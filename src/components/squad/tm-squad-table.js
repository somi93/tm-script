import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPlayerTooltip } from '../player/tm-player-tooltip.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';

/* ═══════════════════════════════════════════════════════════
       CONSTANTS
       ═══════════════════════════════════════════════════════════ */
    const TRN_LABELS = TmConst.TRAINING_LABELS;
    const TRN_DOT_COLORS = ['#555', '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
    const { AGE_THRESHOLDS } = TmConst;


    /* ═══════════════════════════════════════════════════════════
       ROW HELPERS
       ═══════════════════════════════════════════════════════════ */
    const statusIcons = p => {
        let s = '';
        if (p.ban === 'g') {
            s += `<span class="tmsq-card tmsq-card-yellow" title="Yellow card accumulation"></span>`;
        } else if (p.ban && p.ban.startsWith('r')) {
            const matches = p.ban.slice(1) || '1';
            s += `<span class="tmsq-card tmsq-card-red" title="Red card (${matches} match${matches === '1' ? '' : 'es'})">${matches}</span>`;
        }
        if (p.injury && p.injury !== '0') {
            s += `<span style="margin-left:4px;color:#ef4444;font-size:12px;font-weight:700;vertical-align:middle" title="Injury: ${p.injury} weeks">✚${p.injury}</span>`;
        }
        if (p.retire && p.retire !== '0') {
            s += `<img src="http://trophymanager.com/pics/icons/retire.gif" style="margin-left:4px;vertical-align:middle;width:14px;height:14px" title="Retiring">`;
        }
        return s;
    };

    const renderTrainingDots = tc => {
        if (!tc || tc.length !== 6) return '<span style="color:#555">—</span>';
        let h = '<span class="tmsq-trn-dots" title="' +
            tc.split('').map((d, i) => TRN_LABELS[i] + ': ' + d).join('  ') + '">';
        for (let i = 0; i < 6; i++) {
            const v = parseInt(tc[i]) || 0;
            h += `<span class="tmsq-trn-dot" style="background:${TRN_DOT_COLORS[v]}">${v}</span>`;
        }
        h += '</span>';
        return h;
    };

    /* ═══════════════════════════════════════════════════════════
       SUMMARY BAR
       ═══════════════════════════════════════════════════════════ */
    const buildSummary = players => {
        const { getColor } = TmUtils;
        const { REC_THRESHOLDS, R5_THRESHOLDS, TI_THRESHOLDS } = TmConst;
        const n = players.length;
        if (!n) return '';
        const avgR5 = players.reduce((s, p) => s + Number(p.r5), 0) / n;
        const avgRec = players.reduce((s, p) => s + Number(p.rec), 0) / n;
        const avgAge = players.reduce((s, p) => s + p.age + p.month / 12, 0) / n;
        const avgASI = players.reduce((s, p) => s + p.asi, 0) / n;
        const tiPlayers = players.filter(p => p.ti !== null);
        const avgTI = tiPlayers.length ? tiPlayers.reduce((s, p) => s + p.ti, 0) / tiPlayers.length : 0;

        let h = '<div class="tmsq-summary">';
        h += `<div class="tmsq-sum-item"><span class="tmsq-sum-val">${n}</span><span class="tmsq-sum-lbl">Players</span></div>`;
        h += `<div class="tmsq-sum-item"><span class="tmsq-sum-val" style="color:${getColor(avgR5, R5_THRESHOLDS)}">${avgR5.toFixed(2)}</span><span class="tmsq-sum-lbl">Avg R5</span></div>`;
        h += `<div class="tmsq-sum-item"><span class="tmsq-sum-val" style="color:${getColor(avgRec, REC_THRESHOLDS)}">${avgRec.toFixed(2)}</span><span class="tmsq-sum-lbl">Avg REC</span></div>`;
        if (tiPlayers.length) h += `<div class="tmsq-sum-item"><span class="tmsq-sum-val" style="color:${getColor(avgTI, TI_THRESHOLDS)}">${avgTI.toFixed(1)}</span><span class="tmsq-sum-lbl">Avg TI</span></div>`;
        h += `<div class="tmsq-sum-item"><span class="tmsq-sum-val" style="color:${getColor(avgAge, AGE_THRESHOLDS)}">${avgAge.toFixed(1)}</span><span class="tmsq-sum-lbl">Avg Age</span></div>`;
        h += `<div class="tmsq-sum-item"><span class="tmsq-sum-val" style="color:#e0f0cc">${Math.round(avgASI).toLocaleString()}</span><span class="tmsq-sum-lbl">Avg ASI</span></div>`;
        h += '</div>';
        return h;
    };

    /* ═══════════════════════════════════════════════════════════
       TABLE
       ═══════════════════════════════════════════════════════════ */
    const buildSquadTable = (players, onSaleIds) => {
        const { getColor } = TmUtils;
        const { R5_THRESHOLDS, REC_THRESHOLDS, RTN_THRESHOLDS, TI_THRESHOLDS } = TmConst;

        const tbl = TmUI.table({
            headers: [
                { key: '_bar', label: '', sortable: false, cls: 'tmsq-pb', thCls: 'tmsq-pb',
                  render: (_, p) => `<span class="tmsq-pb-inner" style="background:${p.positions[0].color}"></span>` },
                { key: 'no',   label: '#',   align: 'r' },
                { key: 'name', label: 'Player',
                  render: (_, p) => {
                      const flag = TmUI.flag(p.country, 'tmsq-flag');
                      const bBadge = p.isBTeam ? '<span class="tmsq-bteam-badge">B</span>' : '';
                      const saleBadge = onSaleIds.has(String(p.id)) ? '<span class="tmsq-sale-badge">💰</span>' : '';
                      return `${flag}<a href="/players/${p.id}/" class="tmsq-link">${p.name}</a>${bBadge}${saleBadge}${statusIcons(p)}`;
                  }
                },
                { key: 'pos', label: 'Pos', align: 'c',
                  sort: (a, b) => {
                      const getMin = p => Math.min(...(p.positions || p.posList).map(pos => pos.ordering ?? (pos.id === 9 ? 0 : (pos.id ?? pos.idx ?? 0) + 1)));
                      return getMin(a) - getMin(b);
                  },
                  render: (_, p) => TmPosition.chip(p.positions, 'tmsq-pos-chip')
                },
                { key: 'age', label: 'Age', align: 'r',
                  sort: (a, b) => (a.age * 12 + a.month) - (b.age * 12 + b.month),
                  render: (_, p) => `<span style="color:${getColor(p.age, AGE_THRESHOLDS)}">${p.age}.${String(p.month).padStart(2, '0')}</span>`
                },
                { key: 'asi', label: 'ASI', align: 'r',
                  render: v => `<span style="color:#e0f0cc">${Number(v).toLocaleString()}</span>`
                },
                { key: 'r5',  label: 'R5',  align: 'r',
                  render: v => `<span style="color:${getColor(v, R5_THRESHOLDS)};font-weight:700">${v}</span>`
                },
                { key: 'rec', label: 'REC', align: 'r',
                  render: v => `<span style="color:${getColor(Number(v), REC_THRESHOLDS)};font-weight:700">${Number(v)}</span>`
                },
                { key: 'ti',  label: 'TI',  align: 'r',
                  sort: (a, b) => (a.ti ?? -Infinity) - (b.ti ?? -Infinity),
                  render: v => v !== null ? `<span style="color:${getColor(v, TI_THRESHOLDS)}">${v.toFixed(1)}</span>` : '<span style="color:#555">—</span>'
                },
                { key: 'routine', label: 'Rtn', align: 'r',
                  render: v => `<span style="color:${getColor(v, RTN_THRESHOLDS)}">${v.toFixed(1)}</span>`
                },
                { key: 'trainingCustom', label: 'Training', align: 'c', sortable: false,
                  render: v => renderTrainingDots(v)
                },
            ],
            items: players,
            sortKey: 'pos',
            sortDir: 1,
        });
        tbl.className = 'tmsq-table-wrap';
        return tbl;
    };

    /* ═══════════════════════════════════════════════════════════
       INTERNAL STATE
       ═══════════════════════════════════════════════════════════ */
    let _container, _allPlayers, _onSaleIds;

    const _doRender = () => {
        const seniors = _allPlayers.filter(p => p.age > 21);
        const youth   = _allPlayers.filter(p => p.age <= 21);

        _container.innerHTML =
            '<div class="tmsq-header"><div class="tmsq-title">⭐ Squad Overview</div></div>';

        const senLbl = document.createElement('div');
        senLbl.className = 'tmsq-section-lbl';
        senLbl.textContent = `Seniors (${seniors.length})`;
        _container.appendChild(senLbl);
        _container.insertAdjacentHTML('beforeend', buildSummary(seniors));
        _container.appendChild(buildSquadTable(seniors, _onSaleIds));

        const youthLbl = document.createElement('div');
        youthLbl.className = 'tmsq-section-lbl';
        youthLbl.style.marginTop = '14px';
        youthLbl.textContent = `Youth ≤21 (${youth.length})`;
        _container.appendChild(youthLbl);
        _container.insertAdjacentHTML('beforeend', buildSummary(youth));
        _container.appendChild(buildSquadTable(youth, _onSaleIds));
    };

    /* ═══════════════════════════════════════════════════════════
       CSS
       ═══════════════════════════════════════════════════════════ */
    const injectCSS = () => {
        const style = document.createElement('style');
        style.id = 'tmsq-table-styles';
        style.textContent = `
            #tmsq-panel {
                background: #1c3410;
                border-radius: 10px;
                padding: 14px;
                margin: 10px 0 16px 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #c8e0b4;
                box-shadow: 0 4px 24px rgba(0,0,0,0.5);
                border: 1px solid #2a4a1c;
            }
            #tmsq-panel * { box-sizing: border-box; }

            .tmsq-header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 10px;
            }
            .tmsq-title {
                font-size: 15px; font-weight: 700; color: #fff;
                display: flex; align-items: center; gap: 6px;
            }

            .tmsq-summary {
                display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;
                padding: 8px 10px; background: #162e0e; border-radius: 8px;
            }
            .tmsq-sum-item {
                display: flex; flex-direction: column; align-items: center;
                min-width: 72px; padding: 5px 10px;
                background: #1c3410; border-radius: 6px;
            }
            .tmsq-sum-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
            .tmsq-sum-val { font-size: 15px; font-weight: 700; }

            .tmsq-table-wrap {
                overflow-x: auto; border-radius: 8px;
                border: 1px solid #2a4a1c;
            }
            .tmsq-table-wrap .tmu-tbl {
                font-size: 12px; margin-bottom: 0;
            }
            .tmsq-table-wrap .tmu-tbl thead th {
                background: #162e0e; padding: 6px 7px;
                position: sticky; top: 0; z-index: 2;
            }
            .tmsq-table-wrap .tmu-tbl thead th:hover { background: #243d18; }
            .tmsq-table-wrap .tmu-tbl thead th.sort-active { color: #6cc040; }
            .tmsq-table-wrap .tmu-tbl tbody tr:nth-child(odd)  { background: #1c3410; }
            .tmsq-table-wrap .tmu-tbl tbody tr:nth-child(even) { background: #162e0e; }
            .tmsq-table-wrap .tmu-tbl tbody tr:hover { background: #243d18 !important; }
            .tmsq-table-wrap .tmu-tbl tbody td {
                padding: 4px 7px; white-space: nowrap; vertical-align: middle;
            }
            .tmsq-table-wrap .tmu-tbl th.tmsq-pb,
            .tmsq-table-wrap .tmu-tbl td.tmsq-pb { width: 4px; padding: 0; }
            .tmsq-pb-inner { display: block; width: 3px; min-height: 16px; border-radius: 2px; }

            .tmsq-link {
                color: #90b878; text-decoration: none; font-weight: 500;
            }
            .tmsq-link:hover { color: #c8e0b4; text-decoration: underline; }

            .tmsq-flag { margin-right: 4px; vertical-align: middle; }

            .tmsq-status { font-size: 10px; margin-left: 3px; vertical-align: middle; }

            .tmsq-section-lbl {
                font-size: 12px; font-weight: 700; color: #6cc040;
                text-transform: uppercase; letter-spacing: 0.5px;
                margin-bottom: 6px; padding: 4px 0;
                border-bottom: 1px solid #2a4a1c;
            }

            .tmsq-pos-chip {
                display: inline-block; padding: 1px 6px; border-radius: 4px;
                font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
                line-height: 16px; text-align: center; min-width: 28px;
            }
            .tmsq-bteam-badge {
                display: inline-block; margin-left: 4px; padding: 0 4px;
                font-size: 9px; font-weight: 700; color: #f59e0b;
                background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3);
                border-radius: 3px; vertical-align: middle; line-height: 14px;
            }
            .tmsq-sale-badge {
                display: inline-block; margin-left: 4px; padding: 0 4px;
                font-size: 9px; font-weight: 700; color: #ef4444;
                background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
                border-radius: 3px; vertical-align: middle; line-height: 14px;
            }
            .tmsq-trn-dots {
                display: inline-flex; gap: 2px; margin-left: 4px;
            }
            .tmsq-trn-dot {
                display: inline-block; width: 14px; height: 14px;
                border-radius: 3px; text-align: center; line-height: 14px;
                font-size: 9px; font-weight: 700; color: #000;
            }
            .tmsq-card {
                display: inline-block; width: 10px; height: 14px;
                border-radius: 2px; margin-left: 4px; vertical-align: middle;
                box-shadow: 0 1px 2px rgba(0,0,0,0.4);
            }
            .tmsq-card-yellow { background: #eab308; }
            .tmsq-card-red {
                background: #ef4444; position: relative;
                font-size: 8px; font-weight: 700; color: #fff;
                text-align: center; line-height: 14px;
            }
        `;
        document.head.appendChild(style);
    };

    /* ═══════════════════════════════════════════════════════════
       PUBLIC API
       ═══════════════════════════════════════════════════════════ */
    let cssInjected = false;

    /**
     * Render the squad table into `container`.
     * @param {HTMLElement} container   - Element to write into (e.g. #tmsq-panel div)
     * @param {Array}       players     - Combined array (seniors + b-team, already enriched)
     * @param {Object}      [options]
     * @param {Set}         [options.onSaleIds]  - Set of player id strings currently on sale
     */
    const render = (container, players, { onSaleIds = new Set() } = {}) => {
        if (!cssInjected) { injectCSS(); cssInjected = true; }
        _container = container;
        _allPlayers = players;
        _onSaleIds = onSaleIds;

        // Tooltip delegation — survives TmUI.table() internal re-renders on sort
        container.addEventListener('mouseover', e => {
            const link = e.target.closest('.tmsq-link');
            if (!link || !TmPlayerTooltip) return;
            const m = link.href.match(/\/players\/(\d+)/);
            if (!m) return;
            const p = _allPlayers.find(pl => String(pl.id) === m[1]);
            if (p) TmPlayerTooltip.show(link, p);
        });
        container.addEventListener('mouseout', e => {
            if (e.target.closest('.tmsq-link') && TmPlayerTooltip) TmPlayerTooltip.hide();
        });

        _doRender();
    };

    export const TmSquadTable = { render };

