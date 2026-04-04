import { TmConst } from '../../lib/tm-constants.js';
import { TmUI } from '../shared/tm-ui.js';

/**
 * tm-match-header.js — Match header HTML builder
 *
 * Exposed as: TmMatchHeader
 * Usage: TmMatchHeader.build(mData, matchIsFuture, matchIsLive) → jQuery overlay
 */

const { MENTALITY_MAP, STYLE_MAP_SHORT, FOCUS_MAP } = TmConst;

const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'xs', shape: 'rounded', weight: 'bold', ...opts }, tone);

const buildChips = (mData, side) => {
  const md = mData.match_data;
  let c = '';
  const ment = MENTALITY_MAP[mData.teams[side].mentality] || '?';
  c += badgeHtml({
    attrs: { id: `rnd-chip-ment-${side}` },
    slot: `<span class="tmu-badge-icon">⚔</span><span class="tmu-badge-value">${ment}</span>`,
  });
  const style = mData.teams[side].attackingStyle ? (STYLE_MAP_SHORT[mData.teams[side].attackingStyle] || mData.teams[side].attackingStyle) : '?';
  c += badgeHtml({
    slot: `<span class="tmu-badge-icon">🎯</span><span class="tmu-badge-value">${style}</span>`,
  });
  const focus = mData.teams[side].focusSide ? (FOCUS_MAP[mData.teams[side].focusSide] || mData.teams[side].focusSide) : '?';
  c += badgeHtml({
    slot: `<span class="tmu-badge-icon">◎</span><span class="tmu-badge-value">${focus}</span>`,
  });
  c += badgeHtml({
    attrs: { id: `rnd-chip-r5-${side}` },
    slot: '<span class="tmu-badge-label">R5</span><span class="tmu-badge-value">···</span>',
  });
  return c;
};

const buildDatetime = (md) => {
  const ko = md.venue?.kickoff_readable || '';
  const d = ko ? new Date(ko.replace(' ', 'T')).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const t = md.match_time_of_day || '';
  return (d || '') + (t ? ' · ' + t : '');
};

const htmlOf = (node) => node ? node.outerHTML : '';

const buttonHtml = (opts) => TmUI.button(opts).outerHTML;

const buildTabs = (matchIsFuture, isLeague) => {
  const items = matchIsFuture
    ? [
      { key: 'lineups', label: 'Expected Lineups' },
      { key: 'analysis', label: 'Analysis' },
      { key: 'venue', label: 'Venue' },
      { key: 'h2h', label: 'H2H' },
    ]
    : [
      { key: 'details', label: 'Details' },
      { key: 'statistics', label: 'Statistics' },
      { key: 'report', label: 'Report' },
      { key: 'lineups', label: 'Lineups' },
      { key: 'analysis', label: 'Analysis' },
      ...(isLeague ? [{ key: 'league', label: 'League' }] : []),
      { key: 'venue', label: 'Venue' },
      { key: 'h2h', label: 'H2H' },
    ];

  return htmlOf(TmUI.tabs({
    items,
    active: 'lineups',
    color: 'primary',
    stretch: true,
    cls: 'rnd-tabs',
  }));
};

export const TmMatchHeader = {
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
                  ${buttonHtml({ label: 'All', color: 'secondary', size: 'xs', cls: 'rnd-live-filter-btn', attrs: { 'data-filter': 'all' } })}
                  ${buttonHtml({ label: 'Key', color: 'secondary', size: 'xs', cls: `rnd-live-filter-btn${matchIsLive ? '' : ' active'}`, attrs: { 'data-filter': 'key' } })}
                  ${matchIsLive ? buttonHtml({ slot: '<span class="rnd-live-filter-dot"></span><span>Live</span>', color: 'secondary', size: 'xs', cls: 'rnd-live-filter-btn live-btn active', attrs: { 'data-filter': 'live' } }) : ''}
                </div>
                ${buttonHtml({ id: 'rnd-live-play-head', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>', title: 'Play / Pause', color: 'secondary', size: 'xs', cls: 'rnd-live-btn' })}
                ${buttonHtml({ id: 'rnd-live-skip-head', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="4" width="2" height="16" rx="1" fill="currentColor"/></svg>', title: 'Skip to end', color: 'secondary', size: 'xs', cls: 'rnd-live-btn' })}`;

    return $(`
                <div class="rnd-overlay" id="rnd-overlay">
                    <div class="rnd-dialog">
                        <div class="rnd-dlg-head">
                            ${buttonHtml({ id: 'rnd-dlg-close', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', color: 'secondary', size: 'sm', shape: 'full', cls: 'rnd-dlg-close' })}
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
                        ${buildTabs(matchIsFuture, isLeague)}
                        <div class="rnd-dlg-body" id="rnd-dlg-body"></div>
                    </div>
                </div>
            `);
  },
};