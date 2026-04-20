/**
 * tm-match-report.js — Report tab for new match player.
 * Same UI as old TmMatchReport but uses the new normalized match model:
 *   match.plays[minStr]  — array of play objects
 *   play.clips[].actions — per-clip action list with `by` (player ID)
 *   match.home/away.lineup — for player name resolution
 *   scoreAt(match, min, evtIdx) — cumulative score at a given event
 */

import { TmBadge }  from '../shared/tm-badge.js';
import { scoreAt }  from './tm-match-header.js';

// ── Style injection ───────────────────────────────────────────────────────────

const REPORT_STYLE_ID = 'mp-report-style';
const ensureReportStyles = () => {
    if (document.getElementById(REPORT_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = REPORT_STYLE_ID;
    s.textContent = `
        .rnd-report-wrap { max-width: 900px; margin: 0 auto; }

        /* ── Accordion rows ── */
        .rnd-acc { border-bottom: 1px solid var(--tmu-border-soft); }
        .rnd-acc:last-child { border-bottom: none; }
        .rnd-acc-head {
            display: flex; align-items: center;
            padding: 6px 0; min-height: 32px; cursor: pointer;
            transition: background 0.15s;
        }
        .rnd-acc-head:hover { background: var(--tmu-border-contrast); }
        .rnd-acc-goal { background: var(--tmu-success-fill-faint); }
        .rnd-acc-home {
            flex: 1; text-align: right; padding-right: 12px;
            color: var(--tmu-text-strong); font-size: var(--tmu-font-sm);
        }
        .rnd-acc-min {
            width: 44px; text-align: center; flex-shrink: 0;
            color: var(--tmu-text-panel-label); font-weight: 700; font-size: var(--tmu-font-sm);
            background: var(--tmu-accent-fill); border-radius: 3px;
        }
        .rnd-acc-away {
            flex: 1; text-align: left; padding-left: 12px;
            color: var(--tmu-text-strong); font-size: var(--tmu-font-sm);
        }
        .rnd-acc-body {
            display: none; padding: 6px 12px 10px;
            background: var(--tmu-surface-overlay-soft); border-radius: 0 0 4px 4px;
        }
        .rnd-acc.open .rnd-acc-body { display: block; }
        .rnd-acc-chevron {
            width: 14px; height: 14px; flex-shrink: 0;
            fill: var(--tmu-text-dim); transition: transform 0.2s;
            margin: 0 4px;
        }
        .rnd-acc.open .rnd-acc-chevron { transform: rotate(90deg); }

        /* ── Report text body ── */
        .rnd-report-text {
            color: var(--tmu-text-main); font-size: var(--tmu-font-sm); line-height: 1.6;
        }
        .rnd-report-text .rnd-goal-text   { color: var(--tmu-text-live); font-weight: 700; }
        .rnd-report-text .rnd-yellow-text  { color: var(--tmu-text-highlight); }
        .rnd-report-text .rnd-red-text     { color: var(--tmu-danger); font-weight: 700; }
        .rnd-report-text .rnd-sub-text     { color: var(--tmu-text-preview); }
        .rnd-report-text .rnd-player-name  { color: var(--tmu-text-strong); font-weight: 600; }
    `;
    document.head.appendChild(s);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (opts, tone) => TmBadge.badge({ size: 'md', shape: 'rounded', weight: 'bold', ...opts }, tone);

const CHEVRON = '<svg class="rnd-acc-chevron" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';

const buildPlayHtml = (play, min, match, nameMap) => {
    const acts = play.clips.flatMap(c => c.actions || []);
    const isHome = String(play.team) === String(match.home.club.id);

    // ── Header badges ─────────────────────────────────────────────────────────
    let headerBadges = '';
    let hasEvents = false;
    let hasGoal = false;

    const goalAct = acts.find(a => a.action === 'shot' && a.goal);
    if (goalAct) {
        hasEvents = true;
        hasGoal = true;
        const { h, a: as } = scoreAt(match, min, play.reportEventIndex);
        const assistAct = acts.find(a => a.action === 'assist');
        let b = `⚽ ${nameMap[String(goalAct.by)] || '?'} (${h}-${as})`;
        if (assistAct) {
            b += ` <span style="font-size:var(--tmu-font-xs);color:var(--tmu-text-panel-label)">ast. ${nameMap[String(assistAct.by)] || '?'}</span>`;
        }
        headerBadges += badge({ slot: b }, 'success');
    }

    const yellowAct = acts.find(a => a.action === 'yellow');
    if (yellowAct) {
        hasEvents = true;
        headerBadges += badge({ icon: '🟨', label: nameMap[String(yellowAct.by)] || '?' }, 'highlight');
    }
    const yellowRedAct = acts.find(a => a.action === 'yellowRed');
    if (yellowRedAct) {
        hasEvents = true;
        headerBadges += badge({ icon: '🟥🟨', label: nameMap[String(yellowRedAct.by)] || '?' }, 'danger');
    }
    const redAct = acts.find(a => a.action === 'red');
    if (redAct) {
        hasEvents = true;
        headerBadges += badge({ icon: '🟥', label: nameMap[String(redAct.by)] || '?' }, 'danger');
    }
    const injAct = acts.find(a => a.action === 'injury');
    if (injAct) {
        hasEvents = true;
        headerBadges += badge({
            icon: '<span style="color:var(--tmu-danger);font-weight:800">✚</span>',
            label: nameMap[String(injAct.by)] || '?',
        }, 'warn');
    }
    const subIns  = acts.filter(a => a.action === 'subIn');
    const subOuts = acts.filter(a => a.action === 'subOut');
    subIns.forEach((subIn, i) => {
        hasEvents = true;
        const subOut = subOuts[i];
        const inName  = nameMap[String(subIn.by)]  || '?';
        const outName = subOut ? (nameMap[String(subOut.by)] || '?') : '?';
        headerBadges += badge({ icon: '🔄', label: `↑${inName} ↓${outName}` }, 'info');
    });

    // ── Text lines ────────────────────────────────────────────────────────────
    const lines = play.clips.flatMap(c =>
        (c.text || [])
            .filter(l => l && l.trim())
            .map(l => l
                .replace(/\[goal\]/g,   '<span class="rnd-goal-text">⚽ </span>')
                .replace(/\[yellow\]/g, '<span class="rnd-yellow-text">🟨 </span>')
                .replace(/\[red\]/g,    '<span class="rnd-red-text">🟥 </span>')
                .replace(/\[sub\]/g,    '<span class="rnd-sub-text">🔄 </span>')
                .replace(/\[assist\]/g, '')
            )
    );

    const goalCls      = hasGoal ? ' rnd-acc-goal' : '';
    const headerContent = hasEvents
        ? headerBadges
        : `<span style="color:var(--tmu-text-panel-label);font-size:var(--tmu-font-sm)">${lines[0] || ''}</span>`;

    let html = `<div class="rnd-acc" data-acc="${min}-${play.reportEventIndex}">`;
    html += `<div class="rnd-acc-head${goalCls}">`;
    html += `<div class="rnd-acc-home">${isHome ? headerContent : ''}</div>`;
    html += `<div class="rnd-acc-min">${min}'</div>`;
    html += `<div class="rnd-acc-away">${!isHome ? headerContent : ''}</div>`;
    html += CHEVRON;
    html += '</div>';
    html += `<div class="rnd-acc-body"><div class="rnd-report-text">${lines.join('<br>')}</div></div>`;
    html += '</div>';
    return html;
};

// ── Public API ────────────────────────────────────────────────────────────────

export const TmMatchReportNew = {
    /**
     * @param {object} match  — normalized match
     * @param {object|null} state — replayState snapshot; null = show all
     * @returns {{ el: HTMLElement, update(state): void }}
     */
    create(match, state = null) {
        ensureReportStyles();

        const nameMap = {};
        [...match.home.lineup, ...match.away.lineup].forEach(p => {
            nameMap[String(p.id)] = p.name || '?';
        });

        const sortedMins = Object.keys(match.plays).map(Number).sort((a, b) => a - b);

        const el = document.createElement('div');
        el.className = 'rnd-report-wrap';
        el.addEventListener('click', e => {
            const head = e.target.closest('.rnd-acc-head');
            if (head) head.closest('.rnd-acc')?.classList.toggle('open');
        });

        // Track the last rendered watermark (exclusive)
        let lastMin = -1;
        let lastIdx = -1;

        const appendRange = (toMin, toIdx) => {
            sortedMins.forEach(min => {
                if (min < lastMin) return;
                if (toMin !== Infinity && min > toMin) return;
                (match.plays[String(min)] || []).forEach(play => {
                    const ei = play.reportEventIndex;
                    if (min === lastMin && ei <= lastIdx) return; // already rendered
                    if (toIdx !== Infinity && min === toMin && ei > toIdx) return; // not yet
                    const tmp = document.createElement('div');
                    tmp.innerHTML = buildPlayHtml(play, min, match, nameMap);
                    const node = tmp.firstChild;
                    if (node) el.appendChild(node);
                });
            });
            lastMin = toMin;
            lastIdx = toIdx;
        };

        // Initial render up to the given state position
        const initMin = (!state || state.ended) ? Infinity : state.currentMinute;
        const initIdx = (!state || state.ended) ? Infinity : state.committedActionIndex;
        appendRange(initMin, initIdx);

        const update = (newState) => {
            if (!newState) return;
            const newMin = newState.ended ? Infinity : newState.currentMinute;
            const newIdx = newState.ended ? Infinity : newState.committedActionIndex;
            if (newMin === lastMin && newIdx === lastIdx) return;
            appendRange(newMin, newIdx);
        };

        return { el, update };
    },
};
