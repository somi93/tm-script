import { TmMatchModel } from '../models/match.js';
import { TmMatchService } from '../services/match.js';
import { TmClubService } from '../services/club.js';
import { TmMatchHeader } from '../components/match-new/tm-match-header.js';
import { scoreAt } from '../components/match-new/tm-match-header.js';
import { TmMatchFeed } from '../components/match-new/tm-match-feed.js';
import { TmMatchStats, deriveStats } from '../components/match-new/tm-match-stats.js';
import { TmUnityPlayer } from '../components/match-new/tm-unity-player.js';
import { TmReplayController } from '../components/match-new/tm-replay-controller.js';
import { TmMatchLineup } from '../components/match-new/tm-match-lineup.js';
import { MENTALITY_MAP_LONG } from '../constants/match.js';

// ── Overlay shell styles ──────────────────────────────────────────────────────

const SHELL_STYLE_ID = 'mp-shell-style';

const injectShellStyles = () => {
    if (document.getElementById(SHELL_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = SHELL_STYLE_ID;
    s.textContent = `
        .mp-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: var(--tmu-surface-overlay-strong);
            z-index: 10000; display: flex; align-items: flex-start; justify-content: center;
        }
        .mp-dialog {
            background: var(--tmu-surface-panel);
            width: 100vw; height: 100vh;
            display: flex; flex-direction: column; overflow: hidden;
        }
        .mp-body { flex: 1; display: flex; flex-direction: row; overflow: hidden; min-height: 0; padding: 8px; gap: 8px; }
        .mp-center { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; padding: 0 16px; }
    `;
    document.head.appendChild(s);
};

// ── Player ────────────────────────────────────────────────────────────────────

const openPlayer = async (matchId) => {
    const match = await TmMatchModel.fetchMatchWithProfiles(matchId);
    if (!match || match.status === 'future') return;

    const initialMode = match.status === 'live' ? 'all' : 'key';

    const { schedule } = TmMatchService.buildSchedule(match.plays);
    const playMinutes = Object.keys(match.plays).map(Number).sort((a, b) => a - b);
    const maximumMinute = playMinutes.length ? playMinutes[playMinutes.length - 1] : 90;

    // ── Components ────────────────────────────────────────────────────
    const header = TmMatchHeader.create({
        homeName: match.home.club.name || 'Home',
        awayName: match.away.club.name || 'Away',
        homeId: match.home.club.id,
        awayId: match.away.club.id,
        match,
        initialMode,
        onToggle: () => ctrl.toggle(),
        onSkip: () => ctrl.skip(),
        onClose: () => close(),
        onModeChange: (mode) => { feed.clear(); ctrl.setMode(mode); },
    });

    const feed = TmMatchFeed.create();
    const stats = TmMatchStats.create(match);
    const lineup = TmMatchLineup.create(match);

    const unity = TmUnityPlayer.create({
        onReady: () => ctrl.play(),
        onClipStart: (clipIndex) => ctrl.onClipStart(clipIndex),
        onClipEnd: (clipIndex) => ctrl.onClipEnd(clipIndex),
        onMinuteDone: () => ctrl.onUnityMinuteDone(),
        onCanvasClick: () => ctrl.toggle(),
        getHUD: () => {
            const s = ctrl.getState();
            const { h, a } = scoreAt(match, s.currentMinute, s.committedActionIndex);
            return {
                homeName: match.home.club.name || 'Home',
                awayName: match.away.club.name || 'Away',
                homeScore: h, awayScore: a,
                minute: s.currentMinute, seconds: s.seconds,
            };
        },
        getStats: () => deriveStats(match, ctrl.getState()),
    });

    // ── Replay controller ─────────────────────────────────────────────
    const allPlayers = [...match.home.lineup, ...match.away.lineup];
    let prevH = 0, prevA = 0;
    let prevEventClipIndex = -1, prevEventMinute = -1;

    const playerName = (pid) => {
        const p = allPlayers.find(p => String(p.id) === String(pid));
        return (p?.name || '?').toUpperCase();
    };

    // ── Pre-fetch season goal tally for all players in this match ─────────
    // Fetches fixtures for both clubs, scans each completed past match report,
    // and stores player.seasonGoals (goals scored before this match) on each
    // allPlayers entry.  Fire-and-forget — checkGoal reads the value if ready.
    (async () => {
        try {
            const matchId = String(match.id);
            const [homeFixtures, awayFixtures] = await Promise.all([
                TmClubService.fetchClubFixtures(match.home.club.id),
                TmClubService.fetchClubFixtures(match.away.club.id),
            ]);

            const numericMatchId = Number(matchId);
            const seenIds = new Set();
            const pastMatchIds = [];
            for (const fixtures of [homeFixtures, awayFixtures]) {
                if (!fixtures) continue;
                Object.values(fixtures).forEach(month => {
                    (month.matches || []).forEach(m => {
                        const id = String(m.id || '');
                        if (!id) return;
                        if (Number(id) >= numericMatchId) return;
                        if (!m.result || m.result === 'x-x') return;
                        if (!seenIds.has(id)) { seenIds.add(id); pastMatchIds.push(id); }
                    });
                });
            }

            const goalCounts = {};
            const matchCounts = {};
            await Promise.all(pastMatchIds.map(async (id) => {
                try {
                    const mData = await TmMatchService.fetchMatchLite(id);
                    if (!mData?.report) return;
                    // Count appearances
                    (mData.allPlayers || []).forEach(p => {
                        const pid = String(p.id || p.player_id || '');
                        if (pid) matchCounts[pid] = (matchCounts[pid] || 0) + 1;
                    });
                    // Count goals
                    Object.values(mData.report).forEach(evts => {
                        evts.forEach(evt => {
                            if (evt.goal) {
                                const pid = String(evt.goal.player || '');
                                if (pid) goalCounts[pid] = (goalCounts[pid] || 0) + 1;
                            }
                        });
                    });
                } catch (_) { /* skip failed fetches */ }
            }));

            allPlayers.forEach(p => {
                p.seasonGoals = goalCounts[String(p.id)] || 0;
                p.seasonMatches = matchCounts[String(p.id)] || 0;
            });
        } catch (_) { /* silently fail */ }
    })();

    const checkEvents = (replayState) => {
        const { currentMinute, committedClipIndex } = replayState;
        if (committedClipIndex < 0 || committedClipIndex >= 999) return;
        if (currentMinute !== prevEventMinute) { prevEventClipIndex = -1; prevEventMinute = currentMinute; }
        if (committedClipIndex === prevEventClipIndex) return;
        prevEventClipIndex = committedClipIndex;

        const plays = match.plays[String(currentMinute)] || [];
        let flat = [];
        for (const play of plays) for (const clip of play.clips) flat.push(clip);
        const clip = flat[committedClipIndex];
        if (!clip) return;

        for (const act of (clip.actions || [])) {
            const pid = String(act.by || '');
            if (act.action === 'yellow') {
                unity.showEventBanner({ type: 'yellow', name: playerName(pid) });
            } else if (act.action === 'yellowRed') {
                unity.showEventBanner({ type: 'yellowRed', name: playerName(pid) });
            } else if (act.action === 'red') {
                unity.showEventBanner({ type: 'red', name: playerName(pid) });
            } else if (act.action === 'injury') {
                unity.showEventBanner({ type: 'injury', name: playerName(pid) });
            } else if (act.action === 'subIn') {
                const outAct = clip.actions.find(a => a.action === 'subOut');
                unity.showEventBanner({
                    type: 'sub',
                    nameIn:  playerName(pid),
                    nameOut: playerName(outAct?.by || ''),
                });
            } else if (act.action === 'mentality_change') {
                const isHome = String(act.team) === String(match.home.club.id);
                const club = isHome ? match.home.club : match.away.club;
                const teamName = (club.name || '?').toUpperCase();
                const mentalityName = MENTALITY_MAP_LONG[act.mentality] || String(act.mentality);
                unity.showEventBanner({ type: 'tactic', name: mentalityName, teamName });
            }
        }
    };

    const checkGoal = (replayState) => {
        const { h, a } = scoreAt(match, replayState.currentMinute, replayState.committedActionIndex);
        if (h === prevH && a === prevA) return;
        const newGoals = (h - prevH) + (a - prevA);
        if (newGoals === 1) {
            const report = match.report[String(replayState.currentMinute)] || [];
            const evt = report[replayState.committedActionIndex];
            if (evt?.goal) {
                const scorerPid = String(evt.goal.player);
                const assistPid = evt.goal.assist ? String(evt.goal.assist) : null;
                const scorer = allPlayers.find(p => String(p.id) === scorerPid);
                const assist = assistPid ? allPlayers.find(p => String(p.id) === assistPid) : null;
                const isHome = match.home.playerIds?.has(scorerPid);
                const isOwnGoal = (isHome && a > prevA) || (!isHome && h > prevH);
                unity.showGoalBanner({
                    scorerName: (scorer?.name || '').toUpperCase(),
                    assistName: assist ? (assist.name || '').toUpperCase() : null,
                    isOwnGoal,
                    h, a,
                    homeName: match.home.club.name,
                    awayName: match.away.club.name,
                });
                // Count scorer's goals in this match up to current replay point
                let matchGoals = 0;
                for (const [minStr, evts] of Object.entries(match.report)) {
                    const min = Number(minStr);
                    if (min > replayState.currentMinute) continue;
                    evts.forEach((evtR, idx) => {
                        if (min === replayState.currentMinute && idx > replayState.committedActionIndex) return;
                        if (evtR.goal && String(evtR.goal.player) === scorerPid) matchGoals++;
                    });
                }
                // Show season stats if pre-fetch has completed
                if (scorer?.seasonGoals !== undefined) {
                    unity.updateGoalBannerStats({
                        goals: scorer.seasonGoals + matchGoals,
                        games: scorer.seasonMatches + 1,
                    });
                }
            }
        }
        prevH = h; prevA = a;
    };

    const ctrl = TmReplayController.create({
        match, maximumMinute, schedule, unity,
        initialMode,
        onTick: (replayState) => {
            unity.updateHUD(); header.update(match, replayState, maximumMinute);
            lineup.update(replayState);
            checkGoal(replayState);
            checkEvents(replayState);
        },
        onMinuteAdvanced: (replayState) => { unity.updateHUD(); header.update(match, replayState, maximumMinute); },
        onEnded: (replayState) => {
            unity.updateHUD(); header.update(match, replayState, maximumMinute);
            lineup.update(replayState);
            checkGoal(replayState);
            checkEvents(replayState);
        },
    });

    // ── Assemble overlay ──────────────────────────────────────────────
    injectShellStyles();
    document.getElementById('mp-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mp-overlay';
    overlay.className = 'mp-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'mp-dialog';

    const body = document.createElement('div');
    body.className = 'mp-body';

    const center = document.createElement('div');
    center.className = 'mp-center';
    center.appendChild(unity.el);

    body.appendChild(lineup.homePanel.el);
    body.appendChild(center);
    body.appendChild(lineup.awayPanel.el);

    dialog.appendChild(header.el);
    dialog.appendChild(body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    unity.init();

    let canvasRO = null; // kept for close() compatibility

    // ── Close + keyboard ──────────────────────────────────────────────
    const close = () => {
        canvasRO?.disconnect();
        ctrl.destroy();
        unity.saveCanvas();
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        document.body.style.overflow = '';
    };

    const onKey = (e) => {
        if (e.key === 'Escape') close();
        if (e.key === ' ') { e.preventDefault(); ctrl.toggle(); }
    };
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Initial render, then auto-start if Unity won't fire onReady
    header.update(match, ctrl.getState(), maximumMinute);
    setTimeout(() => {
        if (!unity.isAvailable()) ctrl.play();
    }, 800);
};

// ── Page entry point ──────────────────────────────────────────────────────────

export function initMatchPage(main) {
    if (!main || !main.isConnected) return;

    const pathMatch = window.location.pathname.match(/\/matches\/(\d+)/);
    if (pathMatch) {
        openPlayer(pathMatch[1]);
        return;
    }

    document.addEventListener('click', (e) => {
        const trigger =
            e.target.closest('[data-matchid]') ||
            e.target.closest('[data-id].rnd-h2h-match') ||
            e.target.closest('a[href*="/matches/"]');
        if (!trigger) return;

        let matchId = trigger.dataset.matchid || trigger.dataset.id;
        if (!matchId && trigger.href) {
            const m = trigger.href.match(/\/matches\/(\d+)/);
            if (m) matchId = m[1];
        }
        if (!matchId) return;
        e.preventDefault();
        openPlayer(matchId);
    });
}
