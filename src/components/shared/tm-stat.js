document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Stat row ── */
.tmu-stat-row { display: flex; justify-content: space-between; align-items: center; padding: var(--tmu-space-xs) 0; font-size: var(--tmu-font-xs); color: var(--tmu-text-main); }
.tmu-stat-row + .tmu-stat-row { border-top: 1px solid var(--tmu-border-input-overlay); }
.tmu-stat-lbl { color: var(--tmu-text-faint); font-weight: 600; font-size: var(--tmu-font-xs); text-transform: uppercase; }
.tmu-stat-val { font-weight: 700; font-variant-numeric: tabular-nums; }
` }));

export const TmStat = {
};
