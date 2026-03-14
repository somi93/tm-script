// ==UserScript==
// @name         TM Canvas Utils
// ==/UserScript==
(function () {
    'use strict';

    /* Compute "nice" tick values for a chart axis.
       Returns an array of n+/-1 evenly-spaced round numbers covering [min, max]. */
    const calcTicks = (min, max, n) => {
        if (max === min) return [min];
        const range = max - min; const raw = range / n;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const res = raw / mag; let step;
        if (res <= 1.5) step = mag; else if (res <= 3) step = 2 * mag; else if (res <= 7) step = 5 * mag; else step = 10 * mag;
        const ticks = []; let t = Math.ceil(min / step) * step;
        while (t <= max + step * 0.01) { ticks.push(Math.round(t * 10000) / 10000); t += step; }
        return ticks;
    };

    /* Set up a canvas for DPR-aware rendering.
       Writes canvas.width/height, applies ctx.scale, returns { ctx, cssW, cssH, dpr }.
       Returns null if the canvas is too small to render. */
    const setupCanvas = (canvas) => {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
        if (cssW < 10 || cssH < 10) return null;
        canvas.width = cssW * dpr; canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        return { ctx, cssW, cssH, dpr };
    };

    /* Draw horizontal Y-grid lines + left-side labels, and vertical X-grid lines + bottom labels.
       Also draws the "Age" x-axis title and an optional rotated y-axis title.

       params: {
           pL, pR, pT, pB     — padding (pixels)
           cssW, cssH         — canvas CSS dimensions
           cW, cH             — chart content width/height (derived: cssW-pL-pR, cssH-pT-pB)
           xS, yS             — scale functions: data-value → pixel
           yTicks             — array of y tick values
           ageMin, ageMax     — integer range for x ticks
           gridColor          — stroke color for grid lines
           axisColor          — fill color for labels
           formatY            — (tick) => string
           xAxisLabel         — label drawn below x axis (default: 'Age')
           yAxisLabel         — optional rotated label on left side
       }
    */
    const drawGrid = (ctx, params) => {
        const {
            pL, pT, pB, cssW, cssH, cW, cH,
            xS, yS, yTicks, ageMin, ageMax,
            gridColor, axisColor,
            formatY = v => v.toFixed(1),
            xAxisLabel = 'Age',
            yAxisLabel = null
        } = params;

        const FONT_SM = '11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
        const FONT_MD = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

        /* Y grid + labels */
        ctx.font = FONT_SM; ctx.textAlign = 'right';
        yTicks.forEach(tick => {
            const y = yS(tick);
            if (y < pT - 1 || y > pT + cH + 1) return;
            ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + cW, y); ctx.stroke();
            ctx.fillStyle = axisColor; ctx.fillText(formatY(tick), pL - 6, y + 4);
        });

        /* X grid + labels */
        ctx.textAlign = 'center';
        for (let a = ageMin; a <= ageMax; a++) {
            const x = xS(a);
            ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + cH); ctx.stroke();
            ctx.fillStyle = axisColor; ctx.fillText(String(a), x, pT + cH + 16);
        }

        /* X axis title */
        ctx.fillStyle = axisColor;
        ctx.font = FONT_MD; ctx.textAlign = 'center';
        ctx.fillText(xAxisLabel, cssW / 2, cssH - 2);

        /* Optional rotated Y axis title */
        if (yAxisLabel) {
            ctx.save();
            ctx.translate(12, pT + cH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = axisColor;
            ctx.font = FONT_MD; ctx.textAlign = 'center';
            ctx.fillText(yAxisLabel, 0, 0);
            ctx.restore();
        }
    };

    window.TmCanvasUtils = { calcTicks, setupCanvas, drawGrid };
})();
