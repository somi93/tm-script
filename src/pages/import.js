export function initImportPage(main) {
    if (!main || !main.isConnected) return;

    main.innerHTML = `
        <section class="tmu-panel-page" style="padding:24px; display:grid; gap:12px;">
            <h2 style="margin:0;">Import Disabled</h2>
            <p style="margin:0; color:var(--tmu-text-muted);">
                DB migration, interpolation, and record-writing flows have been removed from this build.
            </p>
        </section>
    `;
}
