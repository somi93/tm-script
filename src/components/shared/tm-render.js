import { TmButton } from './tm-button.js';

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Card ── */
.tmu-card { background: #1c3410; border: 1px solid #28451d; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 8px; box-shadow: 0 0 9px #192a19; }
.tmu-card-head { font-size: 10px; font-weight: 700; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #3d6828; }
.tmu-card-head-btn { background: none; border: none; color: #6a9a58; cursor: pointer; font-size: 13px; padding: 0 2px; line-height: 1; transition: color .15s; }
.tmu-card-head-btn:hover { color: #80e048; }
.tmu-card-body { padding: 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.tmu-card-body-flush { padding: 4px; gap: 2px; }
/* ── Divider ── */
.tmu-divider { height: 1px; background: #3d6828; margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: 8px; color: #6a9a58; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 2px; margin-top: 2px; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: rgba(42,74,28,.5); }
/* ── List item ── */
.tmu-list-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #90b878; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.tmu-list-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
button.tmu-list-item { background: transparent; border: none; cursor: pointer; font-family: inherit; text-align: left; width: 100%; border-radius: 5px; }
` }));

export const TmRender = {
    /**
     * Sets innerHTML on el, hydrates custom <tm-*> tags, collects [data-ref] elements.
     * Returns a refs object mapping action names and data-ref values to their DOM nodes.
     *
     * @param {Element} el       — target element (innerHTML replaced)
     * @param {string}  html     — template string
     * @param {object}  handlers — { actionName: Function } matched to data-action
     * @returns {object}         — { [action|ref]: Element }
     */
    render(el, html, handlers = {}) {
        if (html !== undefined) el.innerHTML = html;
        const refs = {};

        // tm-card — deepest-first so nested cards work
        el.querySelectorAll('tm-card').forEach(tmCard => {
            const card = document.createElement('div');
            card.className = 'tmu-card';
            if (tmCard.dataset.ref) card.dataset.ref = tmCard.dataset.ref;

            if (tmCard.dataset.title) {
                const head = document.createElement('div');
                head.className = 'tmu-card-head';
                const titleSpan = document.createElement('span');
                titleSpan.textContent = tmCard.dataset.icon
                    ? tmCard.dataset.icon + ' ' + tmCard.dataset.title
                    : tmCard.dataset.title;
                head.appendChild(titleSpan);
                if (tmCard.dataset.headAction) {
                    const action = tmCard.dataset.headAction;
                    const hBtn = document.createElement('button');
                    hBtn.type = 'button';
                    hBtn.className = 'tmu-card-head-btn';
                    hBtn.textContent = tmCard.dataset.headIcon || '↻';
                    if (handlers[action]) hBtn.addEventListener('click', handlers[action]);
                    head.appendChild(hBtn);
                    refs[action] = hBtn;
                }
                if (tmCard.dataset.headRef) refs[tmCard.dataset.headRef] = head;
                card.appendChild(head);
            }

            const body = document.createElement('div');
            body.className = 'tmu-card-body' + (tmCard.dataset.flush !== undefined ? ' tmu-card-body-flush' : '');
            while (tmCard.firstChild) body.appendChild(tmCard.firstChild);
            card.appendChild(body);
            tmCard.replaceWith(card);
        });

        // tm-divider
        el.querySelectorAll('tm-divider').forEach(tmDivider => {
            const label = tmDivider.dataset.label;
            const div = document.createElement('div');
            div.className = label ? 'tmu-divider-label' : 'tmu-divider';
            if (label) div.textContent = label;
            tmDivider.replaceWith(div);
        });

        // tm-button
        el.querySelectorAll('tm-button').forEach(tmBtn => {
            const action = tmBtn.dataset.action;
            const inner = tmBtn.innerHTML.trim();
            const btn = TmButton.button({
                label: inner ? undefined : tmBtn.dataset.label,
                slot: inner || undefined,
                id: tmBtn.dataset.id,
                variant: tmBtn.dataset.variant,
                size: tmBtn.dataset.size,
                cls: tmBtn.dataset.cls,
                block: tmBtn.hasAttribute('data-block'),
                onClick: action ? handlers[action] : undefined,
            });
            if (tmBtn.getAttribute('title')) btn.title = tmBtn.getAttribute('title');
            if (tmBtn.getAttribute('style')) btn.setAttribute('style', tmBtn.getAttribute('style'));
            const skipAttrs = new Set(['data-label', 'data-variant', 'data-action', 'data-id', 'data-block', 'data-size', 'data-cls']);
            for (const attr of tmBtn.attributes) {
                if (attr.name.startsWith('data-') && !skipAttrs.has(attr.name)) btn.setAttribute(attr.name, attr.value);
            }
            tmBtn.replaceWith(btn);
            if (action) refs[action] = btn;
        });

        // tm-input
        el.querySelectorAll('tm-input').forEach(tmInput => {
            const input = document.createElement('input');
            const size = tmInput.dataset.size || 'sm';
            input.className = `tmu-input tmu-input-${size} py-1 px-2 text-sm`;
            if (tmInput.dataset.ref) input.dataset.ref = tmInput.dataset.ref;
            if (tmInput.dataset.type) input.type = tmInput.dataset.type;
            if (tmInput.dataset.value) input.value = tmInput.dataset.value;
            if (tmInput.dataset.placeholder) input.placeholder = tmInput.dataset.placeholder;
            if (tmInput.dataset.min) input.min = tmInput.dataset.min;
            if (tmInput.dataset.max) input.max = tmInput.dataset.max;
            if (tmInput.dataset.step) input.step = tmInput.dataset.step;

            if (tmInput.dataset.label) {
                const row = document.createElement('div');
                row.className = 'tmu-field';
                const lbl = document.createElement('span');
                lbl.className = 'tmu-field-label';
                lbl.textContent = tmInput.dataset.label;
                row.appendChild(lbl);
                row.appendChild(input);
                tmInput.replaceWith(row);
            } else {
                tmInput.replaceWith(input);
            }
        });

        // tm-stat
        el.querySelectorAll('tm-stat').forEach(tmStat => {
            const row = document.createElement('div');
            const cls = tmStat.dataset.cls || '';
            row.className = 'tmu-stat-row' + (cls ? ' ' + cls : '');
            const lbl = document.createElement('span');
            const lblCls = tmStat.dataset.lblCls || '';
            lbl.className = 'tmu-stat-lbl' + (lblCls ? ' ' + lblCls : '');
            lbl.textContent = tmStat.dataset.label || '';
            row.appendChild(lbl);
            const val = document.createElement('span');
            const variant = tmStat.dataset.variant || tmStat.className;
            const valCls = tmStat.dataset.valCls || '';
            val.className = 'tmu-stat-val' + (variant ? ' ' + variant : '') + (valCls ? ' ' + valCls : '');
            if (tmStat.innerHTML.trim()) val.innerHTML = tmStat.innerHTML;
            else val.textContent = tmStat.dataset.value || '';
            if (tmStat.dataset.ref) val.dataset.ref = tmStat.dataset.ref;
            row.appendChild(val);
            tmStat.replaceWith(row);
        });

        // tm-list-item
        el.querySelectorAll('tm-list-item').forEach(tmItem => {
            const action = tmItem.dataset.action;
            const node = action ? document.createElement('button') : document.createElement('a');
            node.className = 'tmu-list-item';
            if (tmItem.dataset.variant) node.classList.add(tmItem.dataset.variant);
            if (action) {
                node.type = 'button';
                if (handlers[action]) node.addEventListener('click', handlers[action]);
                refs[action] = node;
            } else {
                node.href = tmItem.dataset.href || '#';
            }
            if (tmItem.dataset.icon) {
                const icon = document.createElement('span');
                icon.className = 'tmu-list-icon';
                icon.textContent = tmItem.dataset.icon;
                node.appendChild(icon);
            }
            if (tmItem.dataset.label) {
                const lbl = document.createElement('span');
                lbl.className = 'tmu-list-lbl';
                lbl.textContent = tmItem.dataset.label;
                node.appendChild(lbl);
            }
            if (tmItem.dataset.ref) node.dataset.ref = tmItem.dataset.ref;
            tmItem.replaceWith(node);
        });

        // [data-ref] collection
        el.querySelectorAll('[data-ref]').forEach(node => {
            refs[node.dataset.ref] = node;
        });

        // tm-row
        el.querySelectorAll('tm-row').forEach(tmRow => {
            const div = document.createElement('div');
            const cls = tmRow.dataset.cls || '';
            div.className = 'tmu-row' + (cls ? ' ' + cls : '');
            if (tmRow.dataset.justify) div.style.justifyContent = tmRow.dataset.justify;
            if (tmRow.dataset.align)   div.style.alignItems     = tmRow.dataset.align;
            if (tmRow.dataset.gap)     div.style.gap            = tmRow.dataset.gap;
            while (tmRow.firstChild) div.appendChild(tmRow.firstChild);
            tmRow.replaceWith(div);
        });

        // tm-col
        el.querySelectorAll('tm-col').forEach(tmCol => {
            const div = document.createElement('div');
            const size = tmCol.dataset.size;
            const cls  = tmCol.dataset.cls || '';
            div.className = 'tmu-col' + (size ? ' tmu-col-' + size : '') + (cls ? ' ' + cls : '');
            while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
            tmCol.replaceWith(div);
        });

        // tm-spinner
        el.querySelectorAll('tm-spinner').forEach(tmSpinner => {
            const span = document.createElement('span');
            const size = tmSpinner.dataset.size || 'sm';
            const cls  = tmSpinner.dataset.cls || '';
            span.className = `tmu-spinner tmu-spinner-${size}${cls ? ' ' + cls : ''}`;
            tmSpinner.replaceWith(span);
        });

        return refs;
    },
};
