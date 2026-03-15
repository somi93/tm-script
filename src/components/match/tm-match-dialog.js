import { TmConst } from '../../lib/tm-constants.js';

/**
 * tm-match-dialog.js — Match dialog overlay HTML builder
 *
 * Exposed as: TmMatchDialog
 * Usage: TmMatchDialog.build(mData, matchIsFuture, matchIsLive) → jQuery overlay
 */

const { MENTALITY_MAP, STYLE_MAP_SHORT, FOCUS_MAP } = TmConst;

const buildChips = (mData, side) => {
  const md = mData.match_data;
  let c = '';
  const ment = MENTALITY_MAP[mData.teams[side].mentality] || '?';
  c += `<span class="rnd-dlg-chip" id="rnd-chip-ment-${side}">⚔ <span class="chip-val">${ment}</span></span>`;
  const style = mData.teams[side].attackingStyle ? (STYLE_MAP_SHORT[mData.teams[side].attackingStyle] || mData.teams[side].attackingStyle) : '?';
  c += `<span class="rnd-dlg-chip">🎯 <span class="chip-val">${style}</span></span>`;
  const focus = mData.teams[side].focusSide ? (FOCUS_MAP[mData.teams[side].focusSide] || mData.teams[side].focusSide) : '?';
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

export const TmMatchDialog = {
  /**
   * Build the full dialog overlay element.
   * @param {object} mData        — full match data object
   * @param {boolean} matchIsFuture
   * @param {boolean} matchIsLive
   * @returns {jQuery} overlay element (not yet appended to DOM)
   */
  build(mData, matchIsFuture, matchIsLive) {
    const md = mData.match_data;
    const homeClub = mData.club.home.club_name;
    const awayClub = mData.club.away.club_name;
    const homeLogoId = mData.club.home.id;
    const awayLogoId = mData.club.away.id;
    const isLeague = md.venue?.matchtype === 'l';

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
                                    <div class="rnd-dlg-chips">${buildChips(mData, 'home')}</div>
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
                                    <div class="rnd-dlg-chips">${buildChips(mData, 'away')}</div>
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

