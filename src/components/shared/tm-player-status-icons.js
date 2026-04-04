const STYLE_ID = 'tmu-pstatus-style';

const CSS = `
.tmu-psi{display:inline-flex;align-items:center;gap:3px;vertical-align:middle;margin-left:4px}
.tmu-psi-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;vertical-align:middle}
`;

function ensureCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
}

/* ── Individual SVG icons ──────────────────────────────────── */

/** Yellow card — classic football card shape with rounded top corners */
export function yellowCardSvg(title = 'Yellow card accumulation') {
    return `<svg class="tmu-psi-icon" width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${title}" role="img">
        <title>${title}</title>
        <rect x="0.5" y="0.5" width="9" height="13" rx="2" ry="2" fill="var(--tmu-warning)" stroke="rgba(0,0,0,.25)" stroke-width="0.5"/>
    </svg>`;
}

/** Red card — same shape, red fill, optional match count */
export function redCardSvg(matches = 1, title = '') {
    const label = title || `Red card (${matches} match${matches === 1 ? '' : 'es'})`;
    const num = matches > 1
        ? `<text x="5" y="10" text-anchor="middle" font-size="7" font-weight="800" fill="white" font-family="inherit">${matches}</text>`
        : '';
    return `<svg class="tmu-psi-icon" width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${label}" role="img">
        <title>${label}</title>
        <rect x="0.5" y="0.5" width="9" height="13" rx="2" ry="2" fill="var(--tmu-danger)" stroke="rgba(0,0,0,.25)" stroke-width="0.5"/>
        ${num}
    </svg>`;
}

/** Injury — red cross in a circle */
export function injurySvg(weeks = 1) {
    const title = `Injury: ${weeks} week${weeks === 1 ? '' : 's'}`;
    return `<svg class="tmu-psi-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${title}" role="img">
        <title>${title}</title>
        <circle cx="7.5" cy="7.5" r="7" fill="var(--tmu-danger-fill)" stroke="var(--tmu-danger)" stroke-width="1"/>
        <rect x="6.25" y="3.5" width="2.5" height="8" rx="1.25" fill="var(--tmu-danger)"/>
        <rect x="3.5" y="6.25" width="8" height="2.5" rx="1.25" fill="var(--tmu-danger)"/>
        <text x="7.5" y="18" text-anchor="middle" font-size="5" font-weight="800" fill="var(--tmu-danger)" font-family="inherit" dy="0">${weeks}</text>
    </svg><span style="font-size:var(--tmu-font-2xs);font-weight:800;color:var(--tmu-danger);margin-left:1px">${weeks}w</span>`;
}

/** Retirement — exit door with arrow, no circle */
export function retireSvg() {
    const title = 'Retiring this season';
    return `<svg class="tmu-psi-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${title}" role="img">
        <title>${title}</title>
        <!-- door frame -->
        <rect x="2" y="1.5" width="6" height="11" rx="0.75" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.35)" stroke-width="0.85"/>
        <!-- door knob -->
        <circle cx="7" cy="7" r="0.7" fill="rgba(255,255,255,.5)"/>
        <!-- exit arrow -->
        <path d="M9 7 H13 M11 5 L13 7 L11 9" fill="none" stroke="rgba(255,180,60,.95)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

/** Transfer listed — TL pill badge */
export function transferSvg() {
    const title = 'On transfer list';
    return `<svg class="tmu-psi-icon" width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${title}" role="img">
        <title>${title}</title>
        <rect x="0.5" y="0.5" width="17" height="13" rx="3" fill="var(--tmu-danger-fill)" stroke="var(--tmu-danger)" stroke-width="1"/>
        <text x="9" y="10.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="var(--tmu-danger)" font-family="inherit">TL</text>
    </svg>`;
}

/** B-team badge — small "B" pill */
export function bTeamSvg() {
    const title = 'B-team player';
    return `<svg class="tmu-psi-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${title}" role="img">
        <title>${title}</title>
        <rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="var(--tmu-warning-fill)" stroke="var(--tmu-warning)" stroke-width="1"/>
        <text x="7" y="10.5" text-anchor="middle" font-size="8" font-weight="800" fill="var(--tmu-warning)" font-family="inherit">B</text>
    </svg>`;
}

/* ── Composite renderer ────────────────────────────────────── */

/**
 * Returns an HTML string with all applicable status icons for a player.
 * @param {object} p  — player data object
 *   p.ban      — 'g' for yellow, 'r1'/'r2'/... for red
 *   p.injury   — weeks as string/number, '0' = none
 *   p.retire   — truthy = retiring
 *   p.onSale   — truthy = on transfer list
 *   p.isBTeam  — truthy = b-team
 */
export function playerStatusIconsHtml(p) {
    ensureCSS();
    const parts = [];

    if (p.ban === 'g') {
        parts.push(yellowCardSvg());
    } else if (p.ban && p.ban.startsWith('r')) {
        const matches = parseInt(p.ban.slice(1)) || 1;
        parts.push(redCardSvg(matches));
    }

    if (p.injury && p.injury !== '0') {
        parts.push(injurySvg(p.injury));
    }

    if (p.retire && p.retire !== '0') {
        parts.push(retireSvg());
    }

    if (p.onSale) {
        parts.push(transferSvg());
    }

    if (p.isBTeam) {
        parts.push(bTeamSvg());
    }

    if (!parts.length) return '';
    return `<span class="tmu-psi">${parts.join('')}</span>`;
}
