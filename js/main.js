/* Point d’entrée : routage par hash (#marche, #tableau, #test, #historique, #stock). */
import { $, $$ } from './util.js';
import { renderMarket } from './market.js';
import { renderDash, renderHist, renderStock } from './merchant.js';

const VIEWS = ['marche', 'tableau', 'test', 'historique', 'stock'];
function route() {
  const h = location.hash.slice(1),
    v = VIEWS.includes(h) ? h : h === 'etal' ? 'tableau' : 'marche',
    m = v !== 'marche';
  VIEWS.forEach((k) => ($('#' + k).hidden = k !== v));
  $('#sub').hidden = !m;
  $$('nav a').forEach((a) => {
    const t = a.hash.slice(1),
      on = a.closest('#sub') ? t === v : t === 'marche' ? !m : t === 'tableau' && m;
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  if (v === 'marche') renderMarket(true);
  if (v === 'tableau') renderDash();
  if (v === 'historique') renderHist();
  if (v === 'stock') renderStock();
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
