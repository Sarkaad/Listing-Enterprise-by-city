// Étape 1 : données factices. Sera remplacé par la délimitation Google + recherche Places.
const FAKE_DATA = {
  Paris: [
    { name: "Boulangerie Exemple", address: "1 rue de Rivoli" },
    { name: "Cabinet Démo", address: "10 avenue des Champs-Élysées" },
  ],
  Lyon: [
    { name: "Atelier Test", address: "5 place Bellecour" },
  ],
};

const citySelect = document.getElementById("city");
const countEl = document.getElementById("count");
const resultsEl = document.getElementById("results");

for (const city of Object.keys(FAKE_DATA)) {
  citySelect.add(new Option(city, city));
}

citySelect.addEventListener("change", () => {
  const businesses = FAKE_DATA[citySelect.value] || [];
  resultsEl.replaceChildren();
  countEl.hidden = !citySelect.value;
  countEl.textContent = `${businesses.length} entreprise(s)`;
  for (const b of businesses) {
    const li = document.createElement("li");
    li.textContent = b.name;
    const small = document.createElement("small");
    small.textContent = b.address;
    li.append(small);
    resultsEl.append(li);
  }
});
