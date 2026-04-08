import { TmMatchRow } from './tm-match-row.js';
import { TmSideMenu } from './tm-side-menu.js';

export const TmTournamentPage = {
    mount(main, {
        pageClass,
        navId,
        navClass,
        menuItems = [],
        currentHref = '',
        mainClass,
        sideClass,
        mainNodes = [],
        sideNodes = [],
        season = null,
    } = {}) {
        if (!main) return;

        main.innerHTML = '';
        if (pageClass) main.classList.add(...String(pageClass).split(/\s+/).filter(Boolean));

        TmSideMenu.mount(main, {
            id: navId,
            className: navClass,
            items: menuItems,
            currentHref,
        });

        const mainColumn = document.createElement('section');
        if (mainClass) mainColumn.className = mainClass;
        mainNodes.filter(Boolean).forEach(node => mainColumn.appendChild(node));

        let sideColumn = null;
        if (sideNodes.filter(Boolean).length) {
            sideColumn = document.createElement('aside');
            if (sideClass) sideColumn.className = sideClass;
            sideNodes.filter(Boolean).forEach(node => sideColumn.appendChild(node));
        }

        main.append(mainColumn);
        if (sideColumn) main.append(sideColumn);
        TmMatchRow.enhance(main, { season });

        return { mainColumn, sideColumn };
    },
};