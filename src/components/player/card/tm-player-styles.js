// tm-player-styles.js - Player page CSS injection
// Depends on: nothing
// Exposed as: TmPlayerStyles = { inject }

    const inject = () => {
        if (document.getElementById('tsa-player-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-player-style';
        style.textContent = `

#tmvp-layout {
    width: 100%;
    --tmu-page-sidebar-width: minmax(220px, 250px);
    --tmu-page-main-track: minmax(0, 1fr);
    --tmu-page-rail-width: minmax(280px, 320px);
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

`;
        document.head.appendChild(style);
    };

    export const TmPlayerStyles = { inject };
