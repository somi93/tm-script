document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Tooltip stat triplets ── */
.tmu-tstats{display:grid;grid-template-columns:1fr auto 1fr;gap:var(--tmu-space-xs) var(--tmu-space-md);margin:var(--tmu-space-md) 0;font-size:14px}
.tmu-tstats-home{text-align:right;font-weight:700;color:var(--tmu-text-main)}
.tmu-tstats-label{text-align:center;font-size:10px;color:var(--tmu-text-dim);text-transform:uppercase;letter-spacing:.08em;font-weight:600;padding:0 var(--tmu-space-sm)}
.tmu-tstats-away{text-align:left;font-weight:700;color:var(--tmu-text-main)}
.tmu-tstats-home.is-leading,.tmu-tstats-away.is-leading{color:var(--tmu-success)}
` }));

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const attrText = (attrs = {}) => Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
    .join('');

const parseComparable = (value) => {
    const numeric = Number.parseFloat(String(value ?? '').replace(/[^\d.+-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
};

const buildMatchRows = ({ possession, statistics = {} } = {}) => {
    const rows = [];
    if (possession) {
        const homePossession = Number(possession.home || 0);
        const awayPossession = Number(possession.away || 0);
        rows.push({
            label: 'Possession',
            leftValue: `${homePossession}%`,
            rightValue: `${awayPossession}%`,
            leftNumber: homePossession,
            rightNumber: awayPossession,
        });
    }

    const shotsHome = Number(statistics.home_shots || 0);
    const shotsAway = Number(statistics.away_shots || 0);
    if (shotsHome || shotsAway) {
        rows.push({
            label: 'Shots',
            leftValue: shotsHome,
            rightValue: shotsAway,
            leftNumber: shotsHome,
            rightNumber: shotsAway,
        });
    }

    const onTargetHome = Number(statistics.home_on_target || 0);
    const onTargetAway = Number(statistics.away_on_target || 0);
    if (onTargetHome || onTargetAway) {
        rows.push({
            label: 'On Target',
            leftValue: onTargetHome,
            rightValue: onTargetAway,
            leftNumber: onTargetHome,
            rightNumber: onTargetAway,
        });
    }

    return rows;
};

function renderTooltipStats({ rows = [], cls = '', attrs = {} } = {}) {
    const visibleRows = rows.filter((row) => row && row.label !== undefined && row.label !== null);
    if (!visibleRows.length) return '';

    const classes = ['tmu-tstats'];
    if (cls) classes.push(cls);

    const html = visibleRows.map((row) => {
        const leftValue = row.leftValue ?? '';
        const rightValue = row.rightValue ?? '';
        const leftNumber = row.leftNumber ?? parseComparable(leftValue);
        const rightNumber = row.rightNumber ?? parseComparable(rightValue);
        const leftLead = leftNumber > rightNumber ? ' is-leading' : '';
        const rightLead = rightNumber > leftNumber ? ' is-leading' : '';

        return `<span class="tmu-tstats-home${leftLead}">${escapeHtml(leftValue)}</span><span class="tmu-tstats-label">${escapeHtml(row.label)}</span><span class="tmu-tstats-away${rightLead}">${escapeHtml(rightValue)}</span>`;
    }).join('');

    return `<div class="${classes.join(' ')}"${attrText(attrs)}>${html}</div>`;
}

export const TmTooltipStats = {
    matchTooltipStats({ possession, statistics = {}, cls = '', attrs = {} } = {}) {
        const rows = buildMatchRows({ possession, statistics });
        return renderTooltipStats({ rows, cls, attrs });
    },
};