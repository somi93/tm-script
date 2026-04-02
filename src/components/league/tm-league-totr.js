/**
 * TmLeagueTOTR
 *
 * Handles Team of the Round: parsing, fetching and rendering.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

import { TmButton } from '../shared/tm-button.js';
import { TmUI } from '../shared/tm-ui.js';

    if (!document.getElementById('tsa-league-totr-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-totr-style';
        _s.textContent = `
            .totr-nav {
                display: flex; align-items: center; justify-content: space-between;
                padding: var(--tmu-space-sm) var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-input-overlay);
            }
            .totr-round-label { font-size: 12px; font-weight: 700; color: var(--tmu-text-main); letter-spacing: 0.3px; }
            .totr-pitch {
                position: relative;
                background: linear-gradient(180deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid #4a9030; overflow: hidden;
            }
            .totr-pitch-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
            .totr-pitch-grid {
                position: relative; z-index: 1; display: grid;
                grid-template-columns: repeat(5, 20%);
                grid-template-rows: repeat(9, 11.11%);
                width: 100%; aspect-ratio: 68 / 75;
            }
            .totr-gk-row { position: absolute; bottom: 3%; left: 0; width: 100%; z-index: 2; }
            .totr-gk-cell { position: absolute; transform: translateX(-50%); bottom: 0; display: flex; flex-direction: column; align-items: center; }
            .totr-gk-info { display: flex; flex-direction: column; align-items: center; margin-bottom: var(--tmu-space-xs); pointer-events: auto; }
            .totr-gk-face {
                width: 95%; max-width: 68px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                border: 2px solid var(--tmu-border-soft-alpha-mid);
                box-shadow: 0 2px 8px var(--tmu-shadow-panel); background: var(--tmu-surface-panel);
            }
            .totr-gk-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .totr-pitch-cell { position: relative; overflow: visible; }
            .totr-pitch-face {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 95%; max-width: 68px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                border: 2px solid var(--tmu-border-soft-alpha-mid);
                box-shadow: 0 2px 8px var(--tmu-shadow-panel); z-index: 2; background: var(--tmu-surface-panel);
            }
            .totr-pitch-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .totr-pitch-info {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, 0); margin-top: 42%;
                display: flex; flex-direction: column; align-items: center;
                z-index: 3; pointer-events: none;
            }
            .totr-pitch-label {
                font-size: 9px; color: var(--tmu-text-inverse); pointer-events: auto;
                text-shadow: 0 1px 3px var(--tmu-shadow-panel);
                white-space: nowrap; text-align: center;
                font-weight: 700; line-height: 1.2; text-decoration: none;
            }
            .totr-pitch-label:hover { color: var(--tmu-text-main); }
            .totr-pitch-club {
                font-size: 8px; color: var(--tmu-text-muted); pointer-events: auto;
                text-shadow: 0 1px 2px var(--tmu-shadow-panel);
                white-space: nowrap; text-align: center;
                font-weight: 500; line-height: 1.2; text-decoration: none;
            }
            .totr-pitch-club:hover { color: var(--tmu-text-main); }
            .totr-pitch-rating { font-size: 9px; font-weight: 700; padding: 0 var(--tmu-space-xs); border-radius: var(--tmu-space-xs); background: var(--tmu-surface-overlay-strong); line-height: 1.3; }
            .totr-pitch-events { display: flex; gap: 0; font-size: 8px; justify-content: center; }
        `;
        document.head.appendChild(_s);
    }

    const TOTR_THRESHOLDS = [5.5, 6, 6.5, 7, 7.5, 8, 8.5];
    
    const parseTOTRHtml = (htmlText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const rounds = [...doc.querySelectorAll('#date_sel option')].map(opt => ({
            value: opt.value,
            text: opt.textContent.trim(),
            selected: opt.selected
        }));
        const lines = [...doc.querySelectorAll('.field_line')].map(line => {
            const lineName = [...line.classList].find(c => c !== 'field_line') || '';
            const players = [...line.querySelectorAll('.player')].map(p => {
                const playerLink = p.querySelector('a[player_link]');
                const ratingEl = p.querySelector('span[tooltip="Rating"]');
                const goals = p.querySelectorAll('img[src*="ball.gif"]').length;
                const clubLink = p.querySelector('a[club_link]');
                const photoImg = p.querySelector('div[style*="100px"] img');
                return {
                    playerId: playerLink?.getAttribute('player_link') || '',
                    name: playerLink?.textContent.trim() || '',
                    playerHref: playerLink?.getAttribute('href') || '',
                    photo: photoImg?.getAttribute('src') || '',
                    rating: parseFloat(ratingEl?.textContent) || 0,
                    goals,
                    clubName: clubLink?.textContent.trim() || '',
                    clubId: clubLink?.getAttribute('club_link') || ''
                };
            });
            return { lineName, players };
        });
        return { rounds, lines };
    };

    const renderTOTR = (data) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-totr-content');
        if (!container) return;
        const currentIdx = data.rounds.findIndex(r => r.value === s.totrCurrentDate);
        const canPrev = currentIdx > 0;
        const canNext = currentIdx < data.rounds.length - 1;
        const currentRound = data.rounds[currentIdx] || {};

        const navHtml = `<div class="totr-nav">
            ${TmButton.button({ id: 'totr-prev', cls: 'text-lg px-3 py-0', label: '←', color: 'secondary', size: 'xs', type: 'button', disabled: !canPrev }).outerHTML}
            <span class="totr-round-label">${currentRound.text || '—'}</span>
            ${TmButton.button({ id: 'totr-next', cls: 'text-lg px-3 py-0', label: '→', color: 'secondary', size: 'xs', type: 'button', disabled: !canNext }).outerHTML}
        </div>`;

        const lw = 0.4, clr = 'rgba(255,255,255,0.22)', clr2 = 'rgba(255,255,255,0.3)';
        const pitchSVG = `<svg class="totr-pitch-lines" viewBox="0 0 100 110" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="110" fill="none" stroke="${clr}" stroke-width="0.5"/>
            <line x1="0" y1="55" x2="100" y2="55" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="55" r="9.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="55" r="1.2" fill="${clr2}"/>
            <rect x="20.5" y="0" width="59" height="17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="36.5" y="0" width="27" height="6" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="11.7" r="1.2" fill="${clr2}"/>
            <path d="M 40 17.5 A 9.5 9.5 0 0 0 60 17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="20.5" y="92.5" width="59" height="17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="36.5" y="104" width="27" height="6" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="98.3" r="1.2" fill="${clr2}"/>
            <path d="M 40 92.5 A 9.5 9.5 0 0 1 60 92.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 1.5 A 1.5 1.5 0 0 1 1.5 0" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 98.5 0 A 1.5 1.5 0 0 1 100 1.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 108.5 A 1.5 1.5 0 0 0 1.5 110" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 98.5 110 A 1.5 1.5 0 0 0 100 108.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
        </svg>`;

        const lineRowMap = { forwards: 2, midfield: 5, defense: 8 };
        const spreadCols = n => {
            if (n === 1) return [3];
            if (n === 2) return [2, 4];
            if (n === 3) return [1, 3, 5];
            if (n === 4) return [1, 2, 4, 5];
            return [1, 2, 3, 4, 5];
        };

        const byLine = {};
        data.lines.forEach(l => { byLine[l.lineName] = l.players; });

        const cellMap = {};
        Object.entries(lineRowMap).forEach(([lineName, row]) => {
            const players = byLine[lineName] || [];
            const cols = spreadCols(players.length);
            players.forEach((p, i) => {
                const ratingColor = s.getColor(p.rating, TOTR_THRESHOLDS);
                const goalsHtml = p.goals > 0
                    ? `<div class="totr-pitch-events">${'⚽'.repeat(Math.min(p.goals, 4))}${p.goals > 4 ? `×${p.goals}` : ''}</div>`
                    : '';
                cellMap[`${row}-${cols[i]}`] =
                    `<div class="totr-pitch-face"><img src="${p.photo}" alt="" onerror="this.style.opacity=0"></div>` +
                    `<div class="totr-pitch-info">` +
                    `<a href="${p.playerHref}" class="totr-pitch-label">${p.name.split(' ').slice(-1)[0]}</a>` +
                    `<div class="totr-pitch-rating" style="color:${ratingColor}">${p.rating.toFixed(1)}</div>` +
                    (p.clubName ? `<a href="/club/${p.clubId}/" class="totr-pitch-club">${p.clubName}</a>` : '') +
                    goalsHtml +
                    `</div>`;
            });
        });

        let gridHTML = '';
        for (let r = 1; r <= 9; r++) {
            for (let c = 1; c <= 5; c++) {
                gridHTML += `<div class="totr-pitch-cell">${cellMap[`${r}-${c}`] || ''}</div>`;
            }
        }

        const gkPlayers = byLine['goalkeeper'] || [];
        const gkCols = spreadCols(gkPlayers.length);
        let gkOverlay = '';
        gkPlayers.forEach((p, i) => {
            const ratingColor = s.getColor(p.rating, TOTR_THRESHOLDS);
            const goalsHtml = p.goals > 0
                ? `<div class="totr-pitch-events">${'⚽'.repeat(Math.min(p.goals, 4))}${p.goals > 4 ? `×${p.goals}` : ''}</div>`
                : '';
            const colPct = (gkCols[i] - 1) * 20 + 10;
            gkOverlay +=
                `<div class="totr-gk-cell" style="left:${colPct}%">` +
                `<div class="totr-gk-info">` +
                `<a href="${p.playerHref}" class="totr-pitch-label">${p.name.split(' ').slice(-1)[0]}</a>` +
                `<div class="totr-pitch-rating" style="color:${ratingColor}">${p.rating.toFixed(1)}</div>` +
                (p.clubName ? `<a href="/club/${p.clubId}/" class="totr-pitch-club">${p.clubName}</a>` : '') +
                goalsHtml +
                `</div>` +
                `<div class="totr-gk-face"><img src="${p.photo}" alt="" onerror="this.style.opacity=0"></div>` +
                `</div>`;
        });

        container.innerHTML = navHtml +
            `<div class="totr-pitch">${pitchSVG}<div class="totr-pitch-grid">${gridHTML}</div>` +
            (gkOverlay ? `<div class="totr-gk-row">${gkOverlay}</div>` : '') +
            `</div>`;

        container.onclick = (event) => {
            if (event.target.closest('#totr-prev')) {
                if (currentIdx > 0) fetchAndRenderTOTR(data.rounds[currentIdx - 1].value);
                return;
            }
            if (event.target.closest('#totr-next')) {
                if (currentIdx < data.rounds.length - 1) fetchAndRenderTOTR(data.rounds[currentIdx + 1].value);
            }
        };
    };

    const fetchAndRenderTOTR = (date) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-totr-content');
        if (!container) return;
        if (s.totrCache[date]) { s.totrCurrentDate = date; renderTOTR(s.totrCache[date]); return; }
        container.innerHTML = TmUI.loading('Loading team of the round...');
        const url = `/league/team-of-the-round/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/${date}/`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) return;
            if (this.status !== 200) { container.innerHTML = TmUI.error('Failed to load team of the round.'); return; }
            const data = parseTOTRHtml(this.responseText);
            s.totrCache[date] = data;
            s.totrCurrentDate = date;
            renderTOTR(data);
        };
        xhr.send();
    };

    export const TmLeagueTOTR = { fetchAndRenderTOTR };
