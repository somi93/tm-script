export const TmAppShellDrawer = {
    render({ clubName, logo, groups, currentPath, openGroupId }) {
        return `
            <aside id="tmvu-drawer">
                <div class="tmvu-brand">
                    ${logo
                        ? `<img class="tmvu-brand-logo" src="${logo}" alt="${clubName}">`
                        : '<div class="tmvu-brand-mark">TM</div>'}
                    <div class="tmvu-brand-copy">
                        <strong>${clubName}</strong>
                    </div>
                </div>
                <nav class="tmvu-nav">
                    ${groups.map(group => this.renderGroup(group, currentPath, openGroupId)).join('')}
                </nav>
            </aside>
        `;
    },

    renderGroup(group, currentPath, openGroupId) {
        const isOpen = openGroupId === group.id;
        const isCurrent = group.children.some(child => child.href === currentPath);

        return `
            <section class="tmvu-group${isOpen ? ' is-open' : ''}${isCurrent ? ' is-current' : ''}" data-group-id="${group.id}">
                <div class="tmvu-group-header">
                    <button class="tmvu-group-trigger" type="button" data-group-trigger="${group.id}" aria-expanded="${isOpen ? 'true' : 'false'}">
                        <span class="tmvu-icon ${group.iconClass}"></span>
                        <span class="tmvu-group-label">${group.label}</span>
                        <span class="tmvu-group-caret"></span>
                    </button>
                </div>
                <div class="tmvu-group-panel">
                    ${group.children.map(child => `
                        <a class="tmvu-subitem${child.href === currentPath ? ' is-active' : ''}" href="${child.href}">
                            <span class="tmvu-subitem-dot"></span>
                            <span class="tmvu-subitem-label">${child.label}</span>
                        </a>
                    `).join('')}
                </div>
            </section>
        `;
    },
};
