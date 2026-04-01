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

const bind = (rows, { season } = {}) => {
    injectStyles();
    rows.forEach(row => {
        if (row.dataset.hoverBound === '1') return;
        row.dataset.hoverBound = '1';
        row.addEventListener('mouseenter', () => {
            clearTimeout(state.hideTimer);
            const matchId = row.dataset.mid;
            if (!matchId) return;
            state.showTimer = setTimeout(() => show(row, matchId, season ?? currentSeason()), 300);
        });
        row.addEventListener('mouseleave', () => {
            clearTimeout(state.showTimer);
            state.hideTimer = setTimeout(() => removeTooltip(), 100);
        });
    });
};

export const TmMatchHoverCard = {
    injectStyles,
    bind,
};