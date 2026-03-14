document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── State (loading / empty / error) ── */
.tmu-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;gap:8px;text-align:center}
.tmu-state-text{color:#6a9a58;font-size:12px;font-weight:600;letter-spacing:.5px}
.tmu-state-empty .tmu-state-text{color:#5a7a48;font-style:italic;font-weight:400}
.tmu-state-error .tmu-state-text{color:#f87171}
.tmu-state-sm{padding:8px 12px;gap:5px}
.tmu-state-sm .tmu-state-text{font-size:10px;letter-spacing:.3px}
` }));

export const TmState = {
    loading: (msg = 'Loading\u2026', compact = false) =>
        `<div class="tmu-state${compact ? ' tmu-state-sm' : ''}">` +
        `<span class="tmu-spinner tmu-spinner-md"></span>` +
        `<span class="tmu-state-text">${msg}</span></div>`,

    empty: (msg = 'No data', compact = false) =>
        `<div class="tmu-state tmu-state-empty${compact ? ' tmu-state-sm' : ''}">` +
        `<span class="tmu-state-text">${msg}</span></div>`,

    error: (msg = 'Error', compact = false) =>
        `<div class="tmu-state tmu-state-error${compact ? ' tmu-state-sm' : ''}">` +
        `<span>\u26a0</span>` +
        `<span class="tmu-state-text">${msg}</span></div>`,
};
