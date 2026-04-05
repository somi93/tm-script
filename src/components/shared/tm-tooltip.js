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
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tmvu-header-height')) || 0;
        const topMin = window.scrollY + headerH + 8;

        el.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
        el.style.left = (rect.left  + window.scrollX) + 'px';
        requestAnimationFrame(() => {
            const tipRect = el.getBoundingClientRect();
            // Clamp right edge (viewport → document coords)
            if (tipRect.right > window.innerWidth - 10)
                el.style.left = Math.max(8 + window.scrollX, window.innerWidth - tipRect.width - 10 + window.scrollX) + 'px';
            // Flip above anchor if overflows bottom viewport edge
            if (tipRect.bottom > window.innerHeight - 10) {
                const aboveTop = rect.top + window.scrollY - tipRect.height - 4;
                el.style.top = Math.max(topMin, aboveTop) + 'px';
            }
            // Clamp top so tooltip never goes under fixed header
            const finalTop = parseFloat(el.style.top);
            if (finalTop < topMin) el.style.top = topMin + 'px';
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
        `<span class="${cls}" style="background:color-mix(in srgb, ${primaryColor} 13%, transparent);border:1px solid color-mix(in srgb, ${primaryColor} 27%, transparent)">${innerHTML}</span>`,

    /**
     * Renders a country flag `<ib>` element, or empty string if no country.
     * @param {string} country — country code (e.g. 'gb', 'de')
     * @param {string} [cls]   — extra CSS class to append
     * @returns {string} HTML string
     */
    flag: (country, cls = '') =>
        country ? `<ib class="flag-img-${country}${cls ? ' ' + cls : ''}"></ib>` : '',
};
