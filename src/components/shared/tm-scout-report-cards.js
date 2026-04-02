import { TmUtils } from '../../lib/tm-utils.js';
import { TmBestEstimate } from '../player/tm-best-estimate.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tm-scout-report-cards-style';
const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
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

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
        .tmsc-star-full { color: var(--tmu-warning); }
        .tmsc-star-half {
            background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-border-embedded) 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-empty { color: var(--tmu-border-embedded); }
        .tmsc-report { display: flex; flex-direction: column; gap: var(--tmu-space-lg); }
        .tmsc-report-header { padding-bottom: var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft); }
        .tmsc-report-scout { color: var(--tmu-text-strong); font-weight: 700; font-size: 14px; margin-bottom: var(--tmu-space-xs); }
        .tmsc-report-date {
            background: var(--tmu-surface-overlay); padding: var(--tmu-space-xs) var(--tmu-space-md); border-radius: var(--tmu-space-xs); white-space: nowrap;
        }
        .tmsc-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--tmu-space-sm); }
        .tmsc-report-grid .tmu-metric.wide { grid-column: 1 / -1; }
        .tmsc-section-title {
            padding-bottom: var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft); margin-bottom: var(--tmu-space-sm);
        }
        .tmsc-bar-row { display: flex; align-items: center; gap: var(--tmu-space-md); padding: var(--tmu-space-xs) 0; }
        .tmsc-bar-label { width: 100px; flex-shrink: 0; }
        .tmsc-bar-track {
            flex: 1; height: 6px; background: var(--tmu-surface-overlay-strong); border-radius: var(--tmu-space-xs);
            overflow: hidden; max-width: 120px; position: relative;
        }
        .tmsc-bar-fill { height: 100%; border-radius: var(--tmu-space-xs); transition: width 0.3s; }
        .tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
        .tmsc-report-divider { border: none; border-top: 1px dashed var(--tmu-border-embedded); margin: var(--tmu-space-lg) 0; }
        .tmsc-report-count {
            text-align: center; padding: var(--tmu-space-xs) 0;
        }
        .tmsc-star-green { color: var(--tmu-success); }
        .tmsc-star-green-half {
            background: linear-gradient(90deg, var(--tmu-success) 50%, var(--tmu-border-embedded) 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-split {
            background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-success) 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-report .tmu-badge { vertical-align: middle; }
        .tmsc-report-scout .tmu-badge,
        .tmu-metric-value .tmu-badge,
        .tmsc-bar-row .tmu-badge { margin-left: var(--tmu-space-sm); }
        .tmsc-value-warning { color: var(--tmu-warning); }
        .tmsc-value-muted { color: var(--tmu-text-dim); }
    `;

    document.head.appendChild(style);
}

const potColor = (pot) => {
    const value = parseInt(pot, 10) || 0;
    if (value >= 18) return THEME_COLORS.success;
    if (value >= 15) return THEME_COLORS.info;
    if (value >= 12) return THEME_COLORS.main;
    if (value >= 9) return THEME_COLORS.warning;
    return THEME_COLORS.danger;
};
const extractTier = (txt) => {
    if (!txt) return null;
    const match = txt.match(/\((\d)\/(\d)\)/);
    return match ? { val: parseInt(match[1], 10), max: parseInt(match[2], 10) } : null;
};
const barColor = (val, max) => {
    const ratio = val / max;
    if (ratio >= 0.75) return THEME_COLORS.success;
    if (ratio >= 0.5) return THEME_COLORS.accent;
    if (ratio >= 0.25) return THEME_COLORS.warning;
    return THEME_COLORS.danger;
};
const bloomColor = (txt) => {
    if (!txt) return THEME_COLORS.main;
    const normalized = txt.toLowerCase();
    if (normalized === 'bloomed') return THEME_COLORS.success;
    if (normalized.includes('late bloom')) return THEME_COLORS.accent;
    if (normalized.includes('middle')) return THEME_COLORS.warning;
    if (normalized.includes('starting')) return THEME_COLORS.warningSoft;
    if (normalized.includes('not bloomed')) return THEME_COLORS.danger;
    return THEME_COLORS.main;
};
const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
const confPct = (skill) => Math.round((parseInt(skill, 10) || 0) / 20 * 100);
const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'xs', shape: 'rounded', weight: 'bold', ...opts }, tone);
const metricHtml = (opts) => TmUI.metric(opts);
const confBadge = (pct) => {
    const tone = pct >= 90 ? 'success' : pct >= 70 ? 'live' : pct >= 50 ? 'highlight' : 'danger';
    return badgeHtml({ label: `${pct}%` }, tone);
};
const splitMetricHtml = ({ label, value, valueColor = '', valueCls = '', wide = false }) => metricHtml({
    label,
    value,
    layout: 'split',
    tone: 'overlay',
    size: 'sm',
    cls: wide ? 'wide' : '',
    valueCls,
    valueAttrs: valueColor ? { style: `color:${valueColor}` } : {},
});
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
        return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development${badgeHtml({ label: 'YD' }, 'success')}</div></div><div class="tmsc-report-date tmu-meta tmu-tabular">${report.done || '-'}</div></tm-row><div class="tmsc-report-grid">${splitMetricHtml({ label: 'Potential', value: String(pot), valueColor: potColor(pot), wide: true })}${splitMetricHtml({ label: 'Age at report', value: report.report_age || '-', wide: true })}</div></div>`;
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
        peaksHtml += `<div class="tmsc-bar-row"><span class="tmsc-bar-label tmu-text-panel-label">${peak.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="tmsc-bar-text tmu-tabular" style="color:${color}">${tier.val}/${tier.max}</span>${peak.conf !== null ? confBadge(peak.conf) : ''}</div>`;
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
        personalityHtml += `<div class="tmsc-bar-row"><span class="tmsc-bar-label tmu-text-panel-label">${item.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="tmsc-bar-text tmu-tabular" style="color:${color}">${item.value}</span>${psyConf !== null ? confBadge(psyConf) : ''}</div>`;
    }

    return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${combinedStarsHtml(report.rec, potStarsVal)}</div><div class="tmsc-report-scout">${report.scout_name || 'Unknown'}</div></div><div class="tmsc-report-date tmu-meta tmu-tabular">${report.done || '-'}</div></tm-row><div class="tmsc-report-grid">${splitMetricHtml({ label: 'Potential', value: `${pot}${potConf !== null ? confBadge(potConf) : ''}`, valueColor: potColor(pot) })}${splitMetricHtml({ label: 'Age', value: report.report_age || '-' })}${splitMetricHtml({ label: 'Bloom', value: `${report.bloom_status_txt || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}`, valueColor: bloomColor(report.bloom_status_txt) })}${splitMetricHtml({ label: 'Development', value: `${report.dev_status || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}` })}${splitMetricHtml({ label: 'Specialty', value: `${specLabel}${specConf !== null ? confBadge(specConf) : ''}`, valueCls: spec > 0 ? 'tmsc-value-warning' : 'tmsc-value-muted', wide: true })}</div><div><div class="tmsc-section-title tmu-kicker tmu-text-faint">Peak Development</div>${peaksHtml}</div><div><div class="tmsc-section-title tmu-kicker tmu-text-faint">Personality</div>${personalityHtml}</div></div>`;
}

function listHtml({ reports = [], scouts = {}, error = '', emptyText = 'No scout reports available' } = {}) {
    injectStyles();

    let html = '';
    if (error) {
        const msg = error === 'multi_scout' ? 'This scout is already on a mission' : error === 'multi_bid' ? 'Scout already scouting this player' : error;
        html += TmUI.error(msg, true);
    }
    if (!reports.length) return html + TmUI.empty(emptyText, true);
    if (reports.length > 1) html += `<div class="tmsc-report-count tmu-kicker tmu-text-faint">${reports.length} Reports</div>`;
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
    bestEstimateHtml,
    listHtml,
};