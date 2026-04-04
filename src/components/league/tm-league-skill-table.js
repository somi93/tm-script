/**
 * TmLeagueSkillTable
 *
 * Renders per-club average skill summary (REC / R5 / Age) and logs detailed
 * player-level data to the console.
 *
 * Reads from window.TmLeagueCtx:
 *   skillData, skillSortCol, skillSortAsc  (r/w)
 *   clubMap, clubDatas, clubPlayersMap     (r)
 *   SKILL_NAMES_FIELD, SKILL_NAMES_GK     (r)
 *   REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS (r)
 *   getColor, sortData                    (r)
 */

const STAT_COLS = [
    { key: 'REC', label: 'REC' },
    { key: 'R5',  label: 'R5'  },
    { key: 'Age', label: 'Age' },
];

    const renderSkillTable = () => {
        const s = window.TmLeagueCtx;
        const { skillData, skillSortCol, skillSortAsc, REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS, getColor } = s;
        const thresholds = { REC: REC_THRESHOLDS, R5: R5_THRESHOLDS, Age: AGE_THRESHOLDS };
        const decimals   = { REC: 2, R5: 2, Age: 1 };

        const arrow = (key) => key === skillSortCol ? (skillSortAsc ? ' ▲' : ' ▼') : '';

        const headerHtml = `
            <div class="tsa-skill-head">
                <span class="tsa-skill-rank">#</span>
                <span class="tsa-skill-club">Club</span>
                ${STAT_COLS.map(c => `<span class="tsa-skill-val tsa-skill-sortable${c.key === skillSortCol ? ' tsa-skill-sorted' : ''}" data-key="${c.key}">${c.label}${arrow(c.key)}</span>`).join('')}
            </div>`;

        const rowsHtml = skillData.map((row, i) => `
            <div class="tsa-skill-row">
                <span class="tsa-skill-rank">${i + 1}</span>
                <span class="tsa-skill-club">${row.name}</span>
                ${STAT_COLS.map(c => `<span class="tsa-skill-val" style="color:${getColor(row[c.key], thresholds[c.key])};font-weight:700">${row[c.key].toFixed(decimals[c.key])}</span>`).join('')}
            </div>`).join('');

        const container = document.getElementById('tsa-content');
        if (!container) return;
        container.innerHTML = `<div class="tsa-skill-list">${headerHtml}${rowsHtml}</div>`;

        container.querySelector('.tsa-skill-list').addEventListener('click', e => {
            const col = e.target.closest('[data-key]');
            if (!col) return;
            const key = col.dataset.key;
            if (key === s.skillSortCol) {
                s.skillSortAsc = !s.skillSortAsc;
            } else {
                s.skillSortCol = key;
                s.skillSortAsc = false;
            }
            s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
            renderSkillTable();
        });
    };

    const showSkill = () => {
        const s = window.TmLeagueCtx;
        s.skillData = [];
        console.log('%c[Squad Analysis] ═══ Per-Club Player Ratings ═══', 'font-weight:bold;color:var(--tmu-success)');

        s.clubMap.forEach((name, id) => {
            if (!s.clubDatas.has(id)) {
                s.skillData.push({ name, REC: 0, R5: 0, Age: 0 });
                return;
            }
            const entries = s.clubDatas.get(id);
            let avgREC = 0, avgR5 = 0, avgAge = 0;
            entries.forEach(cd => {
                avgREC += cd.REC / 11;
                avgR5  += cd.R5  / 11;
                avgAge += cd.Age / 11 / 12;
            });
            const n = entries.length;
            const teamREC = avgREC / n;
            const teamR5  = avgR5  / n;
            const teamAge = avgAge / n;
            s.skillData.push({ name, REC: teamREC, R5: teamR5, Age: teamAge });
        });

        s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
        renderSkillTable();
    };

    export const TmLeagueSkillTable = { showSkill };
