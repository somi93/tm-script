/**
 * tm-squad.js — Squad page utilities for TrophyManager userscripts
 *
 * Usage (via Tampermonkey @require):
 *   // @require  file://H:/projects/Moji/tmscripts/lib/tm-squad.js
 *
 * Exposed as: window.TmSquad
 *
 * API:
 *   TmSquad.extractSkills(skillsArr, isGK)   → number[]  (tooltip format)
 *   TmSquad.extractSkillsFromPost(p)          → { isGK, skills, labels }  (API post format)
 *   TmSquad.parseSquadHash()                 → { a: boolean, b: boolean }
 *   TmSquad.ensureAllPlayersVisible()        → Promise<void>
 *   TmSquad.createSquadLoader()              → { update, done, error }
 *   TmSquad.parseSquadPage()                 → player[] | undefined
 */

(function () {
    'use strict';

    const { SKILL_LABELS_OUT, SKILL_NAMES_GK_SHORT, SKILL_NAMES_OUT, SKILL_NAMES_GK } = window.TmConst;

    /**
     * Extract a flat integer skill array from the tooltip skills object array.
     * Tooltip provides skills as [{ name: "Strength", value: "15" }, ...].
     * @param {Array<{name: string, value: string|number}>} skillsArr
     * @param {boolean} isGK
     * @returns {number[]}
     */
    const extractSkills = (skillsArr, isGK) => {
        const names = isGK ? SKILL_NAMES_GK : SKILL_NAMES_OUT;
        return names.map(name => {
            const sk = skillsArr.find(s => s.name === name);
            if (!sk) return 0;
            const v = sk.value;
            if (typeof v === 'string') {
                if (v.includes('star_silver')) return 19;
                if (v.includes('star')) return 20;
                return parseInt(v) || 0;
            }
            return parseInt(v) || 0;
        });
    };

    /**
     * Parse URL hash squad visibility flags.
     * Hash format: #/a/{true|false}/b/{true|false}/
     * @returns {{ a: boolean, b: boolean }}
     */
    const parseSquadHash = () => {
        const h = location.hash || '';
        const aMatch = h.match(/\/a\/(true|false)/i);
        const bMatch = h.match(/\/b\/(true|false)/i);
        return {
            a: aMatch ? aMatch[1] === 'true' : true,
            b: bMatch ? bMatch[1] === 'true' : false
        };
    };

    /**
     * Ensure both the main squad (A) and reserves (B) are visible on /players/.
     * Sets the hash to #/a/true/b/true/ and clicks toggle buttons as a fallback.
     * @returns {Promise<void>}
     */
    const ensureAllPlayersVisible = () => new Promise((resolve) => {
        const sqDiv = document.getElementById('sq');
        if (!sqDiv) { resolve(); return; }

        const vis = parseSquadHash();
        if (vis.a && vis.b) { resolve(); return; }

        const onHashChange = () => {
            window.removeEventListener('hashchange', onHashChange);
            setTimeout(resolve, 500);
        };
        window.addEventListener('hashchange', onHashChange);
        location.hash = '#/a/true/b/true/';

        setTimeout(() => {
            window.removeEventListener('hashchange', onHashChange);
            if (!vis.a) { const btn = document.getElementById('toggle_a_team'); if (btn) btn.click(); }
            if (!vis.b) { const btn = document.getElementById('toggle_b_team'); if (btn) btn.click(); }
            setTimeout(resolve, 500);
        }, 1500);
    });

    /**
     * Create a fixed top-of-page progress bar overlay for squad sync operations.
     * Delegates to TmUI.progressBar({ title, inline: false }).
     * @returns {{ update(current, total, name): void, done(count): void, error(msg): void }}
     */
    const createSquadLoader = () => {
        const bar = window.TmUI.progressBar({ title: '⚡ Squad Sync' });
        return {
            update(current, total, name) {
                bar.update(current, total, `${current}/${total} — ${name}`);
            },
            done(count) {
                bar.done(`✓ ${count} players processed`);
            },
            error(msg) {
                bar.error(msg);
            },
        };
    };

    /**
     * Parse all player rows from the #sq squad table on /players/.
     * Detects GK section via .splitter rows; reads skills, improvements, TI.
     * @returns {Array<object>|undefined}
     */
    const parseSquadPage = () => {
        const sqDiv = document.getElementById('sq');
        if (!sqDiv) { console.warn('[Squad] No #sq div found'); return; }

        const allRows = sqDiv.querySelectorAll('table tbody tr');
        if (!allRows.length) { console.warn('[Squad] No player rows found'); return; }

        let isGKSection = false;
        const players = [];

        allRows.forEach((row) => {
            if (row.classList.contains('splitter')) { isGKSection = true; return; }
            if (row.classList.contains('header')) return;

            const cells = row.querySelectorAll('td');
            if (cells.length < 10) return;

            const link = row.querySelector('a[player_link]');
            if (!link) return;
            const pid  = link.getAttribute('player_link');
            const name = link.textContent.trim();

            const numEl  = cells[0]?.querySelector('span.faux_link');
            const number = numEl ? parseInt(numEl.textContent) || 0 : 0;

            const ageText = cells[2]?.textContent?.trim() || '0.0';
            const [ageYears, ageMonths] = ageText.split('.').map(s => parseInt(s) || 0);

            const posEl  = cells[3]?.querySelector('.favposition');
            const posText = posEl ? posEl.textContent.trim() : '';

            const skillCount    = isGKSection ? 11 : 14;
            const skillStartIdx = 4;
            const skills  = [];
            const improved = [];

            for (let i = 0; i < skillCount; i++) {
                const cell = cells[skillStartIdx + i];
                if (!cell) { skills.push(0); continue; }

                const innerDiv = cell.querySelector('div.skill');
                if (!innerDiv) { skills.push(0); continue; }

                const hasPartUp = innerDiv.classList.contains('part_up');
                const hasOneUp  = innerDiv.classList.contains('one_up');

                const starImg = innerDiv.querySelector('img');
                let skillVal = 0;
                if (starImg) {
                    const src = starImg.getAttribute('src') || '';
                    if (src.includes('star_silver')) skillVal = 19;
                    else if (src.includes('star')) skillVal = 20;
                } else {
                    skillVal = parseInt(innerDiv.textContent.trim()) || 0;
                }

                skills.push(skillVal);
                if (hasPartUp) improved.push({ index: i, type: 'part_up', skillName: isGKSection ? SKILL_NAMES_GK_SHORT[i] : SKILL_LABELS_OUT[i] });
                else if (hasOneUp) improved.push({ index: i, type: 'one_up', skillName: isGKSection ? SKILL_NAMES_GK_SHORT[i] : SKILL_LABELS_OUT[i] });
            }

            const tiIdx       = skillStartIdx + skillCount + (isGKSection ? 3 : 0);
            const TI          = parseInt(cells[tiIdx]?.textContent?.trim()) || 0;
            const TI_change   = parseInt((cells[tiIdx + 1]?.textContent?.trim() || '0').replace('+', '')) || 0;

            const partUpCount = improved.filter(x => x.type === 'part_up').length;
            const oneUpCount  = improved.filter(x => x.type === 'one_up').length;

            players.push({
                pid, name, number, ageYears, ageMonths,
                position: posText, isGK: isGKSection,
                skills, improved, partUpCount, oneUpCount,
                totalImproved: partUpCount + oneUpCount,
                TI, TI_change,
                totalSkill: skills.reduce((s, v) => s + v, 0)
            });
        });

        return players;
    };

    // Skill field names from players_get_select API in TmLib.mapPlayer weight order
    const POST_FIELDS_OUT = ['strength', 'stamina', 'pace', 'marking', 'tackling', 'workrate',
        'positioning', 'passing', 'crossing', 'technique', 'heading', 'finishing', 'longshots', 'setpieces'];
    const POST_LABELS_OUT = ['Str', 'Sta', 'Pac', 'Mar', 'Tac', 'Wor', 'Pos', 'Pas', 'Cro', 'Tec', 'Hea', 'Fin', 'Lon', 'Set'];
    const POST_FIELDS_GK  = ['strength', 'pace', 'jumping', 'stamina', 'oneonones', 'reflexes',
        'arialability', 'communication', 'kicking', 'throwing', 'handling'];
    const POST_LABELS_GK  = ['Str', 'Pac', 'Jum', 'Sta', 'One', 'Ref', 'Aer', 'Com', 'Kic', 'Thr', 'Han'];

    /**
     * Extract skills from a squad API player (players_get_select).
     * Skills are ordered to match TmLib.mapPlayer weight arrays.
     * @param {object} p - squad player (raw or normalized)
     * @returns {{ isGK: boolean, skills: number[], labels: string[] }}
     */
    const extractSkillsFromPost = p => {
        const isGK = parseInt(p.handling) > 0;
        const fields = isGK ? POST_FIELDS_GK : POST_FIELDS_OUT;
        const labels = isGK ? POST_LABELS_GK : POST_LABELS_OUT;
        return { isGK, skills: fields.map(f => parseInt(p[f]) || 0), labels };
    };

    window.TmSquad = {
        extractSkills,
        extractSkillsFromPost,
        parseSquadHash,
        ensureAllPlayersVisible,
        createSquadLoader,
        parseSquadPage,
    };

})();
