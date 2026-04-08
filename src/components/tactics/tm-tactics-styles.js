const STYLE_ID = 'tmtc-style';

export function injectTacticsStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const pitchSvg = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 420">`,
        `<rect x="0" y="0" width="280" height="420" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>`,
        // corner arcs
        `<path d="M2,18 A16,16 0 0,0 18,2" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<path d="M262,2 A16,16 0 0,0 278,18" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<path d="M2,402 A16,16 0 0,1 18,418" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<path d="M262,418 A16,16 0 0,1 278,402" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        // center line + circle
        `<line x1="2" y1="210" x2="278" y2="210" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>`,
        `<circle cx="140" cy="210" r="52" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>`,
        `<circle cx="140" cy="210" r="3" fill="rgba(255,255,255,0.35)"/>`,
        // top penalty area + goal area
        `<path d="M56,2 L56,74 L224,74 L224,2" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<line x1="95" y1="2" x2="95" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<line x1="95" y1="28" x2="185" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<line x1="185" y1="2" x2="185" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<circle cx="140" cy="68" r="2.5" fill="rgba(255,255,255,0.3)"/>`,
        // bottom penalty area + goal area
        `<path d="M56,418 L56,346 L224,346 L224,418" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<line x1="95" y1="392" x2="95" y2="418" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<line x1="95" y1="392" x2="185" y2="392" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<line x1="185" y1="392" x2="185" y2="418" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
        `<circle cx="140" cy="352" r="2.5" fill="rgba(255,255,255,0.3)"/>`,
        `</svg>`,
    ].join('');
    const pitchBg = `url("data:image/svg+xml,${encodeURIComponent(pitchSvg)}")` ;

    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        /* ── full-width override ── */
        body:has(.tmtc-page) .tmvu-main {
            width: calc(100% - 24px) !important;
            max-width: none !important;
            overflow: hidden;
        }

        /* ── page layout ── */
        .tmtc-page {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1 1 0;
            gap: var(--tmu-space-lg);
        }

        /* ── 3-col main grid ── */
        .tmtc-main-grid {
            display: flex;
            gap: var(--tmu-space-md);
            align-items: flex-start;
        }
        .tmtc-main-left {
            flex: 0 0 auto;
            flex-shrink: 0;
            min-width: 0;
            display: flex;
            flex-direction: column;
        }
        .tmtc-main-mid {
            flex: 1 1 0;
            min-width: 0;
        }
        .tmtc-main-right {
            flex: 0 0 400px;
            min-width: 0;
        }

        /* ── formation grid ── */
        .tmtc-lineup-2col {
            display: flex;
            gap: var(--tmu-space-md);
            align-items: stretch;
            flex: 1 1 0;
            min-height: 0;
        }
        .tmtc-field-col {
            flex: 0 0 auto;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--tmu-space-sm);
        }
        .tmtc-squad-col {
            flex: 1 1 0;
            min-width: 0;
            height: 100%;
            overflow-y: auto;
        }
        .tmtc-field {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            flex: 0 0 auto;
            height: calc(100dvh - 160px);
            aspect-ratio: 2 / 3;
            background-color: rgb(19 19 19);
            background-image: ${pitchBg};
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border: 1px solid rgba(255,255,255,0.1);
            overflow: hidden;
        }
        .tmtc-field-spacer {
            flex: 0 0 8%;
        }
        .tmtc-field-line {
            display: flex;
            flex-direction: column;
            gap: 2px;
            height: 16.66666%;
            justify-content: center;
        }
        .tmtc-line {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
        }
        .tmtc-slot-spacer {
            /* empty cell to maintain 5-col grid alignment */
        }
        .tmtc-line-label {
            font-size: var(--tmu-font-2xs);
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.4);
            text-align: center;
        }
        .tmtc-slot {
            flex: 1 1 0;
            min-width: 48px;
            max-width: 100px;
            padding: var(--tmu-space-xs) 4px;
            border-radius: var(--tmu-space-sm);
            background: rgba(0,0,0,0.45);
            backdrop-filter: blur(2px);
            border: 1px solid rgba(255,255,255,0.14);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
            text-align: center;
            text-decoration: none;
            cursor: grab;
            user-select: none;
            transition: background .12s, border-color .12s;
        }
        .tmtc-slot[draggable="true"]:active { cursor: grabbing; }
        .tmtc-slot:hover:not(.tmtc-slot-empty) {
            background: rgba(0,0,0,0.65);
            border-color: rgba(255,255,255,0.28);
        }
        .tmtc-slot-empty {
            opacity: .35;
        }
        .tmtc-slot-no {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            color: var(--tmu-text-faint);
            font-variant-numeric: tabular-nums;
        }
        .tmtc-slot-name {
            font-size: var(--tmu-font-xs);
            font-weight: 600;
            color: var(--tmu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }
        .tmtc-slot-pos {
            font-key: var(--tmu-font-2xs);
        }
        .tmtc-slot-rec {
            font-size: var(--tmu-font-2xs);
            color: var(--tmu-warning);
        }
        .tmtc-slot-poskey {
            font-size: var(--tmu-font-2xs);
            color: var(--tmu-text-muted);
            text-transform: uppercase;
            letter-spacing: .05em;
        }

        /* ── bench (below field) ── */
        .tmtc-bench-col {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            margin-bottom: var(--tmu-space-sm);
        }
        .tmtc-bench-section-head {
            grid-column: 1 / -1;
            font-size: var(--tmu-font-2xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--tmu-text-panel-label);
            padding-top: var(--tmu-space-xs);
        }
        .tmtc-bench-slot {
            padding: 3px 4px;
            border-radius: var(--tmu-space-sm);
            background: var(--tmu-surface-dark-soft);
            border: 1px dashed var(--tmu-border-faint);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
            min-height: 42px;
            text-align: center;
            cursor: default;
        }
        .tmtc-bench-slot:hover {
            background: var(--tmu-surface-tab-hover);
        }
        .tmtc-bench-slot.has-player {
            border-style: solid;
            border-color: var(--tmu-border-embedded);
        }
        .tmtc-bench-role {
            font-size: var(--tmu-font-2xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--tmu-text-panel-label);
            line-height: 1.2;
        }
        .tmtc-bench-name {
            font-size: var(--tmu-font-2xs);
            font-weight: 600;
            color: var(--tmu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }
        .tmtc-bench-empty {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-disabled);
            font-style: italic;
        }

        .tmtc-row-bench-placeholder td {
            opacity: .55;
            font-style: italic;
            cursor: default;
        }
        .tmtc-row-bench-placeholder.tmtc-drag-over td {
            opacity: 1;
            background: rgba(77,171,247,0.08);
        }
        /* ── player list ── */
        .tmtc-filters {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-sm);
            align-items: center;
            margin-bottom: var(--tmu-space-md);
        }
        .tmtc-filter-group {
            display: flex;
            gap: 2px;
        }
        .tmtc-filter-sep {
            width: 1px;
            background: var(--tmu-border-soft-alpha);
            align-self: stretch;
            margin: 0 var(--tmu-space-xs);
        }

        /* ── settings ── */
        .tmtc-settings-rows {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-sm);
        }
        .tmtc-setting-row {
            flex-direction: column;
            align-items: stretch;
            gap: var(--tmu-space-xs);
        }

        /* ── orders table ── */
        .tmtc-orders-empty {
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-muted);
            padding: var(--tmu-space-lg) 0;
            text-align: center;
        }
        .tmtc-order-check { color: var(--tmu-success); font-weight: 700; }
        .tmtc-order-pending { color: var(--tmu-text-disabled); }
        .tmtc-order-action-cell { display: flex; flex-direction: column; gap: 2px; }
        .tmtc-order-action-type {
            font-size: var(--tmu-font-2xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .07em;
            color: var(--tmu-text-panel-label);
        }
        .tmtc-order-action-val {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-main);
        }

        /* ── ghost placeholders: only visible during drag ── */
        .tmtc-slot.tmtc-slot-empty { visibility: hidden; }
        .tmtc-slot-spacer { visibility: hidden; }
        .tmtc-field.is-dragging .tmtc-slot.tmtc-slot-empty,
        .tmtc-field.is-dragging .tmtc-slot-spacer { visibility: visible; }

        /* ── drag-and-drop visuals ── */
        .tmtc-drag-over {
            outline: 2px dashed var(--tmu-info, #4dabf7) !important;
            outline-offset: -2px;
            background: rgba(77,171,247,0.10) !important;
        }
        .tmtc-drag-source {
            opacity: 0.40;
        }
        .tmtc-bench-inner {
            width: 100%;
            cursor: grab;
            user-select: none;
        }
        .tmtc-bench-inner:active { cursor: grabbing; }

        /* ── save status bar ── */
        .tmtc-save-status {
            min-height: 0;
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            text-align: right;
            padding: 0 var(--tmu-space-sm);
            transition: opacity .3s;
            opacity: 0;
        }
        .tmtc-save-status:not(:empty) { opacity: 1; }
        .tmtc-save-ok  { color: var(--tmu-success); }
        .tmtc-save-err { color: var(--tmu-danger);  }

        .tmtc-row-sep td {
            border-top: 2px solid !important;
            border-color: var(--tmu-border-pill-active) !important;
            border-bottom: none !important;
        }

        /* ── squad table column ── */
        .tmtc-row-on-field td {
            background: rgba(70,200,120,0.08) !important;
        }
        .tmtc-row-on-bench td {
            background: rgba(70,140,200,0.06) !important;
        }
        .tmtc-row-out td {
            opacity: 0.45;
        }
        .tmtc-sub-badge {
            display: inline-block;
            font-size: var(--tmu-font-3xs);
            font-weight: 800;
            letter-spacing: .06em;
            padding: 1px 5px;
            border-radius: 4px;
            background: var(--tmu-surface-dark-soft);
            color: var(--tmu-text-muted);
            border: 1px solid var(--tmu-border-faint);
        }
        .tmtc-pb-cell {
            width: 5px !important;
            padding: 0 !important;
        }
        .tmtc-pb-inner {
            display: block;
            width: 4px;
            min-height: 16px;
            border-radius: 2px;
        }

        @media (max-width: 900px) {
            .tmtc-lineup-2col  { flex-direction: column; }
            .tmtc-field-col    { flex: 0 0 auto; width: 100%; max-width: 100%; }
        }

        /* ── foreigners notice ── */
        .tmtc-foreigners-note {
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-muted);
            padding: var(--tmu-space-md);
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        /* ── conditional orders table ── */
        .tmtc-co-row-empty td { opacity: 0.35; }
        .tmu-tbl tbody tr[data-ri] { cursor: grab; }
        .tmu-tbl tbody tr[data-ri]:hover td { background: var(--tmu-surface-hover) !important; }
        .tmu-tbl tbody tr.tmtc-co-row-dragging td { opacity: 0.4; }
        .tmu-tbl tbody tr.tmtc-co-row-drag-over td { background: var(--tmu-primary-muted) !important; outline: 2px dashed var(--tmu-primary); }

        /* ── conditional orders dialog ── */
        .tmtc-co-dialog-body {
            display: flex; border-bottom: 1px solid var(--tmu-border-faint);
        }
        .tmtc-co-col {
            flex: 1; min-width: 0;
            padding: var(--tmu-space-md);
            border-right: 1px solid var(--tmu-border-faint);
            overflow-y: auto; max-height: 65vh;
        }
        .tmtc-co-col:last-child { border-right: none; }
        .tmtc-co-col-label {
            font-size: var(--tmu-font-xs); font-weight: 700; text-transform: uppercase;
            letter-spacing: .06em; color: var(--tmu-text-faint);
            padding-bottom: var(--tmu-space-xs);
            border-bottom: 1px solid var(--tmu-border-faint);
            margin-bottom: var(--tmu-space-sm);
        }
        .tmtc-co-radio-item {
            border-radius: 6px;
        }
        .tmtc-co-radio-row {
            display: flex; align-items: center; gap: 10px;
            padding: 7px 8px; cursor: pointer; border-radius: 6px;
            border: 1px solid transparent;
            transition: background .1s, border-color .1s;
        }
        .tmtc-co-radio-row:hover { background: var(--tmu-surface-hover); border-color: var(--tmu-border-faint); }
        .tmtc-co-radio-item.selected .tmtc-co-radio-row {
            background: var(--tmu-primary-muted); border-color: var(--tmu-primary);
        }
        .tmtc-co-radio-input {
            width: 15px; height: 15px; flex-shrink: 0;
            accent-color: var(--tmu-primary); cursor: pointer;
        }
        .tmtc-co-radio-txt { font-size: var(--tmu-font-sm); color: var(--tmu-text-muted); line-height: 1.3; }
        .tmtc-co-radio-item.selected .tmtc-co-radio-txt { font-weight: 700; color: var(--tmu-text-strong); }
        .tmtc-co-radio-sub {
            padding: var(--tmu-space-xs) var(--tmu-space-sm) var(--tmu-space-sm) 28px;
            display: flex; flex-direction: column; gap: var(--tmu-space-xs);
        }
        .tmtc-co-radio-sub:empty { display: none; }
        .tmtc-co-param-label {
            font-size: var(--tmu-font-xs); font-weight: 600;
            color: var(--tmu-text-muted); margin-top: var(--tmu-space-xs);
        }
        .tmtc-co-chips { display: flex; flex-wrap: wrap; gap: 4px; }
        .tmtc-co-modal-footer {
            display: flex; gap: var(--tmu-space-sm);
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border-top: 1px solid var(--tmu-border-faint);
            flex-shrink: 0;
        }

        /* ── analytics/formation panel (4th column) ── */
        .tmtc-main-stats {
            flex: 0 0 270px;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-md);
            overflow-y: auto;
        }
        .tmtc-panel-row {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
        }
        .tmtc-panel-fm-badge {
            font-size: var(--tmu-font-xl);
            font-weight: 900;
            color: var(--tmu-text-strong);
            letter-spacing: .03em;
            white-space: nowrap;
            flex-shrink: 0;
            min-width: 72px;
        }
        .tmtc-panel-stats {
            display: flex;
            flex-direction: column;
        }
        .tmtc-panel-sep {
            border: none;
            border-top: 1px solid var(--tmu-border-soft-alpha);
            margin: 0;
        }
    `;
    document.head.appendChild(s);
}
