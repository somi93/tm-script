/**
 * tm-match-h2h.js — H2H tab for new match player.
 * Uses normalized match data; fetches via TmMatchModel.fetchH2H.
 */

import { TmMatchModel }      from '../../models/match.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';

const H2H_STYLE_ID = 'mp-h2h-style';
const ensureH2HStyles = () => {
    if (document.getElementById(H2H_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = H2H_STYLE_ID;
    s.textContent = `
        .rnd-h2h-wrap { max-width: 640px; margin: 0 auto; padding: 8px 0 16px; }
        .rnd-h2h-summary {
            display: flex; align-items: center; justify-content: center;
            gap: 32px; padding: 10px 0 12px;
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
            margin-bottom: 4px;
        }
        .rnd-h2h-sum-item { display: flex; flex-direction: column; align-items: center; }
        .rnd-h2h-sum-num {
            font-size: var(--tmu-font-xl); font-weight: 800; line-height: 1;
        }
        .rnd-h2h-sum-num.home { color: var(--tmu-compare-home-grad-end); }
        .rnd-h2h-sum-num.draw { color: var(--tmu-text-muted); }
        .rnd-h2h-sum-num.away { color: var(--tmu-compare-away-grad-end); }
        .rnd-h2h-sum-lbl {
            font-size: var(--tmu-font-2xs); color: var(--tmu-text-dim);
            text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 2px;
        }
        .rnd-h2h-sum-sep { color: var(--tmu-border-embedded); font-size: var(--tmu-font-xl); align-self: center; }
        .rnd-h2h-goals-summary {
            text-align: center; font-size: var(--tmu-font-xs); color: var(--tmu-text-dim);
            padding: 4px 0 8px;
        }
        .rnd-h2h-goals-summary span { color: var(--tmu-text-panel-label); font-weight: 700; }
        .rnd-h2h-matches { padding-top: 4px; }
        .rnd-h2h-season {
            font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase;
            letter-spacing: 1.5px; padding: 10px 0 4px; font-weight: 700;
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
        }
        .rnd-h2h-match {
            position: relative; display: flex; align-items: center; gap: 0;
            padding: 6px 8px; margin: 2px 0; border-radius: 6px;
            font-size: var(--tmu-font-sm); cursor: pointer; transition: background 0.15s;
        }
        .rnd-h2h-match:hover { background: var(--tmu-border-contrast); }
        .rnd-h2h-match.h2h-readonly { cursor: default; }
        .rnd-h2h-match.h2h-win  { border-left: 3px solid var(--tmu-success); }
        .rnd-h2h-match.h2h-loss { border-left: 3px solid var(--tmu-compare-away-grad-end); }
        .rnd-h2h-match.h2h-draw { border-left: 3px solid var(--tmu-text-dim); }
        .rnd-h2h-date {
            color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); width: 72px;
            flex-shrink: 0; font-weight: 500;
        }
        .rnd-h2h-match .tmu-badge {
            flex-shrink: 0; margin-right: 8px; width: 100px; justify-content: center;
        }
        .rnd-h2h-home {
            margin-left: 16px; text-align: right; color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm); white-space: nowrap; overflow: hidden;
            text-overflow: ellipsis; padding-right: 8px; flex: 1;
        }
        .rnd-h2h-score {
            font-weight: 800; font-size: var(--tmu-font-sm); color: var(--tmu-text-strong);
            white-space: nowrap; flex-shrink: 0; min-width: 40px; text-align: center;
        }
        .rnd-h2h-away {
            text-align: left; color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm); white-space: nowrap; overflow: hidden;
            text-overflow: ellipsis; padding-left: 8px; flex: 1;
        }
    `;
    document.head.appendChild(s);
};

const h2hTypeSortKey = (m) => {
    if (m.division) return 'League';
    const mt = m.matchtype || '';
    if (mt === 'fl') return 'Friendly League';
    if (mt === 'f' || mt === 'fq') return 'Friendly';
    if (/^p\d$/.test(mt)) return 'Cup';
    if (['ueg', 'ue1', 'ue2', 'clg', 'cl1', 'cl2'].includes(mt)) return 'International Cup';
    return '';
};

export const TmMatchH2HNew = {
    create(match) {
        ensureH2HStyles();

        const homeId   = String(match.home.club.id);
        const awayId   = String(match.away.club.id);
        const homeName = match.home.club.name || homeId;
        const awayName = match.away.club.name || awayId;
        const kickoff  = match.kickoff || Math.floor(Date.now() / 1000);

        const el = document.createElement('div');
        el.className = 'rnd-h2h-wrap';
        el.innerHTML = '<div style="padding:32px;text-align:center;color:var(--tmu-text-faint)">Loading H2H…</div>';

        TmMatchModel.fetchH2H(homeId, awayId, kickoff).then(data => {
            if (!data) { el.innerHTML = '<div style="padding:32px;text-align:center;color:var(--tmu-text-faint)">No H2H data found.</div>'; return; }

            const allStats = data.all || {};
            const hWins    = allStats[homeId]?.w  || 0;
            const aWins    = allStats[awayId]?.w  || 0;
            const draws    = allStats[homeId]?.d  || 0;
            const hGoals   = allStats[homeId]?.gf || 0;
            const aGoals   = allStats[awayId]?.gf || 0;

            const clubNames = { [homeId]: homeName, [awayId]: awayName };

            let html = `
                <div class="rnd-h2h-summary">
                    <div class="rnd-h2h-sum-item">
                        <span class="rnd-h2h-sum-num home">${hWins}</span>
                        <span class="rnd-h2h-sum-lbl">Home W</span>
                    </div>
                    <span class="rnd-h2h-sum-sep">·</span>
                    <div class="rnd-h2h-sum-item">
                        <span class="rnd-h2h-sum-num draw">${draws}</span>
                        <span class="rnd-h2h-sum-lbl">Draws</span>
                    </div>
                    <span class="rnd-h2h-sum-sep">·</span>
                    <div class="rnd-h2h-sum-item">
                        <span class="rnd-h2h-sum-num away">${aWins}</span>
                        <span class="rnd-h2h-sum-lbl">Away W</span>
                    </div>
                </div>`;

            if (hGoals || aGoals) {
                html += `<div class="rnd-h2h-goals-summary">Goals: <span>${hGoals}</span> – <span>${aGoals}</span></div>`;
            }

            html += '<div class="rnd-h2h-matches">';
            if (data.matches) {
                const currentSeason = window.SESSION?.season;
                const seasons = Object.keys(data.matches).sort((a, b) => Number(b) - Number(a));
                seasons.forEach(season => {
                    html += `<div class="rnd-h2h-season">Season ${season}</div>`;
                    const isOldSeason = Number(season) !== currentSeason;
                    data.matches[season].forEach(m => {
                        html += TmFixtureMatchRow.render({
                            id:             m.id,
                            hometeam:       m.hometeam,
                            hometeam_name:  clubNames[String(m.hometeam)] || String(m.hometeam),
                            awayteam:       m.awayteam,
                            awayteam_name:  clubNames[String(m.awayteam)] || String(m.awayteam),
                            result:         m.result,
                            matchtype_sort: h2hTypeSortKey(m),
                        }, {
                            dateText:   m.date || '',
                            showType:   true,
                            myClubId:   homeId,
                            season:     String(season),
                            extraClass: isOldSeason ? 'h2h-readonly' : '',
                        });
                    });
                });
            }
            html += '</div>';

            el.innerHTML = html;
        }).catch(() => {
            el.innerHTML = '<div style="padding:32px;text-align:center;color:var(--tmu-danger)">Failed to load H2H data.</div>';
        });

        return el;
    },
};
