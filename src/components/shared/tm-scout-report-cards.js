import { TmUtils } from '../../lib/tm-utils.js';
import { TmBestEstimate } from '../player/scout/tm-best-estimate.js';
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
        .tmsc-stars { font-size: var(--tmu-font-xl); letter-spacing: 2px; line-height: 1; }
        .tmsc-star-full { color: var(--tmu-warning); }
        .tmsc-star-half {
            background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-border-embedded) 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-empty { color: var(--tmu-border-embedded); }
        .tmsc-report { display: flex; flex-direction: column; gap: var(--tmu-space-lg); }
        .tmsc-report-header { padding-bottom: var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft); }
        .tmsc-report-scout { color: var(--tmu-text-strong); font-weight: 700; font-size: var(--tmu-font-md); margin-bottom: var(--tmu-space-xs); }
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
        .tmsc-bar-text { font-size: var(--tmu-font-xs); font-weight: 600; min-width: 60px; }
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

function cardHtml(report) {
    injectStyles();

    const isYD = report?.scout?.id === '0' || !report?.scout?.id;
    const devGroup = report.development ?? [];
    const potEntry = devGroup.find(d => d.key === 'potential');
    const bloomEntry = devGroup.find(d => d.key === 'bloom');
    const devEntry = devGroup.find(d => d.key === 'devStatus');
    const pot = potEntry?.value ?? 0;
    const potStarsVal = (report.rec ?? 0) / 2;

    if (isYD) {
        return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development${badgeHtml({ label: 'YD' }, 'success')}</div></div><div class="tmsc-report-date tmu-meta tmu-tabular">${report.date || '-'}</div></tm-row><div class="tmsc-report-grid">${splitMetricHtml({ label: 'Potential', value: String(pot), valueColor: potColor(pot), wide: true })}${splitMetricHtml({ label: 'Age at report', value: report.age ?? '-', wide: true })}</div></div>`;
    }

    const potConf = potEntry?.reliability ?? null;
    const bloomConf = bloomEntry?.reliability ?? null;
    const phyConf = (report.peaks ?? [])[0]?.reliability ?? null;
    const tacConf = (report.peaks ?? [])[1]?.reliability ?? null;
    const tecConf = (report.peaks ?? [])[2]?.reliability ?? null;

    const spec = report.specialist?.value ?? 0;
    const specLabel = SPECIALTIES[spec] || 'None';
    let specConf = null;
    if (spec > 0) {
        const physicalSpec = [1, 2, 3, 11];
        const tacticalSpec = [4, 5, 6, 7];
        if (physicalSpec.includes(spec)) specConf = phyConf;
        else if (tacticalSpec.includes(spec)) specConf = tacConf;
        else specConf = tecConf;
    }

    let peaksHtml = '';
    for (const peak of report.peaks ?? []) {
        const tier = peak.value;
        if (!tier) continue;
        const pct = (tier.value / tier.max) * 100;
        const color = barColor(tier.value, tier.max);
        peaksHtml += `<div class="tmsc-bar-row">
                <span class="tmsc-bar-label tmu-text-panel-label">${peak.label}</span>
                <div class="tmsc-bar-track">
                    <div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="tmsc-bar-text tmu-tabular" style="color:${color}">${tier.value}/${tier.max}</span>
                ${peak.reliability !== null ? confBadge(peak.reliability) : ''}
            </div>`;
    }

    let personalityHtml = '';
    for (const item of report.personality ?? []) {
        const v = item.value ?? 0;
        const pct = (v / 20) * 100;
        const color = TmUtils.skillColor(v);
        personalityHtml += `<div class="tmsc-bar-row">
                <span class="tmsc-bar-label tmu-text-panel-label">${item.label}</span>
                <div class="tmsc-bar-track">
                    <div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="tmsc-bar-text tmu-tabular" style="color:${color}">${v}</span>
                ${item.reliability !== null ? confBadge(item.reliability) : ''}
            </div>`;
    }

    const bloomVal = bloomEntry?.value || '-';
    const devVal = devEntry?.value || '-';

    return `<div class="tmsc-report">
        <tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header">
            <div>
                <div class="tmsc-stars">${combinedStarsHtml(report.rec, potStarsVal)}</div>
                <div class="tmsc-report-scout">${report.scout?.name}</div>
            </div>
            <div class="tmsc-report-date tmu-meta tmu-tabular">${report.date}</div>
        </tm-row>
        <div class="tmsc-report-grid">
            ${splitMetricHtml({ label: 'Potential', value: `${pot}${potConf !== null ? confBadge(potConf) : ''}`, valueColor: potColor(pot) })}${splitMetricHtml({ label: 'Age', value: report.age ?? '-' })}${splitMetricHtml({ label: 'Bloom', value: `${bloomVal}${bloomConf !== null ? confBadge(bloomConf) : ''}`, valueColor: bloomColor(bloomVal) })}${splitMetricHtml({ label: 'Development', value: `${devVal}${bloomConf !== null ? confBadge(bloomConf) : ''}` })}${splitMetricHtml({ label: 'Specialty', value: `${specLabel}${specConf !== null ? confBadge(specConf) : ''}`, valueCls: spec > 0 ? 'tmsc-value-warning' : 'tmsc-value-muted', wide: true })}
        </div>
        <div>
            <div class="tmsc-section-title tmu-kicker tmu-text-faint">Peak Development</div>
            ${peaksHtml}
        </div>
        <div>
            <div class="tmsc-section-title tmu-kicker tmu-text-faint">Personality</div>
            ${personalityHtml}
            </div>
        </div>`;
}

function listHtml({ reports = [], error = '', emptyText = 'No scout reports available' } = {}) {
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
        html += cardHtml(reports[index]);
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