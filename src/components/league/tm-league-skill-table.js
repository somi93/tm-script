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

import { TmTable } from '../shared/tm-table.js';

    const renderSkillTable = () => {
        const s = window.TmLeagueCtx;
        const { skillData, skillSortCol, skillSortAsc, REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS, getColor } = s;

        const table = TmTable.table({
            cls: ' tsa-table',
            items: skillData,
            sortKey: skillSortCol,
            sortDir: skillSortAsc ? 1 : -1,
            prependIndex: {
                label: '#',
                align: 'l',
                cls: 'tsa-rank',
                thCls: 'tsa-left',
                width: '32px',
            },
            headers: [
                { key: 'name', label: 'Club', thCls: 'tsa-left', cls: 'tsa-club' },
                {
                    key: 'REC',
                    label: 'REC',
                    align: 'r',
                    render: (value) => `<span style="color:${getColor(value, REC_THRESHOLDS)};font-weight:700">${value.toFixed(2)}</span>`,
                },
                {
                    key: 'R5',
                    label: 'R5',
                    align: 'r',
                    render: (value) => `<span style="color:${getColor(value, R5_THRESHOLDS)};font-weight:700">${value.toFixed(2)}</span>`,
                },
                {
                    key: 'Age',
                    label: 'Age',
                    align: 'r',
                    render: (value) => `<span style="color:${getColor(value, AGE_THRESHOLDS)};font-weight:700">${value.toFixed(1)}</span>`,
                },
            ],
            afterRender: ({ sortKey, sortDir }) => {
                s.skillSortCol = sortKey;
                s.skillSortAsc = sortDir > 0;
            },
        });

        $('#tsa-content').empty().append(table);
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
