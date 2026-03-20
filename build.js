#!/usr/bin/env node
/**
 * build.js -- TM Scripts bundle builder (esbuild)
 *
 * Bundles all page entry points from src/pages/ into dist/tm-bundle.js.
 *
 * Usage:
 *   node build.js           -- build once (GitHub URL)
 *   node build.js --local   -- build with file:// URL (local testing)
 *   node build.js --watch   -- rebuild on any src/ change
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');
const esbuild = require('esbuild');

const ROOT = __dirname;
const SRC  = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// --- Version helpers ---------------------------------------------------------

function readVersion() {
    const pkg = path.join(ROOT, 'package.json');
    try { return JSON.parse(fs.readFileSync(pkg, 'utf8')).version || '1.0.0'; } catch { return '1.0.0'; }
}

function bumpPatch(ver) {
    const parts = String(ver).split('.').map(Number);
    while (parts.length < 3) parts.push(0);
    parts[2]++;
    return parts.join('.');
}

function writeVersion(ver) {
    const pkg = path.join(ROOT, 'package.json');
    try {
        const obj = JSON.parse(fs.readFileSync(pkg, 'utf8'));
        obj.version = ver;
        fs.writeFileSync(pkg, JSON.stringify(obj, null, 2) + '\n', 'utf8');
    } catch { /* ignore */ }
}

function fileHash(filePath) {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
}

const isLocal = process.argv.includes('--local') || process.argv.includes('--local3');
const isWatch = process.argv.includes('--watch');

// --- Page entry points -------------------------------------------------------
const PAGES = [
    'app-shell',
    'bids',
    'club',
    'cup',
    'international-cup',
    'international-cup-coefficients',
    'finances',
    'fixtures',
    'friendly-league',
    'quickmatch',
    'scouts',
    'transfer',
    'youth-development',
    'match',
    'national-teams',
    'national-teams-rankings',
    'player',
    'players',
    'squad',
    'league',
    'stats',
    'training',
    'history',
    'shortlist',
    'import',
    'r5history',
    'dbinspect',
    'dbrepair',
];

// --- Build -------------------------------------------------------------------

async function buildAll() {
    if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

    // Generate a virtual entry point that imports all pages
    const entryContent = PAGES.map(p => `import './pages/${p}.js';`).join('\n') + '\n';
    const entryFile = path.join(SRC, '_main.js');
    fs.writeFileSync(entryFile, entryContent, 'utf8');

    try {
        const result = await esbuild.build({
            entryPoints: [entryFile],
            bundle: true,
            outfile: path.join(DIST, 'tm-bundle.js'),
            format: 'iife',
            platform: 'browser',
            target: 'es2018',
            logLevel: 'warning',
        });

        const bundlePath = path.join(DIST, 'tm-bundle.js');
        const stat = fs.statSync(bundlePath);
        const kb = (stat.size / 1024).toFixed(1);
        const hash = fileHash(bundlePath);
        console.log('[build] OK  dist/tm-bundle.js  (' + kb + ' KB, ' + PAGES.length + ' pages, hash=' + hash + ')');

        if (result.errors.length) {
            console.error('[build] Errors:', result.errors);
        }

        // Bump version + regenerate tm.user.js only when not in watch mode (avoid spam)
        if (!isWatch || !generatedOnce) {
            generateMainStub(hash);
            generatedOnce = true;
        } else {
            generateMainStub(hash);
        }
    } finally {
        if (fs.existsSync(entryFile)) fs.unlinkSync(entryFile);
    }
}

let generatedOnce = false;

function generateMainStub(bundleHash) {
    // Bump patch version on each production build
    const oldVer = readVersion();
    const newVer = bumpPatch(oldVer);
    if (!isLocal) writeVersion(newVer);
    const ver = isLocal ? oldVer : newVer;

    const BASE = isLocal
        ? 'file://H:/projects/Moji/tmscripts'
        : 'https://raw.githubusercontent.com/somi93/tm-script/main';

    // Append hash as cache-buster query string (ignored by GitHub raw delivery but forces
    // Tampermonkey to treat it as a new URL whenever the file content changes)
    const requireUrl = BASE + '/dist/tm-bundle.js?v=' + bundleHash;

    const GITHUB_BASE = 'https://raw.githubusercontent.com/somi93/tm-script/main';
    const lines = [
        '// ==UserScript==',
        '// @name         TM Scripts',
        '// @namespace    https://trophymanager.com',
        '// @version      ' + ver,
        '// @description  TrophyManager enhancement suite',
        '// @match        https://trophymanager.com/*',
        '// @updateURL    ' + GITHUB_BASE + '/tm.user.js',
        '// @downloadURL  ' + GITHUB_BASE + '/tm.user.js',
        '// @require      ' + requireUrl,
        '// @grant        none',
        '// @run-at       document-end',
        '// ==/UserScript==',
        '',
        '// Auto-generated by build.js -- do not edit manually.',
        '// Run `node build.js` to rebuild.',
    ];
    if (isLocal) {
        lines.push('// NOTE: using local file:// URL -- do not commit!');
    }

    fs.writeFileSync(path.join(ROOT, 'tm.user.js'), lines.join('\n'), 'utf8');
    const mode = isLocal ? 'LOCAL (file://)' : 'GITHUB v' + ver + ' (hash=' + bundleHash + ')';
    console.log('[build] OK  tm.user.js  (' + mode + ')');
}

// --- Watch mode --------------------------------------------------------------

if (isWatch) {
    buildAll();
    console.log('[build] Watching for changes...  (Ctrl+C to stop)');

    let debounceTimer = null;
    const rebuild = (filename) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log('[build] Changed: ' + (filename || '?'));
            buildAll();
        }, 150);
    };

    const watchDirs = [
        path.join(SRC, 'lib'),
        path.join(SRC, 'components'),
        path.join(SRC, 'pages'),
    ];
    for (const dir of watchDirs) {
        fs.watch(dir, { recursive: true }, (_, f) => {
            if (f && f.endsWith('.js')) rebuild(f);
        });
    }
} else {
    buildAll().catch(e => {
        console.error('[build] Fatal error:', e.message);
        process.exit(1);
    });
}
