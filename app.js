const cityInput = document.getElementById("city");
const optionsEl = document.getElementById("city-options");
const errorEl = document.getElementById("error");
const selectedEl = document.getElementById("selected");
const selectedName = document.getElementById("selected-name");
const selectedDetail = document.getElementById("selected-detail");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");

let PlaceClass = null; // défini en mode Google

const label = c => `${c.name}, ${c.country}`;

for (const c of CITIES) {
  optionsEl.append(new Option(label(c), label(c)));
}

let selectedCity = null;

function selectCity(city) {
  selectedCity = city;
  resultsEl.replaceChildren();
  selectedEl.hidden = !city;
  if (!city) return;
  selectedName.textContent = city.name;
  selectedDetail.textContent = `${city.region}, ${city.country} · ${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}`;
  loadBusinesses(city);
}

let loadToken = 0;
async function loadBusinesses(city) {
  const token = ++loadToken;
  statusEl.hidden = false;
  if (!PlaceClass || !city.box) {
    statusEl.textContent = "Recherche des entreprises disponible en mode Google uniquement.";
    return;
  }
  try {
    const result = await listBusinesses(PlaceClass, city.box, p => {
      if (token === loadToken) statusEl.textContent = `Recherche… ${p.found} entreprises (${p.requests} requêtes)`;
    });
    if (token !== loadToken) return;
    statusEl.textContent = `${result.businesses.length} entreprises trouvées (${result.requests} requêtes)` +
      (result.truncated ? " — résultat incomplet (limite atteinte)" : "");
    console.log(result.businesses);
    // Affichage de la liste : étape suivante.
  } catch (e) {
    if (token === loadToken) statusEl.textContent = `Erreur de recherche : ${e.message}`;
  }
}

cityInput.addEventListener("input", () => {
  const value = cityInput.value.trim().toLowerCase();
  const match = CITIES.find(c => label(c).toLowerCase() === value);
  errorEl.hidden = true;
  if (match) {
    selectCity(match);
  } else {
    selectCity(null);
    if (value.length > 2 && !CITIES.some(c => label(c).toLowerCase().includes(value))) {
      errorEl.textContent = "Ville inconnue. Choisissez une ville dans la liste.";
      errorEl.hidden = false;
    }
  }
});

// Mode Google : actif seulement si config.js définit GOOGLE_MAPS_API_KEY.
async function initGoogleAutocomplete(key) {
  await new Promise((resolve, reject) => {
    window.__gmapsReady = resolve;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&libraries=places&v=weekly&callback=__gmapsReady`;
    s.onerror = () => reject(new Error("Chargement de Google Maps impossible."));
    document.head.append(s);
  });
  const { PlaceAutocompleteElement, Place } = await google.maps.importLibrary("places");
  PlaceClass = Place;
  const ac = new PlaceAutocompleteElement({ includedPrimaryTypes: ["locality"] });
  const box = document.getElementById("google-autocomplete");
  box.append(ac);
  box.hidden = false;
  cityInput.hidden = true;
  document.querySelector("label[for=city]").textContent = "Ville (Google)";

  ac.addEventListener("gmp-select", async ({ placePrediction }) => {
    const place = placePrediction.toPlace();
    await place.fetchFields({ fields: ["displayName", "location", "addressComponents", "viewport"] });
    const part = type => place.addressComponents?.find(c => c.types.includes(type))?.longText ?? "";
    selectCity({
      name: place.displayName,
      region: part("administrative_area_level_1"),
      country: part("country"),
      lat: place.location.lat(),
      lng: place.location.lng(),
      box: toBox(place),
    });
  });
}

if (window.GOOGLE_MAPS_API_KEY) {
  initGoogleAutocomplete(window.GOOGLE_MAPS_API_KEY).catch(e => {
    errorEl.textContent = `${e.message} Liste intégrée utilisée à la place.`;
    errorEl.hidden = false;
  });
}

// Zone de recherche : viewport Google de la ville, sinon carré de ~11 km autour du centre.
function toBox(place) {
  const v = place.viewport;
  if (v) {
    return { south: v.getSouthWest().lat(), west: v.getSouthWest().lng(), north: v.getNorthEast().lat(), east: v.getNorthEast().lng() };
  }
  const lat = place.location.lat(), lng = place.location.lng();
  return { south: lat - 0.05, north: lat + 0.05, west: lng - 0.05, east: lng + 0.05 };
}
