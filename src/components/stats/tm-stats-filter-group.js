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
        container.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', () => {
                onChange(btn.dataset[dataAttr]);
            });
        });
    },
};