export const TmDbInspectStyles = {
        inject() {
            if (document.getElementById('dbi-styles')) return;
            const style = document.createElement('style');
            style.id = 'dbi-styles';
            style.textContent = `
        .dbi-wrap { max-width: 1400px; margin: 20px auto; font-family: 'Segoe UI', sans-serif; color: #e0e0e0; }
        .dbi-title { font-size: 22px; font-weight: 700; color: #6cc040; margin-bottom: 16px; }
        .dbi-stats { color: #aaa; margin-bottom: 12px; font-size: 13px; }
        .dbi-player { background: #1a2a10; border: 1px solid #2a3a18; border-radius: 6px; margin-bottom: 8px; }
        .dbi-header { display: flex; align-items: center; gap: 12px; padding: 8px 14px; cursor: pointer; user-select: none; }
        .dbi-header:hover { background: #223314; }
        .dbi-arrow { color: #6cc040; font-size: 12px; transition: transform 0.15s; min-width: 14px; }
        .dbi-arrow.open { transform: rotate(90deg); }
        .dbi-pid { color: #5a7a48; font-size: 11px; min-width: 80px; }
        .dbi-name { color: #e8f5d8; font-weight: 600; min-width: 160px; text-decoration: none; }
        .dbi-name:hover { color: #a0e060; text-decoration: underline; }
        .dbi-country { color: #aaa; font-size: 12px; min-width: 50px; }
        .dbi-meta { color: #8a8; font-size: 12px; }
        .dbi-interp-count { color: #f0c040; font-size: 12px; font-weight: 600; margin-right: auto; }
        .dbi-records { display: none; padding: 6px 14px 10px; }
        .dbi-records.open { display: block; }
        .dbi-rec-tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
        .dbi-rec-tbl th { text-align: left; padding: 3px 6px; color: #6cc040; border-bottom: 1px solid #2a3a18; font-weight: 600; }
        .dbi-rec-tbl td { padding: 3px 6px; border-bottom: 1px solid #1e2e14; }
        .dbi-rec-tbl tr.interp td { color: #e8a050; background: #2a1a10; }
        .dbi-rec-tbl tr.interp2 td { color: #60b0ff; background: #101a2a; }
        .dbi-rec-tbl tr.estimated td { color: #c090ff; background: #1a1030; }
        .dbi-rec-tbl tr.real td { color: #c0e0b0; }
        .dbi-skills { font-size: 11px; white-space: nowrap; }
        .dbi-filter { margin-bottom: 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dbi-filter label { color: #aaa; font-size: 13px; }
        .dbi-filter select { background: #1a2a10; border: 1px solid #2a3a18; color: #e0e0e0; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
        .dbi-status { color: #6cc040; font-size: 12px; margin-left: 8px; }
        .dbi-rec-tbl tr.live td { color: #80ffcc; background: #0a2a1a; font-weight: 600; }
        .dbi-preview-wrap { margin-top: 10px; border-top: 2px dashed #4a3a10; padding-top: 8px; }
        .dbi-preview-title { color: #f0c060; font-size: 11px; font-weight: 700; margin-bottom: 4px; }
        .dbi-preview-anchor { font-size: 11px; color: #888; margin-bottom: 4px; }
        .dbi-rec-tbl tr.preview-interp td { color: #a0c8ff; background: #0a1830; font-style: italic; }
        .dbi-rec-tbl tr.preview-real td { color: #ffe080; background: #2a1a00; font-weight: 700; }
`;
            document.head.appendChild(style);
        }
    };

