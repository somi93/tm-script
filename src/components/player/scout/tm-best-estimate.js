import { TmUI } from '../../shared/tm-ui.js';
import { TmStars } from '../../shared/tm-stars.js';

const THEME_COLORS = {
    success: 'var(--tmu-success)',
    successStrong: 'var(--tmu-success-strong)',
    accent: 'var(--tmu-accent)',
    main: 'var(--tmu-text-main)',
    warning: 'var(--tmu-warning)',
    warningSoft: 'var(--tmu-warning-soft)',
    danger: 'var(--tmu-danger)',
    info: 'var(--tmu-info-alt)'
};

const CSS = `
/* ---------------------------------------
   BEST ESTIMATE CARD (tmbe-*)
   --------------------------------------- */
.tmbe-title-stars { letter-spacing: 1px; line-height: 1; margin-left: auto; }
.tmbe-grid {
    display: grid; grid-template-columns: 1fr; gap: var(--tmu-space-sm); margin-bottom: var(--tmu-space-lg);
}
.tmbe-item {
    background: var(--tmu-surface-overlay); border: 1px solid var(--tmu-border-input);
}
.tmbe-peak-item {
    flex-direction: column !important; align-items: stretch !important; gap: var(--tmu-space-sm); padding: var(--tmu-space-sm) var(--tmu-space-md) !important;
}
.tmbe-peak-reach { line-height: 1; }
.tmbe-reach-tag { color: var(--tmu-text-dim); }
.tmbe-bar-row {
    display: flex; flex-direction: column; gap: var(--tmu-space-xs); padding: var(--tmu-space-sm) 0;
    border-bottom: 1px solid var(--tmu-border-soft);
}
.tmbe-bar-row:last-child { border-bottom: none; }
.tmbe-bar-label { }
.tmbe-bar-track {
    width: 100%; height: 6px; background: var(--tmu-surface-overlay-strong); border-radius: var(--tmu-space-xs);
    overflow: hidden; position: relative;
}
.tmbe-bar-fill { height: 100%; border-radius: var(--tmu-space-xs); transition: width 0.3s; }
.tmbe-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: var(--tmu-space-xs); transition: width 0.3s;
}
.tmbe-bar-val { }
.tmbe-conf {
    display: inline-block; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
.tmbe-unknown { color: var(--tmu-text-dim); }
.tmbe-subnote {
    display: block; font-size: var(--tmu-font-2xs); font-weight: 600; margin-top: 0;
}
.tmbe-subnote-range { }
.tmbe-reach-meta {
    font-weight: 400;
}
`;
const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

/* -- Private helpers -- */
const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
const PEAK_SUMS = {
    outfield: { phy: [64, 70, 74, 80], tac: [64, 70, 74, 80], tec: [96, 105, 111, 120] },
    gk: { phy: [64, 70, 74, 80], tac: [50, 55, 60], tec: [68, 74, 80] }
};

const skillColor = (v) => { v = parseInt(v); if (v >= 19) return THEME_COLORS.success; if (v >= 16) return THEME_COLORS.accent; if (v >= 13) return THEME_COLORS.main; if (v >= 10) return THEME_COLORS.warning; if (v >= 7) return THEME_COLORS.warningSoft; return THEME_COLORS.danger; };
const potColor = (pot) => { pot = parseInt(pot); if (pot >= 18) return THEME_COLORS.success; if (pot >= 15) return THEME_COLORS.info; if (pot >= 12) return THEME_COLORS.main; if (pot >= 9) return THEME_COLORS.warning; return THEME_COLORS.danger; };
const barColor = (val, max) => { const r = val / max; if (r >= 0.75) return THEME_COLORS.success; if (r >= 0.5) return THEME_COLORS.accent; if (r >= 0.25) return THEME_COLORS.warning; return THEME_COLORS.danger; };
const reachColor = (pct) => { if (pct >= 90) return THEME_COLORS.success; if (pct >= 80) return THEME_COLORS.accent; if (pct >= 70) return THEME_COLORS.warning; if (pct >= 60) return THEME_COLORS.warningSoft; return THEME_COLORS.danger; };
const bloomColor = (txt) => { if (!txt) return THEME_COLORS.main; const t = txt.toLowerCase(); if (t === 'bloomed') return THEME_COLORS.success; if (t.includes('late bloom')) return THEME_COLORS.accent; if (t.includes('middle')) return THEME_COLORS.warning; if (t.includes('starting')) return THEME_COLORS.warningSoft; if (t.includes('not bloomed')) return THEME_COLORS.danger; return THEME_COLORS.main; };


/* getCurrentBloomStatus age is the player's current decimal age (e.g. 22.7) */
const getCurrentBloomStatus = (allReports, age) => {
    if (!allReports || !allReports.length || age === null) return { text: '-', certain: false, range: null };
    const getDevSkill = (r) => parseInt(r.scout?.development, 10) || 0;
    const bloomTxt = (r) => r.development?.[1]?.value || '';
    const phaseFor = (start) => {
        if (age < start) return 'not';
        if (age >= start + 3) return 'done';
        const y = age - start;
        return y < 1 ? 'starting' : y < 2 ? 'middle' : 'late';
    };
    const PHASE_LABEL = { not: 'Not bloomed', starting: 'Starting', middle: 'Middle', late: 'Late bloom', done: 'Bloomed' };
    const statusFrom = (start) => {
        const range = `${start}.0\u2013${start + 2}.11`;
        const p = phaseFor(start);
        if (p === 'done') return { text: 'Bloomed', certain: true, range: null };
        const notBloomedTxt = bloomType ? `Not bloomed (${bloomType})` : 'Not bloomed';
        const text = p === 'not' ? notBloomedTxt : p === 'starting' ? 'Starting to bloom' : p === 'middle' ? 'In the middle of his bloom' : 'In his late bloom';
        return { text, certain: true, range };
    };

    let seenBloomed = false;
    let bloomType = null, possibleStarts = null;
    let bloomTypeBestDevSk = -1, bloomTypeBestDate = '';
    for (const r of allReports) {
        const bt = bloomTxt(r);
        if (!bt || bt === '-') continue;
        if (bt === 'Bloomed') { seenBloomed = true; continue; }
        if (!bt.includes('Not bloomed')) continue;
        const hasType = bt.includes('Early') || bt.includes('Normal') || bt.includes('Late');
        if (!hasType) continue;
        const devSk = getDevSkill(r);
        const rDate = r.date || '';
        if (devSk > bloomTypeBestDevSk || (devSk === bloomTypeBestDevSk && rDate > bloomTypeBestDate)) {
            bloomTypeBestDevSk = devSk; bloomTypeBestDate = rDate;
            if (bt.includes('Early')) { bloomType = 'Early'; possibleStarts = [16, 17]; }
            else if (bt.includes('Normal')) { bloomType = 'Normal'; possibleStarts = [18, 19]; }
            else { bloomType = 'Late'; possibleStarts = [20, 21, 22]; }
        }
    }

    const MIN_PHASE_DEV = 15;
    const bloomWinMin = possibleStarts ? possibleStarts[0] : Infinity;
    const bloomWinMax = possibleStarts ? possibleStarts[possibleStarts.length - 1] + 3 : -Infinity;
    let maxPhaseDevSkInWindow = 0;
    for (const r of allReports) {
        const bt = bloomTxt(r);
        if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
        const rAge = r.age || 0;
        if (rAge < bloomWinMin || rAge >= bloomWinMax) continue;
        const devSk = getDevSkill(r);
        if (devSk > maxPhaseDevSkInWindow) maxPhaseDevSkInWindow = devSk;
    }
    const phaseThreshold = maxPhaseDevSkInWindow >= MIN_PHASE_DEV ? MIN_PHASE_DEV : maxPhaseDevSkInWindow;

    let bestPhase = null;
    for (const r of allReports) {
        const bt = bloomTxt(r);
        if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
        const rAge = r.age || 0;
        const rFloor = Math.floor(rAge);
        const devSk = getDevSkill(r);
        let candidateStart = null;
        if (bt.includes('Starting') && !bt.includes('Not')) candidateStart = rFloor;
        else if (bt.toLowerCase().includes('middle')) candidateStart = rFloor - 1;
        else if (bt.toLowerCase().includes('late bloom')) candidateStart = rFloor - 2;
        if (candidateStart === null) continue;
        const inWindow = possibleStarts && rAge >= bloomWinMin && rAge < bloomWinMax;
        if (inWindow && devSk < phaseThreshold) continue;
        if (possibleStarts && !possibleStarts.includes(candidateStart)) continue;
        if (!bestPhase || devSk > bestPhase.devSkill) {
            bestPhase = { knownStart: candidateStart, devSkill: devSk };
        }
    }

    if (bestPhase) {
        let dominated = false;
        for (const r of allReports) {
            const bt = bloomTxt(r);
            if (!bt.includes('Not bloomed')) continue;
            const rAge = r.age || 0;
            const devSk = getDevSkill(r);
            if (rAge >= bestPhase.knownStart && devSk > bestPhase.devSkill) { dominated = true; break; }
        }
        if (!dominated) return statusFrom(bestPhase.knownStart);
    }

    if (seenBloomed) return { text: 'Bloomed', certain: true, range: null };
    if (!possibleStarts) return { text: '-', certain: false, range: null };

    for (const r of allReports) {
        const bt = bloomTxt(r);
        if (!bt.includes('Not bloomed')) continue;
        const rAge = r.age || 0;
        possibleStarts = possibleStarts.filter(s => s > rAge);
    }
    if (possibleStarts.length === 0) return { text: '-', certain: false, range: null };
    if (possibleStarts.length === 1) return statusFrom(possibleStarts[0]);

    const rangeStr = possibleStarts.map(s => `${s}.0\u2013${s + 2}.11`).join(' or ');
    const phases = possibleStarts.map(s => phaseFor(s));
    const unique = [...new Set(phases)];
    const notBloomedLabel = bloomType ? `Not bloomed (${bloomType})` : 'Not bloomed';
    if (unique.length === 1) {
        if (unique[0] === 'not') return { text: notBloomedLabel, certain: true, range: rangeStr };
        if (unique[0] === 'done') return { text: 'Bloomed', certain: true, range: null };
        return { text: PHASE_LABEL[unique[0]], certain: true, range: rangeStr };
    }
    const allBlooming = phases.every(p => p !== 'not' && p !== 'done');
    if (allBlooming) {
        const labels = unique.map(p => PHASE_LABEL[p]).join(' or ');
        return { text: 'Blooming', certain: true, phases: labels, range: rangeStr };
    }
    let parts = [];
    if (phases.includes('not')) parts.push(notBloomedLabel);
    const bloomPhases = unique.filter(p => p !== 'not' && p !== 'done');
    if (bloomPhases.length) parts.push('Blooming (' + bloomPhases.map(p => PHASE_LABEL[p]).join('/') + ')');
    if (phases.includes('done')) parts.push('Bloomed');
    return { text: parts.join(' or '), certain: false, range: rangeStr };
};

const render = (container, { player = null, title = 'Best Estimate', icon = '★' } = {}) => {
    const currentPosition = [...(player?.positions || [])]
        .sort((a, b) => Number(b.preferred) - Number(a.preferred) || Number(b.rec || 0) - Number(a.rec || 0) || (a.ordering ?? 0) - (b.ordering ?? 0))[0] || null;

    const estimate = player?.bestEstimate ?? null;
    const regular = (player?.scoutReports ?? []).filter(r => r.scout?.id && r.scout.id !== '0');
    const hasData = regular.length > 0;

    if (!hasData && !(player?.skills ?? []).some(skill => skill.isGK ? skill.isGK : skill.isOutfield)) return;

    const potEntry   = estimate?.development?.[0];
    const bloomEntry = estimate?.development?.[1];
    const devEntry   = estimate?.development?.[2];
    const pot         = potEntry?.value ?? 0;
    const potStarsVal = (estimate?.rec ?? 0) / 2;
    const rec         = estimate?.rec ?? 0;

    const bloomResult = getCurrentBloomStatus(regular, player?.ageMonths != null ? player.ageMonths / 12 : null);
    const bloomTxt    = bloomResult.text || '-';
    const devTxt      = devEntry?.value || '-';

    const specVal   = estimate?.specialist?.value ?? 0;
    const specLabel = SPECIALTIES[specVal] || 'None';
    const phyEntry  = estimate?.peaks?.[0];
    const tacEntry  = estimate?.peaks?.[1];
    const tecEntry  = estimate?.peaks?.[2];
    let specConf = null;
    if (specVal > 0) {
        const physicalSpec = [1, 2, 3, 11];
        const tacticalSpec = [4, 5, 6, 7];
        if (physicalSpec.includes(specVal)) specConf = phyEntry?.reliability ?? null;
        else if (tacticalSpec.includes(specVal)) specConf = tacEntry?.reliability ?? null;
        else specConf = tecEntry?.reliability ?? null;
    }

    const skillCategories = [
        { label: 'Physique',  category: 'Physical',  key: 'phy', peakEntry: phyEntry },
        { label: 'Tactical',  category: 'Tactical',  key: 'tac', peakEntry: tacEntry },
        { label: 'Technical', category: 'Technical', key: 'tec', peakEntry: tecEntry },
    ].map(({ label, category, key, peakEntry }) => {
        const value = (player?.skills ?? [])
            .filter(skill => skill.category === category)
            .reduce((sum, skill) => sum + (skill.value || 0), 0)
            .toFixed(2);
        const peakArr = (player?.isGK ? PEAK_SUMS.gk : PEAK_SUMS.outfield)[key];
        return { label, value, peakArr, tier: peakEntry?.value ?? null, conf: peakEntry?.reliability ?? null };
    });

    const cb = (conf) => {
        if (conf === null) return '';
        const tone = conf === 0 ? 'muted' : conf >= 90 ? 'success' : conf >= 70 ? 'warn' : 'danger';
        return TmUI.badge({
            label: conf === 0 ? '?' : `${conf}%`,
            size: 'xs',
            shape: 'rounded',
            weight: 'bold',
            cls: 'tmbe-conf ml-1',
        }, tone);
    };

    /* Peak bars with reach */
    let peaksH = '';
    for (const p of skillCategories) {
        if (!p.peakArr) continue;
        const maxPeakSum = p.peakArr[p.peakArr.length - 1];
        const tier = p.tier;  // { value, max } or null
        const curSum = p.value || null;

        if (tier && curSum !== null) {
            const peakSum = p.peakArr[tier.value - 1];
            const peakPct = (peakSum / maxPeakSum) * 100;
            const curPct = (curSum / maxPeakSum) * 100;
            const c = barColor(tier.value, tier.max);
            const rPct = Math.round(curSum / peakSum * 100); const rC = reachColor(rPct);
            const mPct = Math.round(curSum / maxPeakSum * 100); const mC = reachColor(mPct);
            const reachLbl = `<tm-row data-cls="tmbe-peak-reach my-2 text-xs font-bold" data-justify="space-between" data-gap="12px"><div><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Peak</span><span style="color:${rC}">${rPct}%</span></tm-row><tm-row><span class="text-xs tmbe-reach-meta tmu-meta tmu-tabular">(${curSum}/${peakSum})</span></tm-row></div><div><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span></tm-row><tm-row><span class="text-xs tmbe-reach-meta tmu-meta tmu-tabular">(${curSum}/${maxPeakSum})</span></tm-row></div></tm-row>`;
            peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.value}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c};opacity:0.35"></div><div class="tmbe-bar-fill-reach" style="width:${curPct}%;background:${rC}"></div></div></div>`;
        } else if (curSum !== null) {
            const mPct = Math.round(curSum / maxPeakSum * 100);
            const curPct = (curSum / maxPeakSum) * 100;
            const mC = reachColor(mPct);
            const reachLbl = `<tm-row data-cls="tmbe-peak-reach text-xs font-bold" data-justify="space-between" data-gap="12px"><div><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span></tm-row><tm-row><span class="text-xs tmbe-reach-meta tmu-meta tmu-tabular">(${curSum}/${maxPeakSum})</span></tm-row></div></tm-row>`;
            peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold tmbe-unknown">?</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${curPct}%;background:${mC}"></div></div></div>`;
        } else if (tier) {
            const peakSum = p.peakArr[tier.value - 1];
            const peakPct = (peakSum / maxPeakSum) * 100;
            const c = barColor(tier.value, tier.max);
            peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.value}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c}"></div></div></div>`;
        }
    }

    /* Personality */
    let persH = '';
    const persEntries = estimate?.personality ?? [];
    if (persEntries.length && hasData) {
        for (const item of persEntries) {
            const v = item.value ?? 0;
            const pct = (v / 20) * 100;
            const c = skillColor(v);
            persH += `<div class="tmbe-bar-row"><tm-row data-justify="space-between"><span class="tmbe-bar-label tmu-text-panel-label text-sm font-semibold">${item.label}</span><tm-row data-gap="8px"><span class="tmbe-bar-val tmu-tabular text-sm font-bold" style="color:${c}">${v}</span>${cb(item.reliability)}</tm-row></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${pct}%;background:${c}"></div></div></div>`;
        }
    } else if (!hasData) {
        for (const lbl of ['Leadership', 'Professionalism', 'Aggression']) {
            persH += `<tm-stat data-label="${lbl}" data-value="?" data-variant="muted"></tm-stat>`;
        }
    }

    const currentRating = currentPosition?.rec != null ? Number(currentPosition.rec) : rec;
    const unknownClass = 'tmbe-unknown';

    let h = `<tm-card data-title="${title}" data-icon="${icon}" data-head-ref="head">`;
    h += `<div class="tmbe-grid">`;
    h += `<tm-stat data-label="Potential" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? ` style="color:${potColor(pot)}"` : ` class="${unknownClass}"`}>${hasData ? pot : '?'}${potEntry ? cb(potEntry.reliability) : ''}</span></tm-stat>`;

    const beBloomClr = hasData ? (bloomResult.certain ? (bloomResult.phases ? THEME_COLORS.accent : bloomColor(bloomTxt)) : THEME_COLORS.warning) : '';
    const beBloomTxt = hasData ? (!bloomResult.certain && !bloomResult.phases ? (bloomResult.text || bloomResult.range || '-') : bloomTxt) : '?';
    let beBloomSub = '';
    if (hasData && bloomResult.phases) beBloomSub += `<span class="tmbe-subnote tmu-note">${bloomResult.phases}</span>`;
    if (hasData && bloomResult.range && bloomTxt !== 'Bloomed') beBloomSub += `<span class="tmbe-subnote tmbe-subnote-range tmu-meta tmu-text-faint">${bloomResult.range}</span>`;
    h += `<tm-stat data-label="Bloom" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? ` style="color:${beBloomClr}"` : ` class="${unknownClass}"`}>${beBloomTxt}${bloomEntry ? cb(bloomEntry.reliability) : ''}${beBloomSub}</span></tm-stat>`;
    h += `<tm-stat data-label="Development" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? ' class="tmu-text-strong"' : ` class="${unknownClass}"`}>${hasData ? devTxt : '?'}${bloomEntry ? cb(bloomEntry.reliability) : ''}</span></tm-stat>`;
    h += `<tm-stat data-label="Specialty" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? (specVal > 0 ? ` style="color:${THEME_COLORS.warning}"` : ` class="${unknownClass}"`) : ` class="${unknownClass}"`}>${hasData ? specLabel : '?'}${specConf !== null ? cb(specConf) : ''}</span></tm-stat>`;
    if (peaksH) h += `<tm-divider data-label="Peak Development"></tm-divider>${peaksH}`;
    h += `</div>`;
    if (persH) h += `<tm-divider data-label="Personality"></tm-divider>${persH}`;
    h += `</tm-card>`;

    const refs = TmUI.render(container, h);
    if (refs.head) {
        const starsSpan = document.createElement('span');
        starsSpan.className = 'tmbe-title-stars text-xl';
        starsSpan.innerHTML = TmStars.combined(currentRating, potStarsVal);
        refs.head.appendChild(starsSpan);
    }
};

export const TmBestEstimate = { render };

