const cityInput = document.getElementById("city");
const optionsEl = document.getElementById("city-options");
const errorEl = document.getElementById("error");
const selectedEl = document.getElementById("selected");
const selectedName = document.getElementById("selected-name");
const selectedDetail = document.getElementById("selected-detail");
const resultsEl = document.getElementById("results");

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
  // Étapes suivantes : délimitation de la ville, puis recherche des entreprises.
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
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&v=weekly`;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Chargement de Google Maps impossible."));
    document.head.append(s);
  });
  const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");
  const ac = new PlaceAutocompleteElement({ includedPrimaryTypes: ["locality"] });
  const box = document.getElementById("google-autocomplete");
  box.append(ac);
  box.hidden = false;
  cityInput.hidden = true;
  document.querySelector("label[for=city]").textContent = "Ville (Google)";

  ac.addEventListener("gmp-select", async ({ placePrediction }) => {
    const place = placePrediction.toPlace();
    await place.fetchFields({ fields: ["displayName", "location", "addressComponents"] });
    const part = type => place.addressComponents?.find(c => c.types.includes(type))?.longText ?? "";
    selectCity({
      name: place.displayName,
      region: part("administrative_area_level_1"),
      country: part("country"),
      lat: place.location.lat(),
      lng: place.location.lng(),
    });
  });
}

if (window.GOOGLE_MAPS_API_KEY) {
  initGoogleAutocomplete(window.GOOGLE_MAPS_API_KEY).catch(e => {
    errorEl.textContent = `${e.message} Liste intégrée utilisée à la place.`;
    errorEl.hidden = false;
  });
}
