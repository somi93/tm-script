#!/usr/bin/env node
/**
 * build.js — TM Scripts bundle builder
 *
 * Builds per-page bundles: each contains shared libs + page-specific
 * components + the page IIFE. Only the relevant bundle loads per URL.
 *
 * Output:
 *   dist/tm-libs.js            — shared libs (always loaded, cached)
 *   dist/pages/tm-transfer.js  — transfer page bundle
 *   dist/pages/tm-match.js     — match page bundle
 *   … etc.
 *   stubs/                     — thin userscript stubs (install these in TM)
 *
 * Usage:
 *   node build.js           — build once
 *   node build.js --watch   — rebuild on any .js change
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC  = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// ─── Shared libs (loaded on every page via tm-libs.js) ───────────────────────
const LIBS = [
    'lib/tm-constants.js',
    'lib/tm-position.js',
    'lib/tm-utils.js',
    'lib/tm-lib.js',
    'lib/tm-playerdb.js',
    'lib/tm-dbsync.js',
    'lib/tm-services.js',
    'lib/tm-squad.js',
    'components/shared/tm-canvas-utils.js',
    'components/shared/tm-ui.js',
];

// ─── Shared player components (needed by multiple pages) ─────────────────────
const PLAYER_COMPONENTS = [
    'components/player/tm-player-tooltip.js',
    'components/player/tm-player-styles.js',
    'components/player/tm-player-card.js',
    'components/player/tm-player-sidebar.js',
    'components/player/tm-sidebar-nav.js',
    'components/player/tm-skills-grid.js',
    'components/player/tm-training-mod.js',
    'components/player/tm-history-mod.js',
    'components/player/tm-graphs-mod.js',
    'components/player/tm-scout-mod.js',
    'components/player/tm-asi-calculator.js',
    'components/player/tm-best-estimate.js',
    'components/player/tm-tabs-mod.js',
];

// ─── Page definitions ─────────────────────────────────────────────────────────
// Each entry describes one page bundle:
//   out        — output filename in dist/pages/
//   match      — @match pattern for the main stub (informational only)
//   urlGuard   — regex tested against location.pathname; page IIFE is skipped if it doesn't match
//   components — component files to include (relative to ROOT)
//   page       — the entry point in src/pages/ (==UserScript== header stripped, wrapped in urlGuard)
const PAGES = [
    {
        out: 'tm-transfer.js',
        match: 'https://trophymanager.com/transfer*',
        urlGuard: /^\/transfer\/?$/,
        components: [
            ...PLAYER_COMPONENTS,
            'components/transfer/tm-transfer-styles.js',
            'components/transfer/tm-transfer-table.js',
            'components/transfer/tm-transfer-sidebar.js',
        ],
        page: 'pages/transfer.js',
    },
    {
        out: 'tm-match.js',
        match: 'https://trophymanager.com/matches/*',
        urlGuard: /^\/matches\/\d+/,
        components: [
            ...PLAYER_COMPONENTS,
            'components/match/tm-match-styles.js',
            'components/match/tm-match-utils.js',
            'components/match/tm-match-dialog.js',
            'components/match/tm-match-venue.js',
            'components/match/tm-match-h2h.js',
            'components/match/tm-match-statistics.js',
            'components/match/tm-match-analysis.js',
            'components/match/tm-match-lineups.js',
            'components/match/tm-match-league.js',
        ],
        page: 'pages/match.js',
    },
    {
        out: 'tm-player.js',
        match: 'https://trophymanager.com/players/*',
        urlGuard: /^\/players\/\d+/,
        components: [...PLAYER_COMPONENTS],
        page: 'pages/player.js',
    },
    {
        out: 'tm-players.js',
        match: 'https://trophymanager.com/players/',
        urlGuard: /^\/players\/?$/,
        components: [...PLAYER_COMPONENTS],
        page: 'pages/players.js',
    },
    {
        out: 'tm-squad.js',
        match: 'https://trophymanager.com/club/*',
        urlGuard: /^\/club\/\d+\/squad/,
        components: [
            ...PLAYER_COMPONENTS,
            'components/squad/tm-squad-table.js',
        ],
        page: 'pages/squad.js',
    },
    {
        out: 'tm-league.js',
        match: 'https://trophymanager.com/league/*',
        urlGuard: /^\/league\//,
        components: [
            ...PLAYER_COMPONENTS,
            'components/league/tm-league-styles.js',
            'components/league/tm-league-picker.js',
            'components/league/tm-league-standings.js',
            'components/league/tm-league-fixtures.js',
            'components/league/tm-league-rounds.js',
            'components/league/tm-league-stats.js',
            'components/league/tm-league-skill-table.js',
            'components/league/tm-league-totr.js',
            'components/league/tm-league-panel.js',
        ],
        page: 'pages/league.js',
    },
    {
        out: 'tm-stats.js',
        match: 'https://trophymanager.com/statistics/club/*',
        urlGuard: /^\/statistics\/club\//,
        components: [
            ...PLAYER_COMPONENTS,
            'components/stats/tm-stats-styles.js',
            'components/stats/tm-stats-aggregator.js',
            'components/stats/tm-stats-match-processor.js',
            'components/stats/tm-stats-match-list.js',
            'components/stats/tm-stats-basic-table.js',
            'components/stats/tm-stats-attacking-table.js',
            'components/stats/tm-stats-defending-table.js',
            'components/stats/tm-stats-adv-table.js',
            'components/stats/tm-stats-gk-table.js',
            'components/stats/tm-stats-team-tab.js',
            'components/stats/tm-stats-player-tab.js',
        ],
        page: 'pages/stats.js',
    },
    {
        out: 'tm-history.js',
        match: 'https://trophymanager.com/history/club/*',
        urlGuard: /^\/history\/club\//,
        components: [
            ...PLAYER_COMPONENTS,
            'components/history/tm-history-styles.js',
            'components/history/tm-history-helpers.js',
            'components/history/tm-history-matches.js',
            'components/history/tm-history-transfers.js',
            'components/history/tm-history-records.js',
            'components/history/tm-history-league.js',
        ],
        page: 'pages/history.js',
    },
    {
        out: 'tm-shortlist.js',
        match: 'https://trophymanager.com/shortlist/*',
        urlGuard: /^\/shortlist\//,
        components: [
            ...PLAYER_COMPONENTS,
            'components/shortlist/tm-shortlist-filters.js',
            'components/shortlist/tm-shortlist-table.js',
            'components/shortlist/tm-shortlist-panel.js',
        ],
        page: 'pages/shortlist.js',
    },
    {
        out: 'tm-import.js',
        match: 'https://trophymanager.com/history*',
        urlGuard: /^\/history/,
        components: [
            'components/import/tm-import-styles.js',
            'components/import/tm-import-sync.js',
        ],
        page: 'pages/import.js',
    },
    {
        out: 'tm-r5history.js',
        match: 'https://trophymanager.com/players/',
        urlGuard: /^\/players\/?$/,
        components: [
            'components/r5history/tm-r5history-styles.js',
            'components/r5history/tm-r5history-chart.js',
        ],
        page: 'pages/r5history.js',
    },
    {
        out: 'tm-dbinspect.js',
        match: 'https://trophymanager.com/history*',
        urlGuard: /^\/history/,
        components: [
            'components/dbinspect/tm-dbinspect-styles.js',
        ],
        page: 'pages/dbinspect.js',
    },
    {
        out: 'tm-dbrepair.js',
        match: 'https://trophymanager.com/history',
        urlGuard: /^\/history\/?$/,
        components: [
            'components/dbrepair/tm-dbrepair-styles.js',
        ],
        page: 'pages/dbrepair.js',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripUserscriptHeader(code) {
    return code.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==[ \t]*\r?\n?/, '');
}

function concat(files, label) {
    const parts = [];
    const missing = [];
    for (const rel of files) {
        const full = path.join(SRC, rel);
        if (!fs.existsSync(full)) { missing.push(rel); continue; }
        let code = fs.readFileSync(full, 'utf8');
        if (rel.endsWith('.user.js')) code = stripUserscriptHeader(code);
        parts.push(`\n// ─── ${rel} ${'─'.repeat(Math.max(0, 55 - rel.length))}\n`);
        parts.push(code.trimEnd());
        parts.push('\n');
    }
    if (missing.length) {
        for (const m of missing) console.warn(`[build] ${label}: skipped (not found): ${m}`);
    }
    return parts.join('\n');
}

function writeFile(outPath, content) {
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, content, 'utf8');
}

function buildPageCode(page) {
    const componentCode = concat(page.components, page.out);
    const pageFull = path.join(SRC, page.page);
    let pageCode = '';
    if (!fs.existsSync(pageFull)) {
        console.warn(`[build] ${page.out}: skipped page (not found): ${page.page}`);
    } else {
        const raw = stripUserscriptHeader(fs.readFileSync(pageFull, 'utf8').trimEnd());
        const guardStr = page.urlGuard.toString();
        pageCode = `\n// ─── ${page.page} (guarded: ${guardStr}) ${'─'.repeat(Math.max(0, 30 - page.page.length))}\n` +
                   `if (${guardStr}.test(location.pathname)) {\n${raw}\n}\n`;
    }
    return componentCode + pageCode;
}

function buildAll() {
    const distDir = DIST;
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    // 1. Shared libs
    const libsCode = concat(LIBS, 'tm-libs');

    // 2. All pages concatenated into one bundle
    const pageParts = PAGES.map(page => buildPageCode(page));
    const bundleCode = libsCode + pageParts.join('');
    const bundleOut = path.join(DIST, 'tm-bundle.js');
    writeFile(bundleOut, bundleCode);
    const bundleKb = (Buffer.byteLength(bundleCode, 'utf8') / 1024).toFixed(1);
    console.log(`[build] ✓  dist/tm-bundle.js  (${bundleKb} KB, ${PAGES.length} pages)`);

    // 3. Generate main single-install userscript
    generateMainStub();
}

function generateMainStub() {
    const BASE = 'https://raw.githubusercontent.com/somi93/tm-script/main';

    const content = [
        '// ==UserScript==',
        '// @name         TM Scripts',
        '// @namespace    https://trophymanager.com',
        '// @version      2.0.0',
        '// @description  TrophyManager enhancement suite — transfer scanner, match viewer, player tools, squad, league and more',
        '// @match        https://trophymanager.com/*',
        `// @require      ${BASE}/dist/tm-bundle.js`,
        '// @grant        none',
        '// @run-at       document-end',
        '// ==/UserScript==',
        '',
        '// Auto-generated by build.js — do not edit manually.',
        '// Run `node build.js` to rebuild bundles and regenerate this file.',
    ].join('\n');

    const outPath = path.join(ROOT, 'tm.user.js');
    writeFile(outPath, content);
    console.log(`[build] ✓  tm.user.js  (1 @require entry)`);
}

// ─── Watch mode ───────────────────────────────────────────────────────────────

if (process.argv.includes('--watch')) {
    buildAll();
    console.log('[build] Watching for changes…  (Ctrl+C to stop)');

    let debounceTimer = null;
    const rebuild = (filename) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log(`[build] Changed: ${filename || '?'}`);
            buildAll();
        }, 150);
    };

    // Watch lib/, components/, and all *.user.js at root
    const watchDirs = [
        path.join(ROOT, 'lib'),
        path.join(ROOT, 'components'),
    ];
    for (const dir of watchDirs) {
        fs.watch(dir, { recursive: true }, (_, f) => {
            if (f && f.endsWith('.js')) rebuild(f);
        });
    }
    fs.watch(ROOT, (_, f) => {
        if (f && f.endsWith('.user.js')) rebuild(f);
    });

} else {
    buildAll();
}
