// tm-player-styles.js - Player page CSS injection
// Depends on: nothing
// Exposed as: TmPlayerStyles = { inject }

    const inject = () => {
        if (document.getElementById('tsa-player-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-player-style';
        style.textContent = `
body.tmvu-shell-active .tmvu-main.tmvu-player-page {
    display: block !important;
}

body.tmvu-shell-active .tmvu-main.tmvu-player-page.tmvp-shell-pending > .column1,
body.tmvu-shell-active .tmvu-main.tmvu-player-page.tmvp-shell-pending > .column2_a,
body.tmvu-shell-active .tmvu-main.tmvu-player-page.tmvp-shell-pending > .column3_a,
body.tmvu-shell-active .tmvu-main.tmvu-player-page.tmvp-shell-pending > :not(#tmvp-layout) {
    display: none !important;
}

body.tmvu-shell-active .tmvu-main.tmvu-player-page:not(.tmvp-shell-ready) > #tmvp-layout {
    visibility: hidden;
}

#tmvp-layout {
    --tmu-page-sidebar-width: minmax(248px, 286px);
    --tmu-page-main-track: minmax(0, 1fr);
    --tmu-page-rail-width: minmax(304px, 340px);
    --tmu-page-gap: var(--tmu-space-lg);
    --tmu-section-gap: var(--tmu-space-lg);
}

#tmvp-layout > * {
    min-width: 0;
}

#tmvp-left,
#tmvp-right {
    align-self: start;
}

#tmvp-main > *,
#tmvp-left > *,
#tmvp-right > * {
    width: 100%;
}

#tmvp-left > .box {
    display: none !important;
}

/* -- Hide native TM tabs -- */
.tabs_outer { display: none !important; }
.tabs_content { display: none !important; }

@media (max-width: 760px) {
    #tmvp-layout {
        --tmu-page-gap: var(--tmu-space-md);
        --tmu-section-gap: var(--tmu-space-md);
    }
}

`;
        document.head.appendChild(style);
    };

    export const TmPlayerStyles = { inject };
