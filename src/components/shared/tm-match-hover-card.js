import { TmMatchService } from '../../services/match.js';
import { TmUI } from './tm-ui.js';
import { TmMatchTooltip } from './tm-match-tooltip.js';

const state = {
    cache: {},
    tooltipEl: null,
    showTimer: null,
    hideTimer: null,
};

const currentSeason = () => ((typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null);

const injectStyles = () => {
    TmMatchTooltip.ensureStyles();
};

const buildLegacyTooltipContent = (data) => TmMatchTooltip.buildLegacyTooltipContent(data);

const buildRichTooltip = (matchData) => TmMatchTooltip.buildRichTooltip(matchData);

const HOVER_ROW_SELECTOR = '[data-mid][data-match-hover-enabled="1"]';

const removeTooltip = () => {
    if (state.tooltipEl) {
        state.tooltipEl.remove();
        state.tooltipEl = null;
    }
};

const show = (el, matchId, season) => {
    injectStyles();
    clearTimeout(state.hideTimer);
    removeTooltip();

    const isCurrentSeason = Number(season) === currentSeason();
    state.tooltipEl = document.createElement('div');
    state.tooltipEl.className = 'rnd-h2h-tooltip';
    el.appendChild(state.tooltipEl);

    if (state.cache[matchId]) {
        const cached = state.cache[matchId];
        state.tooltipEl.innerHTML = cached._rich ? buildRichTooltip(cached) : buildLegacyTooltipContent(cached);
        requestAnimationFrame(() => state.tooltipEl?.classList.add('visible'));
        return;
    }

    state.tooltipEl.innerHTML = TmUI.loading('Loading…', true);
    requestAnimationFrame(() => state.tooltipEl?.classList.add('visible'));

    const onFail = () => {
        if (state.tooltipEl) state.tooltipEl.innerHTML = TmUI.error('Failed', true);
    };

    if (isCurrentSeason) {
        TmMatchService.fetchMatchCached(matchId, { dbSync: false }).then(data => {
            if (!data) {
                onFail();
                return;
            }
            data._rich = true;
            state.cache[matchId] = data;
            if (state.tooltipEl && state.tooltipEl.closest('[data-mid]')?.dataset.mid === String(matchId)) {
                state.tooltipEl.innerHTML = buildRichTooltip(data);
            }
        }).catch(onFail);
        return;
    }

    TmMatchService.fetchMatchTooltip(matchId, season).then(data => {
        if (!data) {
            onFail();
            return;
        }
        state.cache[matchId] = data;
        if (state.tooltipEl && state.tooltipEl.closest('[data-mid]')?.dataset.mid === String(matchId)) {
            state.tooltipEl.innerHTML = buildLegacyTooltipContent(data);
        }
    }).catch(onFail);
};

const bindContainer = (container) => {
    if (!container || container.__tmMatchHoverBound === '1') return;
    container.__tmMatchHoverBound = '1';

    container.addEventListener('mouseover', (event) => {
        const row = event.target.closest(HOVER_ROW_SELECTOR);
        if (!row || !container.contains(row) || row.contains(event.relatedTarget)) return;
        clearTimeout(state.hideTimer);
        const matchId = row.dataset.mid;
        if (!matchId) return;
        const season = row.dataset.hoverSeason ? Number(row.dataset.hoverSeason) : currentSeason();
        state.showTimer = setTimeout(() => show(row, matchId, season), 300);
    });

    container.addEventListener('mouseout', (event) => {
        const row = event.target.closest(HOVER_ROW_SELECTOR);
        if (!row || !container.contains(row) || row.contains(event.relatedTarget)) return;
        clearTimeout(state.showTimer);
        state.hideTimer = setTimeout(() => removeTooltip(), 100);
    });
};

const bind = (rows, { season } = {}) => {
    injectStyles();
    const resolvedSeason = season ?? currentSeason();
    const containers = new Set();
    rows.forEach(row => {
        if (!row?.dataset?.mid) return;
        row.dataset.matchHoverEnabled = '1';
        row.dataset.hoverSeason = resolvedSeason == null ? '' : String(resolvedSeason);
        if (row.parentElement) containers.add(row.parentElement);
    });
    containers.forEach(bindContainer);
};

export const TmMatchHoverCard = {
    injectStyles,
    bind,
};