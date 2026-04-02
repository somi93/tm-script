let dropdownDocumentBound = false;
const dropdownBodies = new Set();

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
        html += `<div class="tsa-dd-panel" data-dd-panel="${key}" data-option-count="${values.length}">`;
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

        body.__tmStatsTacticDropdownCtx = { getFilter, setFilter, afterChange, closeAllDropdowns };
        dropdownBodies.add(body);

        if (!dropdownDocumentBound) {
            document.addEventListener('click', (e) => {
                if (e.target.closest('.tsa-dd-wrap')) return;
                dropdownBodies.forEach(dropdownBody => {
                    dropdownBody.__tmStatsTacticDropdownCtx?.closeAllDropdowns();
                });
            }, true);
            dropdownDocumentBound = true;
        }

        if (body.__tmStatsTacticDropdownBound) {
            return;
        }
        body.__tmStatsTacticDropdownBound = true;

        body.addEventListener('click', (e) => {
            const ctx = body.__tmStatsTacticDropdownCtx;
            if (!ctx) return;

            const btn = e.target.closest('.tsa-dd-btn');
            if (btn && body.contains(btn)) {
                e.stopPropagation();
                const key = btn.dataset.dd;
                const panel = body.querySelector(`.tsa-dd-panel[data-dd-panel="${key}"]`);
                if (!panel) return;
                const wasOpen = panel.classList.contains('open');
                ctx.closeAllDropdowns();
                if (!wasOpen) {
                    panel.classList.add('open');
                    const rect = panel.getBoundingClientRect();
                    if (rect.right > window.innerWidth - 10) {
                        panel.classList.add('align-right');
                    }
                }
                return;
            }

            const opt = e.target.closest('.tsa-dd-opt');
            if (opt && body.contains(opt)) {
                e.stopPropagation();
                const key = opt.dataset.tactic;
                const val = opt.dataset.val;
                const currentSet = ctx.getFilter(key);
                const panel = opt.closest('.tsa-dd-panel');
                const optionCount = Number(panel?.dataset.optionCount) || 0;

                if (val === '__all__') {
                    ctx.setFilter(key, null);
                } else if (!currentSet) {
                    ctx.setFilter(key, new Set([val]));
                } else if (currentSet.has(val)) {
                    currentSet.delete(val);
                    ctx.setFilter(key, currentSet.size === 0 ? null : currentSet);
                } else {
                    currentSet.add(val);
                    ctx.setFilter(key, optionCount > 0 && currentSet.size === optionCount ? null : currentSet);
                }

                ctx.afterChange();
                return;
            }

            if (!e.target.closest('.tsa-dd-wrap')) ctx.closeAllDropdowns();
        });
    },
};