import { TmUtils } from '../../lib/tm-utils.js';
import { TmBestEstimate } from '../player/tm-best-estimate.js';

const STYLE_ID = 'tm-scout-report-cards-style';
const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmsc-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
        .tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
        .tmsc-star-full { color: #fbbf24; }
        .tmsc-star-half {
            background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-empty { color: #3d6828; }
        .tmsc-report { display: flex; flex-direction: column; gap: 14px; }
        .tmsc-report-header { padding-bottom: 10px; border-bottom: 1px solid #2a4a1c; }
        .tmsc-report-scout { color: #e8f5d8; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .tmsc-report-date {
            color: #6a9a58; font-size: 11px; font-weight: 600;
            background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
        }
        .tmsc-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .tmsc-report-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 5px 10px; background: rgba(42,74,28,.25); border-radius: 4px;
            border: 1px solid rgba(42,74,28,.4);
        }
        .tmsc-report-label { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
        .tmsc-report-value { color: #e8f5d8; font-weight: 700; font-size: 12px; }
        .tmsc-report-item.wide { grid-column: 1 / -1; }
        .tmsc-section-title {
            color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
        }
        .tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
        .tmsc-bar-label { color: #90b878; font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
        .tmsc-bar-track {
            flex: 1; height: 6px; background: #1a2e10; border-radius: 3px;
            overflow: hidden; max-width: 120px; position: relative;
        }
        .tmsc-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
        .tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
        .tmsc-yd-badge {
            display: inline-block; background: #274a18; color: #6cc040; font-size: 9px;
            font-weight: 700; padding: 1px 6px; border-radius: 3px; border: 1px solid #3d6828;
            margin-left: 6px; letter-spacing: 0.5px; vertical-align: middle;
        }
        .tmsc-error {
            text-align: center; color: #f87171; padding: 10px; font-size: 12px; font-weight: 600;
            background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
            border-radius: 4px; margin-bottom: 10px;
        }
        .tmsc-report-divider { border: none; border-top: 1px dashed #3d6828; margin: 16px 0; }
        .tmsc-report-count {
            color: #6a9a58; font-size: 10px; text-align: center; padding: 4px 0;
            font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .tmsc-star-green { color: #6cc040; }
        .tmsc-star-green-half {
            background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-split {
            background: linear-gradient(90deg, #fbbf24 50%, #6cc040 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-conf {
            display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 5px;
            border-radius: 3px; margin-left: 6px; letter-spacing: 0.3px;
            vertical-align: middle; white-space: nowrap;
        }
    `;

    document.head.appendChild(style);
}

const potColor = (pot) => {
    const value = parseInt(pot, 10) || 0;
    if (value >= 18) return '#6cc040';
    if (value >= 15) return '#5b9bff';
    if (value >= 12) return '#c8e0b4';
    if (value >= 9) return '#fbbf24';
    return '#f87171';
};
const extractTier = (txt) => {
    if (!txt) return null;
    const match = txt.match(/\((\d)\/(\d)\)/);
    return match ? { val: parseInt(match[1], 10), max: parseInt(match[2], 10) } : null;
};
const barColor = (val, max) => {
    const ratio = val / max;
    if (ratio >= 0.75) return '#6cc040';
    if (ratio >= 0.5) return '#80e048';
    if (ratio >= 0.25) return '#fbbf24';
    return '#f87171';
};
const bloomColor = (txt) => {
    if (!txt) return '#c8e0b4';
    const normalized = txt.toLowerCase();
    if (normalized === 'bloomed') return '#6cc040';
    if (normalized.includes('late bloom')) return '#80e048';
    if (normalized.includes('middle')) return '#fbbf24';
    if (normalized.includes('starting')) return '#f97316';
    if (normalized.includes('not bloomed')) return '#f87171';
    return '#c8e0b4';
};
const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
const confPct = (skill) => Math.round((parseInt(skill, 10) || 0) / 20 * 100);
const confBadge = (pct) => {
    const color = pct >= 90 ? '#6cc040' : pct >= 70 ? '#80e048' : pct >= 50 ? '#fbbf24' : '#f87171';
    const bg = pct >= 90 ? 'rgba(108,192,64,.12)' : pct >= 70 ? 'rgba(128,224,72,.1)' : pct >= 50 ? 'rgba(251,191,36,.1)' : 'rgba(248,113,113,.1)';
    return `<span class="tmsc-conf" style="color:${color};background:${bg}">${pct}%</span>`;
};
const greenStarsHtml = (rec) => {
    const rating = parseFloat(rec) || 0;
    const full = Math.floor(rating);
    const half = (rating % 1) >= 0.25;
    let html = '';
    for (let index = 0; index < full; index += 1) html += '<span class="tmsc-star-green">★</span>';
    if (half) html += '<span class="tmsc-star-green-half">★</span>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let index = 0; index < empty; index += 1) html += '<span class="tmsc-star-empty">★</span>';
    return html;
};
const combinedStarsHtml = (current, potMax) => {
    let currentValue = parseFloat(current) || 0;
    let potentialValue = parseFloat(potMax) || 0;
    if (potentialValue < currentValue) potentialValue = currentValue;
    let html = '';
    for (let index = 1; index <= 5; index += 1) {
        if (index <= currentValue) html += '<span class="tmsc-star-full">★</span>';
        else if (index - 0.5 <= currentValue && currentValue < index) html += potentialValue >= index ? '<span class="tmsc-star-split">★</span>' : '<span class="tmsc-star-half">★</span>';
        else if (index <= potentialValue) html += '<span class="tmsc-star-green">★</span>';
        else if (index - 0.5 <= potentialValue && potentialValue < index) html += '<span class="tmsc-star-green-half">★</span>';
        else html += '<span class="tmsc-star-empty">★</span>';
    }
    return html;
};

function getScoutForReport(report, scouts = {}) {
    if (!report?.scoutid) return null;
    return Object.values(scouts).find(scout => String(scout.id) === String(report.scoutid)) || null;
}

function cardHtml(report, { scouts = {} } = {}) {
    injectStyles();

    const pot = parseInt(report?.old_pot, 10) || 0;
    const potStarsVal = (parseFloat(report?.potential) || 0) / 2;
    if (report?.scout_name === 'YD' || report?.scoutid === '0') {
        return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development<span class="tmsc-yd-badge">YD</span></div></div><div class="tmsc-report-date">${report.done || '-'}</div></tm-row><div class="tmsc-report-grid"><div class="tmsc-report-item wide"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Age at report</span><span class="tmsc-report-value">${report.report_age || '-'}</span></div></div></div>`;
    }

    const spec = parseInt(report?.specialist, 10) || 0;
    const specLabel = SPECIALTIES[spec] || 'None';
    const scout = getScoutForReport(report, scouts);
    let potConf = null;
    let bloomConf = null;
    let phyConf = null;
    let tacConf = null;
    let tecConf = null;
    let psyConf = null;
    let specConf = null;

    if (scout) {
        const age = parseInt(report.report_age, 10) || 0;
        const senYth = age < 20 ? (parseInt(scout.youths, 10) || 0) : (parseInt(scout.seniors, 10) || 0);
        const dev = parseInt(scout.development, 10) || 0;
        potConf = confPct(Math.min(senYth, dev));
        bloomConf = confPct(dev);
        phyConf = confPct(parseInt(scout.physical, 10) || 0);
        tacConf = confPct(parseInt(scout.tactical, 10) || 0);
        tecConf = confPct(parseInt(scout.technical, 10) || 0);
        psyConf = confPct(parseInt(scout.psychology, 10) || 0);
        if (spec > 0) {
            const physicalSpec = [1, 2, 3, 11];
            const tacticalSpec = [4, 5, 6, 7];
            if (physicalSpec.includes(spec)) specConf = phyConf;
            else if (tacticalSpec.includes(spec)) specConf = tacConf;
            else specConf = tecConf;
        }
    }

    const peaks = [
        { label: 'Physique', text: cleanPeakText(report.peak_phy_txt), conf: phyConf },
        { label: 'Tactical', text: cleanPeakText(report.peak_tac_txt), conf: tacConf },
        { label: 'Technical', text: cleanPeakText(report.peak_tec_txt), conf: tecConf },
    ];
    let peaksHtml = '';
    for (const peak of peaks) {
        const tier = extractTier(peak.text);
        if (!tier) continue;
        const pct = (tier.val / tier.max) * 100;
        const color = barColor(tier.val, tier.max);
        peaksHtml += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${peak.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="tmsc-bar-text" style="color:${color}">${tier.val}/${tier.max}</span>${peak.conf !== null ? confBadge(peak.conf) : ''}</div>`;
    }

    const personality = [
        { label: 'Leadership', value: parseInt(report.charisma, 10) || 0 },
        { label: 'Professionalism', value: parseInt(report.professionalism, 10) || 0 },
        { label: 'Aggression', value: parseInt(report.aggression, 10) || 0 },
    ];
    let personalityHtml = '';
    for (const item of personality) {
        const pct = (item.value / 20) * 100;
        const color = TmUtils.skillColor(item.value);
        personalityHtml += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${item.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="tmsc-bar-text" style="color:${color}">${item.value}</span>${psyConf !== null ? confBadge(psyConf) : ''}</div>`;
    }

    return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${combinedStarsHtml(report.rec, potStarsVal)}</div><div class="tmsc-report-scout">${report.scout_name || 'Unknown'}</div></div><div class="tmsc-report-date">${report.done || '-'}</div></tm-row><div class="tmsc-report-grid"><div class="tmsc-report-item"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}${potConf !== null ? confBadge(potConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Age</span><span class="tmsc-report-value">${report.report_age || '-'}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Bloom</span><span class="tmsc-report-value" style="color:${bloomColor(report.bloom_status_txt)}">${report.bloom_status_txt || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Development</span><span class="tmsc-report-value">${report.dev_status || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Specialty</span><span class="tmsc-report-value" style="color:${spec > 0 ? '#fbbf24' : '#5a7a48'}">${specLabel}${specConf !== null ? confBadge(specConf) : ''}</span></div></div><div><div class="tmsc-section-title">Peak Development</div>${peaksHtml}</div><div><div class="tmsc-section-title">Personality</div>${personalityHtml}</div></div>`;
}

function listHtml({ reports = [], scouts = {}, error = '', emptyText = 'No scout reports available' } = {}) {
    injectStyles();

    let html = '';
    if (error) {
        const msg = error === 'multi_scout' ? 'This scout is already on a mission' : error === 'multi_bid' ? 'Scout already scouting this player' : error;
        html += `<div class="tmsc-error">${msg}</div>`;
    }
    if (!reports.length) return html + `<div class="tmsc-empty">${emptyText}</div>`;
    if (reports.length > 1) html += `<div class="tmsc-report-count">${reports.length} Reports</div>`;
    for (let index = 0; index < reports.length; index += 1) {
        if (index > 0) html += '<hr class="tmsc-report-divider">';
        html += cardHtml(reports[index], { scouts });
    }
    return html;
}

function bestEstimateHtml({ scoutData = {}, player = null, title = 'Best Estimate', icon = '★' } = {}) {
    injectStyles();
    if (!player || !Array.isArray(player.skills)) return '';
    if (!scoutData || !Array.isArray(scoutData.reports) || !scoutData.reports.length) return '';

    const container = document.createElement('div');
    TmBestEstimate.render(container, { scoutData, player, title, icon });
    return container.innerHTML;
}

export const TmScoutReportCards = {
    cardHtml,
    bestEstimateHtml,
    listHtml,
};