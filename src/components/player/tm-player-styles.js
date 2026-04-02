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

#tmvp-layout {
    display: grid;
    grid-template-columns: minmax(248px, 286px) minmax(0, 1fr) minmax(294px, 330px);
    gap: var(--tmu-space-md);
    align-items: start;
}

#tmvp-layout > * {
    min-width: 0;
}

#tmvp-left,
#tmvp-right {
    display: flex;
    flex-direction: column;
    gap: var(--tmu-space-md);
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

@media (max-width: 1080px) {
    #tmvp-layout {
        grid-template-columns: minmax(248px, 286px) minmax(0, 1fr);
    }

    #tmvp-right {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 760px) {
    #tmvp-layout,
    #tmvp-right {
        grid-template-columns: 1fr;
    }
}

`;
        document.head.appendChild(style);
    };

    export const TmPlayerStyles = { inject };
