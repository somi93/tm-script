#!/usr/bin/env node
/**
 * convert-to-esm.js
 *
 * One-time migration: converts all src/lib/, src/components/, and src/pages/
 * from the IIFE + window.TmXxx pattern to ES modules with import/export.
 *
 * Usage: node convert-to-esm.js
 *
 * What it does per file:
 *   1. Strip ==UserScript== header (pages only)
 *   2. Strip IIFE wrapper  (function () { 'use strict'; ... })();
 *   3. Convert  window.TmXxx = { ... }  →  export const TmXxx = { ... }
 *   4. Find all remaining  window.TmXxx  references → collect as imports
 *   5. Replace  window.TmXxx  →  TmXxx  in body
 *   6. Prepend  import { ... } from '...'  lines
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');

// ─── Global → source path mapping (relative to src/) ─────────────────────────
const GLOBALS = {
    // lib
    TmConst:           'lib/tm-constants.js',
    TmUtils:           'lib/tm-utils.js',
    TmLib:             'lib/tm-lib.js',
    TmPlayerDB:        'lib/tm-playerdb.js',
    TmPlayerArchiveDB: 'lib/tm-playerdb.js',
    TmMatchCacheDB:    'lib/tm-playerdb.js',
    TmPosition:        'lib/tm-position.js',
    TmApi:             'lib/tm-services.js',
    TmSquad:           'lib/tm-squad.js',
    // shared components
    TmUI:              'components/shared/tm-ui.js',
    TmCanvasUtils:     'components/shared/tm-canvas-utils.js',
    // history
    TmHistoryStyles:   'components/history/tm-history-styles.js',
    TmHistoryHelpers:  'components/history/tm-history-helpers.js',
    TmHistoryRecords:  'components/history/tm-history-records.js',
    TmHistoryTransfers:'components/history/tm-history-transfers.js',
    TmHistoryMatches:  'components/history/tm-history-matches.js',
    TmHistoryLeague:   'components/history/tm-history-league.js',
    // league
    TmLeagueStyles:    'components/league/tm-league-styles.js',
    TmLeaguePanel:     'components/league/tm-league-panel.js',
    TmLeaguePicker:    'components/league/tm-league-picker.js',
    TmLeagueStandings: 'components/league/tm-league-standings.js',
    TmLeagueFixtures:  'components/league/tm-league-fixtures.js',
    TmLeagueRounds:    'components/league/tm-league-rounds.js',
    TmLeagueSkillTable:'components/league/tm-league-skill-table.js',
    TmLeagueStats:     'components/league/tm-league-stats.js',
    TmLeagueTOTR:      'components/league/tm-league-totr.js',
    // match
    TmMatchStyles:     'components/match/tm-match-styles.js',
    TmMatchUtils:      'components/match/tm-match-utils.js',
    TmMatchDialog:     'components/match/tm-match-dialog.js',
    TmMatchLineups:    'components/match/tm-match-lineups.js',
    TmMatchStatistics: 'components/match/tm-match-statistics.js',
    TmMatchVenue:      'components/match/tm-match-venue.js',
    TmMatchH2H:        'components/match/tm-match-h2h.js',
    TmMatchAnalysis:   'components/match/tm-match-analysis.js',
    TmMatchLeague:     'components/match/tm-match-league.js',
    // player
    TmPlayerStyles:    'components/player/card/tm-player-styles.js',
    TmPlayerCard:      'components/player/card/tm-player-card.js',
    TmPlayerTooltip:   'components/player/tooltip/tm-player-tooltip.js',
    TmPlayerSidebar:   'components/player/card/tm-player-sidebar.js',
    TmSidebarNav:      'components/player/tm-sidebar-nav.js',
    TmSkillsGrid:      'components/player/skills/tm-skills-grid.js',
    TmHistoryMod:      'components/player/history/tm-history-mod.js',
    TmScoutMod:        'components/player/scout/tm-scout-mod.js',
    TmTrainingMod:     'components/player/training/tm-player-training.js',
    TmGraphsMod:       'components/player/graphs/tm-graphs-mod.js',
    TmTabsMod:         'components/player/tabs/tm-tabs-mod.js',
    TmAsiCalculator:   'components/player/card/tm-asi-calculator.js',
    TmBestEstimate:    'components/player/scout/tm-best-estimate.js',
    // shortlist
    TmShortlistFilters:'components/shortlist/tm-shortlist-filters.js',
    TmShortlistTable:  'components/shortlist/tm-shortlist-table.js',
    TmShortlistPanel:  'components/shortlist/tm-shortlist-panel.js',
    // squad
    TmSquadTable:      'components/squad/tm-squad-table.js',
    // stats
    TmStatsStyles:         'components/stats/tm-stats-styles.js',
    TmStatsMatchProcessor: 'components/stats/tm-stats-match-processor.js',
    TmStatsAggregator:     'components/stats/tm-stats-aggregator.js',
    TmStatsBasicTable:     'components/stats/tm-stats-basic-table.js',
    TmStatsDefendingTable: 'components/stats/tm-stats-defending-table.js',
    TmStatsGKTable:        'components/stats/tm-stats-gk-table.js',
    TmStatsAdvTable:       'components/stats/tm-stats-adv-table.js',
    TmStatsAttackingTable: 'components/stats/tm-stats-attacking-table.js',
    TmStatsPlayerTab:      'components/stats/tm-stats-player-tab.js',
    TmStatsTeamTab:        'components/stats/tm-stats-team-tab.js',
    TmStatsMatchList:      'components/stats/tm-stats-match-list.js',
    // r5history
    TmR5HistoryStyles: 'components/r5history/tm-r5history-styles.js',
    TmR5HistoryChart:  'components/r5history/tm-r5history-chart.js',
    // transfer
    TmTransferStyles:  'components/transfer/tm-transfer-styles.js',
    TmTransferTable:   'components/transfer/tm-transfer-table.js',
    TmTransferSidebar: 'components/transfer/tm-transfer-sidebar.js',
};

// Globals we intentionally leave as window.* (browser-provided or page-set state)
const KEEP_AS_WINDOW = new Set([
    'jQuery',       // loaded by TM itself
    'SESSION',      // TM session object
    'TmLeagueCtx',  // page-set shared state (avoid circular imports)
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllJsFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...getAllJsFiles(full));
        else if (entry.name.endsWith('.js')) results.push(full);
    }
    return results;
}

function relPath(fromFile, toRelFromSrc) {
    const from = path.dirname(fromFile);
    const to   = path.join(SRC, toRelFromSrc);
    let rel = path.relative(from, to).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
}

// ─── Core converter ───────────────────────────────────────────────────────────

function convertFile(filePath, isPage) {
    let code = fs.readFileSync(filePath, 'utf8');

    // Guard: skip already-converted files (start with 'import' or 'export')
    // to allow idempotent re-runs
    const alreadyESM = /^\s*(?:import|export)\b/.test(code);

    // 1. Strip ==UserScript== header
    code = code.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==[ \t]*\r?\n?/, '');

    if (!alreadyESM && !isPage) {
        // 2. Strip IIFE opening:  (function () {   and optional 'use strict';
        //    Use `m` flag so `^` matches start of ANY line (not just string start)
        //    Note: only strips if (function starts a line (not inside an assignment like window.X = (function() {...})())
        const before2 = code;
        code = code.replace(/^[ \t]*\(function\s*\(\s*\)\s*\{[ \t]*\r?\n/m, '');
        const iifeOpeningStripped = code !== before2;

        if (iifeOpeningStripped) {
            code = code.replace(/^[ \t]*'use strict';?[ \t]*\r?\n/m, '');
            code = code.replace(/^[ \t]*"use strict";?[ \t]*\r?\n/m, '');
            // 3. Strip matching IIFE closing:  })();  at the very end
            code = code.replace(/\r?\n[ \t]*\}\s*\)\s*\(\s*\)\s*;?[ \t]*\r?\n?$/, '\n');
        }
    }

    // 4. Convert  window.TmXxx = {  →  export const TmXxx = {
    //    Only convert globals that are in our GLOBALS map (lib/component exports).
    //    Skip KEEP_AS_WINDOW and skip anything not in our map.
    if (!isPage) {
        code = code.replace(/(?:^|(?<=\n))[ \t]*window\.([A-Z][a-zA-Z0-9]+)\s*=/gm, (match, name) => {
            if (GLOBALS[name] && !KEEP_AS_WINDOW.has(name)) {
                // Preserve leading whitespace
                const leading = match.match(/^([ \t]*)/)[1];
                return `${leading}export const ${name} =`;
            }
            return match;
        });
    }

    // 5a. Find all  window.TmXxx  usages (explicit global access)
    const usedGlobals = new Set();
    const scanRegex = /\bwindow\.([A-Z][a-zA-Z0-9]+)/g;
    let m;
    while ((m = scanRegex.exec(code)) !== null) {
        const name = m[1];
        if (GLOBALS[name] && !KEEP_AS_WINDOW.has(name)) {
            usedGlobals.add(name);
        }
    }

    // 5b. Find bare  TmXxx  usages — e.g. TmTransferTable.buildPlayerRow()
    //     These are globals used without window. prefix (common in page entry files)
    //     Exclude: lines that are import/export statements (to avoid picking up
    //     the imports we already added from a prior run)
    const codeLines = code.split('\n');
    for (const line of codeLines) {
        const trimmed = line.trimStart();
        // Skip import/export declaration lines
        if (/^(?:import|export)\b/.test(trimmed)) continue;
        // Scan for bare TmXxx identifiers
        const bareRegex = /\b(Tm[A-Z][a-zA-Z0-9]+)\b/g;
        let bm;
        while ((bm = bareRegex.exec(line)) !== null) {
            const name = bm[1];
            if (GLOBALS[name] && !KEEP_AS_WINDOW.has(name)) {
                usedGlobals.add(name);
            }
        }
    }

    // 6. Replace  window.TmXxx  →  TmXxx  in body
    for (const name of usedGlobals) {
        // Simple string split/join for global replacement (avoids regex escaping issues)
        while (code.includes(`window.${name}`)) {
            code = code.split(`window.${name}`).join(name);
        }
    }

    // 7. Build import statements grouped by source file
    const importsByFile = new Map();
    for (const name of [...usedGlobals].sort()) {
        const target = relPath(filePath, GLOBALS[name]);
        if (!importsByFile.has(target)) importsByFile.set(target, []);
        importsByFile.get(target).push(name);
    }

    const importLines = [];
    for (const [fp, names] of [...importsByFile.entries()].sort()) {
        // Skip self-imports
        const resolvedTarget = path.resolve(path.dirname(filePath), fp);
        if (resolvedTarget === filePath) continue;
        importLines.push(`import { ${names.join(', ')} } from '${fp}';`);
    }

    // 8. Prepend imports + 'use strict' (redundant in ESM but harmless)
    const prefix = importLines.length > 0 ? importLines.join('\n') + '\n\n' : '';
    code = prefix + code.trimStart();

    return code;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

function run() {
    let ok = 0, skip = 0;

    const libFiles        = getAllJsFiles(path.join(SRC, 'lib'));
    const componentFiles  = getAllJsFiles(path.join(SRC, 'components'));
    const pageFiles       = getAllJsFiles(path.join(SRC, 'pages'));

    for (const f of [...libFiles, ...componentFiles]) {
        try {
            const converted = convertFile(f, false);
            fs.writeFileSync(f, converted, 'utf8');
            console.log(`✓  ${path.relative(SRC, f)}`);
            ok++;
        } catch (e) {
            console.error(`✗  ${path.relative(SRC, f)}: ${e.message}`);
            skip++;
        }
    }

    for (const f of pageFiles) {
        try {
            const converted = convertFile(f, true);
            fs.writeFileSync(f, converted, 'utf8');
            console.log(`✓  pages/${path.basename(f)}`);
            ok++;
        } catch (e) {
            console.error(`✗  pages/${path.basename(f)}: ${e.message}`);
            skip++;
        }
    }

    console.log(`\nDone: ${ok} converted, ${skip} errors.`);
}

run();
