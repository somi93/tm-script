import { TmMatchModel } from '../../models/match.js';
import { TmUI } from './tm-ui.js';
import { TmMatchTooltip } from './tm-match-tooltip.js';
import { TmTooltip } from './tm-tooltip.js';

const state = {
    cache: {},
    tooltipEl: null,
    anchor: null,
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

    state.anchor = el;
    const isCurrentSeason = Number(season) === currentSeason();
    state.tooltipEl = document.createElement('div');
    state.tooltipEl.className = 'rnd-h2h-tooltip';
    state.tooltipEl.dataset.forMid = String(matchId);
    state.tooltipEl.style.transform = 'none';
    document.body.appendChild(state.tooltipEl);
    TmTooltip.positionTooltip(state.tooltipEl, el);

    state.tooltipEl.addEventListener('mouseenter', () => clearTimeout(state.hideTimer));
    state.tooltipEl.addEventListener('mouseleave', () => {
        state.hideTimer = setTimeout(() => removeTooltip(), 100);
    });

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
        TmMatchModel.fetchMatchCached(matchId).then(data => {
            if (!data) {
                onFail();
                return;
            }
            data._rich = true;
            state.cache[matchId] = data;
            if (state.tooltipEl?.dataset.forMid === String(matchId)) {
                state.tooltipEl.innerHTML = buildRichTooltip(data);
                TmTooltip.positionTooltip(state.tooltipEl, state.anchor);
            }
        }).catch(onFail);
        return;
    }

    TmMatchModel.fetchTooltip(matchId, season).then(data => {
        if (!data) {
            onFail();
            return;
        }
        state.cache[matchId] = data;
        if (state.tooltipEl?.dataset.forMid === String(matchId)) {
            state.tooltipEl.innerHTML = buildLegacyTooltipContent(data);
            TmTooltip.positionTooltip(state.tooltipEl, state.anchor);
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