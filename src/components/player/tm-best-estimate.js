import { TmUI } from '../shared/tm-ui.js';

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
/* ═══════════════════════════════════════
   BEST ESTIMATE CARD (tmbe-*)
   ═══════════════════════════════════════ */
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
    display: block; font-size: 9px; font-weight: 600; margin-top: 0;
}
.tmbe-subnote-range { }
.tmbe-reach-meta {
    font-weight: 400;
}
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    /* ── Private helpers ── */
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
    const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
    const extractTier = (txt) => { if (!txt) return null; const m = txt.match(/\((\d)\/(\d)\)/); return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null; };
    const confPct = (skill) => Math.round((parseInt(skill) || 0) / 20 * 100);

    const combinedStarsHtml = (current, potMax) => {
        current = parseFloat(current) || 0; potMax = parseFloat(potMax) || 0;
        if (potMax < current) potMax = current;
        let h = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= current) h += '<span class="tmsc-star-full">★</span>';
            else if (i - 0.5 <= current && current < i) {
                h += potMax >= i ? '<span class="tmsc-star-split">★</span>' : '<span class="tmsc-star-half">★</span>';
            }
            else if (i <= potMax) h += '<span class="tmsc-star-green">★</span>';
            else if (i - 0.5 <= potMax && potMax < i) h += '<span class="tmsc-star-green-half">★</span>';
            else h += '<span class="tmsc-star-empty">★</span>';
        }
        return h;
    };

    /* getCurrentBloomStatus — age is the player's current decimal age (e.g. 22.7) */
    const getCurrentBloomStatus = (allReports, scouts, age) => {
        if (!allReports || !allReports.length || age === null) return { text: '-', certain: false, range: null };
        const getDevSkill = (r) => {
            if (!scouts) return 0;
            const s = Object.values(scouts).find(sc => String(sc.id) === String(r.scoutid));
            return s ? (parseInt(s.development) || 0) : 0;
        };
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
            const bt = r.bloom_status_txt || '';
            if (!bt || bt === '-') continue;
            if (bt === 'Bloomed') { seenBloomed = true; continue; }
            if (!bt.includes('Not bloomed')) continue;
            const hasType = bt.includes('Early') || bt.includes('Normal') || bt.includes('Late');
            if (!hasType) continue;
            const devSk = getDevSkill(r);
            const rDate = r.done || '';
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
            const bt = r.bloom_status_txt || '';
            if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
            const rAge = parseFloat(r.report_age) || 0;
            if (rAge < bloomWinMin || rAge >= bloomWinMax) continue;
            const devSk = getDevSkill(r);
            if (devSk > maxPhaseDevSkInWindow) maxPhaseDevSkInWindow = devSk;
        }
        const phaseThreshold = maxPhaseDevSkInWindow >= MIN_PHASE_DEV ? MIN_PHASE_DEV : maxPhaseDevSkInWindow;

        let bestPhase = null;
        for (const r of allReports) {
            const bt = r.bloom_status_txt || '';
            if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
            const rAge = parseFloat(r.report_age) || 0;
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
                const bt = r.bloom_status_txt || '';
                if (!bt.includes('Not bloomed')) continue;
                const rAge = parseFloat(r.report_age) || 0;
                const devSk = getDevSkill(r);
                if (rAge >= bestPhase.knownStart && devSk > bestPhase.devSkill) { dominated = true; break; }
            }
            if (!dominated) return statusFrom(bestPhase.knownStart);
        }

        if (seenBloomed) return { text: 'Bloomed', certain: true, range: null };
        if (!possibleStarts) return { text: '-', certain: false, range: null };

        for (const r of allReports) {
            const bt = r.bloom_status_txt || '';
            if (!bt.includes('Not bloomed')) continue;
            const rAge = parseFloat(r.report_age) || 0;
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

    /**
     * render(container, props)
     *
     * @param {Element}  container          - DOM element to render the card into.
     * @param {object}   props
     * @param {object}   props.scoutData    - Raw data from TmApi.fetchPlayerInfo(id, 'scout').
     * @param {object}   props.player       - Raw tooltip player object (p from fetchPlayerInfo).
     */
    const render = (container, { scoutData = {}, player = null, title = 'Best Estimate', icon = '★' } = {}) => {
        const isGK = player.isGK;
        const age = player && player.age != null ? player.age + (player.months || 0) / 12 : null;
        const recSort = player && player.rec_sort != null ? parseFloat(player.rec_sort) : null;

        const skills = player.skills.filter(skill => isGK ? skill.isGK : skill.isOutfield);
        const data = scoutData;
        const hasScouts = data && data.reports && data.reports.length && data.scouts;
        let scouts = {}, regular = [];
        let potPick = null, bloomPick = null, phyPick = null, tacPick = null, tecPick = null, psyPick = null;
        if (hasScouts) {
            scouts = data.scouts;
            regular = data.reports.filter(r => r.scout_name !== 'YD' && r.scoutid !== '0');
            if (regular.length) {
                const scoutSkill = (r, field) => { const s = Object.values(scouts).find(s => String(s.id) === String(r.scoutid)); return s ? (parseInt(s[field]) || 0) : 0; };
                const pickBest = (field) => { let best = null, bs = -1, bd = ''; for (const r of regular) { const sk = scoutSkill(r, field); const d = r.done || ''; if (sk > bs || (sk === bs && d > bd)) { best = r; bs = sk; bd = d; } } return best ? { report: best, conf: confPct(bs) } : null; };
                const pickBestPot = () => { let best = null, bs = -1, bd = ''; for (const r of regular) { const s = Object.values(scouts).find(s => String(s.id) === String(r.scoutid)); const rAge = parseInt(r.report_age) || 0; let sk = 0; if (s) { const senYth = rAge < 20 ? (parseInt(s.youths) || 0) : (parseInt(s.seniors) || 0); const dev = parseInt(s.development) || 0; sk = Math.min(senYth, dev); } const d = r.done || ''; if (sk > bs || (sk === bs && d > bd)) { best = r; bs = sk; bd = d; } } return best ? { report: best, conf: confPct(bs) } : null; };
                potPick = pickBestPot(); bloomPick = pickBest('development'); phyPick = pickBest('physical');
                tacPick = pickBest('tactical'); tecPick = pickBest('technical'); psyPick = pickBest('psychology');
            }
        }

        if (!regular.length && !skills.length) return;

        const skillCategories = [
            { label: 'Physique',  category: 'Physical',  key: 'phy', pick: phyPick, peakField: 'peak_phy_txt' },
            { label: 'Tactical',  category: 'Tactical',  key: 'tac', pick: tacPick, peakField: 'peak_tac_txt' },
            { label: 'Technical', category: 'Technical', key: 'tec', pick: tecPick, peakField: 'peak_tec_txt' },
        ].map(({ label, category, key, pick, peakField }) => {
            const value = skills.filter(s => s.category === category).reduce((sum, s) => sum + (s.value || 0), 0).toFixed(2);
            const peakArr = (isGK ? PEAK_SUMS.gk : PEAK_SUMS.outfield)[key];
            const text = pick ? cleanPeakText(pick.report[peakField]) : '';
            const conf = pick ? pick.conf : null;
            return { label, value, pick, peakArr, text, conf };
        });

        const pot = potPick ? parseInt(potPick.report.old_pot) || 0 : 0;
        const potStarsVal = potPick ? (parseFloat(potPick.report.potential) || 0) / 2 : 0;
        const rec = potPick ? parseFloat(potPick.report.rec) || 0 : 0;
        const bloomResult = getCurrentBloomStatus(regular, scouts, age);
        const bloomTxt = bloomResult.text || '-';
        const devTxt = bloomPick ? bloomPick.report.dev_status : '-';
        let specVal = 0, specLabel = 'None', specConf = null;
        for (const { pick } of skillCategories) { if (pick) { const s = parseInt(pick.report.specialist) || 0; if (s > 0) { specVal = s; specLabel = SPECIALTIES[s] || 'None'; specConf = pick.conf; break; } } }

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
            const tier = extractTier(p.text);
            const curSum = p.value || null;

            if (tier && curSum !== null) {
                const peakSum = p.peakArr[tier.val - 1];
                const peakPct = (peakSum / maxPeakSum) * 100;
                const curPct = (curSum / maxPeakSum) * 100;
                const c = barColor(tier.val, tier.max);
                const rPct = Math.round(curSum / peakSum * 100); const rC = reachColor(rPct);
                const mPct = Math.round(curSum / maxPeakSum * 100); const mC = reachColor(mPct);
                const reachLbl = `<tm-row data-cls="tmbe-peak-reach my-2 text-xs font-bold" data-justify="space-between" data-gap="12px"><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Peak</span><span style="color:${rC}">${rPct}%</span><span class="text-xs tmbe-reach-meta tmu-meta tmu-tabular">(${curSum}/${peakSum})</span></tm-row><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span><span class="text-xs tmbe-reach-meta tmu-meta tmu-tabular">(${curSum}/${maxPeakSum})</span></tm-row></tm-row>`;
                peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c};opacity:0.35"></div><div class="tmbe-bar-fill-reach" style="width:${curPct}%;background:${rC}"></div></div></div>`;
            } else if (curSum !== null) {
                const mPct = Math.round(curSum / maxPeakSum * 100);
                const curPct = (curSum / maxPeakSum) * 100;
                const mC = reachColor(mPct);
                const reachLbl = `<tm-row data-cls="tmbe-peak-reach text-xs font-bold" data-justify="space-between" data-gap="12px"><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span><span class="text-xs tmbe-reach-meta tmu-meta tmu-tabular">(${curSum}/${maxPeakSum})</span></tm-row></tm-row>`;
                peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold tmbe-unknown">?</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${curPct}%;background:${mC}"></div></div></div>`;
            } else if (tier) {
                const peakSum = p.peakArr[tier.val - 1];
                const peakPct = (peakSum / maxPeakSum) * 100;
                const c = barColor(tier.val, tier.max);
                peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c}"></div></div></div>`;
            }
        }

        /* Personality */
        let persH = '';
        if (psyPick) {
            const pers = [{ label: 'Leadership', value: parseInt(psyPick.report.charisma) || 0 }, { label: 'Professionalism', value: parseInt(psyPick.report.professionalism) || 0 }, { label: 'Aggression', value: parseInt(psyPick.report.aggression) || 0 }];
            for (const p of pers) { const pct = (p.value / 20) * 100; const c = skillColor(p.value); persH += `<div class="tmbe-bar-row"><tm-row data-justify="space-between"><span class="tmbe-bar-label tmu-text-panel-label text-sm font-semibold">${p.label}</span><tm-row data-gap="8px"><span class="tmbe-bar-val tmu-tabular text-sm font-bold" style="color:${c}">${p.value}</span>${cb(psyPick.conf)}</tm-row></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${pct}%;background:${c}"></div></div></div>`; }
        } else if (!hasScouts) {
            for (const lbl of ['Leadership', 'Professionalism', 'Aggression']) {
                persH += `<tm-stat data-label="${lbl}" data-value="?" data-variant="muted"></tm-stat>`;
            }
        }

        const currentRating = recSort !== null ? recSort : rec;
        const hasData = regular.length > 0;
        const unknownClass = 'tmbe-unknown';

        let h = `<tm-card data-title="${title}" data-icon="${icon}" data-head-ref="head">`;
        h += `<div class="tmbe-grid">`;
        h += `<tm-stat data-label="Potential" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? ` style="color:${potColor(pot)}"` : ` class="${unknownClass}"`}>${hasData ? pot : '?'}${potPick ? cb(potPick.conf) : ''}</span></tm-stat>`;

        const beBloomClr = hasData ? (bloomResult.certain ? (bloomResult.phases ? THEME_COLORS.accent : bloomColor(bloomTxt)) : THEME_COLORS.warning) : '';
        const beBloomTxt = hasData ? (!bloomResult.certain && !bloomResult.phases ? (bloomResult.text || bloomResult.range || '-') : bloomTxt) : '?';
        let beBloomSub = '';
        if (hasData && bloomResult.phases) beBloomSub += `<span class="tmbe-subnote tmu-note">${bloomResult.phases}</span>`;
        if (hasData && bloomResult.range && bloomTxt !== 'Bloomed') beBloomSub += `<span class="tmbe-subnote tmbe-subnote-range tmu-meta tmu-text-faint">${bloomResult.range}</span>`;
        h += `<tm-stat data-label="Bloom" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? ` style="color:${beBloomClr}"` : ` class="${unknownClass}"`}>${beBloomTxt}${bloomPick ? cb(bloomPick.conf) : ''}${beBloomSub}</span></tm-stat>`;
        h += `<tm-stat data-label="Development" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? ' class="tmu-text-strong"' : ` class="${unknownClass}"`}>${hasData ? devTxt : '?'}${bloomPick ? cb(bloomPick.conf) : ''}</span></tm-stat>`;
        h += `<tm-stat data-label="Specialty" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span${hasData ? (specVal > 0 ? ` style="color:${THEME_COLORS.warning}"` : ` class="${unknownClass}"`) : ` class="${unknownClass}"`}>${hasData ? specLabel : '?'}${specConf !== null ? cb(specConf) : ''}</span></tm-stat>`;
        if (peaksH) h += `<tm-divider data-label="Peak Development"></tm-divider>${peaksH}`;
        h += `</div>`;
        if (persH) h += `<tm-divider data-label="Personality"></tm-divider>${persH}`;
        h += `</tm-card>`;

        const refs = TmUI.render(container, h);
        if (refs.head) {
            const starsSpan = document.createElement('span');
            starsSpan.className = 'tmbe-title-stars text-xl';
            starsSpan.innerHTML = combinedStarsHtml(currentRating, potStarsVal);
            refs.head.appendChild(starsSpan);
        }
    };

    export const TmBestEstimate = { render };

