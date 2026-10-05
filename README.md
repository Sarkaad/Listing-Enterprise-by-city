# Listing Enterprise by City

Page web simple (HTML, CSS, JavaScript sans framework) : on choisit une ville avec l'autocomplétion Google, et la page affiche une liste numérotée de 100 entreprises situées dans cette ville.

## Lancer le projet

1. Clonez le dépôt.
2. Copiez `config.example.js` en `config.js` et remplacez `VOTRE_CLE_ICI` par votre clé API Google Maps. `config.js` est ignoré par git : ne le commitez jamais.
3. Dans Google Cloud Console, activez **Maps JavaScript API** et **Places API (New)** pour cette clé, puis restreignez la clé (référents HTTP `http://127.0.0.1:5500/*` et `http://localhost:5500/*`, et ces deux API seulement).
4. Servez le dossier avec un serveur local, par exemple l'extension **Live Server** de VS Code (clic droit sur `index.html` → *Open with Live Server*) ou `python3 -m http.server 8000`. N'ouvrez pas `index.html` en `file://` : Google refuse les clés restreintes dans ce mode.

Sans `config.js`, la page fonctionne avec une courte liste de villes intégrée (`cities.js`) mais ne cherche pas d'entreprises.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `style.css` | Page et styles |
| `app.js` | Sélection de la ville (Google Places Autocomplete), lance la recherche, affiche l'état |
| `businesses.js` | `listBusinesses` : recherche des entreprises par grille de cellules |
| `display.js` | `renderBusinesses` : affichage de la liste numérotée |
| `cities.js` | Liste de villes de secours |
| `config.example.js` | Modèle pour la clé API |

## Fonctionnement de la recherche

1. Google renvoie, pour la ville choisie, un rectangle englobant (le *viewport*).
2. `listBusinesses` le découpe en 3×3 cellules et interroge Places API (New) `searchNearby` pour chaque cellule (3 cellules à la fois, 20 résultats maximum par requête).
3. Une cellule qui renvoie 20 résultats est subdivisée en 4, jusqu'à 5 niveaux.
4. Les résultats sont dédoublonnés, les établissements fermés et ceux hors du rectangle sont retirés.
5. La recherche s'arrête dès que 100 entreprises sont trouvées (`MAX_BUSINESSES` dans `businesses.js`).

## Limites connues

- La zone de recherche est le rectangle Google de la ville, pas son contour exact : quelques entreprises de communes voisines peuvent apparaître.
- Les 100 entreprises sont celles que Google remonte en premier, pas un échantillon aléatoire.
- Places API (New) est une API payante avec un quota gratuit mensuel. Vérifiez votre facturation.

Les difficultés rencontrées et leurs solutions sont décrites dans [DIFFICULTES.md](DIFFICULTES.md).
