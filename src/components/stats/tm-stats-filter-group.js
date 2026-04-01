export const TmStatsFilterGroup = {
    renderGroup({ items, active, wrapCls, itemCls, dataAttr, renderItem }) {
        let html = `<div class="${wrapCls}">`;
        items.forEach(item => {
            const key = String(item.key);
            const activeCls = String(active) === key ? ' active' : '';
            html += `<div class="${itemCls}${activeCls}" data-${dataAttr}="${key}">${renderItem(item)}</div>`;
        });
        html += '</div>';
        return html;
    },

    bindGroup(container, { selector, dataAttr, onChange }) {
        if (!container) return;
        if (!container.__tmStatsFilterBindings) container.__tmStatsFilterBindings = new Map();

        const bindingKey = `${selector}::${dataAttr}`;
        if (container.__tmStatsFilterBindings.has(bindingKey)) {
            container.__tmStatsFilterBindings.set(bindingKey, onChange);
            return;
        }

        container.__tmStatsFilterBindings.set(bindingKey, onChange);
        container.addEventListener('click', (event) => {
            const target = event.target.closest(selector);
            if (!target || !container.contains(target)) return;
            const handler = container.__tmStatsFilterBindings.get(bindingKey);
            if (!handler) return;
            handler(target.dataset[dataAttr]);
        });
    },
};