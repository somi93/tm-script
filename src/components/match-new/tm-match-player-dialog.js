import { TmConst }    from '../../lib/tm-constants.js';
import { TmUtils }    from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMetric }   from '../shared/tm-metric.js';
import { TmModal }    from '../shared/tm-modal.js';

const STYLE_ID = 'mpd-style';

const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .mpd-wrap {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        .mpd-head {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
            padding: var(--tmu-space-md) var(--tmu-space-lg);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
        }
        .mpd-no {
            flex-shrink: 0;
            min-width: 18px;
            text-align: right;
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-dim);
        }
        .mpd-name {
            flex: 1 1 0;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--tmu-font-md);
            font-weight: 800;
            color: var(--tmu-text-strong);
        }
        .mpd-meta {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: var(--tmu-space-sm);
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-dim);
        }
        .mpd-body {
            max-height: min(72vh, 640px);
            overflow-y: auto;
            padding: var(--tmu-space-lg);
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
        }
        .mpd-section {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-sm);
        }
        .mpd-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
            gap: var(--tmu-space-sm);
        }
        .mpd-tile-zero { opacity: .28; }
    `;
    document.head.appendChild(style);
};

const ICON = {
    ball:    '&#x26BD;',
    target:  '&#x1F3AF;',
    check:   '&#x2705;',
    glove:   '&#x1F9E4;',
    net:     '&#x1F945;',
    shake:   '&#x1F91D;',
    key:     '&#x1F511;',
    chat:    '&#x1F4AC;',
    arrow:   '&#x21D7;',
    eye:     '&#x1F441;',
    leg:     '&#x1F9B5;',
    head:    '&#x1F3CB;',
    trophy:  '&#x1F3C6;',
    pensive: '&#x1F614;',
    warn:    '&#x26A0;',
    ycard:   '&#x1F7E8;',
    rcard:   '&#x1F7E5;',
    xmark:   '&#x274C;',
    pct:     '&#x1F4CA;',
    cross:   '&#x1F4D0;',
};

const pct = (num, den) => den > 0 ? Math.round(num / den * 100) + '%' : null;

function buildSections(st, isGK) {
    const passTotal = (st.passesCompleted || 0) + (st.passesFailed || 0);
    const crossTotal = (st.crossesCompleted || 0) + (st.crossesFailed || 0);
    const duelTotal = (st.duelsWon || 0) + (st.duelsLost || 0);
    const passPct = pct(st.passesCompleted || 0, passTotal);
    const crossPct = pct(st.crossesCompleted || 0, crossTotal);

    const shooting = isGK ? [
        { icon: ICON.glove, label: 'Saves', val: st.saves || 0 },
        { icon: ICON.ball, label: 'Goals Ag.', val: st.goals || 0, warn: true },
        { icon: ICON.target, label: 'Shots Faced', val: st.shots || 0 },
        { icon: ICON.check, label: 'On Target', val: st.shotsOnTarget || 0 },
        ...(st.penaltiesTaken > 0 ? [{ icon: ICON.net, label: 'Penalties', val: `${st.penaltiesScored || 0}/${st.penaltiesTaken}` }] : []),
    ] : [
        { icon: ICON.ball, label: 'Goals', val: st.goals || 0, highlight: true },
        { icon: ICON.target, label: 'Shots', val: st.shots || 0 },
        { icon: ICON.check, label: 'On Target', val: st.shotsOnTarget || 0 },
        ...(st.goalsHead > 0 ? [{ icon: ICON.head, label: 'Head Goals', val: st.goalsHead }] : []),
        ...(st.goalsFoot > 0 ? [{ icon: ICON.leg, label: 'Foot Goals', val: st.goalsFoot }] : []),
        ...(st.penaltiesTaken > 0 ? [{ icon: ICON.net, label: 'Penalties', val: `${st.penaltiesScored || 0}/${st.penaltiesTaken}` }] : []),
    ];

    const passing = [
        { icon: ICON.shake, label: 'Assists', val: st.assists || 0, highlight: true },
        { icon: ICON.key, label: 'Key Passes', val: st.keyPasses || 0 },
        { icon: ICON.chat, label: 'Passes', val: st.passesCompleted || 0 },
        ...(passPct ? [{ icon: ICON.pct, label: 'Pass %', val: passPct }] : []),
        ...(crossTotal > 0 ? [
            { icon: ICON.arrow, label: 'Crosses', val: st.crossesCompleted || 0 },
            ...(crossPct ? [{ icon: ICON.cross, label: 'Cross %', val: crossPct }] : []),
        ] : []),
    ];

    const defending = [
        { icon: ICON.eye, label: 'Interceptions', val: st.interceptions || 0 },
        { icon: ICON.leg, label: 'Tackles', val: st.tackles || 0 },
        { icon: ICON.head, label: 'Headers', val: st.headerClearances || 0 },
        ...(duelTotal > 0 ? [
            { icon: ICON.trophy, label: 'Duels Won', val: st.duelsWon || 0 },
            { icon: ICON.pensive, label: 'Duels Lost', val: st.duelsLost || 0, warn: true },
        ] : []),
        { icon: ICON.warn, label: 'Fouls', val: st.fouls || 0, warn: true },
        ...(st.tackleFails > 0 ? [{ icon: ICON.xmark, label: 'Tackle Fails', val: st.tackleFails, warn: true }] : []),
        ...(st.yellowCards > 0 ? [{ icon: ICON.ycard, label: 'Yellow', val: st.yellowCards, warn: true }] : []),
        ...(st.yellowRedCards > 0 ? [{ icon: ICON.ycard + ICON.rcard, label: 'Y/R', val: st.yellowRedCards, danger: true }] : []),
        ...(st.redCards > 0 ? [{ icon: ICON.rcard, label: 'Red', val: st.redCards, danger: true }] : []),
    ];

    return [
        { title: 'Shooting', items: shooting },
        { title: 'Passing', items: passing },
        { title: 'Defending', items: defending },
    ];
}

function renderMetric(item) {
    const rawVal = item.val;
    const isZero = rawVal == null || rawVal === 0 || rawVal === '0' || rawVal === '0%';
    const valueCls = item.danger
        ? 'tmu-text-danger'
        : item.warn
            ? 'tmu-text-warning'
            : item.highlight
                ? 'tmu-text-accent'
                : '';

    return TmMetric.metric({
        layout: 'card',
        size: 'sm',
        align: 'center',
        labelPosition: 'bottom',
        tone: 'overlay',
        value: `${item.icon} ${String(rawVal ?? 0)}`,
        label: item.label,
        cls: isZero ? 'mpd-tile-zero' : '',
        valueCls,
    });
}

function renderBody(sections) {
    return sections.map(sec =>
        `<div class="mpd-section">` +
            `<div class="tmu-kicker">${sec.title}</div>` +
            `<div class="mpd-grid">${sec.items.map(renderMetric).join('')}</div>` +
        `</div>`
    ).join('');
}

export const TmMatchPlayerDialog = {
    open(player, stats, minsPlayed, { showRating = false } = {}) {
        ensureStyles();

        const st = stats || {};
        const isGK = (player.position || '').toLowerCase() === 'gk';
        const posKey = (player.position || '').toLowerCase();
        const posChip = posKey ? TmPosition.chip([posKey]) : '';
        const name = player.nameLast || player.name || '?';
        const ratingColor = player.rating != null
            ? TmUtils.getColor(player.rating, TmConst.R5_THRESHOLDS)
            : 'var(--tmu-text-dim)';
        const ratingStr = player.rating != null ? player.rating.toFixed(1) : '-';

        const contentEl = document.createElement('div');
        contentEl.className = 'mpd-wrap';
        contentEl.innerHTML =
            `<div class="mpd-head">` +
                `<span class="mpd-no">${player.no ?? ''}</span>` +
                `${posChip}` +
                `<span class="mpd-name">${name}${player.captain ? ' <span class="tmu-text-dim" style="font-size:10px">(C)</span>' : ''}</span>` +
                `<span class="mpd-meta">` +
                    `${showRating && player.mom ? '<span title="Man of the Match" style="color:#f5c518">&#9733;</span>' : ''}` +
                    `${minsPlayed > 0 ? `<span>${minsPlayed}'</span>` : ''}` +
                    `${showRating ? `<span class="tmu-tabular" style="color:${ratingColor};font-weight:800">${ratingStr}</span>` : ''}` +
                `</span>` +
            `</div>` +
            `<div class="mpd-body">${renderBody(buildSections(st, isGK))}</div>`;

        return TmModal.open({
            contentEl,
            maxWidth: 'min(720px, 96vw)',
        });
    },
};
