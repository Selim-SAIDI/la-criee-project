import test from 'node:test';
import assert from 'node:assert/strict';
import { score, quote, tn } from '../js/pricing.js';
import { money, kg, left, esc, comma, MIN } from '../js/util.js';
import { MEASURE_SECONDS } from '../js/measurement.js';

test('le score vaut 100 sans dégradation', () => {
  assert.equal(score(0, 0), 100);
});

test('les pénalités temps-température et gaz sont plafonnées', () => {
  assert.equal(score(1000, 0), 40);
  assert.equal(score(0, 1000), 60);
  assert.equal(score(1000, 1000), 0);
});

test('une variation de gaz négative est ignorée', () => {
  assert.equal(score(0, -20), 100);
});

test('le score est classé en bon, modéré ou à surveiller', () => {
  assert.equal(tn(85), 'mint');
  assert.equal(tn(55), 'saf');
  assert.equal(tn(10), 'har');
});

test('prix plein si le lot est frais et loin de la fermeture', () => {
  assert.equal(quote(12, 100, 300).p, 12);
});

test('le prix ne descend jamais sous 30 % du prix de base', () => {
  assert.equal(quote(20, 0, 0).p, 6);
});

test('le facteur temps descend linéairement dans les 3 dernières heures', () => {
  assert.equal(quote(10, 100, 180).tf, 1);
  assert.equal(quote(10, 100, 90).tf, 0.75);
  assert.equal(quote(10, 100, 0).tf, 0.5);
});

test('le prix est arrondi à 0,5 TND', () => {
  for (const [b, s, m] of [[9, 89, 95], [18, 75, 160], [24, 60, 40], [7, 80, 70]]) {
    assert.equal((quote(b, s, m).p * 2) % 1, 0);
  }
});

test('formats : monnaie, poids, durée, virgule', () => {
  assert.equal(money(6.5), '6,5 TND');
  assert.equal(money(9), '9 TND');
  assert.equal(kg(1450), '1,45 kg');
  assert.equal(left(95 * MIN), '1 h 35');
  assert.equal(left(40 * MIN), '40 min');
  assert.equal(comma(4.2), '4,2');
});

test('esc neutralise le HTML saisi par l’utilisateur', () => {
  assert.equal(esc('<b>"x"&'), '&lt;b&gt;&quot;x&quot;&amp;');
});

test('la mesure dure exactement 30 secondes', () => {
  assert.equal(MEASURE_SECONDS, 30);
});
