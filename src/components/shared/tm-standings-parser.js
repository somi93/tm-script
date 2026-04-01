const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

function getZone(className) {
    if (className.includes('promotion_playoff')) return 'promo-po';
    if (className.includes('promotion')) return 'promo';
    if (className.includes('relegation_playoff')) return 'rel-po';
    if (className.includes('relegation')) return 'rel';
    return '';
}

function extractClubId(node) {
    if (!node) return '';
    const explicit = node.getAttribute('club_link');
    if (explicit) return String(explicit);
    const href = node.getAttribute('href') || '';
    const match = href.match(/\/club\/(\d+)\//);
    return match ? match[1] : '';
}

function parseStandingsRow(row, { highlightedClubId = '', rankFallback = 0 } = {}) {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length < 8) return null;

    let clubLink = null;
    for (const cell of cells) {
        clubLink = cell.querySelector('a[club_link], a[href*="/club/"]');
        if (clubLink) break;
    }
    if (!clubLink) return null;

    const hasRankColumn = cells.length >= 9;
    const offset = hasRankColumn ? 1 : 0;
    const className = row.className || '';
    const clubId = extractClubId(clubLink);
    const isHighlighted = cells.some(cell => cell.classList.contains('highlight_td'));

    return {
        rank: hasRankColumn ? (Number.parseInt(cleanText(cells[0]?.textContent || ''), 10) || rankFallback) : rankFallback,
        clubId,
        clubName: cleanText(clubLink.textContent || ''),
        gp: Number.parseInt(cleanText(cells[1 + offset]?.textContent || ''), 10) || 0,
        w: Number.parseInt(cleanText(cells[2 + offset]?.textContent || ''), 10) || 0,
        d: Number.parseInt(cleanText(cells[3 + offset]?.textContent || ''), 10) || 0,
        l: Number.parseInt(cleanText(cells[4 + offset]?.textContent || ''), 10) || 0,
        gf: Number.parseInt(cleanText(cells[5 + offset]?.textContent || ''), 10) || 0,
        ga: Number.parseInt(cleanText(cells[6 + offset]?.textContent || ''), 10) || 0,
        pts: Number.parseInt(cleanText(cells[7 + offset]?.textContent || ''), 10) || 0,
        zone: getZone(className),
        isMe: className.includes('highlighted_row_done') || isHighlighted || (!!highlightedClubId && clubId === highlightedClubId),
    };
}

function isGroupTitleRow(row) {
    const headers = row.querySelectorAll('th');
    if (!headers.length) return false;
    const firstLabel = cleanText(headers[0]?.textContent || '').toLowerCase();
    if (!firstLabel) return false;
    return !['#', 'club', 'gp', 'w', 'd', 'l', 'gf', 'ga', 'pts', 'p', 'goals'].includes(firstLabel);
}

export const TmStandingsParser = {
    parseNativeTable(table, { highlightedClubId = '' } = {}) {
        return Array.from(table?.querySelectorAll('tr') || []).map((row, index) => {
            if (row.querySelector('th')) return null;
            return parseStandingsRow(row, { highlightedClubId, rankFallback: index + 1 });
        }).filter(Boolean);
    },

    parseNativeGroupedTable(table, { highlightedClubId = '' } = {}) {
        const groups = [];
        let currentGroup = null;

        Array.from(table?.querySelectorAll('tr') || []).forEach(row => {
            if (isGroupTitleRow(row)) {
                if (currentGroup?.rows.length) groups.push(currentGroup);
                currentGroup = { title: cleanText(row.querySelector('th')?.textContent || ''), rows: [] };
                return;
            }

            if (row.querySelector('th')) return;

            const parsed = parseStandingsRow(row, {
                highlightedClubId,
                rankFallback: (currentGroup?.rows.length || 0) + 1,
            });
            if (!parsed) return;

            if (!currentGroup) currentGroup = { title: '', rows: [] };
            currentGroup.rows.push(parsed);
        });

        if (currentGroup?.rows.length) groups.push(currentGroup);
        return groups;
    },
};