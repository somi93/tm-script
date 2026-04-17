import { TmSectionCard } from '../shared/tm-section-card.js';
import { TmSideMenu } from '../shared/tm-side-menu.js';
import { esc, clean } from './tm-forum-utils.js';

export const TmForumSidebar = {
    /**
     * Parse sidebar data from TM DOM.
     * @param {Element} src
     * @returns {{ countryOptions, currentCountry, menuGroups }}
     */
    parse(src) {
        const countryOptions = Array.from(src.querySelectorAll('#menu_country_select_hidden option')).map(o => ({
            val: o.value,
            label: clean(o.textContent),
            sel: o.getAttribute('selected') !== null || o.selected,
        }));

        const urlMatch = window.location.pathname.match(/^\/forum\/([^/]+)\//i);
        const urlCode = urlMatch ? urlMatch[1].toLowerCase() : '';

        let activeOption = countryOptions.find(o => o.val.toLowerCase() === urlCode);
        if (!activeOption && urlCode) {
            activeOption = countryOptions.find(o =>
                o.val.toLowerCase() === urlCode ||
                o.label.toLowerCase().replace(/\s*\[.*$/, '').trim() === urlCode
            );
        }
        if (activeOption) {
            countryOptions.forEach(o => { o.sel = false; });
            activeOption.sel = true;
        }

        const currentCountry = activeOption
            ? clean(activeOption.label.replace(/\s*\[.*$/, ''))
            : (urlCode === 'int' ? 'International' : clean(
                src.querySelector('.dark .white')?.firstChild?.textContent ||
                src.querySelector('.dark .white')?.textContent || ''
            ));

        const menuGroups = (() => {
            const result = [];
            let group = { title: '', items: [] };
            result.push(group);
            src.querySelectorAll('.content_menu > *').forEach(node => {
                if (node.tagName === 'H3') {
                    group = { title: clean(node.textContent), items: [] };
                    result.push(group);
                } else if (node.tagName === 'A') {
                    group.items.push({
                        href: node.getAttribute('href') || '#',
                        label: clean(node.textContent),
                        active: node.classList.contains('selected'),
                    });
                }
            });
            return result.filter(g => g.items.length);
        })();

        return { countryOptions, currentCountry, menuGroups };
    },

    /**
     * Mount the sidebar into host.
     * @param {Element} host
     * @param {{ countryOptions, currentCountry, menuGroups }} props
     * @returns {Element}
     */
    mount(host, { countryOptions, currentCountry, menuGroups }) {
        const sidebar = document.createElement('aside');
        sidebar.className = 'tmvu-forum-sidebar tmu-page-sidebar-stack';

        const scopeHost = document.createElement('div');
        TmSectionCard.mount(scopeHost, {
            title: currentCountry || 'Scope',
            icon: '\uD83C\uDF0D',
            bodyHtml: '<div class="tmvu-forum-country-wrap">'
                + '<select class="tmvu-forum-country-select" data-forum-country>'
                + countryOptions.map(o =>
                    '<option value="' + esc(o.val) + '"' + (o.sel ? ' selected' : '') + '>' + esc(o.label) + '</option>'
                ).join('')
                + '</select></div>',
        });
        sidebar.appendChild(scopeHost.firstElementChild || scopeHost);

        const activeItem = menuGroups.flatMap(g => g.items).find(item => item.active);
        const currentHref = activeItem?.href || window.location.pathname;
        const navItems = [];
        menuGroups.forEach((g, i) => {
            if (i > 0) navItems.push({ type: 'separator' });
            if (g.title) navItems.push({ type: 'subtitle', label: g.title });
            g.items.forEach(item => navItems.push({ type: 'link', href: item.href, label: item.label }));
        });

        const navHost = document.createElement('div');
        const navEl = TmSideMenu.mount(navHost, { id: 'tmvu-forum-channels-nav', items: navItems, currentHref });
        if (navEl) sidebar.appendChild(navEl);

        sidebar.querySelector('[data-forum-country]')?.addEventListener('change', (e) => {
            window.location.assign('/forum/' + e.target.value + '/general/');
        });

        host.appendChild(sidebar);
        return sidebar;
    },
};
