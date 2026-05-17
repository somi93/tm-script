// ─── Colors per player index ──────────────────────────────────────────────

const COLORS = [
    { fill: 'rgba(30,160,255,0.18)', stroke: 'rgba(30,160,255,0.85)', dot: 'rgba(30,160,255,0.95)' },
    { fill: 'rgba(255,120,30,0.18)',  stroke: 'rgba(255,120,30,0.85)',  dot: 'rgba(255,120,30,0.95)'  },
    { fill: 'rgba(80,200,80,0.18)',   stroke: 'rgba(80,200,80,0.85)',   dot: 'rgba(80,200,80,0.95)'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const getSkillVal = (player, key) => {
    const s = player.skills?.find(sk => sk.key === key || sk.key2 === key);
    return Number.isFinite(s?.value) ? Number(s.value) : 0;
};

const groupScore = (player, group) => {
    let sum = 0, wsum = 0;
    for (const entry of group.keys) {
        const [k, w] = Array.isArray(entry) ? entry : [entry, 1];
        sum += getSkillVal(player, k) * w;
        wsum += w;
    }
    return wsum > 0 ? sum / wsum : 0;
};

// ─── CSS ──────────────────────────────────────────────────────────────────

let _cssInjected = false;
const injectCss = () => {
    if (_cssInjected) return;
    _cssInjected = true;
    document.head.appendChild(Object.assign(document.createElement('style'), {
        textContent: `
.tmpr-legend{display:flex;gap:var(--tmu-space-xl,16px);flex-wrap:wrap;justify-content:center}
.tmpr-legend-item{display:flex;align-items:center;gap:var(--tmu-space-xs,4px);font-size:var(--tmu-font-xs,11px);color:var(--tmu-text-muted,rgba(160,160,160,0.8))}
.tmpr-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
`,
    }));
};

// ─── Canvas draw ──────────────────────────────────────────────────────────

const drawCanvas = (canvas, groups, players) => {
    const dpr = window.devicePixelRatio || 1;
    const sz = canvas.clientWidth || 280;
    canvas.width = sz * dpr;
    canvas.height = sz * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const N = groups.length;
    const cx = sz / 2;
    const cy = sz * 0.43;
    const r  = sz * 0.33;
    const lr = sz * 0.38;
    const ang = (i) => (i / N) * Math.PI * 2 - Math.PI / 2;

    const rs = getComputedStyle(document.documentElement);
    const gridClr = rs.getPropertyValue('--tmu-border-soft-alpha-mid').trim() || 'rgba(128,128,128,0.25)';
    const axisClr = rs.getPropertyValue('--tmu-text-panel-label').trim()      || 'rgba(160,160,160,0.8)';

    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const a = ang(i);
            const px = cx + Math.cos(a) * r * f;
            const py = cy + Math.sin(a) * r * f;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = gridClr;
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Axes
    for (let i = 0; i < N; i++) {
        const a = ang(i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = gridClr;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Polygons
    players.forEach((player, pi) => {
        const clr = COLORS[pi] || COLORS[0];
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const score = groupScore(player, groups[i]);
            const pr = r * Math.min(score / 20, 1);
            const a = ang(i);
            i === 0
                ? ctx.moveTo(cx + Math.cos(a) * pr, cy + Math.sin(a) * pr)
                : ctx.lineTo(cx + Math.cos(a) * pr, cy + Math.sin(a) * pr);
        }
        ctx.closePath();
        ctx.fillStyle = clr.fill;
        ctx.fill();
        ctx.strokeStyle = clr.stroke;
        ctx.lineWidth = 1.8;
        ctx.stroke();
    });

    // Hit map (also used for tooltip)
    const hits = groups.map((g, i) => {
        const a = ang(i);
        return {
            label: g.label,
            axisAngle: a,
            players: players.map((player, pi) => {
                const score = groupScore(player, g);
                const pr = r * Math.min(score / 20, 1);
                return { score, x: cx + Math.cos(a) * pr, y: cy + Math.sin(a) * pr, clr: COLORS[pi] || COLORS[0] };
            }),
        };
    });

    // Dots (on top of polygons)
    hits.forEach(h => h.players.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.clr.dot;
        ctx.fill();
    }));

    // Labels
    ctx.font = `bold 11px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`;
    ctx.fillStyle = axisClr;
    for (let i = 0; i < N; i++) {
        const a = ang(i);
        const lx = cx + Math.cos(a) * lr;
        const ly = cy + Math.sin(a) * lr;
        ctx.textAlign    = Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center';
        ctx.textBaseline = Math.sin(a) > 0.3 ? 'top'  : Math.sin(a) < -0.3 ? 'bottom' : 'middle';
        ctx.fillText(groups[i].label, lx, ly);
    }

    // Hover tooltip
    let tip = canvas._radarTip;
    if (!tip) {
        tip = document.createElement('div');
        tip.style.cssText =
            'position:fixed;pointer-events:none;display:none;z-index:99999;' +
            'background:var(--tmu-bg-panel,#1a1a2e);border:1px solid var(--tmu-border-soft,rgba(255,255,255,.15));' +
            'border-radius:6px;padding:5px 9px;font-size:12px;line-height:1.6;' +
            'color:var(--tmu-text-main,#e8e8e8);white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.4);';
        document.body.appendChild(tip);
        canvas._radarTip = tip;
    }

    if (canvas._radarMM) canvas.removeEventListener('mousemove', canvas._radarMM);
    if (canvas._radarML) canvas.removeEventListener('mouseleave', canvas._radarML);

    const mm = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dx = mx - cx, dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 8 || dist > lr + 10) { tip.style.display = 'none'; return; }
        const mouseAngle = Math.atan2(dy, dx);
        let best = 0, bestDiff = Infinity;
        for (let i = 0; i < N; i++) {
            let diff = Math.abs(mouseAngle - hits[i].axisAngle);
            if (diff > Math.PI) diff = 2 * Math.PI - diff;
            if (diff < bestDiff) { bestDiff = diff; best = i; }
        }
        const h = hits[best];
        tip.innerHTML = `<strong>${esc(h.label)}</strong>&nbsp;&nbsp;` +
            h.players.map(p => `<span style="color:${p.clr.dot}">●</span> ${p.score.toFixed(2)}`).join('&nbsp;&nbsp;');
        tip.style.display = 'block';
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY - 14) + 'px';
    };
    const ml = () => { tip.style.display = 'none'; };
    canvas.addEventListener('mousemove', mm);
    canvas.addEventListener('mouseleave', ml);
    canvas._radarMM = mm;
    canvas._radarML = ml;
};

// ─── Export ───────────────────────────────────────────────────────────────

export const TmPlayerRadar = {
    /**
     * Mount a radar chart into wrapper.
     * @param {HTMLElement} wrapper
     * @param {Array<{label:string, keys:Array}>} groups
     * @param {Array<Object>} players  — player objects with .skills[] and .name
     * @param {Object} [opts]
     * @param {string} [opts.legendClass]  — extra class(es) added to the legend element
     */
    mount(wrapper, groups, players, opts = {}) {
        injectCss();
        wrapper.innerHTML = '';

        if (players.length > 1) {
            const legend = document.createElement('div');
            legend.className = ['tmpr-legend', opts.legendClass].filter(Boolean).join(' ');
            legend.innerHTML = players.map((p, i) => {
                const clr = (COLORS[i] || COLORS[0]).stroke;
                return `<div class="tmpr-legend-item">
                    <div class="tmpr-legend-dot" style="background:${clr}"></div>
                    <span>${esc(p.name)}</span>
                </div>`;
            }).join('');
            wrapper.appendChild(legend);
        }

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'width:100%;aspect-ratio:1;display:block';
        wrapper.appendChild(canvas);

        requestAnimationFrame(() => drawCanvas(canvas, groups, players));
    },
};
