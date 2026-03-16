export const TmMatchDetails = {
    render(body, liveState) {
        const mData = liveState.mData;

        const IMPORTANT_ACTIONS = new Set(['shot', 'yellow', 'yellowRed', 'red', 'subIn', 'injury']);
        const icons = { shot: '⚽', yellow: '🟨', yellowRed: '🟥🟨', red: '🟥', injury: '✚' };

        const allActions = (mData.actions || []).filter(a => IMPORTANT_ACTIONS.has(a.action) && (a.action !== 'shot' || a.goal));

        // ── Render ────────────────────────────────────────────────────────
        let html = '<div style="max-width:900px;margin:0 auto"><div class="rnd-timeline">';
        allActions.forEach(act => {
            let cell;
            if (act.action === 'subIn') {
                const subOut = (mData.actions || []).find(a => a.action === 'subOut' && a.min === act.min && a.home === act.home);
                cell = `<span style="color:#80d848">↑ ${act.player}</span> <span style="color:#c07050">↓ ${subOut?.player ?? '?'}</span>`;
            } else {
                cell = `${act.player} ${icons[act.action] || ''}`;
            }
            html += `<div class="rnd-tl-row">`;
            html += `<div class="rnd-tl-home">${act.home ? cell : ''}</div>`;
            html += `<div class="rnd-tl-min">${act.min}'</div>`;
            html += `<div class="rnd-tl-away">${!act.home ? cell : ''}</div>`;
            html += `</div>`;
        });
        html += '</div></div>';

        body.html(html);
    },
};
