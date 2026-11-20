/* Espace commerçant : test de fraîcheur (boîte 3D), tableau de bord, historique, stock. */
import { $, $$, MIN, money, kg, esc, fd, dayMs } from './util.js';
import { score, quote, tn } from './pricing.js';
import { lots, hist, QUARTIERS } from './data.js';
import { PHASES, MEASURE_SECONDS } from './measurement.js';

let draft = null,
  run = null,
  stk = [];
const box = { t: 4.2, g: 142 };
let measuredWeight = 1500;
setInterval(() => {
  box.t = +(box.t + (Math.random() - 0.5) * 0.3).toFixed(1);
  box.g = Math.round(box.g + (Math.random() - 0.5) * 2);
  $('#it').textContent = box.t.toString().replace('.', ',') + ' °C';
  $('#ig').textContent = box.g + ' kΩ';
  $('#id').textContent = Math.random() < 0.06 ? 'Ouverte' : 'Fermée';
}, 2000);
/* étal : cycle de mesure (la boîte en 3D) */
const bx = $('#bx');
const PH = PHASES.map((item) => item.key);
let tm = [];
const later = (f, ms) => tm.push(setTimeout(f, ms)),
  steps = () => $$('.steps li');
const phase = (k) => {
  bx.classList.remove(...PH);
  if (k) bx.classList.add(k);
};
function resetBox() {
  tm.forEach(clearTimeout);
  tm = [];
  bx.className = 'box open';
  bx.dataset.c = $('#cat').value;
  steps().forEach((x) => (x.className = ''));
  $('#measure-progress').hidden = true;
  $('#measure-bar').value = 0;
  $('#measure-status').textContent = '';
}
function stop() {
  clearInterval(run);
  run = null;
  $('#abort').hidden = true;
  $('#go').disabled = false;
}
$('#cat').onchange = () => {
  if (!run) bx.dataset.c = $('#cat').value;
};
$('#go').onclick = () => {
  if (run) return;
  if (![$('#b'), $('#ago')].every((i) => i.reportValidity())) return;
  $('#out').innerHTML = '';
  resetBox();
  void bx.offsetWidth;
  bx.classList.add('go');
  later(() => bx.classList.add('s2'), 1500);
  const L = steps();
  L.forEach((x) => x.style.setProperty('--f', 0));
  measuredWeight = Math.round(300 + Math.random() * 2700);
  let startedAt = 0;
  $('#abort').hidden = false;
  $('#go').disabled = true;
  $('#measure-progress').hidden = false;
  later(() => {
    startedAt = Date.now();
    bx.classList.remove('open');
    bx.classList.add('shut');
    phase(PHASES[0].key);
  }, 2800);
  run = setInterval(() => {
    if (!startedAt) return;
    const elapsed = Math.min(MEASURE_SECONDS, (Date.now() - startedAt) / 1000);
    let passed = 0;
    const i = PHASES.findIndex((item) => elapsed < (passed += item.seconds));
    const index = i === -1 ? PHASES.length - 1 : i;
    const phaseStart = PHASES.slice(0, index).reduce((sum, item) => sum + item.seconds, 0);
    L.forEach((step, stepIndex) => {
      step.className = stepIndex < index ? 'done' : stepIndex === index ? 'now' : '';
      if (stepIndex === index) step.style.setProperty('--f', Math.min(1, (elapsed - phaseStart) / PHASES[index].seconds));
    });
    if (index === 1) $('#iw').textContent = kg(measuredWeight);
    $('#measure-status').textContent = 'Mesure en cours : ' + Math.max(0, Math.ceil(MEASURE_SECONDS - elapsed)) + ' s restantes';
    $('#measure-bar').value = elapsed;
    $('#measure-bar').setAttribute('aria-valuenow', String(Math.floor(elapsed)));
    if (elapsed >= MEASURE_SECONDS) {
      stop();
      finish();
    }
  }, 100);
};
$('#abort').onclick = () => {
  stop();
  resetBox();
  $('#out').innerHTML = '<p class="status" role="status">Mesures stoppées. Refermez la caisse pour recommencer.</p>';
};

function finish() {
  phase();
  bx.classList.remove('shut');
  bx.classList.add('open');
  const cat = $('#cat').value,
    w = measuredWeight,
    b = +$('#b').value,
    ago = +$('#ago').value,
    per = cat === 'Plats cuisinés' ? 2.2 : cat === 'Pâtisserie' ? 1.6 : 1,
    mx = 4 + Math.random() * 4;
  draft = {
    m: 'Votre étal',
    loc: $('#qloc').value,
    c: cat,
    t: esc($('#what').value.trim() || 'Panier de ' + cat.toLowerCase()),
    w: Math.round(w * (0.9 + Math.random() * 0.2)),
    b,
    close: Date.now() + 150 * MIN,
    dh: +(ago * Math.max(0.5, mx - 4) * per).toFixed(1),
    g: +(Math.random() * 18 * per).toFixed(1),
  };
  const s = score(draft.dh, draft.g),
    q = quote(b, s, 150),
    held = draft.dh > 30,
    row = (r, i) => `<p class="row" style="--d:${i}"><span>${r[0]}</span><i></i><b>${r[1]}</b></p>`;
  const ing = [
    ['Poids', kg(draft.w)],
    ['Température', String(box.t).replace('.', ',') + ' °C'],
    ['Hors du froid', draft.dh + ' °C·h'],
    ['Gaz en baisse', draft.g + ' %'],
    ['Fraîcheur', s + ' sur 100'],
  ];
  const prep = [
    ['Partir du prix de base', money(b)],
    ['Multiplier par la fraîcheur', '× ' + q.ff.toFixed(2)],
    ['Multiplier par le temps restant', '× ' + q.tf.toFixed(2)],
    ['Plancher de 30 %', money(q.fl)],
    ['Prix final, arrondi à 0,5', money(q.p)],
  ];
  later(() => {
    $('#iw').textContent = kg(draft.w);
    $('#out').innerHTML =
      `<article class="recipe"><div class="stamp ${held ? 'no' : 'ok'}">${held ? 'Retenu' : 'Apte à la vente'}</div>
 <h3>${draft.t}</h3><p>${cat}, ${kg(draft.w)}, fraîcheur ${s} sur 100.</p>
 <div class="rc"><section><h4>Ingrédients mesurés</h4>${ing.map(row).join('')}</section><section class="prep"><h4>Préparation du prix</h4>${prep.map((r, i) => row(r, i + 5)).join('')}</section></div>
 ${held ? '<p class="warn">Au-delà de 30 °C·h, ce lot ne peut pas être vendu.</p>' : ''}</article>
 <div class="three"><button data-a="pub"${held ? ' disabled' : ''}><i class="dot mint"></i>Publier au marché</button><button class="ghost" data-a="mod"><i class="dot saf"></i>Modifier le lot</button><button class="ghost" data-a="no"><i class="dot har"></i>Ne pas publier</button></div>`;
    $('#out').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('#measure-progress').hidden = true;
  }, 1000);
}
$('#out').addEventListener('click', (e) => {
  const a = e.target.closest('button')?.dataset.a;
  if (!a) return;
  if (a === 'pub') {
    save('Publié');
    lots.unshift({ ...draft, id: 'L-' + (100 + lots.length + 1) });
    $('#out').innerHTML = '';
    resetBox();
    location.hash = '#marche';
  }
  if (a === 'mod') {
    $('#out').innerHTML = '';
    resetBox();
    $('#what').focus();
  }
  if (a === 'no') {
    save(draft.dh > 30 ? 'Retenu' : 'Non publié');
    $('#out').innerHTML = '<p>Lot non publié. La caisse est prête pour un nouveau lot.</p>';
    resetBox();
  }
});

$('#qloc').innerHTML = QUARTIERS.map((q) => `<option>${q}</option>`).join('');

const LBL = { mint: 'Bon', saf: 'Modéré', har: 'À surveiller' },
  ro = (a, b) => `<p class="row"><span>${a}</span><i></i><b>${b}</b></p>`;
function save(st) {
  const s = score(draft.dh, draft.g);
  hist.unshift({
    id: Date.now(),
    t: draft.t,
    c: draft.c,
    ts: Date.now(),
    score: s,
    dh: draft.dh,
    g: draft.g,
    w: draft.w,
    p: quote(draft.b, s, 150).p,
    status: st,
  });
}
export function renderDash() {
  const n = hist.length,
    avg = Math.round(hist.reduce((s, h) => s + h.score, 0) / n),
    wk = hist.filter((h) => h.ts > Date.now() - 7 * dayMs).length,
    ds = new Set(hist.filter((h) => h.ts > Date.now() - 30 * dayMs).map((h) => h.t)).size;
  $('#kp').innerHTML = [
    [n, 'Tests réalisés'],
    [avg + ' / 100', 'Fraîcheur moyenne estimée'],
    [ds, 'Plats suivis sur 30 jours'],
    [wk, 'Tests cette semaine'],
  ]
    .map((k) => `<div><b>${k[0]}</b><span>${k[1]}</span></div>`)
    .join('');
  $('#ch').innerHTML = hist
    .slice(0, 14)
    .reverse()
    .map(
      (h, i) =>
        `<rect class="${tn(h.score)}" x="${i * 21 + 4}" y="${96 - h.score * 0.9}" width="15" height="${h.score * 0.9}"><title>${h.t} : ${h.score} sur 100</title></rect><text x="${i * 21 + 11.5}" y="${91 - h.score * 0.9}" text-anchor="middle" fill="var(--ink)" font-family="var(--st)" font-size="5">${h.score}</text>`,
    )
    .join('');
  $('#rc').innerHTML = hist
    .slice(0, 4)
    .map((h) => ro(h.t + ', ' + fd(h.ts), h.score + ' sur 100'))
    .join('');
}
export function renderHist() {
  const q = $('#hq').value.trim().toLowerCase(),
    f = $('#hf').value,
    rows = hist.filter((h) => h.t.toLowerCase().includes(q) && (!f || tn(h.score) === f));
  $('#hn').textContent = rows.length + ' test' + (rows.length > 1 ? 's' : '');
  $('#hl').innerHTML =
    rows
      .map(
        (h) =>
          `<details class="hrow"><summary><span>${fd(h.ts)}</span><b>${h.t}</b><span class="pill ${tn(h.score)}">${h.score}</span><span>${h.status}</span></summary><div class="hbody">${ro('Catégorie', h.c)}${ro('Poids', kg(h.w))}${ro('Hors du froid', h.dh + ' °C·h')}${ro('Gaz en baisse', h.g + ' %')}${ro('Fraîcheur', LBL[tn(h.score)])}${ro('Prix proposé', money(h.p))}</div></details>`,
      )
      .join('') || '<p>Aucun test ne correspond.</p>';
}
$('#hq').addEventListener('input', renderHist);
$('#hf').addEventListener('input', renderHist);
export function renderStock() {
  const m = new Map();
  hist
    .filter((h) => h.ts > Date.now() - 30 * dayMs)
    .forEach((h) => {
      if (!m.has(h.t)) m.set(h.t, { h, n: 0 });
      m.get(h.t).n++;
    });
  stk = [...m.values()];
  $('#sk').innerHTML = stk
    .map(
      (s, i) =>
        `<div class="scd"><h3>${s.h.t}</h3><p>${s.h.c}, ${s.n} test${s.n > 1 ? 's' : ''}</p><p>Dernier test : ${fd(s.h.ts)}</p><p><span class="pill ${tn(s.h.score)}">${s.h.score}</span> ${LBL[tn(s.h.score)]}</p><button data-r="${i}">Retester ce plat</button></div>`,
    )
    .join('');
}
$('#sk').addEventListener('click', (e) => {
  const b = e.target.closest('[data-r]');
  if (!b) return;
  const s = stk[+b.dataset.r].h;
  $('#what').value = s.t;
  $('#cat').value = s.c;
  $('#cat').dispatchEvent(new Event('change'));
  location.hash = '#test';
});
