import { TmMatchModel } from '../models/match.js';
import { TmMatchService } from '../services/match.js';
import { TmMatchHeader } from '../components/match-new/tm-match-header.js';
import { scoreAt } from '../components/match-new/tm-match-header.js';
import { TmMatchFeed } from '../components/match-new/tm-match-feed.js';
import { TmMatchStats, deriveStats } from '../components/match-new/tm-match-stats.js';
import { TmUnityPlayer } from '../components/match-new/tm-unity-player.js';
import { TmReplayController } from '../components/match-new/tm-replay-controller.js';
import { TmMatchLineup } from '../components/match-new/tm-match-lineup.js';

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
        .mp-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
        .mp-player {
            display: flex; align-items: stretch; justify-content: center;
            width: 100%; flex: 1; min-height: 0;
        }
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
    const ctrl = TmReplayController.create({
        match, maximumMinute, schedule, unity,
        initialMode,
        onTick: (replayState) => {
            feed.sync(match, replayState.currentMinute, replayState.currentActionIndex, replayState.currentActionLineIndex);
            stats.update(replayState); unity.updateHUD(); header.update(match, replayState, maximumMinute);
            lineup.update(replayState);
        },
        onMinuteAdvanced: (replayState) => { stats.update(replayState); unity.updateHUD(); header.update(match, replayState, maximumMinute); },
        onEnded: (replayState) => {
            feed.sync(match, replayState.currentMinute, replayState.currentActionIndex, replayState.currentActionLineIndex);
            stats.update(replayState); unity.updateHUD(); header.update(match, replayState, maximumMinute);
            lineup.update(replayState);
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

    const player = document.createElement('div');
    player.className = 'mp-player';
    player.appendChild(feed.el);
    player.appendChild(unity.el);
    player.appendChild(stats.el);

    body.appendChild(player);
    body.appendChild(lineup.el);

    dialog.appendChild(header.el);
    dialog.appendChild(body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    unity.init();

    // ── Canvas height sync ────────────────────────────────────────────
    // Feed and stats are capped to canvas height via --mp-canvas-h.
    // ResizeObserver fires on canvas resize (window resize, first paint).
    const viewport = document.getElementById('mp-viewport');
    let canvasRO = null;
    if (viewport) {
        canvasRO = new ResizeObserver(() => {
            body.style.setProperty('--mp-canvas-h', viewport.offsetHeight + 'px');
        });
        canvasRO.observe(viewport);
    }

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
