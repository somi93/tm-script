import { TmUI } from '../shared/tm-ui.js';
import { TmTable } from '../shared/tm-table.js';

const htmlOf = node => node?.outerHTML || '';
const buttonHtml = opts => htmlOf(TmUI.button(opts));

export const TmImportRoutinePanel = {
    create({ allZero = [], bigJumps = [], badPids = [], onFix } = {}) {
        const root = document.createElement('div');

        let html = '<div id="tmi-routine-panel" class="tmi-routine-panel"><div class="tmi-wrap"><div class="tmi-wrap-head"><h2>Routine Issues</h2>' +
            buttonHtml({ id: 'tmi-fix-routine-btn', label: `Fix Routine (${badPids.length})`, color: 'primary', size: 'xs' }) +
            '</div><div class="tmi-wrap-body">';

        if (allZero.length > 0) {
            html += `<div class="tmi-routine-cat">Routine = 0 but has games <span>${allZero.length}</span></div>`;
            html += '<div data-role="routine-zero-table"></div>';
        }

        if (bigJumps.length > 0) {
            html += `<div class="tmi-routine-cat">Routine jump &gt; 3 <span>${bigJumps.length}</span></div>`;
            html += '<div data-role="routine-jump-table"></div>';
        }

        html += '</div></div></div>';
        root.innerHTML = html;

        root.addEventListener('click', (event) => {
            if (typeof onFix !== 'function' || !event.target.closest('#tmi-fix-routine-btn')) return;
            onFix(badPids);
        });

        const zeroTableWrap = root.querySelector('[data-role="routine-zero-table"]');
        if (zeroTableWrap) {
            zeroTableWrap.appendChild(TmTable.table({
                cls: 'tmi-db-table',
                items: allZero,
                headers: [
                    { key: 'name', label: 'Name', sortable: false, render: (_, player) => `<a href="https://trophymanager.com/players/${player.pid}/" target="_blank">${player.name}</a>` },
                    { key: 'records', label: 'Records', align: 'c', sortable: false },
                    { key: 'games', label: 'Games', align: 'c', sortable: false },
                ],
            }));
        }

        const jumpRows = bigJumps.flatMap(player => player.jumps.map((jump, index) => ({
            pid: player.pid,
            name: player.name,
            showName: index === 0,
            age: `${jump.from} → ${jump.to}`,
            from: jump.prevR,
            to: jump.currR,
            diff: jump.diff,
        })));
        const jumpTableWrap = root.querySelector('[data-role="routine-jump-table"]');
        if (jumpTableWrap) {
            jumpTableWrap.appendChild(TmTable.table({
                cls: 'tmi-db-table',
                items: jumpRows,
                headers: [
                    { key: 'name', label: 'Name', sortable: false, render: (_, row) => row.showName ? `<a href="https://trophymanager.com/players/${row.pid}/" target="_blank">${row.name}</a>` : '' },
                    { key: 'age', label: 'Age', sortable: false },
                    { key: 'from', label: 'From', align: 'r', sortable: false },
                    { key: 'to', label: 'To', align: 'r', sortable: false },
                    { key: 'diff', label: 'Δ', align: 'r', sortable: false, render: (value) => `<span style="color:var(--tmu-warning);font-weight:700">${value}</span>` },
                ],
            }));
        }

        return root.firstElementChild;
    },
};