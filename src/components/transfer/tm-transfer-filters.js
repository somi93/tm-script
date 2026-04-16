const SAVED_FILTERS_KEY = 'tms_saved_filters';

const FP_MAP = {
    gk: { group: 'gk', side: null },
    dl: { group: 'de', side: 'le' },
    dc: { group: 'de', side: 'ce' },
    dr: { group: 'de', side: 'ri' },
    dml: { group: 'dm', side: 'le' },
    dmc: { group: 'dm', side: 'ce' },
    dmr: { group: 'dm', side: 'ri' },
    ml: { group: 'mf', side: 'le' },
    mc: { group: 'mf', side: 'ce' },
    mr: { group: 'mf', side: 'ri' },
    oml: { group: 'om', side: 'le' },
    omc: { group: 'om', side: 'ce' },
    omr: { group: 'om', side: 'ri' },
    fc: { group: 'fw', side: null },
};

function decRecToTM(val) {
    return Math.min(10, Math.max(0, Math.floor(parseFloat(val) * 2)));
}

function buildHashRaw({ positions = [], sides = [], foreigners, amin, amax, rmin, rmax, cost, time, skills = [] }) {
    let h = '/';
    for (const p of positions) h += p + '/';
    for (const s of sides) h += s + '/';
    if (foreigners) h += 'for/';
    if (amin && amin !== '18') h += `amin/${amin}/`;
    if (amax && amax !== '37') h += `amax/${amax}/`;
    if (rmin && rmin !== '0') h += `rmin/${rmin}/`;
    if (rmax && rmax !== '10') h += `rmax/${rmax}/`;
    if (cost && cost !== '0') h += `cost/${cost}/`;
    if (time && time !== '0') h += `time/${time}/`;
    for (const [sk, sv] of skills) {
        if (sk && sk !== '0' && sv && sv !== '0') h += `${sk}/${sv}/`;
    }
    return h;
}

function passesPostFilters(player, pf) {
    if (player.r5 == null && player.r5Hi == null) return true;
    if (player.r5 != null) {
        if (pf.r5min !== null && player.r5 < pf.r5min) return false;
        if (pf.r5max !== null && player.r5 > pf.r5max) return false;
    } else {
        if (pf.r5min !== null && player.r5Hi != null && player.r5Hi < pf.r5min) return false;
        if (pf.r5max !== null && player.r5Lo != null && player.r5Lo > pf.r5max) return false;
    }
    if (pf.timin !== null && player.ti != null && player.ti < pf.timin) return false;
    if (pf.timax !== null && player.ti != null && player.ti > pf.timax) return false;
    return true;
}

function getSavedFilters() {
    try {
        return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '{}');
    } catch (e) { return {}; }
}

function saveNamedFilter(name, state) {
    const filters = getSavedFilters();
    filters[name] = state;
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

function deleteNamedFilter(name) {
    const filters = getSavedFilters();
    delete filters[name];
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

function getPostFilters() {
    const r5min = document.getElementById('tms-r5min').value;
    const r5max = document.getElementById('tms-r5max').value;
    const timin = document.getElementById('tms-timin').value;
    const timax = document.getElementById('tms-timax').value;
    return {
        r5min: r5min !== '' ? parseFloat(r5min) : null,
        r5max: r5max !== '' ? parseFloat(r5max) : null,
        timin: timin !== '' ? parseFloat(timin) : null,
        timax: timax !== '' ? parseFloat(timax) : null,
    };
}

function buildHash() {
    let h = '/';
    const activeFps = [...document.querySelectorAll('[data-fp].active')].map(el => el.dataset.fp);
    if (activeFps.length) {
        const groups = new Set(), sides = new Set();
        for (const fp of activeFps) {
            const m = FP_MAP[fp]; if (!m) continue;
            groups.add(m.group);
            if (m.side) sides.add(m.side);
        }
        for (const g of groups) h += g + '/';
        for (const s of sides) h += s + '/';
    }
    if (document.getElementById('tms-for').checked) h += 'for/';

    const amin = document.getElementById('tms-amin').value;
    const amax = document.getElementById('tms-amax').value;
    if (amin !== '18') h += `amin/${amin}/`;
    if (amax !== '37') h += `amax/${amax}/`;

    const recMin = parseFloat(document.getElementById('tms-rmin').value) || 0;
    const recMax = parseFloat(document.getElementById('tms-rmax').value);
    const tmRmin = decRecToTM(recMin);
    const tmRmax = decRecToTM(isNaN(recMax) ? 5 : recMax);
    if (tmRmin > 0) h += `rmin/${tmRmin}/`;
    if (tmRmax < 10) h += `rmax/${tmRmax}/`;

    const cost = document.getElementById('tms-cost').value;
    if (cost && cost !== '0') h += `cost/${cost}/`;

    const time = document.getElementById('tms-time').value;
    if (time && time !== '0') h += `time/${time}/`;

    for (let i = 0; i < 3; i++) {
        const sk = document.getElementById(`tms-sf-s${i}`).value;
        const sv = document.getElementById(`tms-sf-v${i}`).value;
        if (sk && sk !== '0' && sv && sv !== '0') h += `${sk}/${sv}/`;
    }
    return h;
}

function readCurrentFilterState() {
    const positions = [...document.querySelectorAll('[data-fp].active')].map(el => el.dataset.fp);
    const skills = [];
    for (let i = 0; i < 3; i++) {
        skills.push([
            document.getElementById(`tms-sf-s${i}`).value || '0',
            document.getElementById(`tms-sf-v${i}`).value || '0',
        ]);
    }
    return {
        positions,
        foreigners: document.getElementById('tms-for').checked,
        amin: document.getElementById('tms-amin').value,
        amax: document.getElementById('tms-amax').value,
        rmin: document.getElementById('tms-rmin').value,
        rmax: document.getElementById('tms-rmax').value,
        cost: document.getElementById('tms-cost').value,
        time: document.getElementById('tms-time').value,
        skills,
        r5min: document.getElementById('tms-r5min').value,
        r5max: document.getElementById('tms-r5max').value,
        timin: document.getElementById('tms-timin').value,
        timax: document.getElementById('tms-timax').value,
    };
}

function applyFilterState(state) {
    if (!state) return;
    document.querySelectorAll('[data-fp]').forEach(el => el.classList.remove('active'));
    (state.positions || []).forEach(fp => {
        document.querySelectorAll(`[data-fp="${fp}"]`).forEach(el => el.classList.add('active'));
    });
    document.getElementById('tms-for').checked = !!state.foreigners;
    document.getElementById('tms-amin').value = state.amin != null ? state.amin : '18';
    document.getElementById('tms-amax').value = state.amax != null ? state.amax : '37';
    document.getElementById('tms-rmin').value = state.rmin != null ? state.rmin : '0';
    document.getElementById('tms-rmax').value = state.rmax != null ? state.rmax : '5';
    document.getElementById('tms-cost').value = state.cost || '0';
    document.getElementById('tms-time').value = state.time || '0';
    const skills = state.skills || [];
    for (let i = 0; i < 3; i++) {
        const [sk, sv] = skills[i] || ['0', '0'];
        document.getElementById(`tms-sf-s${i}`).value = sk;
        document.getElementById(`tms-sf-v${i}`).value = sv;
    }
    document.getElementById('tms-r5min').value = state.r5min || '';
    document.getElementById('tms-r5max').value = state.r5max || '';
    document.getElementById('tms-timin').value = state.timin || '';
    document.getElementById('tms-timax').value = state.timax || '';
    const hasMore = (state.cost && state.cost !== '0') ||
        (state.time && state.time !== '0') ||
        (skills.some(([sk]) => sk && sk !== '0'));
    if (hasMore) {
        document.getElementById('tms-more-toggle').classList.add('open');
        document.getElementById('tms-more-body').classList.add('open');
    }
}

function readBaseFilters() {
    return {
        foreigners: document.getElementById('tms-for').checked,
        amin: document.getElementById('tms-amin').value || '18',
        amax: document.getElementById('tms-amax').value || '37',
        rmin: document.getElementById('tms-rmin').value || '0',
        rmax: document.getElementById('tms-rmax').value || '5',
        cost: document.getElementById('tms-cost').value || '0',
        time: document.getElementById('tms-time').value || '0',
        skills: [0, 1, 2].map(i => [
            document.getElementById(`tms-sf-s${i}`).value || '0',
            document.getElementById(`tms-sf-v${i}`).value || '0',
        ]),
    };
}

function populateSavedFiltersDropdown() {
    const filters = getSavedFilters();
    const names = Object.keys(filters);
    const sel = document.getElementById('tms-saved-filters-sel');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '';
    if (names.length === 0) {
        sel.insertAdjacentHTML('beforeend', '<option value="">— no saved filters —</option>');
    } else {
        sel.insertAdjacentHTML('beforeend', '<option value="">— select filter —</option>');
        for (const name of names) {
            sel.insertAdjacentHTML('beforeend', `<option value="${name}"${name === current ? ' selected' : ''}>${name}</option>`);
        }
    }
}

export const TmTransferFilters = {
    FP_MAP,
    decRecToTM,
    buildHashRaw,
    passesPostFilters,
    getSavedFilters,
    saveNamedFilter,
    deleteNamedFilter,
    getPostFilters,
    buildHash,
    readCurrentFilterState,
    applyFilterState,
    readBaseFilters,
    populateSavedFiltersDropdown,
};
