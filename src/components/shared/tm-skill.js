export const TmSkill = {
    skillBadge(val) {
        if (val == null) return '<span class="muted">&mdash;</span>';
        if (val >= 20) return '<span class="gold" style="font-size:var(--tmu-font-sm)">\u2605</span>';
        if (val >= 19) {
            const frac = val - Math.floor(val);
            const suffix = frac > 0.005 ? `<span style="font-size:var(--tmu-font-xs);opacity:.75">.${Math.round(frac*100).toString().padStart(2,'0')}</span>` : '';
            return `<span class="silver" style="font-size:var(--tmu-font-sm)">\u2605</span>${suffix}`;
        }
        const clr = val >= 16 ? 'lime' : val >= 12 ? 'yellow' : val >= 8 ? 'orange' : 'red';
        const r = Math.round(val * 100) / 100;
        return `<span class="${clr}">${Number.isInteger(r) ? r : r.toFixed(2)}</span>`;
    },
};
