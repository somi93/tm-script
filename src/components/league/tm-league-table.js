import { TmTable } from '../shared/tm-table.js';

const sortableValue = (row, sortIndex) => row?._sortVals?.[sortIndex];

const compareValues = (leftValue, rightValue) => {
    const leftNumber = Number.parseFloat(leftValue);
    const rightNumber = Number.parseFloat(rightValue);

    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return leftNumber - rightNumber;
    }

    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
};

export const TmLeagueTable = {
    mountSortable(wrap, { headerRows = [], getRows, renderRows, defaultAsc = (sortIndex) => sortIndex === 1 || sortIndex === 2 } = {}) {
        if (!wrap) return;

        const sortDefs = {};
        const groupHeaders = headerRows.map(row => ({
            cells: row.map(cell => {
                const sortKey = cell.sortIndex !== undefined ? `sort-${cell.sortIndex}` : undefined;
                if (sortKey) {
                    sortDefs[sortKey] = {
                        defaultSortDir: defaultAsc(cell.sortIndex) ? 1 : -1,
                        sort: (leftRow, rightRow) => compareValues(sortableValue(leftRow, cell.sortIndex), sortableValue(rightRow, cell.sortIndex)),
                    };
                }
                return {
                    label: cell.label,
                    cls: cell.className || '',
                    key: sortKey,
                    style: cell.style,
                    title: cell.title,
                    rowspan: cell.rowspan,
                    colspan: cell.colspan,
                };
            }),
        }));

        wrap.innerHTML = '';
        const scroll = document.createElement('div');
        scroll.className = 'tsa-stats-scroll';
        scroll.appendChild(TmTable.table({
            cls: 'tsa-stats-table',
            items: getRows(),
            headers: [],
            groupHeaders,
            sortDefs,
            sortKey: null,
            renderRowsHtml: renderRows,
        }));
        wrap.appendChild(scroll);
    },
};