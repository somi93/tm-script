import { TmMatchService } from '../../services/match.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchTooltip } from '../shared/tm-match-tooltip.js';

const dataCache = new Map();
const requestCache = new Map();

const cacheKeyFor = (matchId, rich) => `${rich ? 'rich' : 'legacy'}:${matchId}`;
const currentSeason = () => ((typeof SESSION !== 'undefined' && SESSION.season) ? String(SESSION.season) : null);
const resolveLegacySeason = (anchorEl) => anchorEl?.dataset?.season || anchorEl?.closest?.('[data-season]')?.dataset?.season || currentSeason();

const fetchTooltipData = (matchId, rich, anchorEl) => {
    const key = cacheKeyFor(matchId, rich);
    if (dataCache.has(key)) return Promise.resolve(dataCache.get(key));
    if (requestCache.has(key)) return requestCache.get(key);

    const request = (rich
        ? TmMatchService.fetchMatchCached(matchId, { dbSync: false }).then(data => {
            if (!data) return null;
            data._rich = true;
            return data;
        })
        : (() => {
            const season = resolveLegacySeason(anchorEl);
            if (!season) return Promise.resolve(null);
            return TmMatchService.fetchMatchTooltip(matchId, season);
        })())
        .then(data => {
            if (data) dataCache.set(key, data);
            requestCache.delete(key);
            return data;
        })
        .catch(error => {
            requestCache.delete(key);
            throw error;
        });

    requestCache.set(key, request);
    return request;
};

export const TmMatchH2HTooltip = {

    ensureStyles() {
        TmMatchTooltip.ensureStyles();
    },

    show(anchorEl, matchId, rich = false) {
        if (!anchorEl || !matchId) return null;

        this.ensureStyles();

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'rnd-h2h-tooltip';
        tooltipEl.dataset.matchId = String(matchId);
        anchorEl.appendChild(tooltipEl);

        const render = (html) => {
            if (!tooltipEl.isConnected || tooltipEl.dataset.matchId !== String(matchId)) return;
            tooltipEl.innerHTML = html;
        };

        render(TmUI.loading('Loading…', true));
        requestAnimationFrame(() => tooltipEl.classList.add('visible'));

        fetchTooltipData(matchId, !!rich, anchorEl)
            .then(data => {
                if (!data) {
                    render(TmUI.error('Failed', true));
                    return;
                }
                render(data._rich ? this.buildRichTooltip(data) : this.buildTooltipContent(data));
            })
            .catch(() => render(TmUI.error('Failed', true)));

        return tooltipEl;
    },

    // ── Tooltip from tooltip.ajax.php (older seasons) ──
    buildTooltipContent(d) {
        return TmMatchTooltip.buildLegacyTooltipContent(d);
    },

    // ── Rich tooltip from match.ajax.php (current season) ──
    buildRichTooltip(mData) {
        return TmMatchTooltip.buildRichTooltip(mData);
    },
};
