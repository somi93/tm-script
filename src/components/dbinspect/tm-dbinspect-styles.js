export const TmDbInspectStyles = {
        inject() {
            if (document.getElementById('dbi-styles')) return;
            const style = document.createElement('style');
            style.id = 'dbi-styles';
            style.textContent = `
        .dbi-wrap { max-width: 1400px; margin: 20px auto; font-family: 'Segoe UI', sans-serif; color: var(--tmu-text-strong); }
        .dbi-title { font-size: 22px; font-weight: 700; color: var(--tmu-success); margin-bottom: 16px; }
        .dbi-stats { color: var(--tmu-text-disabled); margin-bottom: 12px; font-size: 13px; }
        .dbi-player { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft); border-radius: 6px; margin-bottom: 8px; }
        .dbi-header { display: flex; align-items: center; gap: 12px; padding: 8px 14px; cursor: pointer; user-select: none; }
        .dbi-header:hover { background: var(--tmu-surface-tab-hover); }
        .dbi-arrow { color: var(--tmu-success); font-size: 12px; transition: transform 0.15s; min-width: 14px; }
        .dbi-arrow.open { transform: rotate(90deg); }
        .dbi-pid { color: var(--tmu-text-dim); font-size: 11px; min-width: 80px; }
        .dbi-name { color: var(--tmu-text-strong); font-weight: 600; min-width: 160px; text-decoration: none; }
        .dbi-name:hover { color: var(--tmu-accent); text-decoration: underline; }
        .dbi-country { color: var(--tmu-text-disabled); font-size: 12px; min-width: 50px; }
        .dbi-meta { color: var(--tmu-text-muted); font-size: 12px; }
        .dbi-interp-count { color: var(--tmu-warning); font-size: 12px; font-weight: 600; margin-right: auto; }
        .dbi-records { display: none; padding: 6px 14px 10px; }
        .dbi-records.open { display: block; }
        .dbi-rec-tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
        .dbi-rec-tbl th { text-align: left; padding: 3px 6px; color: var(--tmu-success); border-bottom: 1px solid var(--tmu-border-soft); font-weight: 600; }
        .dbi-rec-tbl td { padding: 3px 6px; border-bottom: 1px solid var(--tmu-border-faint); }
        .dbi-rec-tbl tr.interp td { color: var(--tmu-warning-soft); background: var(--tmu-warning-fill); }
        .dbi-rec-tbl tr.interp2 td { color: var(--tmu-info-strong); background: var(--tmu-info-fill); }
        .dbi-rec-tbl tr.estimated td { color: var(--tmu-purple); background: var(--tmu-accent-fill-soft); }
        .dbi-rec-tbl tr.real td { color: var(--tmu-text-main); }
        .dbi-skills { font-size: 11px; white-space: nowrap; }
        .dbi-filter { margin-bottom: 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dbi-filter label { color: var(--tmu-text-disabled); font-size: 13px; }
        .dbi-filter select { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft); color: var(--tmu-text-strong); padding: 4px 8px; border-radius: 4px; font-size: 13px; }
        .dbi-status { color: var(--tmu-success); font-size: 12px; margin-left: 8px; }
        .dbi-rec-tbl tr.live td { color: var(--tmu-text-live); background: var(--tmu-live-fill); font-weight: 600; }
        .dbi-preview-wrap { margin-top: 10px; border-top: 2px dashed var(--tmu-border-highlight); padding-top: 8px; }
        .dbi-preview-title { color: var(--tmu-warning-soft); font-size: 11px; font-weight: 700; margin-bottom: 4px; }
        .dbi-preview-anchor { font-size: 11px; color: var(--tmu-text-disabled); margin-bottom: 4px; }
        .dbi-rec-tbl tr.preview-interp td { color: var(--tmu-text-preview); background: var(--tmu-preview-fill); font-style: italic; }
        .dbi-rec-tbl tr.preview-real td { color: var(--tmu-text-highlight); background: var(--tmu-highlight-fill); font-weight: 700; }
`;
            document.head.appendChild(style);
        }
    };

