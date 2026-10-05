// Liste les entreprises dans une zone rectangulaire (viewport Google de la ville).
// Places API (New) renvoie au plus 20 résultats par requête : on découpe la zone en cellules
// et on subdivise toute cellule saturée (20 résultats), jusqu'à MAX_DEPTH. Chaque requête est facturée par Google : MAX_REQUESTS plafonne le coût.
const MAX_PER_QUERY = 20;
const INITIAL_GRID = 3;
const MAX_DEPTH = 5;
const MAX_REQUESTS = 1000;
const BATCH_SIZE = 6;

function distanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = d => (d * Math.PI) / 180;
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a));
}

function splitCell(cell, n, depth) {
  const dLat = (cell.north - cell.south) / n;
  const dLng = (cell.east - cell.west) / n;
  const cells = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      cells.push({
        south: cell.south + i * dLat, north: cell.south + (i + 1) * dLat,
        west: cell.west + j * dLng, east: cell.west + (j + 1) * dLng,
        depth,
      });
    }
  }
  return cells;
}

function inside(box, lat, lng) {
  return lat >= box.south && lat <= box.north && lng >= box.west && lng <= box.east;
}

async function searchCell(Place, cell) {
  const lat = (cell.north + cell.south) / 2;
  const lng = (cell.east + cell.west) / 2;
  const radius = Math.min(50000, distanceMeters(lat, lng, cell.north, cell.east));
  const { places } = await Place.searchNearby({
    fields: ["id", "displayName", "formattedAddress", "location", "businessStatus", "primaryType"],
    locationRestriction: { center: { lat, lng }, radius },
    maxResultCount: MAX_PER_QUERY,
  });
  return places;
}

// box : { south, west, north, east }. Retourne { businesses, requests, truncated }.
async function listBusinesses(Place, box, onProgress = () => {}) {
  const found = new Map();
  const queue = splitCell(box, INITIAL_GRID, 0);
  let requests = 0;
  let truncated = false;

  while (queue.length) {
    const batch = queue.splice(0, BATCH_SIZE);
    const results = await Promise.all(batch.map(async cell => {
      if (requests >= MAX_REQUESTS) { truncated = true; return null; }
      requests++;
      return { cell, places: await searchCell(Place, cell) };
    }));

    for (const r of results) {
      if (!r) continue;
      for (const p of r.places) {
        const lat = p.location.lat();
        const lng = p.location.lng();
        if (p.businessStatus?.startsWith("CLOSED") || !inside(box, lat, lng)) continue;
        found.set(p.id, { id: p.id, name: p.displayName, address: p.formattedAddress, type: p.primaryType, lat, lng });
      }
      if (r.places.length >= MAX_PER_QUERY) {
        if (r.cell.depth < MAX_DEPTH) queue.push(...splitCell(r.cell, 2, r.cell.depth + 1));
        else truncated = true;
      }
    }
    onProgress({ requests, found: found.size });
  }
  return { businesses: [...found.values()], requests, truncated };
}
