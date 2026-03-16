import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchUtils } from '../../utils/match.js';

const { R5_THRESHOLDS } = TmConst;
const getColor = TmUtils.getColor;

export const TmMatchAnalysis = {
    render(body, mData, teams) {
        if (!mData.profilesReady) {
            body.html(TmUI.loading('Loading profiles…'));
            return;
        }
        const md = mData.match_data;
        const lines = ['GK', 'DEF', 'MID', 'ATT', 'ALL'];

        // Build HTML
        let html = '<div class="rnd-analysis-wrap">';

        // ── 1. FORM ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">📊</span> Form Guide</div>';
        html += '<div class="rnd-an-form-row">';
        // Home form
        html += '<div class="rnd-an-form-side home">';
        html += `<span class="rnd-an-form-label">${teams.home.name.length > 12 ? teams.home.name.substring(0, 12) + '…' : teams.home.name}</span>`;
        html += '<div class="rnd-an-form-dots">';
        teams.home.form.dots.forEach(r => {
            html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
        });
        html += `</div><span class="rnd-an-form-pts">${teams.home.form.pts}</span>`;
        html += '</div>';
        // Away form
        html += '<div class="rnd-an-form-side away">';
        html += `<span class="rnd-an-form-label">${teams.away.name.length > 12 ? teams.away.name.substring(0, 12) + '…' : teams.away.name}</span>`;
        html += '<div class="rnd-an-form-dots">';
        teams.away.form.dots.forEach(r => {
            html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
        });
        html += `</div><span class="rnd-an-form-pts">${teams.away.form.pts}</span>`;
        html += '</div>';
        html += '</div>';
        // Form comparison bar
        const totalFormPts = teams.home.form.pts + teams.away.form.pts || 1;
        html += '<div class="rnd-an-form-bar-wrap"><div class="rnd-an-form-bar">';
        html += `<div class="rnd-an-form-seg home" style="width:${Math.round(teams.home.form.pts / totalFormPts * 100)}%"></div>`;
        html += `<div class="rnd-an-form-seg away" style="width:${Math.round(teams.away.form.pts / totalFormPts * 100)}%"></div>`;
        html += '</div></div>';
        html += '</div>';

        // ── 2. SQUAD STRENGTH ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">💪</span> Squad Strength (R5)</div>';

        const lineLabels = { GK: 'Keeper', DEF: 'Defence', MID: 'Midfield', ATT: 'Attack', ALL: 'Overall' };
        lines.forEach(line => {
            const hR5 = line === 'ALL' ? teams.home.avgR5 : teams.home[line];
            const aR5 = line === 'ALL' ? teams.away.avgR5 : teams.away[line];
            const maxR5 = Math.max(hR5, aR5, 1);
            const hPct = Math.round(hR5 / maxR5 * 100);
            const aPct = Math.round(aR5 / maxR5 * 100);
            const hLead = hR5 > aR5 ? ' leading' : '';
            const aLead = aR5 > hR5 ? ' leading' : '';
            const isOverall = line === 'ALL';

            html += `<div class="rnd-an-strength-row"${isOverall ? ' style="padding:8px 20px;border-top:1px solid rgba(80,160,48,.1)"' : ''}>`;
            html += `<span class="rnd-an-str-val home${hLead}" style="color:${getColor(hR5, R5_THRESHOLDS)}">${hR5.toFixed(1)}</span>`;
            html += `<div class="rnd-an-str-bar"><div class="rnd-an-str-fill home" style="width:${hPct}%"></div></div>`;
            html += `<span class="rnd-an-str-label">${isOverall ? '⭐ ' : ''}${lineLabels[line]}</span>`;
            html += `<div class="rnd-an-str-bar"><div class="rnd-an-str-fill away" style="width:${aPct}%"></div></div>`;
            html += `<span class="rnd-an-str-val away${aLead}" style="color:${getColor(aR5, R5_THRESHOLDS)}">${aR5.toFixed(1)}</span>`;
            html += '</div>';
        });
        html += '</div>';

        // ── 3. KEY PLAYERS ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">🌟</span> Key Players</div>';
        html += '<div class="rnd-an-keys">';

        const faceUrl = (p, clrHex) => TmMatchUtils.faceUrl(p, clrHex, 72);

        const renderTopPlayers = (team, side) => {
            const clr = team.color.replace('#', '');
            const top5 = team.starting.filter(p => !p.isSub).slice(0, 5);
            html += `<div class="rnd-an-keys-side${side === 'away' ? ' away' : ''}">`;
            top5.forEach((p, i) => {
                const url = faceUrl(p, clr);
                html += `<div class="rnd-an-key-player">`;
                html += `<span class="rnd-an-key-rank">${i + 1}</span>`;
                if (url) html += `<div class="rnd-an-key-face" style="border-color:${team.color}"><img src="${url}" onerror="this.style.display='none'"></div>`;
                html += `<div class="rnd-an-key-info"><div class="rnd-an-key-name">${p.name}</div><div class="rnd-an-key-meta">${p.fp} · ${p.age}y · Rtn ${p.routine.toFixed(1)}</div></div>`;
                html += `<span class="rnd-an-key-r5" style="color:${getColor(p.r5, R5_THRESHOLDS)}">${p.r5.toFixed(1)}</span>`;
                html += '</div>';
            });
            html += '</div>';
        }
        renderTopPlayers(teams.home, 'home');
        renderTopPlayers(teams.away, 'away');
        html += '</div></div>';

        // ── 4. SQUAD PROFILE ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">📋</span> Squad Profile</div>';
        html += '<div class="rnd-an-profile-grid">';
        html += `<div class="rnd-an-profile-card">
                    <span class="rnd-an-profile-icon">🎂</span>
                    <div class="rnd-an-profile-info">
                        <div class="rnd-an-profile-label">Avg Age</div>
                        <div class="rnd-an-profile-vals">
                            <span class="rnd-an-profile-val home">${teams.home.avgAge.toFixed(1)}</span>
                            <span class="rnd-an-profile-vs">vs</span>
                            <span class="rnd-an-profile-val away">${teams.away.avgAge.toFixed(1)}</span>
                        </div>
                    </div>
                </div>`;
        html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">📈</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Avg Routine</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home">${teams.home.avgRtn.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away">${teams.away.avgRtn.toFixed(1)}</span></div></div></div>`;
        html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">⭐</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Starting XI R5</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home" style="color:${getColor(teams.home.avgR5, R5_THRESHOLDS)}">${teams.home.avgR5.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away" style="color:${getColor(teams.away.avgR5, R5_THRESHOLDS)}">${teams.away.avgR5.toFixed(1)}</span></div></div></div>`;
        html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">🪑</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Bench Avg R5</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home" style="color:${getColor(teams.home.subsR5, R5_THRESHOLDS)}">${teams.home.subsR5.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away" style="color:${getColor(teams.away.subsR5, R5_THRESHOLDS)}">${teams.away.subsR5.toFixed(1)}</span></div></div></div>`;
        html += '</div></div>';

        // ── 5. TACTICAL MATCHUP ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">⚔️</span> Tactical Matchup</div>';
        html += '<div class="rnd-an-tactics">';


        const generateTactics = (team, side) => {
            const formation = team.formation;
            const ment = team.mentality;
            const style = team.attackingStyle;
            const focus = team.focusSide;

            html += `<div class="rnd-an-tactic-side${side === 'away' ? ' away' : ''}">`;
            html += `<div class="rnd-an-tactic-team">${team.name}</div>`;
            html += `<div class="rnd-an-tactic-item"><span class="t-icon">📐</span><span class="t-label">Formation</span><span class="t-val">${formation}</span></div>`;
            html += `<div class="rnd-an-tactic-item"><span class="t-icon">⚔️</span><span class="t-label">Mentality</span><span class="t-val">${ment}</span></div>`;
            html += `<div class="rnd-an-tactic-item"><span class="t-icon">🎯</span><span class="t-label">Style</span><span class="t-val">${style}</span></div>`;
            html += `<div class="rnd-an-tactic-item"><span class="t-icon">◎</span><span class="t-label">Focus</span><span class="t-val">${focus}</span></div>`;
            html += '</div>';
        }

        generateTactics(teams.home, 'home');
        generateTactics(teams.away, 'away');
        html += '</div></div>';

        // ── 6. UNAVAILABLE PLAYERS ──
        const hOut = md.lineup_out?.home ? Object.values(md.lineup_out.home) : [];
        const aOut = md.lineup_out?.away ? Object.values(md.lineup_out.away) : [];
        if (hOut.length || aOut.length) {
            html += '<div class="rnd-an-section">';
            html += '<div class="rnd-an-section-head"><span class="an-icon">🚫</span> Unavailable</div>';
            html += '<div class="rnd-an-unavail">';
            html += '<div class="rnd-an-unavail-side">';
            if (hOut.length) hOut.forEach(p => { html += `<div class="rnd-an-unavail-player">✕ ${p.name}</div>`; });
            else html += '<div class="rnd-an-unavail-none">Full squad available</div>';
            html += '</div>';
            html += '<div class="rnd-an-unavail-side away">';
            if (aOut.length) aOut.forEach(p => { html += `<div class="rnd-an-unavail-player">✕ ${p.name}</div>`; });
            else html += '<div class="rnd-an-unavail-none">Full squad available</div>';
            html += '</div>';
            html += '</div></div>';
        }

        // ── 7. PREDICTION ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">🔮</span> Match Prediction</div>';
        html += '<div class="rnd-an-prediction">';

        // Weighted prediction: 50% R5, 30% form, 20% home advantage
        const hR5Score = teams.home.avgR5;
        const aR5Score = teams.away.avgR5;

        // Form score (points / max possible)
        const hFormScore = teams.home.form.dots.length ? teams.home.form.pts / (teams.home.form.dots.length * 3) : 0.5;
        const aFormScore = teams.away.form.dots.length ? teams.away.form.pts / (teams.away.form.dots.length * 3) : 0.5;

        // Composite strength (0-1 scale)
        const homeAdv = TmConst.GAMEPLAY.HOME_ADVANTAGE;
        const r5Weight = 0.70;
        const formWeight = 0.15;
        const haWeight = 0.15;

        // Normalize R5 to 0-1 (range 40-120)
        const r5Norm = (v) => Math.max(0, Math.min(1, (v - 40) / 80));
        const hStrength = r5Norm(hR5Score) * r5Weight + hFormScore * formWeight + (0.5 + homeAdv) * haWeight;
        const aStrength = r5Norm(aR5Score) * r5Weight + aFormScore * formWeight + (0.5 - homeAdv) * haWeight;

        // Convert to win/draw/loss probabilities
        const diff = hStrength - aStrength;
        const drawBase = 0.24; // Base draw probability
        const drawProb = Math.max(0.08, drawBase - Math.abs(diff) * 0.6);
        const remaining = 1 - drawProb;
        const sigmoid = (x) => 1 / (1 + Math.exp(-x * 12));
        const hWinRaw = sigmoid(diff);
        let hWin = Math.round(hWinRaw * remaining * 100);
        let draw = Math.round(drawProb * 100);
        let aWin = 100 - hWin - draw;
        if (aWin < 0) { aWin = 0; hWin = 100 - draw; }

        html += '<div class="rnd-an-pred-teams">';
        html += '<div class="rnd-an-pred-side">';
        html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${teams.home.id}_140.png" onerror="this.style.display='none'">`;
        html += `<div class="rnd-an-pred-name">${teams.home.name}</div>`;
        html += `<div class="rnd-an-pred-pct home">${hWin}%</div>`;
        html += '<div class="rnd-an-pred-label">Win</div>';
        html += '</div>';
        html += '<div class="rnd-an-pred-draw">';
        html += `<div class="rnd-an-pred-pct draw">${draw}%</div>`;
        html += '<div class="rnd-an-pred-label">Draw</div>';
        html += '</div>';
        html += '<div class="rnd-an-pred-side">';
        html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${teams.away.id}_140.png" onerror="this.style.display='none'">`;
        html += `<div class="rnd-an-pred-name">${teams.away.name}</div>`;
        html += `<div class="rnd-an-pred-pct away">${aWin}%</div>`;
        html += '<div class="rnd-an-pred-label">Win</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="rnd-an-pred-bar-wrap">';
        html += `<div class="rnd-an-pred-seg home" style="width:${hWin}%"></div>`;
        html += `<div class="rnd-an-pred-seg draw" style="width:${draw}%"></div>`;
        html += `<div class="rnd-an-pred-seg away" style="width:${aWin}%"></div>`;
        html += '</div>';
        html += '</div></div>';

        html += '</div>'; // wrap
        body.html(html);
    }
};
