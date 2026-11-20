/* Données de démonstration (à remplacer par des appels à l’API). */
import { MIN } from './util.js';
import { score, quote } from './pricing.js';
export const N0 = Date.now();
export const QUARTIERS = ['Centre-ville', 'Ennasr', 'Lafayette', 'Bab Saadoun', 'Lac'];
export const CATEGORIES = ['Boulangerie', 'Pâtisserie', 'Plats cuisinés', 'Fruits & légumes'];
export const lots = [
  {
    id: 'L-101',
    loc: 'Centre-ville',
    m: 'Boulangerie El Medina',
    c: 'Boulangerie',
    t: '4 baguettes, 2 pains complets, 3 croissants',
    w: 1450,
    b: 9,
    close: N0 + 95 * MIN,
    dh: 4,
    g: 6,
  },
  {
    id: 'L-102',
    loc: 'Ennasr',
    m: 'Pâtisserie Ennasr',
    c: 'Pâtisserie',
    t: '6 mille-feuilles, 4 makrouds',
    w: 820,
    b: 18,
    close: N0 + 160 * MIN,
    dh: 9,
    g: 14,
  },
  {
    id: 'L-103',
    loc: 'Lafayette',
    m: 'Cantine Lafayette',
    c: 'Plats cuisinés',
    t: '3 couscous au poulet, 2 salades méchouia',
    w: 2100,
    b: 24,
    close: N0 + 40 * MIN,
    dh: 18,
    g: 22,
  },
  {
    id: 'L-104',
    loc: 'Centre-ville',
    m: 'Marché Central, stand 12',
    c: 'Fruits & légumes',
    t: 'Panier mixte : tomates, poivrons, oranges',
    w: 3200,
    b: 10,
    close: N0 + 230 * MIN,
    dh: 6,
    g: 4,
  },
  {
    id: 'L-105',
    loc: 'Bab Saadoun',
    m: 'Boulangerie Bab Saadoun',
    c: 'Boulangerie',
    t: '5 tabouna, 2 pains au sésame',
    w: 1100,
    b: 7,
    close: N0 + 70 * MIN,
    dh: 12,
    g: 10,
  },
  {
    id: 'L-106',
    loc: 'Lac',
    m: 'Traiteur Les Berges',
    c: 'Plats cuisinés',
    t: '4 lasagnes, 2 tajines malsouka',
    w: 1900,
    b: 28,
    close: N0 + 120 * MIN,
    dh: 33,
    g: 30,
  },
];
let sd = 7;
const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const DISH = [
  ['Couscous au poulet', 'Plats cuisinés'],
  ['Lasagnes', 'Plats cuisinés'],
  ['Tajine malsouka', 'Plats cuisinés'],
  ['Mille-feuilles', 'Pâtisserie'],
  ['Baguettes', 'Boulangerie'],
  ['Tabouna', 'Boulangerie'],
  ['Panier de légumes', 'Fruits & légumes'],
  ['Makrouds', 'Pâtisserie'],
];
export const hist = Array.from({ length: 16 }, (_, i) => {
  const d = DISH[i % 8],
    per = d[1] === 'Plats cuisinés' ? 2.2 : d[1] === 'Pâtisserie' ? 1.6 : 1,
    dh = +(rnd() * 14 * per).toFixed(1),
    g = +(rnd() * 16 * per).toFixed(1),
    sc = score(dh, g);
  return {
    id: i,
    t: d[0],
    c: d[1],
    ts: N0 - i * 20 * 36e5 - rnd() * 36e5,
    score: sc,
    dh,
    g,
    w: Math.round(800 + rnd() * 2200),
    p: quote([9, 12, 18, 24][i % 4], sc, 150).p,
    status: i % 5 === 4 ? 'Non publié' : 'Publié',
  };
});
