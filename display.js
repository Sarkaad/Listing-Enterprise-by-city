// Affiche les entreprises dans la liste numérotée (<ol>, la numérotation est faite par le navigateur).
function renderBusinesses(listEl, businesses) {
  const items = businesses.map(b => {
    const li = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = b.name || "(sans nom)";
    li.append(name);
    if (b.type) {
      const type = document.createElement("span");
      type.className = "type";
      type.textContent = b.type.replaceAll("_", " ");
      li.append(" ", type);
    }
    if (b.address) {
      const address = document.createElement("small");
      address.textContent = b.address;
      li.append(address);
    }
    return li;
  });
  listEl.replaceChildren(...items);
}
