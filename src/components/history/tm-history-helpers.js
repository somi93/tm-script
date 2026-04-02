import { TmConst } from '../../lib/tm-constants.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmPlayerService } from '../../services/player.js';
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
        return TmPlayerService.fetchPlayerTooltip(pid).then(function (data) {
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

    function progressState(container, opts) {
        const message = opts?.message || 'Loading…';
        const total = Number(opts?.total) || 0;
        const start = Number(opts?.current) || 0;
        const spinnerHtml = '<div class="tmu-spinner tmu-spinner-md" style="margin-bottom:var(--tmu-space-sm)"></div><br>';

        function textFor(current, nextMessage) {
            return spinnerHtml + nextMessage + (total ? ' ' + current + '/' + total : '');
        }

        container.html(
            '<div class="tmh-load">' + textFor(start, message) + '</div>' +
            '<div class="tmh-prog"><div class="tmh-prog-bar" style="width:0%"></div></div>'
        );

        const loadEl = container.find('.tmh-load');
        const barEl = container.find('.tmh-prog-bar');

        return {
            update(current, nextMessage) {
                const safeCurrent = Number(current) || 0;
                const pct = total > 0 ? Math.round(safeCurrent / total * 100) : 0;
                loadEl.html(textFor(safeCurrent, nextMessage || message));
                barEl.css('width', pct + '%');
            }
        };
    }

    function seasonBar(opts) {
        const seasons = opts?.seasons || [];
        const currentSeason = opts?.currentSeason;
        const selectId = opts?.selectId || 'tmh-season-sel';
        const prevId = opts?.prevId || 'tmh-season-prev';
        const nextId = opts?.nextId || 'tmh-season-next';
        const label = opts?.label || 'Season:';
        const extraButtons = opts?.extraButtons || [];
        const sIdx = seasons.findIndex(s => s.id == currentSeason);
        const prevDis = sIdx >= seasons.length - 1 ? ' dis' : '';
        const nextDis = sIdx <= 0 ? ' dis' : '';
        const buttonHtml = ({ cls = '', ...buttonOpts } = {}) => TmUI.button({
            color: 'secondary',
            size: 'xs',
            cls,
            ...buttonOpts,
        }).outerHTML;

        let html = '<div class="tmh-sbar">';
        html += buttonHtml({ id: prevId, label: '◀', title: 'Previous season', cls: 'tmh-arrow' + prevDis });
        html += '<label>' + label + '</label>';
        html += '<select id="' + selectId + '">';
        seasons.forEach(s => {
            html += '<option value="' + s.id + '"' + (s.id == currentSeason ? ' selected' : '') + '>' + s.label + '</option>';
        });
        html += '</select>';
        html += buttonHtml({ id: nextId, label: '▶', title: 'Next season', cls: 'tmh-arrow' + nextDis });
        extraButtons.forEach(buttonOpts => {
            html += buttonHtml(buttonOpts);
        });
        html += '</div>';
        return html;
    }

    function bindSeasonBar(container, opts) {
        const seasons = opts?.seasons || [];
        const currentSeason = opts?.currentSeason;
        const selectId = opts?.selectId || 'tmh-season-sel';
        const prevId = opts?.prevId || 'tmh-season-prev';
        const nextId = opts?.nextId || 'tmh-season-next';
        const onChange = opts?.onChange || function () {};

        container.find('#' + selectId).on('change', function () {
            onChange($(this).val());
        });
        container.find('#' + prevId).on('click', function () {
            const i = seasons.findIndex(s => s.id == currentSeason);
            if (i < seasons.length - 1) onChange(seasons[i + 1].id);
        });
        container.find('#' + nextId).on('click', function () {
            const i = seasons.findIndex(s => s.id == currentSeason);
            if (i > 0) onChange(seasons[i - 1].id);
        });
    }

    export const TmHistoryHelpers = { fmt, balCls, starVal, fix2, r5Color, posVariant, prefetchPlayers, progressState, seasonBar, bindSeasonBar, playerInfoCache };
