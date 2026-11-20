# La Criée

Prototype web de paniers anti-gaspi à **prix dégressif**. Plus l’heure de fermeture approche, plus le prix baisse.
Deux espaces dans une seule application :

- **Espace étudiant** : radar des paniers (ou étiquettes sur une corde), filtres par catégorie, quartier et
  intervalle de prix, réservation de 10 minutes avec code de retrait.
- **Espace commerçant** : tableau de bord, test de fraîcheur (boîte connectée en 3D), historique des tests,
  stock de plats.

> Tout est simulé dans le navigateur : paniers, mesures de la boîte, historique. Rien n’est sauvegardé.
> Le score mélange le temps passé hors du froid et la variation du signal gaz ; le gaz seul ne mesure pas la
> fraîcheur du pain. C’est une estimation expérimentale, jamais une garantie sanitaire.

## Démarrer

```sh
npm start            # http://localhost:8080 (python3 -m http.server)
```

Un serveur local est nécessaire : le code est en modules ES, et les navigateurs les bloquent quand la page
est ouverte par double-clic (`file://`). Sans npm : `python3 -m http.server 8080` dans ce dossier.

### Fichier unique (partage, hébergement simple)

```sh
npm install          # une seule fois (esbuild)
npm run build        # génère dist/la-criee.html : CSS et JS en ligne, s’ouvre par double-clic
```

## Tests

```sh
npm test             # node:test, sans dépendance : score, prix, formats, échappement HTML
```

## Structure

```
index.html            squelette de la page (espaces, filtres, ticket)
css/styles.css        design (variables en tête de fichier, voir ci-dessous)
js/main.js            point d’entrée et routage par hash
js/market.js          espace étudiant : filtres, radar, étiquettes, réservation, ticket
js/merchant.js        espace commerçant : test (boîte 3D), tableau de bord, historique, stock
js/pricing.js         règles métier pures : score de fraîcheur, prix dynamique (testées)
js/data.js            données de démonstration : paniers, quartiers, historique
js/util.js            DOM, formats (TND, kg, durée), échappement HTML
tests/                tests unitaires
scripts/build.mjs     build du fichier unique
docs/BACKEND.md       comment brancher un vrai backend
```

Routes (hash) : `#marche` (étudiant), `#tableau`, `#test`, `#historique`, `#stock` (commerçant).

## Design

Palette du soir au marché de Tunis : bleu des portes de Sidi Bou Said en fond (`--sky`), blanc de chaux pour
les étiquettes et feuilles (`--paper`), encre bleu nuit (`--ink`), safran (`--saf`), harissa (`--har`), menthe
(`--mint`). Les couleurs de fraîcheur sont toujours les mêmes : menthe = bon, safran = modéré, harissa = à surveiller.
Titres en Big Shoulders Stencil Display, texte en Schibsted Grotesk, ligne arabe en Reem Kufi (Google Fonts, avec
polices de secours). Le mode sombre et la préférence « réduire les animations » sont gérés.

## Règles de prix

`prix = prix de base × facteur fraîcheur × facteur temps`, plancher à 30 % du prix de base, arrondi à 0,5 TND.
Un lot au-delà de 30 °C·h hors du froid est **retenu** : il ne peut pas être vendu. Les coefficients sont dans
`js/pricing.js` ; le seuil de 30 °C·h est testé dans `js/market.js` et `js/merchant.js`.

## Brancher un backend

Voir [`docs/BACKEND.md`](docs/BACKEND.md).

## Premier commit

```sh
git init -b main
git add .
git commit -m "La Criée : espaces étudiant et commerçant"
git remote add origin <url-de-votre-depot>
git push -u origin main
```
