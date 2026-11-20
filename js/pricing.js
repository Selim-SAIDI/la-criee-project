/* Règles métier pures (sans DOM) : score de fraîcheur et prix dynamique. Testées dans tests/. */
export const score = (d, g) =>
  Math.max(0, Math.round(100 - Math.min(60, d * 1.5) - Math.min(40, Math.max(0, g) * 0.8)));
export const quote = (b, s, m) => {
  const ff = 0.4 + (0.6 * s) / 100,
    tf = m >= 180 ? 1 : 0.5 + (0.5 * Math.max(0, m)) / 180,
    fl = b * 0.3,
    raw = b * ff * tf;
  return { ff, tf, fl, raw, p: Math.round(Math.max(fl, raw) * 2) / 2 };
};
export const tn = (s) => (s >= 70 ? 'mint' : s >= 40 ? 'saf' : 'har');
