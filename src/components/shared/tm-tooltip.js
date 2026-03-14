export const TmTooltip = {
    /**
     * Positions a body-appended tooltip near an anchor element,
     * clamping to right and bottom viewport edges.
     *
     * @param {HTMLElement} el     — tooltip element (already in DOM)
     * @param {Element}     anchor — element to anchor against
     */
    positionTooltip(el, anchor) {
        const rect = anchor.getBoundingClientRect();
        el.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
        el.style.left = (rect.left + window.scrollX) + 'px';
        requestAnimationFrame(() => {
            const tipRect = el.getBoundingClientRect();
            if (tipRect.right > window.innerWidth - 10)
                el.style.left = (window.innerWidth - tipRect.width - 10) + 'px';
            if (tipRect.bottom > window.innerHeight + window.scrollY - 10)
                el.style.top = (rect.top + window.scrollY - tipRect.height - 4) + 'px';
        });
    },

    /**
     * Builds the standard position chip HTML (used across squad, transfer, shortlist tables).
     *
     * @param {string} primaryColor — hex color of the primary position
     * @param {string} innerHTML    — pre-built inner HTML
     * @param {string} [cls]        — CSS class (default: 'tm-pos-chip')
     * @returns {string} HTML string
     */
    positionChip: (primaryColor, innerHTML, cls = 'tm-pos-chip') =>
        `<span class="${cls}" style="background:${primaryColor}22;border:1px solid ${primaryColor}44">${innerHTML}</span>`,
};
