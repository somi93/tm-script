import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchAnalysisTactic } from './tm-match-analysis-tactic.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmMatchAnalysisProfile } from './tm-match-analysis-profile.js';
import { TmMatchUtils } from '../../utils/match.js';

const { R5_THRESHOLDS } = TmConst;
const getColor = TmUtils.getColor;

const avg = (values) => {
    const nums = values.map(v => Number(v)).filter(v => Number.isFinite(v));
    return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
};

const playerAgeYears = (player) => {
    const years = Number(player?.age);
    const months = Number(player?.month);
    if (!Number.isFinite(years) || years <= 0) return null;
    return Number.isFinite(months) && months >= 0 ? years + (months / 12) : years;
};

const posKey = (player) => String(player?.position || player?.originalPosition || player?.fp || '')
    .split(',')[0]
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const isBenchPos = (player) => /^sub\d+$/.test(String(player?.position || ''));

const classifyLine = (player) => {
    const key = posKey(player);
    if (!key) return 'MID';
    if (key === 'gk') return 'GK';
    if (key.startsWith('f')) return 'ATT';
    if (key.startsWith('m') || key.startsWith('om') || key.startsWith('am') || key.startsWith('dm') || key.includes('mc') || key.includes('ml') || key.includes('mr')) return 'MID';
    if (key.startsWith('d')) return 'DEF';
    return 'MID';
};

const normalizeForm = (form) => {
    let dots = [];
    if (Array.isArray(form)) {
        dots = form
            .map(item => String(item?.result || item || '').toLowerCase())
            .filter(result => result === 'w' || result === 'd' || result === 'l')
            .slice(0, 5);
    } else if (Array.isArray(form?.dots)) {
        dots = form.dots
            .map(item => String(item || '').toLowerCase())
            .filter(result => result === 'w' || result === 'd' || result === 'l')
            .slice(0, 5);
    }
    const pts = Number.isFinite(Number(form?.pts)) ? Number(form.pts) : dots.reduce((sum, item) => sum + (item === 'w' ? 3 : item === 'd' ? 1 : 0), 0);
    return { dots, pts };
};

const enrichTeam = (mData, side, team) => {
    const lineupSource = Array.isArray(team?.lineup)
        ? team.lineup
        : Object.values(mData?.lineup?.[side] || {});
    const lineup = lineupSource.filter(Boolean);
    const starting = Array.isArray(team?.starting) && team.starting.length
        ? team.starting
        : lineup.filter(player => !isBenchPos(player));
    const bench = lineup.filter(player => isBenchPos(player));
    const form = normalizeForm(team?.form);
    const computedAvgAge = avg(starting.map(playerAgeYears));
    const linePlayers = {
        GK: starting.filter(player => classifyLine(player) === 'GK'),
        DEF: starting.filter(player => classifyLine(player) === 'DEF'),
        MID: starting.filter(player => classifyLine(player) === 'MID'),
        ATT: starting.filter(player => classifyLine(player) === 'ATT'),
    };

    return {
        ...team,
        id: team?.id || mData?.club?.[side]?.id || mData?.teams?.[side]?.id,
        name: team?.name || team?.club_name || mData?.club?.[side]?.club_name || mData?.teams?.[side]?.club_name || mData?.teams?.[side]?.name || side,
        color: team?.color || mData?.teams?.[side]?.color || (side === 'home' ? 'var(--tmu-success)' : 'var(--tmu-info)'),
        lineup,
        starting,
        form,
        avgAge: computedAvgAge || (Number.isFinite(Number(team?.avgAge)) && Number(team.avgAge) >= 15 && Number(team.avgAge) <= 50 ? Number(team.avgAge) : 0),
        avgRtn: Number.isFinite(Number(team?.avgRtn)) ? Number(team.avgRtn) : avg(starting.map(player => player.routine)),
        avgR5: Number.isFinite(Number(team?.avgR5)) ? Number(team.avgR5) : avg(starting.map(player => player.r5)),
        subsR5: Number.isFinite(Number(team?.subsR5)) ? Number(team.subsR5) : avg(bench.map(player => player.r5)),
        formation: team?.formation || mData?.match_data?.formation?.[side] || '4-4-2',
        mentalityLabel: team?.mentalityLabel || TmConst.MENTALITY_MAP_LONG?.[team?.mentality] || '?',
        attackingStyleLabel: team?.attackingStyleLabel || TmConst.STYLE_MAP?.[team?.attackingStyle] || '?',
        focusSideLabel: team?.focusSideLabel || TmConst.FOCUS_MAP?.[team?.focusSide] || '?',
        GK: Number.isFinite(Number(team?.GK)) ? Number(team.GK) : avg(linePlayers.GK.map(player => player.r5)),
        DEF: Number.isFinite(Number(team?.DEF)) ? Number(team.DEF) : avg(linePlayers.DEF.map(player => player.r5)),
        MID: Number.isFinite(Number(team?.MID)) ? Number(team.MID) : avg(linePlayers.MID.map(player => player.r5)),
        ATT: Number.isFinite(Number(team?.ATT)) ? Number(team.ATT) : avg(linePlayers.ATT.map(player => player.r5)),
    };
};

export const TmMatchAnalysis = {
    render(body, mData, teams) {
        const md = mData.match_data;
        const safeTeams = {
            home: enrichTeam(mData, 'home', teams?.home || {}),
            away: enrichTeam(mData, 'away', teams?.away || {}),
        };
        const lines = ['GK', 'DEF', 'MID', 'ATT', 'ALL'];

        // Build HTML
        let html = '<div class="rnd-analysis-wrap">';

        // ── 1. FORM ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">📊</span> Form Guide</div>';
        html += '<div class="rnd-an-form-row">';
        // Home form
        html += '<div class="rnd-an-form-side home">';
        html += `<span class="rnd-an-form-label">${safeTeams.home.name.length > 12 ? safeTeams.home.name.substring(0, 12) + '…' : safeTeams.home.name}</span>`;
        html += '<div class="rnd-an-form-dots">';
        safeTeams.home.form.dots.forEach(r => {
            html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
        });
        html += `</div><span class="rnd-an-form-pts">${safeTeams.home.form.pts}</span>`;
        html += '</div>';
        // Away form
        html += '<div class="rnd-an-form-side away">';
        html += `<span class="rnd-an-form-label">${safeTeams.away.name.length > 12 ? safeTeams.away.name.substring(0, 12) + '…' : safeTeams.away.name}</span>`;
        html += '<div class="rnd-an-form-dots">';
        safeTeams.away.form.dots.forEach(r => {
            html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
        });
        html += `</div><span class="rnd-an-form-pts">${safeTeams.away.form.pts}</span>`;
        html += '</div>';
        html += '</div>';
        // Form comparison bar
        const totalFormPts = safeTeams.home.form.pts + safeTeams.away.form.pts || 1;
        html += '<div class="rnd-an-form-bar-wrap"><div class="rnd-an-form-bar">';
        html += `<div class="rnd-an-form-seg home" style="width:${Math.round(safeTeams.home.form.pts / totalFormPts * 100)}%"></div>`;
        html += `<div class="rnd-an-form-seg away" style="width:${Math.round(safeTeams.away.form.pts / totalFormPts * 100)}%"></div>`;
        html += '</div></div>';
        html += '</div>';

        // ── 2. SQUAD STRENGTH ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">💪</span> Squad Strength (R5)</div>';

        const lineLabels = { GK: 'Keeper', DEF: 'Defence', MID: 'Midfield', ATT: 'Attack', ALL: 'Overall' };
        lines.forEach(line => {
            const hR5 = line === 'ALL' ? safeTeams.home.avgR5 : safeTeams.home[line];
            const aR5 = line === 'ALL' ? safeTeams.away.avgR5 : safeTeams.away[line];
            const maxR5 = Math.max(hR5, aR5, 1);
            const hPct = Math.round(hR5 / maxR5 * 100);
            const aPct = Math.round(aR5 / maxR5 * 100);
            const hLead = hR5 > aR5 ? ' leading' : '';
            const aLead = aR5 > hR5 ? ' leading' : '';
            const isOverall = line === 'ALL';

            html += `<div class="rnd-an-strength-row"${isOverall ? ' style="padding:var(--tmu-space-sm) var(--tmu-space-xl);border-top:1px solid var(--tmu-border-soft-alpha)"' : ''}>`;
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
            const top5 = team.lineup
                .filter(p => !p.isSub)
                .sort((a, b) => (Number(b.r5) || 0) - (Number(a.r5) || 0))
                .slice(0, 5);
            html += `<div class="rnd-an-keys-side${side === 'away' ? ' away' : ''}">`;
            top5.forEach((p, i) => {
                const url = faceUrl(p, clr);
                html += `<div class="rnd-an-key-player">`;
                html += `<span class="rnd-an-key-rank">${i + 1}</span>`;
                if (url) html += `<div class="rnd-an-key-face" style="border-color:${team.color}"><img src="${url}" onerror="this.style.display='none'"></div>`;
                html += `<div class="rnd-an-key-info">
                    <div class="rnd-an-key-name">${p.name}</div>
                    <div class="rnd-an-key-meta">
                        ${p.fp} · ${p.age}y · Rtn ${p.routine}
                    </div>
                </div>
                <span class="rnd-an-key-r5" style="color:${getColor(p.r5, R5_THRESHOLDS)}">
                ${p.r5}
                </span>
                </div>`;
            });
            html += '</div>';
        }
        renderTopPlayers(safeTeams.home, 'home');
        renderTopPlayers(safeTeams.away, 'away');
        html += '</div></div>';

        // ── 4. SQUAD PROFILE ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">📋</span> Squad Profile</div>';
        html += '<div class="rnd-an-profile-grid">';
        const profileCards = [
            {
                icon: '🎂',
                label: 'Avg Age',
                homeValue: safeTeams.home.avgAge.toFixed(1),
                awayValue: safeTeams.away.avgAge.toFixed(1),
            },
            {
                icon: '📈',
                label: 'Avg Routine',
                homeValue: safeTeams.home.avgRtn.toFixed(1),
                awayValue: safeTeams.away.avgRtn.toFixed(1),
            },
            {
                icon: '⭐',
                label: 'Starting XI R5',
                homeValue: safeTeams.home.avgR5.toFixed(1),
                awayValue: safeTeams.away.avgR5.toFixed(1),
                homeColor: getColor(safeTeams.home.avgR5, R5_THRESHOLDS),
                awayColor: getColor(safeTeams.away.avgR5, R5_THRESHOLDS),
            },
            {
                icon: '🪑',
                label: 'Bench Avg R5',
                homeValue: safeTeams.home.subsR5.toFixed(1),
                awayValue: safeTeams.away.subsR5.toFixed(1),
                homeColor: getColor(safeTeams.home.subsR5, R5_THRESHOLDS),
                awayColor: getColor(safeTeams.away.subsR5, R5_THRESHOLDS),
            },
        ];
        html += profileCards.map(card => TmMatchAnalysisProfile.card(card)).join('');
        html += '</div></div>';

        // ── 5. TACTICAL MATCHUP ──
        html += '<div class="rnd-an-section">';
        html += '<div class="rnd-an-section-head"><span class="an-icon">⚔️</span> Tactical Matchup</div>';
        html += '<div class="rnd-an-tactics">';


        const generateTactics = (team, side) => {
            const formation = team.formation;
            const ment = team.mentalityLabel || team.mentality;
            const style = team.attackingStyleLabel || team.attackingStyle;
            const focus = team.focusSideLabel || team.focusSide;
            const tacticRows = [
                { icon: '📐', label: 'Formation', value: formation },
                { icon: '⚔️', label: 'Mentality', value: ment },
                { icon: '🎯', label: 'Style', value: style },
                { icon: '◎', label: 'Focus', value: focus },
            ];

            html += `<div class="rnd-an-tactic-side${side === 'away' ? ' away' : ''}">`;
            html += `<div class="rnd-an-tactic-team">${team.name}</div>`;
            html += tacticRows.map(row => TmMatchAnalysisTactic.row(row)).join('');
            html += '</div>';
        }

        generateTactics(safeTeams.home, 'home');
        generateTactics(safeTeams.away, 'away');
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
        const hR5Score = safeTeams.home.avgR5;
        const aR5Score = safeTeams.away.avgR5;

        // Form score (points / max possible)
        const hFormScore = safeTeams.home.form.dots.length ? safeTeams.home.form.pts / (safeTeams.home.form.dots.length * 3) : 0.5;
        const aFormScore = safeTeams.away.form.dots.length ? safeTeams.away.form.pts / (safeTeams.away.form.dots.length * 3) : 0.5;

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
        html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${safeTeams.home.id}_140.png" onerror="this.style.display='none'">`;
        html += `<div class="rnd-an-pred-name">${safeTeams.home.name}</div>`;
        html += `<div class="rnd-an-pred-pct home">${hWin}%</div>`;
        html += '<div class="rnd-an-pred-label">Win</div>';
        html += '</div>';
        html += '<div class="rnd-an-pred-draw">';
        html += `<div class="rnd-an-pred-pct draw">${draw}%</div>`;
        html += '<div class="rnd-an-pred-label">Draw</div>';
        html += '</div>';
        html += '<div class="rnd-an-pred-side">';
        html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${safeTeams.away.id}_140.png" onerror="this.style.display='none'">`;
        html += `<div class="rnd-an-pred-name">${safeTeams.away.name}</div>`;
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
