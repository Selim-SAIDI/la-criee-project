/* Petits utilitaires partagés : DOM, formats, texte. */
export const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
export const MIN = 6e4;
export const money = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',') + ' TND';
export const left = (ms) => {
  const m = Math.max(0, Math.floor(ms / MIN));
  return m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min';
};
export const kg = (g) => (g / 1000).toFixed(2).replace('.', ',') + ' kg';
export const esc = (t) =>
  t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const comma = (n) => String(n).replace('.', ',');
export const dayMs = 864e5,
  fd = (ts) =>
    new Date(ts).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
