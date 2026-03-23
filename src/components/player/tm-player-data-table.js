import { TmTable } from '../shared/tm-table.js';

const attrsToHtml = (attrs = {}) => Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
    .join('');

const renderCell = (cell, tagName) => {
    if (typeof cell === 'string') return `<${tagName}>${cell}</${tagName}>`;
    const className = cell.cls ? ` class="${cell.cls}"` : '';
    const attrs = attrsToHtml(cell.attrs);
    return `<${tagName}${className}${attrs}>${cell.content ?? ''}</${tagName}>`;
};

const renderRow = (row, tagName) => {
    if (typeof row === 'string') return row;
    const className = row.cls ? ` class="${row.cls}"` : '';
    const attrs = attrsToHtml(row.attrs);
    return `<tr${className}${attrs}>${(row.cells || []).map(cell => renderCell(cell, tagName)).join('')}</tr>`;
};

export const TmPlayerDataTable = {
    table({ tableClass, headerRows = [], bodyRows = [] }) {
        return TmTable.table({
            cls: tableClass,
            headers: [],
            groupHeaders: headerRows.map(row => ({
                cls: typeof row === 'string' ? '' : (row.cls || ''),
                cells: (typeof row === 'string' ? [] : (row.cells || [])).map(cell => ({
                    label: typeof cell === 'string' ? cell : (cell.content ?? ''),
                    cls: typeof cell === 'string' ? '' : (cell.cls || ''),
                    attrs: typeof cell === 'string' ? {} : (cell.attrs || {}),
                })),
            })),
            items: bodyRows,
            renderRowsHtml: rows => rows.map(row => renderRow(row, 'td')).join(''),
        });
    },
};