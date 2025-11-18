## Portfolio – Mamadou Alpha Diallo

En ligne: https://alpha-dklg.github.io/portfolio

### Prérequis
- Node.js 18+ recommandé
- npm

### Démarrer en local
```bash
npm install
npm start
```

L'application est servie sur http://localhost:4200/.

### Build (production)
```bash
npm run build
```
Le build est généré dans `dist/mad-portfolio`.

### Déploiement (GitHub Pages)
```bash
npm run deploy
```
Cette commande génère le site dans `docs/` avec `--base-href=/portfolio/`.

### Mettre à jour le contenu
- Données: modifier les fichiers JSON dans `src/assets/data/` (`about.json`, `skills.json`, `projects.json`, etc.)
- Images: ajouter/mettre à jour dans `src/assets/images/`
- CV: remplacer `src/assets/cv/CV_Mamadou-Alpha.Diallo_Stage.Software-Engineer.pdf`

### Scripts utiles
- `npm run lint` / `npm run lint:fix`: lint du code
- `npm run format` / `npm run format:check`: formatage Prettier

### Stack technique
- Angular 17, TypeScript, RxJS
- Outils: Angular CLI, ESLint + @angular-eslint, Prettier
- Déploiement: GitHub Pages (sortie dans `docs/`)
