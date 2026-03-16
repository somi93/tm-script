export const TmMatchDetails = {
    render(body, liveState) {
        const mData = liveState.mData;

        const IMPORTANT_ACTIONS = new Set(['shot', 'yellow', 'yellowRed', 'red', 'subIn', 'injury']);
        const icons = { shot: '⚽', yellow: '🟨', yellowRed: '🟥🟨', red: '🟥', subIn: '🔄', injury: '✚' };

        const allActions = (mData.actions || []).filter(a => IMPORTANT_ACTIONS.has(a.action) && (a.action !== 'shot' || a.goal));

        // ── Render ────────────────────────────────────────────────────────
        let html = '<div style="max-width:900px;margin:0 auto"><div class="rnd-timeline">';
        allActions.forEach(act => {
            html += `<div class="rnd-tl-row">`;
            html += `<div class="rnd-tl-home"></div>`;
            html += `<div class="rnd-tl-min">${act.min}' ${icons[act.action] || ''} ${act.by ?? ''}</div>`;
            html += `<div class="rnd-tl-away"></div>`;
            html += `</div>`;
        });
        html += '</div></div>';

        body.html(html);
    },
};
