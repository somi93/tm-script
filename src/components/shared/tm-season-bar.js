import { TmUI } from './tm-ui.js';
import { TmAutocomplete } from './tm-autocomplete.js';

/**
 * Shared season navigation bar: [◀] [Season N ▼] [▶] [extra buttons]
 * The season chip opens an autocomplete dropdown for quick season search/filter.
 *
 * Usage:
 *   const handle = TmSeasonBar.mount(container, {
 *       seasons: [{id, label}],   // explicit list (newest first)
 *       // OR: max: N             // generates Season N..1
 *       current: id,
 *       onChange: (id) => {},
 *       label: 'SEASON:',         // optional, set false to hide
 *       extraButtons: [{ id, label, color }],
 *   });
 *   handle.setCurrent(id);
 *   handle.setExtraBtnActive(id);  // pass null to clear all
 */
export const TmSeasonBar = {
    mount(container, opts = {}) {
        const onChange = opts.onChange || (() => {});
        const labelText = opts.label !== undefined ? opts.label : 'SEASON:';
        const extraButtons = opts.extraButtons || [];

        // Build normalised seasons list (newest first)
        let seasons;
        if (opts.seasons && opts.seasons.length) {
            seasons = opts.seasons.map(s => ({ id: String(s.id), label: String(s.label) }));
        } else if (opts.max) {
            seasons = Array.from({ length: opts.max }, (_, i) => opts.max - i)
                .map(n => ({ id: String(n), label: 'Season ' + n }));
        } else {
            seasons = [];
        }

        let current = String(opts.current ?? (seasons[0]?.id ?? ''));
        const getLabel = id => seasons.find(s => s.id === String(id))?.label ?? ('Season ' + id);

        // ── Build DOM ──
        const bar = document.createElement('div');
        if (opts.cls !== undefined) {
            if (opts.cls) bar.className = opts.cls;
            bar.style.cssText = `display:flex;align-items:center;gap:${opts.gap || 'var(--tmu-space-sm)'}`;
        } else {
            bar.className = 'tmh-sbar';
        }
        if (labelText) {
            const lbl = document.createElement('label');
            lbl.textContent = labelText;
            bar.appendChild(lbl);
        }

        const prevBtn = TmUI.button({ icon: '◀', color: 'secondary', size: 'xs', cls: 'tmh-arrow', title: 'Previous season' });
        bar.appendChild(prevBtn);

        // Chip + autocomplete dropdown wrapper
        const chipWrap = document.createElement('div');
        chipWrap.style.cssText = 'position:relative;display:inline-block;flex-shrink:0';

        const chip = TmUI.button({ label: getLabel(current), color: 'secondary', size: 'xs', shape: 'full' });
        chip.style.minWidth = '90px';
        chipWrap.appendChild(chip);

        const ac = TmAutocomplete.autocomplete({
            placeholder: 'Search season…',
            tone: 'overlay',
            density: 'compact',
            size: 'md',
            grow: false,
            autocomplete: 'off',
            attrs: { inputmode: 'numeric', 'aria-label': 'Season picker' },
        });
        ac.style.cssText = 'position:absolute;left:0;top:calc(100% + 4px);width:150px;z-index:9999;display:none';
        chipWrap.appendChild(ac);
        bar.appendChild(chipWrap);

        const nextBtn = TmUI.button({ icon: '▶', color: 'secondary', size: 'xs', cls: 'tmh-arrow', title: 'Next season' });
        bar.appendChild(nextBtn);

        const extraEls = {};
        extraButtons.forEach(eb => {
            const btn = TmUI.button({ id: eb.id, label: eb.label, color: eb.color ?? 'secondary', size: 'xs' });
            if (eb.active) btn.classList.add('tmu-btn-active');
            if (eb.id) extraEls[eb.id] = btn;
            bar.appendChild(btn);
        });

        const ssnInput = ac.inputEl;

        // ── Autocomplete ──
        const renderItems = (query = '') => {
            const q = query.trim().toLowerCase();
            ac.setItems(seasons
                .filter(s => !q || s.label.toLowerCase().includes(q) || s.id.includes(q))
                .slice(0, 60)
                .map(s => {
                    const item = TmAutocomplete.autocompleteItem({
                        label: s.label,
                        active: s.id === current,
                        onSelect: () => { closePop(); navigate(s.id); },
                    });
                    item.dataset.sid = s.id;
                    return item;
                })
            );
        };

        const openPop = () => {
            ac.style.display = '';
            ac.setValue('');
            renderItems();
            ssnInput.focus();
            const active = ac.dropEl.querySelector('.tmu-ac-item-active');
            if (active) setTimeout(() => active.scrollIntoView({ block: 'nearest' }), 0);
        };

        const closePop = () => {
            ac.style.display = 'none';
            ac.hideDrop();
        };

        const updateChevrons = () => {
            const idx = seasons.findIndex(s => s.id === current);
            prevBtn.disabled = idx < 0 || idx >= seasons.length - 1;
            nextBtn.disabled = idx < 0 || idx <= 0;
        };

        const navigate = (id) => {
            current = String(id);
            chip.textContent = getLabel(current);
            updateChevrons();
            onChange(current);
        };

        // ── Events ──
        chip.addEventListener('click', () => ac.style.display === 'none' ? openPop() : closePop());

        prevBtn.addEventListener('click', () => {
            const idx = seasons.findIndex(s => s.id === current);
            if (idx < seasons.length - 1) navigate(seasons[idx + 1].id);
        });
        nextBtn.addEventListener('click', () => {
            const idx = seasons.findIndex(s => s.id === current);
            if (idx > 0) navigate(seasons[idx - 1].id);
        });

        ac.addEventListener('focusin', e => { if (e.target === ssnInput) renderItems(ssnInput.value); });
        ac.addEventListener('input', e => { if (e.target === ssnInput) renderItems(e.target.value); });
        ac.addEventListener('keydown', e => {
            if (e.target !== ssnInput) return;
            if (e.key === 'Enter') {
                const first = ac.dropEl.querySelector('[data-sid]');
                if (first) { closePop(); navigate(first.dataset.sid); }
            }
            if (e.key === 'Escape') closePop();
        });
        ac.addEventListener('focusout', e => { if (e.target === ssnInput) setTimeout(() => closePop(), 150); });
        document.addEventListener('click', e => { if (!chipWrap.contains(e.target)) closePop(); });

        updateChevrons();
        container.appendChild(bar);

        return {
            el: bar,
            /** Update displayed season externally (no onChange fired) */
            setCurrent(id) {
                current = String(id);
                chip.textContent = getLabel(current);
                updateChevrons();
            },
            /** Highlight one extra button as active; pass null to clear all */
            setExtraBtnActive(id) {
                Object.entries(extraEls).forEach(([bid, btn]) => {
                    btn.classList.toggle('tmu-btn-active', bid === id);
                });
            },
        };
    },
};
