export const PHASES = [
  { key: 'stab', label: 'Porte fermée', seconds: 4 },
  { key: 'wei', label: 'Pesée', seconds: 4 },
  { key: 'pur', label: 'Purge', seconds: 7 },
  { key: 'acc', label: 'Accumulation', seconds: 12 },
  { key: 'ana', label: 'Calcul', seconds: 3 },
];
export const MEASURE_SECONDS = PHASES.reduce((sum, phase) => sum + phase.seconds, 0);
