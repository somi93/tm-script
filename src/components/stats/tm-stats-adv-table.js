import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';

// tm-stats-adv-table.js — Attacking Styles table component
// API: TmStatsAdvTable.build(advData, { tf, mCount }) → HTMLElement
    const STYLE_ORDER = [
        'Direct', 'Short Passing', 'Through Balls', 'Long Balls',
        'Wings', 'Corners', 'Free Kicks', 'Penalties'
    ];

    const _fix2 = TmUtils.fix2;

    function _fv(v, tf, mCount) {
        return tf === 'average' ? _fix2(v / mCount) : v;
    }

    function _dv(v, tf, mCount) {
        return v === 0 ? '-' : _fv(v, tf, mCount);
    }

    function _span(cls, content) {
        return `<span class="${cls}">${content}</span>`;
    }

    export const TmStatsAdvTable = {
        build(advData, { tf = 'total', mCount = 1 } = {}) {
            const items = STYLE_ORDER.map(style => {
                const d = advData[style] || { a: 0, l: 0, sh: 0, g: 0 };
                return { style, a: d.a, l: d.l, sh: d.sh, g: d.g };
            });

            let totA = 0, totL = 0, totSh = 0, totG = 0;
            items.forEach(it => { totA += it.a; totL += it.l; totSh += it.sh; totG += it.g; });
            const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';

            const headers = [
                {
                    key: 'style', label: 'Style', align: 'left', sortable: false,
                },
                {
                    key: 'a', label: 'Att', align: 'center', sortable: false,
                    render: (_, it) => it.a === 0
                        ? _span('adv-zero', '-')
                        : String(_fv(it.a, tf, mCount)),
                },
                {
                    key: 'l', label: 'Lost', align: 'center', sortable: false,
                    render: (_, it) => _span(it.l === 0 ? 'adv-zero' : 'adv-lost', _dv(it.l, tf, mCount)),
                },
                {
                    key: 'sh', label: 'Shot', align: 'center', sortable: false,
                    render: (_, it) => _span(it.sh === 0 ? 'adv-zero' : 'adv-shot', _dv(it.sh, tf, mCount)),
                },
                {
                    key: 'g', label: 'Goal', align: 'center', sortable: false,
                    render: (_, it) => _span(it.g === 0 ? 'adv-zero' : 'adv-goal', _dv(it.g, tf, mCount)),
                },
                {
                    key: 'pct', label: 'Conv%', align: 'center', sortable: false,
                    render: (_, it) => it.a ? Math.round(it.g / it.a * 100) + '%' : '-',
                },
            ];

            const footer = [{
                cls: 'tsa-adv-total',
                cells: [
                    'Total',
                    totA === 0 ? _span('adv-zero', '-') : String(_fv(totA, tf, mCount)),
                    _span(totL === 0 ? 'adv-zero' : 'adv-lost', _dv(totL, tf, mCount)),
                    _span(totSh === 0 ? 'adv-zero' : 'adv-shot', _dv(totSh, tf, mCount)),
                    _span(totG === 0 ? 'adv-zero' : 'adv-goal', _dv(totG, tf, mCount)),
                    totPct,
                ],
            }];

            return TmUI.table({ items, headers, footer });
        },
    };
