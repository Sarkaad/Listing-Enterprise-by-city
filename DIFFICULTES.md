# Difficultés rencontrées et solutions

## 1. Google ne donne pas le contour exact d'une ville
**Problème.** Les API Google renvoient pour une ville un rectangle englobant (`viewport`), pas un polygone.
**Solution.** On utilise ce rectangle comme zone de recherche et on filtre les résultats qui sortent du rectangle. Le contour exact (par exemple via OpenStreetMap) reste une amélioration possible.

## 2. Google limite chaque recherche à 20 résultats
**Problème.** `searchNearby` renvoie au maximum 20 lieux, sans pagination.
**Solution.** Un algorithme de grille : on découpe la zone en cellules, et toute cellule qui renvoie 20 résultats est subdivisée en 4, de façon récursive. Les doublons sont retirés par identifiant de lieu.

## 3. Le rendu en ligne ne pouvait pas appeler Google
**Problème.** La page publiée en artifact tourne dans un bac à sable qui bloque les requêtes vers d'autres sites, donc impossible d'y tester Google.
**Solution.** Test en local (VS Code). Le rendu en ligne n'a servi que pour les étapes sans Google.

## 4. Python absent sous Windows
**Problème.** `python3 -m http.server` échouait (« Python est introuvable »).
**Solution.** Utiliser l'extension Live Server de VS Code (port 5500).

## 5. Sécurité de la clé API
**Problème.** La clé a été collée dans une conversation, et une clé côté navigateur est visible par quiconque ouvre la page.
**Solution.** La clé vit dans `config.js`, ignoré par git, avec `config.example.js` comme modèle. Elle doit être restreinte (référents HTTP et API autorisées) dans Google Cloud Console, et régénérée si elle a été exposée.

## 6. `google.maps.importLibrary is not a function`
**Problème.** Le script Google chargé en mode asynchrone n'avait pas fini de s'initialiser quand le code l'utilisait.
**Solution.** Charger le script avec le paramètre `callback` et attendre cet appel avant d'utiliser `importLibrary`.

## 7. `RESOURCE_EXHAUSTED` : quota par minute dépassé
**Problème.** Six requêtes en parallèle sans pause dépassaient le quota « SearchNearbyRequest per minute ».
**Solution.** Trois requêtes à la fois, une pause de 0,5 s entre les lots, et en cas d'erreur de quota une attente croissante (10 s, 20 s, 40 s…) avec nouvelle tentative. La page affiche le compte à rebours.

## 8. Plafond de requêtes
**Problème.** Un plafond de 150 requêtes laissait des résultats incomplets pour les grandes villes (jusqu'à 1200 entreprises).
**Solution.** Plafond relevé progressivement (1000, puis 10 000 comme simple garde-fou). Finalement, le besoin a changé : on s'arrête à 100 entreprises par ville, ce qui réduit la recherche à quelques requêtes.

## 9. Coûts
**Problème.** Places API (New) est payante au-delà d'un quota gratuit.
**Solution.** Limiter les requêtes (arrêt à 100 entreprises), surveiller la facturation, et utiliser un compte d'essai pour les tests.
