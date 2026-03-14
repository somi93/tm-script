(function () {
    'use strict';

    const { calcTicks, setupCanvas, drawGrid } = window.TmCanvasUtils;

    window.TmR5HistoryChart = {

        /* draw(canvas, visibleSeries, opts, zoomState)
           zoomState = { ageMin, ageMax, yMin, yMax } or null for auto-fit
           Returns chartInfo = { xS, yS, yMin, yMax, ageMin, ageMax } */
        draw(canvas, visibleSeries, opts = {}, zoomState = null) {
            const { gridColor = 'rgba(255,255,255,0.08)', axisColor = '#9ab889' } = opts;
            const setup = setupCanvas(canvas);
            if (!setup) return null;
            const { ctx, cssW, cssH } = setup;

            const pL = 52, pR = 14, pT = 14, pB = 32;
            const cW = cssW - pL - pR, cH = cssH - pT - pB;

            /* Compute age range from all visible data */
            let allAges = [], allVals = [];
            visibleSeries.forEach(s => { allAges.push(...s.ages); allVals.push(...s.values); });
            if (!allVals.length) { allVals = [0, 100]; allAges = [15, 37]; }

            let ageMin, ageMax, yMin, yMax;
            if (zoomState) {
                ageMin = zoomState.ageMin; ageMax = zoomState.ageMax;
                yMin = zoomState.yMin; yMax = zoomState.yMax;
            } else {
                ageMin = Math.floor(Math.min(...allAges));
                ageMax = Math.ceil(Math.max(...allAges));
                const rMin = Math.min(...allVals), rMax = Math.max(...allVals);
                const mg = (rMax - rMin) * 0.06 || 5;
                yMin = Math.floor(rMin - mg);
                yMax = Math.ceil(rMax + mg);
            }

            const xS = v => pL + ((v - ageMin) / (Math.max(ageMax, ageMin + 1) - ageMin)) * cW;
            const yS = v => pT + cH - ((v - yMin) / (Math.max(yMax, yMin + 1) - yMin)) * cH;

            /* Background */
            ctx.clearRect(0, 0, cssW, cssH);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(pL, pT, cW, cH);

            /* Y grid + labels */
            const yTicks = calcTicks(yMin, yMax, 8);
            drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin, ageMax, gridColor, axisColor, yAxisLabel: 'R5 Rating' });

            /* Draw lines — non-highlighted first, highlighted on top */
            const anyHL = visibleSeries.some(v => v.highlighted);
            const drawOrder = [...visibleSeries.filter(s => !s.highlighted), ...visibleSeries.filter(s => s.highlighted)];

            drawOrder.forEach(s => {
                const alpha = s.highlighted ? 1.0 : (anyHL ? 0.12 : 0.75);
                const lw = s.highlighted ? 2.8 : 1.3;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = s.color;
                ctx.lineWidth = lw;
                ctx.lineJoin = 'round'; ctx.lineCap = 'round';
                ctx.beginPath();
                let first = true;
                for (let i = 0; i < s.ages.length; i++) {
                    const x = xS(s.ages[i]), y = yS(s.values[i]);
                    if (first) { ctx.moveTo(x, y); first = false; }
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                /* Dots only for highlighted players */
                if (s.highlighted) {
                    for (let i = 0; i < s.ages.length; i++) {
                        ctx.beginPath();
                        ctx.arc(xS(s.ages[i]), yS(s.values[i]), 2.5, 0, Math.PI * 2);
                        ctx.fillStyle = s.color; ctx.fill();
                    }
                }
                ctx.restore();
            });

            /* Border */
            ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1;
            ctx.strokeRect(pL, pT, cW, cH);

            return { xS, yS, yMin, yMax, ageMin, ageMax };
        },

        /* attachTooltip(canvas, tipEl, getSeriesFn, chartInfoGetter) */
        attachTooltip(canvas, tipEl, getSeriesFn, chartInfoGetter) {
            const { R5_THRESHOLDS } = window.TmConst;
            const { getColor } = window.TmUtils;

            canvas.addEventListener('mousemove', e => {
                const info = chartInfoGetter();
                if (!info) return;
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left, my = e.clientY - rect.top;
                const vis = getSeriesFn();
                let best = null, bd = Infinity;

                vis.forEach(s => {
                    for (let i = 0; i < s.ages.length; i++) {
                        const dx = mx - info.xS(s.ages[i]);
                        const dy = my - info.yS(s.values[i]);
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < bd && d < 30) { bd = d; best = { s, i }; }
                    }
                });

                if (best) {
                    const { s, i } = best;
                    const age = s.ages[i], val = s.values[i];
                    const ay = Math.floor(age), am = Math.round((age - ay) * 12);
                    tipEl.innerHTML = `<span style="color:${s.color}">●</span> <b>${s.name}</b> <span style="color:#6a9a58">(${s.posLabel})</span><br>` +
                        `<b>R5:</b> <span style="color:${getColor(val, R5_THRESHOLDS)}">${Number(val).toFixed(2)}</span> &nbsp; <b>Age:</b> ${ay}y ${am}m`;
                    tipEl.style.display = 'block';
                    const px = info.xS(age), py = info.yS(val);
                    let tx = px - tipEl.offsetWidth / 2;
                    if (tx < 0) tx = 4;
                    if (tx + tipEl.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tipEl.offsetWidth - 4;
                    let ty = py - 50;
                    if (ty < 0) ty = py + 16;
                    tipEl.style.left = tx + 'px';
                    tipEl.style.top = ty + 'px';
                } else {
                    tipEl.style.display = 'none';
                }
            });
            canvas.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; });
        },
    };

})();
