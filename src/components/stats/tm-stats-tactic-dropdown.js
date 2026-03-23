export const TmStatsTacticDropdown = {
    renderDropdown({ label, icon, values, filterSet, key }) {
        const isAll = !filterSet;
        let btnContent;
        if (isAll) {
            btnContent = `<span class="tsa-dd-icon">${icon}</span>${label}: All`;
        } else {
            const tags = [...filterSet].map(v => `<span class="tsa-dd-tag">${v}</span>`).join('');
            btnContent = `<span class="tsa-dd-icon">${icon}</span><span class="tsa-dd-tags">${tags}</span>`;
        }

        let html = '<div class="tsa-dd-wrap">';
        html += `<div class="tsa-dd-btn${isAll ? '' : ' has-filter'}" data-dd="${key}">${btnContent}<span class="tsa-dd-arrow">▾</span></div>`;
        html += `<div class="tsa-dd-panel" data-dd-panel="${key}">`;
        html += `<div class="tsa-dd-opt tsa-dd-all${isAll ? ' selected' : ''}" data-tactic="${key}" data-val="__all__"><span class="tsa-dd-check">${isAll ? '✓' : ''}</span>All<span class="tsa-dd-cnt">${values.reduce((sum, row) => sum + row[1], 0)}</span></div>`;
        values.forEach(([val, cnt]) => {
            const selected = isAll || filterSet.has(val);
            html += `<div class="tsa-dd-opt${selected && !isAll ? ' selected' : ''}" data-tactic="${key}" data-val="${val}"><span class="tsa-dd-check">${selected && !isAll ? '✓' : ''}</span>${val}<span class="tsa-dd-cnt">${cnt}</span></div>`;
        });
        html += '</div></div>';
        return html;
    },

    bindDropdowns(body, { getFilter, setFilter, afterChange }) {
        const closeAllDropdowns = () => {
            body.querySelectorAll('.tsa-dd-panel.open').forEach(panel => panel.classList.remove('open', 'align-right'));
        };

        body.querySelectorAll('.tsa-dd-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.dataset.dd;
                const panel = body.querySelector(`.tsa-dd-panel[data-dd-panel="${key}"]`);
                if (!panel) return;
                const wasOpen = panel.classList.contains('open');
                closeAllDropdowns();
                if (!wasOpen) {
                    panel.classList.add('open');
                    const rect = panel.getBoundingClientRect();
                    if (rect.right > window.innerWidth - 10) {
                        panel.classList.add('align-right');
                    }
                }
            });
        });

        body.querySelectorAll('.tsa-dd-opt').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = opt.dataset.tactic;
                const val = opt.dataset.val;
                const currentSet = getFilter(key);
                const allVals = [...body.querySelectorAll(`.tsa-dd-opt[data-tactic="${key}"]:not(.tsa-dd-all)`)].map(node => node.dataset.val);

                if (val === '__all__') {
                    setFilter(key, null);
                } else if (!currentSet) {
                    setFilter(key, new Set([val]));
                } else if (currentSet.has(val)) {
                    currentSet.delete(val);
                    setFilter(key, currentSet.size === 0 ? null : currentSet);
                } else {
                    currentSet.add(val);
                    setFilter(key, currentSet.size === allVals.length ? null : currentSet);
                }

                afterChange();
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tsa-dd-wrap')) closeAllDropdowns();
        }, { once: true, capture: true });
        body.addEventListener('click', (e) => {
            if (!e.target.closest('.tsa-dd-wrap')) closeAllDropdowns();
        });
    },
};