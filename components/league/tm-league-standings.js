// ==UserScript==
// @name         TM League Standings Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueStandings
 *
 * Handles standings: building from live DOM, parsing/fetching history, and rendering.
 * Reads and writes shared state via window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-standings-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-standings-style';
        _s.textContent = `
            .std-hover-opp td { background: #2e5c1a !important; outline: 1px solid #6cc040; }
            .std-hover-opp td:first-child { border-left: 3px solid #6cc040 !important; }
            #std-form-tooltip {
                position: fixed; z-index: 9999; pointer-events: none;
                background: #162e0e; border: 1px solid #3d6828;
                border-radius: 5px; padding: 6px 10px;
                font-size: 12px; color: #e8f5d8;
                box-shadow: 0 3px 10px rgba(0,0,0,0.5);
                white-space: nowrap; display: none;
            }
            #std-form-tooltip .sft-score { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
            #std-form-tooltip .sft-opp   { color: #90b878; font-size: 11px; }
            .tsa-standings-wrap { overflow: hidden; }
            .tsa-standings-page-ctrl {
                display: flex; align-items: center; justify-content: flex-end;
                gap: 6px; padding: 5px 10px 0;
            }
            .tsa-standings-page-ctrl span { font-size: 11px; color: #90b878; }
            .std-promo    { }
            .std-promo-po { }
            .std-rel-po   { }
            .std-rel      { }
            .std-me { background: rgba(108,192,64,0.10) !important; box-shadow: inset 3px 0 0 rgba(108,192,64,0.55); }
            .std-sep-green  td { border-bottom: 2px solid #4ade80 !important; }
            .std-sep-orange td { border-bottom: 2px solid #fb923c !important; }
            .std-sep-red    td { border-bottom: 2px solid #ef4444 !important; }
            .form-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 18px; height: 18px; border-radius: 3px;
                font-size: 10px; font-weight: 700; cursor: pointer;
                transition: opacity 0.15s; text-decoration: none;
            }
            .form-badge:hover { opacity: 0.75; }
            .form-w { background: #1d6b29; color: #fff; }
            .form-d { background: #b48127; color: #fff; }
            .form-l { background: #7f1d1d; color: #fff; }
            .form-u { background: #1e3a4c; color: #fff; }
            .tsa-std-controls {
                display: flex; align-items: center; justify-content: space-between;
                padding: 5px 10px; background: rgba(0,0,0,0.25);
                border-bottom: 1px solid rgba(61,104,40,0.3); flex-wrap: wrap; gap: 6px;
            }
            .tsa-std-ctrl-group { display: flex; align-items: center; gap: 3px; }
            .tsa-std-ctrl-label {
                font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
                color: #3d6828; margin-right: 4px; user-select: none;
            }
            .tsa-std-ctrl-btn {
                background: rgba(61,104,40,0.2); border: 1px solid rgba(61,104,40,0.35);
                color: #5a8a48; font-size: 10px; padding: 3px 8px; border-radius: 3px;
                cursor: pointer; transition: background 0.12s, color 0.12s, border-color 0.12s;
                font-family: inherit; line-height: 1.2;
            }
            .tsa-std-ctrl-btn:hover { background: rgba(61,104,40,0.4); color: #b8d8a0; border-color: rgba(61,104,40,0.6); }
            .tsa-std-ctrl-active {
                background: rgba(108,192,64,0.25) !important; color: #c8e0b4 !important;
                border-color: rgba(108,192,64,0.55) !important; font-weight: 600;
            }
        `;
        document.head.appendChild(_s);
    }

    const buildStandingsFromDOM = () => {
        const s = window.TmLeagueCtx;
        s.standingsRows = [];
        const myClubId = (() => {
            const hi = document.querySelector('#overall_table tr.highlighted_row_done td a[club_link]');
            return hi ? hi.getAttribute('club_link') : null;
        })();

        const formMap = {};
        const playedCountMap = {};
        if (s.fixturesCache) {
            const played = [], upcoming = [];
            Object.values(s.fixturesCache).forEach(month => {
                if (month?.matches) month.matches.forEach(m => {
                    if (m.result) played.push(m); else upcoming.push(m);
                });
            });
            played.sort((a, b) => new Date(a.date) - new Date(b.date));
            played.forEach(m => {
                const res = m.result;
                if (!res) return;
                const parts = res.split('-').map(Number);
                if (parts.length !== 2) return;
                const [hg, ag] = parts;
                const hid = String(m.hometeam), aid = String(m.awayteam);
                if (!formMap[hid]) { formMap[hid] = []; playedCountMap[hid] = 0; }
                if (!formMap[aid]) { formMap[aid] = []; playedCountMap[aid] = 0; }
                formMap[hid].push({ r: hg > ag ? 'W' : hg < ag ? 'L' : 'D', id: m.id, oppId: aid, score: `${hg}–${ag}`, home: true });
                formMap[aid].push({ r: ag > hg ? 'W' : ag < hg ? 'L' : 'D', id: m.id, oppId: hid, score: `${ag}–${hg}`, home: false });
                playedCountMap[hid]++;
                playedCountMap[aid]++;
            });
            upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            upcoming.forEach(m => {
                const hid = String(m.hometeam), aid = String(m.awayteam);
                if (!formMap[hid]) { formMap[hid] = []; playedCountMap[hid] = 0; }
                if (!formMap[aid]) { formMap[aid] = []; playedCountMap[aid] = 0; }
                formMap[hid].push({ r: '?', id: m.id, oppId: aid, score: '', home: true });
                formMap[aid].push({ r: '?', id: m.id, oppId: hid, score: '', home: false });
            });
        }

        $('#overall_table tbody tr').each(function () {
            const $tr = $(this);
            const cls = ($tr.attr('class') || '').trim();
            const $a = $tr.find('td a[club_link]').first();
            if (!$a.length) return;
            const clubId = $a.attr('club_link');
            const clubName = $a.text().trim();
            const tds = $tr.find('td');
            const rank = parseInt($(tds[0]).text().trim()) || 0;
            const gp = parseInt($(tds[2]).text().trim()) || 0;
            const w = parseInt($(tds[3]).text().trim()) || 0;
            const d = parseInt($(tds[4]).text().trim()) || 0;
            const l = parseInt($(tds[5]).text().trim()) || 0;
            const gf = parseInt($(tds[6]).text().trim()) || 0;
            const ga = parseInt($(tds[7]).text().trim()) || 0;
            const pts = parseInt($(tds[8]).text().trim()) || 0;
            const isMe = cls.includes('highlighted_row_done') || clubId === myClubId;
            let zone = '';
            if (cls.includes('promotion_playoff')) zone = 'promo-po';
            else if (cls.includes('promotion')) zone = 'promo';
            else if (cls.includes('relegation_playoff')) zone = 'rel-po';
            else if (cls.includes('relegation')) zone = 'rel';
            s.standingsRows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe, form: formMap[clubId] || [], playedCount: playedCountMap[clubId] || 0 });
            if (rank && zone) s.liveZoneMap[rank] = zone;
        });
    };

    const parseHistoryStandings = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const table = doc.querySelector('table.border_bottom');
        if (!table) return [];
        const myClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null;
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
            const a = tr.querySelector('td a[club_link]');
            if (!a) return;
            const tds = tr.querySelectorAll('td');
            const cls = tr.className || '';
            const rank = parseInt(tds[0]?.textContent.trim()) || 0;
            const clubId = a.getAttribute('club_link');
            const clubName = a.textContent.trim();
            const gp = parseInt(tds[2]?.textContent.trim()) || 0;
            const w = parseInt(tds[3]?.textContent.trim()) || 0;
            const d = parseInt(tds[4]?.textContent.trim()) || 0;
            const l = parseInt(tds[5]?.textContent.trim()) || 0;
            const goalParts = (tds[6]?.textContent.trim() || '0-0').split('-');
            const gf = parseInt(goalParts[0]) || 0;
            const ga = parseInt(goalParts[1]) || 0;
            const pts = parseInt(tds[7]?.textContent.trim()) || 0;
            let zone = '';
            if (cls.includes('promotion_playoff')) zone = 'promo-po';
            else if (cls.includes('promotion')) zone = 'promo';
            else if (cls.includes('relegation_playoff')) zone = 'rel-po';
            else if (cls.includes('relegation')) zone = 'rel';
            const isMe = cls.includes('highlighted_row_done') || (myClubId && clubId === myClubId);
            rows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe: !!isMe, form: [], playedCount: 0 });
        });
        return rows;
    };

    const fetchHistoryStandings = (season) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-standings-content');
        if (!container) return;
        container.innerHTML = `<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading Season ${season}…</div>`;
        window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/standings/${season}/`)
            .then(r => r.text())
            .then(html => {
                const rows = parseHistoryStandings(html);
                if (!rows.length) {
                    container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data for Season ${season}</div>`;
                    return;
                }
                rows.forEach(r => { if (!r.zone && s.liveZoneMap[r.rank]) r.zone = s.liveZoneMap[r.rank]; });
                s.displayedSeason = season;
                s.standingsRows = rows;
                s.formOffset = 0;
                window.TmLeagueStandings.renderLeagueTable();
            })
            .catch(() => {
                container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load Season ${season}</div>`;
            });
    };

    const renderLeagueTable = () => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-standings-content');
        if (!container || !s.standingsRows.length) return;

        const liveSeasonVal = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        const isHistory = s.displayedSeason !== null && s.displayedSeason !== liveSeasonVal;
        const historyBanner = isHistory
            ? `<div class="tsa-history-banner">📅 Season ${s.displayedSeason} <button class="tsa-history-live-btn" id="tsa-history-live-btn">↩ Back to live</button></div>`
            : '';

        const isFiltered = !isHistory && (s.stdVenue !== 'total' || s.stdFormN > 0);
        const rows = isFiltered ? (() => {
            const mapped = s.standingsRows.map(r => {
                const played = r.form.filter(f => f.r !== '?');
                const veued = s.stdVenue === 'home' ? played.filter(f => f.home)
                    : s.stdVenue === 'away' ? played.filter(f => !f.home)
                        : played;
                const sliced = s.stdFormN > 0 ? veued.slice(-s.stdFormN) : veued;
                let w = 0, d = 0, l = 0, gf = 0, ga = 0;
                sliced.forEach(f => {
                    if (f.r === 'W') w++;
                    else if (f.r === 'D') d++;
                    else if (f.r === 'L') l++;
                    if (f.score) {
                        const p = f.score.split(/[\u2013\-]/);
                        if (p.length === 2) { gf += parseInt(p[0], 10) || 0; ga += parseInt(p[1], 10) || 0; }
                    }
                });
                return { ...r, gp: sliced.length, w, d, l, gf, ga, pts: w * 3 + d };
            });
            mapped.sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
            mapped.forEach((r, i) => { r.rank = i + 1; });
            return mapped;
        })() : s.standingsRows;

        const venueBtns = ['total', 'home', 'away'].map(v =>
            `<button class="tsa-std-ctrl-btn${s.stdVenue === v ? ' tsa-std-ctrl-active' : ''}" data-std-venue="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`
        ).join('');
        const nBtns = [0, 5, 10, 15, 20, 25, 30].map(n =>
            `<button class="tsa-std-ctrl-btn${s.stdFormN === n ? ' tsa-std-ctrl-active' : ''}" data-std-n="${n}">${n === 0 ? 'All' : n}</button>`
        ).join('');
        const controlsHtml = isHistory ? '' : `
            <div class="tsa-std-controls">
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">View</span>${venueBtns}</div>
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">Form</span>${nBtns}</div>
            </div>`;

        const zoneColor = zone => {
            if (zone === 'promo') return '#4ade80';
            if (zone === 'promo-po') return '#fbbf24';
            if (zone === 'rel-po') return '#fb923c';
            if (zone === 'rel') return '#ef4444';
            return null;
        };
        const zoneBg = zone => {
            if (zone === 'promo') return 'rgba(74,222,128,0.18)';
            if (zone === 'promo-po') return 'rgba(251,191,36,0.18)';
            if (zone === 'rel-po') return 'rgba(251,146,60,0.18)';
            if (zone === 'rel') return 'rgba(239,68,68,0.18)';
            return 'transparent';
        };

        const maxPlayedLen = Math.max(0, ...rows.map(r => r.playedCount));
        const maxUpcomingLen = Math.max(0, ...rows.map(r => r.form.length - r.playedCount));
        const canOlder = maxPlayedLen + 1 - s.formOffset > 6;
        const canNewer = s.formOffset > 1 - maxUpcomingLen;

        const formHtml = (form, playedCount) => {
            let slice;
            if (s.stdVenue !== 'total') {
                const isHome = s.stdVenue === 'home';
                const filtered = form.filter(f => f.r !== '?' && (isHome ? f.home : !f.home));
                slice = filtered.slice(-6);
            } else {
                const windowEnd = Math.min(form.length, Math.max(0, playedCount + 1 - s.formOffset));
                const windowStart = Math.max(0, windowEnd - 6);
                slice = form.slice(windowStart, windowEnd);
            }
            if (!slice.length) return '<span style="color:#5a7a48;font-size:10px;">—</span>';
            return slice.map(f => {
                const cls = f.r === 'W' ? 'form-w' : f.r === 'D' ? 'form-d' : f.r === 'L' ? 'form-l' : 'form-u';
                const oppName = (s.standingsRows.find(sr => sr.clubId === f.oppId) || {}).clubName || f.oppId;
                return `<a class="form-badge ${cls}" href="/matches/${f.id}/" target="_blank"
                    data-opp="${f.oppId}" data-score="${f.score || ''}" data-opp-name="${oppName}"
                    data-venue="${f.home ? 'H' : 'A'}">${f.r}</a>`;
            }).join(' ');
        };

        let html = `${historyBanner}${controlsHtml}<table class="tsa-table" style="width:100%">
            <tr>
                <th class="tsa-left" style="width:24px">#</th>
                <th class="tsa-left">Club</th>
                <th title="Games played">Gp</th>
                <th title="Won">W</th>
                <th title="Drawn">D</th>
                <th title="Lost">L</th>
                <th title="Goals for">GF</th>
                <th title="Goals against">GA</th>
                <th title="Points">Pts</th>
                ${isHistory ? '' : `<th class="tsa-right" style="padding-left:6px;white-space:nowrap">
                    <button class="tsa-btn" id="std-form-older" style="padding:0 5px;font-size:14px;line-height:16px;margin-right:4px" ${canOlder ? '' : 'disabled'}>&#8249;</button>
                    Form
                    <button class="tsa-btn" id="std-form-newer" style="padding:0 5px;font-size:14px;line-height:16px;margin-left:4px" ${canNewer ? '' : 'disabled'}>&#8250;</button>
                </th>`}
            </tr>`;

        rows.forEach((r, i) => {
            const effectiveZone = isFiltered ? (s.liveZoneMap[r.rank] || '') : r.zone;
            const nextZone = isFiltered ? (s.liveZoneMap[rows[i + 1]?.rank] || null) : (rows[i + 1]?.zone ?? null);
            const sepClass = isFiltered ? '' : (() => {
                if (r.zone === nextZone || nextZone === null) return '';
                if (nextZone === 'rel') return ' std-sep-red';
                if (nextZone === 'rel-po') return ' std-sep-orange';
                if (r.zone === 'promo' || r.zone === 'promo-po') return ' std-sep-green';
                return '';
            })();
            const rowClass = (i % 2 === 0 ? 'tsa-even' : 'tsa-odd') + (r.isMe ? ' std-me' : '') + sepClass;
            html += `<tr class="${rowClass}" data-club="${r.clubId}">
                <td class="tsa-left tsa-rank" style="background:${zoneBg(effectiveZone)};color:${zoneColor(effectiveZone) || '#6a9a58'};font-weight:700;padding-top:8px;padding-bottom:8px">${r.rank}</td>
                <td class="tsa-left" style="color:#f4f8f0;font-weight:500;white-space:nowrap;padding-top:8px;padding-bottom:8px">
                    <img src="/pics/club_logos/${r.clubId}_25.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;flex-shrink:0" onerror="this.style.visibility='hidden'">
                    <a href="/club/${r.clubId}/" style="color:inherit;text-decoration:none">${r.clubName}</a>
                </td>
                <td>${r.gp}</td>
                <td style="color:#4ade80;font-weight:700">${r.w}</td>
                <td style="color:#fde68a">${r.d}</td>
                <td style="color:#fca5a5">${r.l}</td>
                <td>${r.gf}</td>
                <td>${r.ga}</td>
                <td style="font-weight:700;color:#e8f5d8">${r.pts}</td>
                ${isHistory ? '' : `<td class="tsa-right" style="padding-left:6px">${formHtml(r.form, r.playedCount)}</td>`}
            </tr>`;
        });

        html += '</table>';
        container.innerHTML = html;

        container.querySelectorAll('[data-std-venue]').forEach(btn => {
            btn.addEventListener('click', () => { s.stdVenue = btn.dataset.stdVenue; renderLeagueTable(); });
        });
        container.querySelectorAll('[data-std-n]').forEach(btn => {
            btn.addEventListener('click', () => { s.stdFormN = parseInt(btn.dataset.stdN, 10); renderLeagueTable(); });
        });

        document.getElementById('tsa-history-live-btn')?.addEventListener('click', () => {
            s.displayedSeason = null;
            s.historyFixturesData = null;
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip) chip.textContent = `Season ${liveSeasonVal}`;
            const ssnList = document.getElementById('tsa-ssnpick-list');
            ssnList?.querySelectorAll('.tsa-ssnpick-item').forEach(el =>
                el.classList.toggle('tsa-ssnpick-active', parseInt(el.dataset.s) === liveSeasonVal));
            s.standingsRows = [];
            s.formOffset = 0;
            buildStandingsFromDOM();
            renderLeagueTable();
            const fixCont = document.getElementById('tsa-fixtures-content');
            if (fixCont && fixCont.style.display !== 'none' && s.fixturesCache)
                window.TmLeagueFixtures.renderFixturesTab(s.fixturesCache);
        });

        let tooltip = document.getElementById('std-form-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'std-form-tooltip';
            document.body.appendChild(tooltip);
        }

        container.querySelectorAll('.form-badge[data-opp]').forEach(badge => {
            badge.addEventListener('mouseenter', e => {
                const oppId = badge.dataset.opp;
                container.querySelectorAll('tr[data-club]').forEach(tr => {
                    tr.classList.toggle('std-hover-opp', tr.dataset.club === oppId);
                });
                const score = badge.dataset.score;
                const oppName = badge.dataset.oppName;
                const venue = badge.dataset.venue;
                const venueLabel = venue === 'H' ? '<span style="color:#90b878">(H)</span>' : '<span style="color:#90b878">(A)</span>';
                tooltip.innerHTML = `<div class="sft-score">${score} ${venueLabel}</div><div class="sft-opp">vs ${oppName}</div>`;
                tooltip.style.left = (e.clientX + 14) + 'px';
                tooltip.style.top = (e.clientY - 10) + 'px';
                tooltip.style.display = 'block';
            });
            badge.addEventListener('mousemove', e => {
                tooltip.style.left = (e.clientX + 14) + 'px';
                tooltip.style.top = (e.clientY - 10) + 'px';
            });
            badge.addEventListener('mouseleave', () => {
                container.querySelectorAll('tr[data-club].std-hover-opp').forEach(tr => tr.classList.remove('std-hover-opp'));
                tooltip.style.display = 'none';
            });
        });

        document.getElementById('std-form-older')?.addEventListener('click', () => { s.formOffset += 6; renderLeagueTable(); });
        document.getElementById('std-form-newer')?.addEventListener('click', () => { s.formOffset -= 6; renderLeagueTable(); });
    };

    window.TmLeagueStandings = { buildStandingsFromDOM, parseHistoryStandings, fetchHistoryStandings, renderLeagueTable };
})();
