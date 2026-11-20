// Génère dist/la-criee.html : un seul fichier autonome (CSS et JS en ligne),
// qui s'ouvre par double-clic et se publie partout. Usage : npm run build
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const bundle = await build({
  entryPoints: ['js/main.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  write: false,
});
const js = bundle.outputFiles[0].text;
const css = await readFile('css/styles.css', 'utf8');
const html = (await readFile('index.html', 'utf8'))
  .replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="js/main.js"></script>', () => `<script>${js}</script>`);

await mkdir('dist', { recursive: true });
await writeFile('dist/la-criee.html', html);
console.log(`dist/la-criee.html : ${(html.length / 1024).toFixed(1)} Ko`);
