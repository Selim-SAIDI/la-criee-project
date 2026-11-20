/* Espace étudiant : filtres, radar, étiquettes, réservation et tickets. */
import { $, $$, MIN, money, kg, left, comma } from './util.js';
import { score, quote, tn } from './pricing.js';
import { lots, QUARTIERS, CATEGORIES } from './data.js';

const res = {};
let cur = null;
let back = null;
let selId = null;
const F = { c: '', l: '', min: '', max: '' };
const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = () => Array.from({ length: 6 }, () => A[(Math.random() * A.length) | 0]).join('');
const P = (l) => quote(l.b, score(l.dh, l.g), (l.close - Date.now()) / MIN).p;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function vis() {
  return lots.filter(
    (l) =>
      !res[l.id] &&
      (!F.c || l.c === F.c) &&
      (!F.l || l.loc === F.l) &&
      (F.min === '' || P(l) >= +F.min) &&
      (F.max === '' || P(l) <= +F.max),
  );
}

function tag(l, i, first = true) {
  const s = score(l.dh, l.g),
    q = quote(l.b, s, (l.close - Date.now()) / MIN),
    held = l.dh > 30,
    tone = s >= 70 ? 'mint' : s >= 40 ? 'saf' : 'har';
  return `<li data-lot="${l.id}" aria-current="${l.id === selId}" style="--i:${i};--r:${(i % 2 ? 1 : -1) * (1 + (i % 3) * 0.8)}deg"><div class="card${held ? ' held' : ''}"><i class="hole"></i><p class="who">${l.m}</p><p class="meta">${l.loc || ''}</p><p class="what">${l.t}</p><p class="px"><b data-p="${l.id}">${money(q.p)}</b><s data-b="${l.id}"${q.p < l.b ? '' : ' hidden'}>${money(l.b)}</s></p><div class="bar"><span class="${tone}" style="width:${s}%"></span></div><p class="meta">Fraîcheur ${s} sur 100, ${kg(l.w)}</p><p class="meta">Ferme dans <time data-t="${l.id}">${left(l.close - Date.now())}</time></p>${held ? '<button disabled>Retenu : chaîne du froid</button>' : '<button data-res="' + l.id + '">Réserver ce panier</button>'}</div></li>`;
}

function renderTickets() {
  const active = Object.entries(res);
  $('#tickets').hidden = active.length === 0;
  $('#ticket-list').innerHTML = active
    .map(([id, r]) => {
      const l = lots.find((x) => x.id === id);
      return `<article class="ticket-card" data-ticket-card="${id}"><h3 tabindex="-1">${l.t}</h3><p>${l.m}, ${l.loc}</p><p>${kg(l.w)} · <b>${money(r.price)}</b></p><p>Retrait avant <time data-ticket-time="${id}">${left(r.until - Date.now())}</time></p><p class="code">${r.code}</p><p>Montrez ce code au commerçant au moment du retrait.</p><button class="ghost" data-cancel="${id}">Annuler la réservation</button></article>`;
    })
    .join('');
}

function tick() {
  const n = Date.now();
  $$('.blip').forEach((b) => {
    const l = lots.find((x) => x.id === b.dataset.pick);
    if (l) {
      const [x, y] = pos(l);
      b.style.left = x + '%';
      b.style.top = y + '%';
      b.textContent = comma(P(l));
      b.setAttribute('aria-label', `${l.m}, ${money(P(l))}, ferme dans ${left(l.close - n)}`);
    }
  });
  let changed = false;
  for (const id in res) {
    if (res[id].until < n) {
      delete res[id];
      changed = true;
      $('#market-status').textContent = 'Votre réservation a expiré';
    }
  }
  if (changed) renderMarket(false);
  lots.forEach((l) => {
    const p = $$(`[data-p="${l.id}"]`);
    if (!p.length) return;
    const q = quote(l.b, score(l.dh, l.g), (l.close - n) / MIN),
      m = money(q.p);
    p.forEach((node) => {
      if (node.textContent !== m) {
        node.textContent = m;
        if (!reducedMotion())
          node.animate([{ backgroundColor: '#f2b01e' }, { backgroundColor: 'rgba(242,176,30,0)' }], {
            duration: 900,
            easing: 'ease-out',
          });
      }
    });
    $$(`[data-b="${l.id}"]`).forEach((node) => (node.hidden = q.p >= l.b));
    $$(`[data-t="${l.id}"]`).forEach((node) => (node.textContent = left(l.close - n)));
  });
  Object.entries(res).forEach(([id, r]) => {
    $$(`[data-ticket-time="${id}"]`).forEach((node) => (node.textContent = left(r.until - n)));
  });
}
setInterval(tick, 1000);

function openTicket(id) {
  back = document.activeElement;
  cur = id;
  $('#ticket').dataset.reservationId = id;
  const l = lots.find((x) => x.id === id);
  $('#tw').textContent = `${l.m}, ${l.loc} : ${l.t}, ${kg(l.w)}, prix actuel ${money(P(l))}.`;
  $('#tc').textContent = 'Le panier sera gardé pendant 10 minutes.';
  $('#ticket').hidden = false;
  $('#ticket').classList.add('in');
  $('#tx').focus();
}

function closeTicket() {
  const t = $('#ticket');
  if (t.hidden) return;
  t.hidden = true;
  t.classList.remove('in');
  if (back && document.contains(back)) back.focus();
  back = null;
  cur = null;
}

function confirmTicket() {
  const id = $('#ticket').dataset.reservationId;
  const l = lots.find((x) => x.id === id);
  if (!l) return;
  res[id] = { until: Date.now() + 10 * MIN, code: code(), price: P(l) };
  closeTicket();
  renderMarket(false);
  const ticket = $(`[data-ticket-card="${id}"] h3`);
  ticket?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  ticket?.focus();
}

const onAct = (e) => {
  const b = e.target.closest('button');
  if (b?.dataset.res) openTicket(b.dataset.res);
  if (b?.dataset.cancel) {
    delete res[b.dataset.cancel];
    renderMarket(false);
  }
};
$('#list').addEventListener('click', onAct);
$('#ticket-list').addEventListener('click', onAct);
$('#tx').onclick = confirmTicket;
$('#tn').onclick = closeTicket;
addEventListener('keydown', (e) => {
  if ($('#ticket').hidden) return;
  if (e.key === 'Escape') closeTicket();
  if (e.key === 'Tab') {
    const focusables = [$('#tx'), $('#tn')],
      i = focusables.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      focusables[1].focus();
    } else if (!e.shiftKey && i === focusables.length - 1) {
      e.preventDefault();
      focusables[0].focus();
    }
  }
});

function focusLot(id) {
  selId = id;
  $$('#list li[data-lot]').forEach((li) => li.setAttribute('aria-current', li.dataset.lot === id));
  $$('.blip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.pick === id));
}

function pos(l) {
  const m = Math.max(0, (l.close - Date.now()) / MIN),
    r = 0.18 + 0.78 * Math.min(1, m / 240),
    a = (((parseInt(l.id.slice(2)) * 137.5) % 360) * Math.PI) / 180;
  return [50 + r * 45 * Math.sin(a), 50 - r * 45 * Math.cos(a)];
}

$('#fcat').innerHTML += CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
$('#floc').innerHTML = '<option value="">Tous les quartiers</option>' + QUARTIERS.map((q) => `<option>${q}</option>`).join('');
const updateFilters = () => {
  Object.assign(F, { c: $('#fcat').value, l: $('#floc').value, min: $('#fmin').value, max: $('#fmax').value });
  renderMarket(false);
};
$('#flt').addEventListener('input', updateFilters);
$('#flt').addEventListener('change', updateFilters);
$('#freset').onclick = () => {
  Object.assign(F, { c: '', l: '', min: '', max: '' });
  $('#fcat').value = $('#floc').value = $('#fmin').value = $('#fmax').value = '';
  renderMarket(false);
};
$('#list').addEventListener('pointerover', (e) => {
  const li = e.target.closest('li[data-lot]');
  if (li) focusLot(li.dataset.lot);
});
$('#list').addEventListener('focusin', (e) => {
  const li = e.target.closest('li[data-lot]');
  if (li) focusLot(li.dataset.lot);
});
$('#rd').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pick]');
  if (!b) return;
  focusLot(b.dataset.pick);
  const li = $(`#list li[data-lot="${b.dataset.pick}"]`);
  li?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  li?.querySelector('button')?.focus();
});

export function renderMarket(first = false) {
  const v = vis();
  if (!v.some((l) => l.id === selId)) selId = v[0]?.id;
  $('#fn').textContent = v.length + ' panier' + (v.length > 1 ? 's' : '') + ' sur ' + lots.length;
  const ul = $('#list');
  ul.classList.toggle('first', first);
  ul.innerHTML = v.length ? v.map((l, i) => tag(l, i, first)).join('') : '<li class="none">Aucun panier ne correspond. Élargissez le prix ou le quartier, ou réinitialisez les filtres.</li>';
  renderRadar(v);
  renderTickets();
  if (first) setTimeout(() => ul.classList.remove('first'), 2600);
}

function renderRadar(v) {
  const rings = [1, 2, 3, 4]
    .map((h) => {
      const r = (0.18 + (0.78 * h) / 4) * 45;
      return `<circle cx="50" cy="50" r="${r}" fill="none" stroke="#0e1f5b" stroke-opacity=".28" stroke-width=".4"/><text x="50" y="${50 - r + 3.6}" text-anchor="middle" font-size="3" fill="#0e1f5b">${h} h</text>`;
    })
    .join('');
  $('#rd').innerHTML =
    `<svg viewBox="0 0 100 100" aria-hidden="true">${rings}<path d="M50 2V98M2 50H98" stroke="#0e1f5b" stroke-opacity=".18" stroke-width=".3"/><circle cx="50" cy="50" r="8.1" fill="#0e1f5b"/><text x="50" y="51" text-anchor="middle" font-size="2.7" fill="#f4f6f1">Fermeture</text></svg><div class="sweep"></div>` +
    v
      .map((l) => {
        const [x, y] = pos(l);
        return `<button type="button" class="blip ${tn(score(l.dh, l.g))}${l.dh > 30 ? ' held' : ''}" aria-pressed="${l.id === selId}" aria-label="${l.m}, ${money(P(l))}, ferme dans ${left(l.close - Date.now())}" data-pick="${l.id}" style="left:${x}%;top:${y}%">${comma(P(l))}</button>`;
      })
      .join('');
}
