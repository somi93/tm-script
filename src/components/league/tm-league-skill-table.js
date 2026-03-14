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

    const renderSkillTable = () => {
        const s = window.TmLeagueCtx;
        const { skillData, skillSortCol, skillSortAsc, REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS, getColor } = s;

        const arrow  = col => col !== skillSortCol ? '' : (skillSortAsc ? ' ▲' : ' ▼');
        const active = col => col === skillSortCol ? ' tsa-active' : '';

        let html = `<table class="tsa-table">
            <tr>
                <th class="tsa-left${active('#')}">#</th>
                <th class="tsa-left${active('name')}" data-sort-skill="name">Club${arrow('name')}</th>
                <th class="${active('REC')}" data-sort-skill="REC">REC${arrow('REC')}</th>
                <th class="${active('R5')}" data-sort-skill="R5">R5${arrow('R5')}</th>
                <th class="${active('Age')}" data-sort-skill="Age">Age${arrow('Age')}</th>
            </tr>`;

        skillData.forEach((row, idx) => {
            html += `<tr class="${idx % 2 === 0 ? 'tsa-even' : 'tsa-odd'}">
                <td class="tsa-left tsa-rank">${idx + 1}</td>
                <td class="tsa-left tsa-club">${row.name}</td>
                <td style="color:${getColor(row.REC, REC_THRESHOLDS)};font-weight:700">${row.REC.toFixed(2)}</td>
                <td style="color:${getColor(row.R5,  R5_THRESHOLDS)};font-weight:700">${row.R5.toFixed(2)}</td>
                <td style="color:${getColor(row.Age, AGE_THRESHOLDS)};font-weight:700">${row.Age.toFixed(1)}</td>
            </tr>`;
        });

        html += '</table>';
        $('#tsa-content').html(html);

        $('[data-sort-skill]').on('click', function () {
            const col = $(this).attr('data-sort-skill');
            if (col === s.skillSortCol) s.skillSortAsc = !s.skillSortAsc;
            else { s.skillSortCol = col; s.skillSortAsc = col === 'name'; }
            s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
            renderSkillTable();
        });
    };

    const showSkill = () => {
        const s = window.TmLeagueCtx;
        s.skillData = [];
        console.log('%c[Squad Analysis] ═══ Per-Club Player Ratings ═══', 'font-weight:bold;color:#6cc040');

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

    export const TmLeagueSkillTable = { renderSkillTable, showSkill };
