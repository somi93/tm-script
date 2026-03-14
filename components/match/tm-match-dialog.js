/**
 * tm-match-dialog.js — Match dialog overlay HTML builder
 *
 * Exposed as: window.TmMatchDialog
 * Usage: window.TmMatchDialog.build(mData, matchIsFuture, matchIsLive) → jQuery overlay
 */
(function () {
    'use strict';

    const MENTALITY_MAP    = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
    const STYLE_MAP_SHORT  = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short', 5: 'Long', 6: 'Through' };
    const FOCUS_MAP_SHORT  = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };

    const buildChips = (md, side) => {
        let c = '';
        const ment = md.mentality ? (MENTALITY_MAP[md.mentality[side]] || md.mentality[side]) : '?';
        c += `<span class="rnd-dlg-chip" id="rnd-chip-ment-${side}">⚔ <span class="chip-val">${ment}</span></span>`;
        const style = md.attacking_style ? (STYLE_MAP_SHORT[md.attacking_style[side]] || md.attacking_style[side]) : '?';
        c += `<span class="rnd-dlg-chip">🎯 <span class="chip-val">${style}</span></span>`;
        const focus = md.focus_side ? (FOCUS_MAP_SHORT[md.focus_side[side]] || md.focus_side[side]) : '?';
        c += `<span class="rnd-dlg-chip">◎ <span class="chip-val">${focus}</span></span>`;
        c += `<span class="rnd-dlg-chip" id="rnd-chip-r5-${side}">R5 <span class="chip-val">···</span></span>`;
        return c;
    };

    const buildDatetime = (md) => {
        const ko = md.venue?.kickoff_readable || '';
        const d = ko ? new Date(ko.replace(' ', 'T')).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const t = md.match_time_of_day || '';
        return (d || '') + (t ? ' · ' + t : '');
    };

    const buildTabs = (matchIsFuture, isLeague) => {
        if (matchIsFuture) return `
            <div class="rnd-tab active" data-tab="lineups">Expected Lineups</div>
            <div class="rnd-tab" data-tab="analysis">Analysis</div>
            <div class="rnd-tab" data-tab="venue">Venue</div>
            <div class="rnd-tab" data-tab="h2h">H2H</div>`;
        return `
            <div class="rnd-tab" data-tab="details">Details</div>
            <div class="rnd-tab" data-tab="statistics">Statistics</div>
            <div class="rnd-tab" data-tab="report">Report</div>
            <div class="rnd-tab active" data-tab="lineups">Lineups</div>
            <div class="rnd-tab" data-tab="analysis">Analysis</div>
            ${isLeague ? '<div class="rnd-tab" data-tab="league">League</div>' : ''}
            <div class="rnd-tab" data-tab="venue">Venue</div>
            <div class="rnd-tab" data-tab="h2h">H2H</div>`;
    };

    window.TmMatchDialog = {
        /**
         * Build the full dialog overlay element.
         * @param {object} mData        — full match data object
         * @param {boolean} matchIsFuture
         * @param {boolean} matchIsLive
         * @returns {jQuery} overlay element (not yet appended to DOM)
         */
        build(mData, matchIsFuture, matchIsLive) {
            const md = mData.match_data;
            const homeClub    = mData.club.home.club_name;
            const awayClub    = mData.club.away.club_name;
            const homeLogoId  = mData.club.home.id;
            const awayLogoId  = mData.club.away.id;
            const isLeague    = md.venue?.matchtype === 'l';

            const liveControls = matchIsFuture ? '' : `
                <div class="rnd-live-progress"><div class="rnd-live-progress-fill" id="rnd-live-progress-head" style="width:0%"></div></div>
                <div class="rnd-live-filter-group">
                  <button class="rnd-live-filter-btn" data-filter="all">All</button>
                  <button class="rnd-live-filter-btn${matchIsLive ? '' : ' active'}" data-filter="key">Key</button>
                  ${matchIsLive ? '<button class="rnd-live-filter-btn live-btn active" data-filter="live">Live</button>' : ''}
                </div>
                <button class="rnd-live-btn" id="rnd-live-play-head" title="Play / Pause">▶</button>
                <button class="rnd-live-btn" id="rnd-live-skip-head" title="Skip to end">⏭</button>`;

            return $(`
                <div class="rnd-overlay" id="rnd-overlay">
                    <div class="rnd-dialog">
                        <div class="rnd-dlg-head">
                            <button class="rnd-dlg-close" id="rnd-dlg-close">&times;</button>
                            <div class="rnd-dlg-head-content">
                              <div class="rnd-dlg-head-row">
                                <div class="rnd-dlg-team-group home">
                                  <div class="rnd-dlg-team-info">
                                    <span class="rnd-dlg-team">${homeClub}</span>
                                    <div class="rnd-dlg-chips">${buildChips(md, 'home')}</div>
                                  </div>
                                  <img class="rnd-dlg-logo" src="/pics/club_logos/${homeLogoId}_140.png" onerror="this.style.display='none'">
                                </div>
                                <div class="rnd-dlg-score-block">
                                  <span class="rnd-dlg-score">0 - 0</span>
                                  <div class="rnd-dlg-datetime">${buildDatetime(md)}</div>
                                </div>
                                <div class="rnd-dlg-team-group away">
                                  <img class="rnd-dlg-logo" src="/pics/club_logos/${awayLogoId}_140.png" onerror="this.style.display='none'">
                                  <div class="rnd-dlg-team-info">
                                    <span class="rnd-dlg-team">${awayClub}</span>
                                    <div class="rnd-dlg-chips">${buildChips(md, 'away')}</div>
                                  </div>
                                </div>
                              </div>
                              <div class="rnd-dlg-head-time">
                                <span class="rnd-live-min" id="rnd-live-min-head">${matchIsFuture ? '⏳' : '0:00'}</span>
                                ${liveControls}
                              </div>
                            </div>
                        </div>
                        <div class="rnd-tabs">${buildTabs(matchIsFuture, isLeague)}</div>
                        <div class="rnd-dlg-body" id="rnd-dlg-body"></div>
                    </div>
                </div>
            `);
        },
    };

})();
