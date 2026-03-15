import { TmConst } from '../../lib/tm-constants.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmApi }  from '../../services/index.js' ;
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';

const { R5_THRESHOLDS } = TmConst;
    const { getColor } = TmUtils;

    const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);
    const r5Color = v => getColor(v, R5_THRESHOLDS);

    function fmt(n, d) {
        if (n == null || isNaN(n)) return '0';
        d = d == null ? 1 : d;
        return Number(n).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function balCls(v) { return v > 0 ? 'tmh-pos' : v < 0 ? 'tmh-neg' : 'tmh-neut'; }

    function starVal(html) {
        if (!html) return 0;
        const full = (html.match(/star\.png/g) || []).length;
        const half = (html.match(/half_star\.png/g) || []).length;
        return full + half * 0.5;
    }

    function posClass(pos) { return TmPosition.cssClass(pos); }

    /* returns chip variant key for TmUI.chip() */
    function posVariant(pos) { return TmPosition.variant(pos) || 'default'; }

    /* Ensures all pids are in playerInfoCache, then calls onDone(). */
    function prefetchPlayers(pids, onDone) {
        const missing = pids.map(String).filter(pid => playerInfoCache[pid] === undefined);
        if (!missing.length) { onDone(); return; }
        Promise.all(missing.map(pid => fetchPlayerInfo(pid))).then(onDone);
    }

    const playerInfoCache = {};

    function fetchPlayerInfo(pid) {
        pid = String(pid);
        if (playerInfoCache[pid] !== undefined) return Promise.resolve(playerInfoCache[pid]);
        return TmApi.fetchPlayerTooltip(pid).then(function (data) {
            if (!data?.player) { playerInfoCache[pid] = null; return null; }
            const p = data.player;
            const info = {
                pos: (p.favposition || '').toUpperCase().replace(/,/g, '/'),
                age: p.age || 0,
                months: p.months || 0,
                asi: p.asi || 0,
                r5: Number(p.r5 || 0),
                rec: Number(p.rec || 0),
            };
            playerInfoCache[pid] = info;
            return info;
        });
    }

    function enrichTable(container) {
        const $ = window.jQuery;
        const rows = container.find('tr[data-pid]');
        if (!rows.length) return;
        const seen = {}, unique = [];
        rows.each(function () {
            const pid = String($(this).data('pid'));
            if (pid && playerInfoCache[pid] === undefined && !seen[pid]) {
                seen[pid] = true;
                unique.push(pid);
            }
        });
        if (!unique.length) { fillCells(rows); return; }
        Promise.all(unique.map(function (pid) { return fetchPlayerInfo(pid); })).then(function () {
            fillCells(rows);
        });
        function fillCells(rows) {
            rows.each(function () {
                const pid = String($(this).data('pid'));
                const info = playerInfoCache[pid];
                const posCell = $(this).find('.tmh-pos-cell');
                const ageCell = $(this).find('.tmh-age-cell');
                const asiCell = $(this).find('.tmh-asi-cell');
                const r5Cell  = $(this).find('.tmh-r5-cell');
                if (info) {
                    posCell.html('<span class="' + posClass(info.pos) + '">' + info.pos + '</span>');
                    ageCell.text(info.age + '.' + info.months);
                    asiCell.text(fmt(info.asi, 0));
                    r5Cell.html('<span style="color:' + r5Color(info.r5) + ';font-weight:700">' + fix2(info.r5) + '</span>');
                } else {
                    posCell.text('—'); ageCell.text('—'); asiCell.text('—'); r5Cell.text('—');
                }
            });
        }
    }

    export const TmHistoryHelpers = { fmt, balCls, starVal, fix2, r5Color, posClass, posVariant, prefetchPlayers, fetchPlayerInfo, enrichTable, playerInfoCache };
