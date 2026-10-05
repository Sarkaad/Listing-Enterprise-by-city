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
