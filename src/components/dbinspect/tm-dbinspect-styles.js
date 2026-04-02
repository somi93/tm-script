export const TmDbInspectStyles = {
        inject() {
            if (document.getElementById('dbi-styles')) return;
            const style = document.createElement('style');
            style.id = 'dbi-styles';
            style.textContent = `
        .dbi-wrap { max-width: 1400px; margin: var(--tmu-space-xl) auto; font-family: 'Segoe UI', sans-serif; color: var(--tmu-text-strong); }
        .dbi-title { font-size: var(--tmu-font-xl); font-weight: 700; color: var(--tmu-success); margin-bottom: var(--tmu-space-lg); }
        .dbi-stats { color: var(--tmu-text-disabled); margin-bottom: var(--tmu-space-md); font-size: var(--tmu-font-sm); }
        .dbi-player { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-sm); margin-bottom: var(--tmu-space-sm); }
        .dbi-header { display: flex; align-items: center; gap: var(--tmu-space-md); padding: var(--tmu-space-sm) var(--tmu-space-lg); cursor: pointer; user-select: none; }
        .dbi-header:hover { background: var(--tmu-surface-tab-hover); }
        .dbi-arrow { color: var(--tmu-success); font-size: var(--tmu-font-sm); transition: transform 0.15s; min-width: 14px; }
        .dbi-arrow.open { transform: rotate(90deg); }
        .dbi-pid { color: var(--tmu-text-dim); font-size: var(--tmu-font-xs); min-width: 80px; }
        .dbi-name { color: var(--tmu-text-strong); font-weight: 600; min-width: 160px; text-decoration: none; }
        .dbi-name:hover { color: var(--tmu-accent); text-decoration: underline; }
        .dbi-country { color: var(--tmu-text-disabled); font-size: var(--tmu-font-sm); min-width: 50px; }
        .dbi-meta { color: var(--tmu-text-muted); font-size: var(--tmu-font-sm); }
        .dbi-interp-count { color: var(--tmu-warning); font-size: var(--tmu-font-sm); font-weight: 600; margin-right: auto; }
        .dbi-records { display: none; padding: var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-md); }
        .dbi-records.open { display: block; }
        .dbi-rec-tbl { width: 100%; border-collapse: collapse; font-size: var(--tmu-font-sm); }
        .dbi-rec-tbl th { text-align: left; padding: var(--tmu-space-xs) var(--tmu-space-sm); color: var(--tmu-success); border-bottom: 1px solid var(--tmu-border-soft); font-weight: 600; }
        .dbi-rec-tbl td { padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-faint); }
        .dbi-rec-tbl tr.interp td { color: var(--tmu-warning-soft); background: var(--tmu-warning-fill); }
        .dbi-rec-tbl tr.interp2 td { color: var(--tmu-info-strong); background: var(--tmu-info-fill); }
        .dbi-rec-tbl tr.estimated td { color: var(--tmu-purple); background: var(--tmu-accent-fill-soft); }
        .dbi-rec-tbl tr.real td { color: var(--tmu-text-main); }
        .dbi-skills { font-size: var(--tmu-font-xs); white-space: nowrap; }
        .dbi-filter { margin-bottom: var(--tmu-space-lg); display: flex; gap: var(--tmu-space-md); align-items: center; flex-wrap: wrap; }
        .dbi-filter label { color: var(--tmu-text-disabled); font-size: var(--tmu-font-sm); }
        .dbi-filter select { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft); color: var(--tmu-text-strong); padding: var(--tmu-space-xs) var(--tmu-space-sm); border-radius: var(--tmu-space-xs); font-size: var(--tmu-font-sm); }
        .dbi-status { color: var(--tmu-success); font-size: var(--tmu-font-sm); margin-left: var(--tmu-space-sm); }
        .dbi-rec-tbl tr.live td { color: var(--tmu-text-live); background: var(--tmu-live-fill); font-weight: 600; }
        .dbi-preview-wrap { margin-top: var(--tmu-space-md); border-top: 2px dashed var(--tmu-border-highlight); padding-top: var(--tmu-space-sm); }
        .dbi-preview-title { color: var(--tmu-warning-soft); font-size: var(--tmu-font-xs); font-weight: 700; margin-bottom: var(--tmu-space-xs); }
        .dbi-preview-anchor { font-size: var(--tmu-font-xs); color: var(--tmu-text-disabled); margin-bottom: var(--tmu-space-xs); }
        .dbi-rec-tbl tr.preview-interp td { color: var(--tmu-text-preview); background: var(--tmu-preview-fill); font-style: italic; }
        .dbi-rec-tbl tr.preview-real td { color: var(--tmu-text-highlight); background: var(--tmu-highlight-fill); font-weight: 700; }
`;
            document.head.appendChild(style);
        }
    };

