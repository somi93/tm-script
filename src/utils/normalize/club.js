export const normalizeClubTransfers = (html, opts = {}) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let boughtTable = null, soldTable = null;
    doc.querySelectorAll('h3').forEach(h3 => {
        const text = h3.textContent.trim().toLowerCase();
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'TABLE') next = next.nextElementSibling;
        if (!next) return;
        if (text.includes('bought')) boughtTable = next;
        else if (text.includes('sold')) soldTable = next;
    });
    const parseRow = tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 4) return null;
        const playerA = tds[0].querySelector('a[player_link]');
        if (!playerA) return null;
        const recTd = tds[1];
        const isRetired = recTd.textContent.trim() === 'Retired';
        let stars = 0;
        recTd.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (src.includes('half_star')) stars += 0.5;
            else if (src.includes('star') && !src.includes('dark_star')) stars += 1;
        });
        const clubA = tds[2].querySelector('a[club_link]');
        return {
            pid: playerA.getAttribute('player_link'),
            name: playerA.textContent.trim(),
            url: playerA.getAttribute('href'),
            rec: stars * 3.38,
            isRetired,
            clubId: clubA ? clubA.getAttribute('club_link') : null,
            clubName: clubA ? clubA.textContent.trim() : tds[2].textContent.trim(),
            price: parseFloat(tds[3].textContent.trim().replace(/,/g, '')) || 0,
            ...opts,
        };
    };
    const parseRows = table => !table ? [] : Array.from(table.querySelectorAll('tr')).map(parseRow).filter(Boolean);
    const bought = parseRows(boughtTable);
    const sold   = parseRows(soldTable);
    let totalBought = 0, totalSold = 0, balance = 0;
    doc.querySelectorAll('td[colspan]').forEach(td => {
        const val = parseFloat((td.querySelector('strong')?.textContent || '0').replace(/,/g, '')) || 0;
        const txt = td.textContent.trim();
        if (/Total Bought/i.test(txt)) totalBought = val;
        else if (/Total Sold/i.test(txt)) totalSold = val;
        else if (/Balance/i.test(txt)) balance = val;
    });
    if (!totalBought && bought.length) totalBought = bought.reduce((s, p) => s + p.price, 0);
    if (!totalSold   && sold.length)   totalSold   = sold.reduce((s, p) => s + p.price, 0);
    if (!balance) balance = totalSold - totalBought;
    return { bought, sold, totalBought, totalSold, balance };
};

export const normalizeClubFromTooltip = (raw) => ({
    id: raw.id ?? null,
    name: raw.club_name ?? null,
    nick: raw.club_nick ?? null,
    country: raw.country ?? null,
    division: raw.division ?? null,
    group: raw.group ?? null,
    manager_name: raw.manager_name ?? null,
    fanclub: raw.fanclub ?? null,
    stadium: raw.stadium ?? null,
    city: raw.city ?? null,
    a_team: raw.a_team ?? null,
    b_team: raw.b_team ?? null,
    created: raw.created ?? null,
    is_diamond: raw.is_diamond ?? null,
    cash: raw.cash ?? null,
    online: raw.online ?? null,
});

export const normalizeClubFromScoutReport = (raw) => ({
    id: raw.club ?? null,
    name: raw.klubnavn ?? null,
    nick: null,
    country: raw.land ?? null,
    division: raw.division ?? null,
    group: raw.pulje ?? null,
    manager_name: null,
    fanclub: null,
    stadium: null,
    city: null,
    a_team: null,
    b_team: null,
    created: null,
    is_diamond: null,
    cash: raw.cash ?? null,
    online: raw.online ?? null,
});
