import { TmButton } from './tm-button.js';
import { TmInput } from './tm-input.js';

document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
/* ── Card ── */
.tmu-card { background: radial-gradient(circle at top left, var(--tmu-success-fill-faint), transparent 42%), linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-dark-muted) 100%); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-md); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: var(--tmu-space-md); box-shadow: 0 14px 30px var(--tmu-shadow-elev); }
.tmu-card.tmu-card-variant-soft { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft-alpha-strong); border-radius: var(--tmu-space-lg); box-shadow: none; }
.tmu-card.tmu-card-variant-sidebar { margin-bottom: var(--tmu-space-xl); }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body { padding: var(--tmu-space-lg) var(--tmu-space-lg); gap: var(--tmu-space-lg); }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body.tmu-card-body-flush { padding: 0; gap: 0; }
.tmu-card.tmu-card-variant-embedded { margin-bottom: 0; background: var(--tmu-surface-embedded); border-color: var(--tmu-border-embedded); box-shadow: none; color: var(--tmu-text-main); }
.tmu-card.tmu-card-variant-embedded .tmu-card-body,
.tmu-card.tmu-card-variant-embedded .tmu-card-body.tmu-card-body-flush { padding: 0; gap: 0; }
.tmu-card.tmu-card-variant-flatpanel { background: var(--tmu-surface-dark-strong); border: 1px solid var(--tmu-border-soft-alpha); border-radius: var(--tmu-space-md); box-shadow: none; margin-bottom: 0; }
.tmu-card.tmu-card-variant-flatpanel .tmu-card-head { background: none; border-bottom: 1px solid var(--tmu-border-soft-alpha); }
.tmu-card-head { font-size: var(--tmu-font-md); font-weight: 800; color: var(--tmu-text-strong); text-transform: none; letter-spacing: 0.02em; padding: 0 var(--tmu-space-lg); min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft-alpha); background: linear-gradient(180deg, var(--tmu-success-fill-soft), var(--tmu-success-fill-faint)); }
.tmu-card-head-btn { background: none; border: none; color: var(--tmu-text-faint); cursor: pointer; font-size: var(--tmu-font-md); padding: 0; line-height: 1; transition: color .15s, transform .15s; }
.tmu-card-head-btn:hover { color: var(--tmu-accent); }
.tmu-card-head-btn:hover { transform: none; }
.tmu-card-body { padding: var(--tmu-space-lg) var(--tmu-space-lg); display: flex; flex-direction: column; gap: var(--tmu-space-md); background: transparent; }
.tmu-card-body-flush { padding: 0; gap: 0; }
/* ── Panel ── */
.tmu-panel { background: var(--tmu-surface-panel); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-sm); color: var(--tmu-text-main); box-shadow: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tmu-panel-page { padding: var(--tmu-space-lg); }
/* ── Flat panel (squad, league standings — no card gradient) ── */
.tmu-flat-panel { background: var(--tmu-surface-dark-strong); border: 1px solid var(--tmu-border-soft-alpha); border-radius: var(--tmu-space-md); overflow: hidden; margin-bottom: var(--tmu-space-lg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--tmu-text-main); }
.tmu-flat-panel .tmu-card-head { background: none; border-bottom: 1px solid var(--tmu-border-soft-alpha); }
/* ── Divider ── */
.tmu-divider { height: 1px; background: var(--tmu-border-embedded); margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: var(--tmu-space-sm); color: var(--tmu-text-faint); font-size: var(--tmu-font-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: var(--tmu-space-sm) 0 0; margin-top: 0; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: var(--tmu-border-faint); }
/* ── List item ── */
.tmu-list-item { display: flex; align-items: center; gap: var(--tmu-space-sm); padding: var(--tmu-space-md) var(--tmu-space-lg); color: var(--tmu-text-panel-label); font-size: var(--tmu-font-sm); font-weight: 700; text-decoration: none; transition: background .15s, border-color .15s, color .15s; border: 1px solid transparent; }
.tmu-list-icon { font-size: var(--tmu-font-md); width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
a.tmu-list-item:hover,button.tmu-list-item:hover { background: var(--tmu-surface-item-hover); border-color: var(--tmu-border-soft-alpha); color: var(--tmu-text-strong); }
button.tmu-list-item { background: transparent; cursor: pointer; font-family: inherit; text-align: left; width: 100%; border-radius: var(--tmu-space-sm); }
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
        el.__tmRenderHandlers = handlers;

        if (!el.__tmRenderClickBound) {
            el.addEventListener('click', (event) => {
                const actionNode = event.target.closest('[data-action]');
                if (!actionNode || !el.contains(actionNode) || actionNode.disabled) return;
                const action = actionNode.dataset.action;
                const handler = el.__tmRenderHandlers?.[action];
                if (typeof handler === 'function') handler.call(actionNode, event);
            });
            el.__tmRenderClickBound = true;
        }

        // tm-card — deepest-first so nested cards work
        el.querySelectorAll('tm-card').forEach(tmCard => {
            const card = document.createElement('div');
            card.className = 'tmu-card';
            if (tmCard.dataset.variant) {
                tmCard.dataset.variant.split(/\s+/).filter(Boolean).forEach(variant => {
                    card.classList.add('tmu-card-variant-' + variant);
                });
            }
            if (tmCard.dataset.cls) {
                tmCard.dataset.cls.split(/\s+/).filter(Boolean).forEach(cls => {
                    card.classList.add(cls);
                });
            }
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
                    hBtn.dataset.action = action;
                    head.appendChild(hBtn);
                    refs[action] = hBtn;
                }
                if (tmCard.dataset.headRef) refs[tmCard.dataset.headRef] = head;
                card.appendChild(head);
            }

            const body = document.createElement('div');
            body.className = 'tmu-card-body' + (tmCard.dataset.flush !== undefined ? ' tmu-card-body-flush' : '');
            if (tmCard.dataset.bodyRef) body.dataset.ref = tmCard.dataset.bodyRef;
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
                color: tmBtn.dataset.color || tmBtn.dataset.variant,
                size: tmBtn.dataset.size,
                cls: tmBtn.dataset.cls,
                block: tmBtn.hasAttribute('data-block'),
                onClick: undefined,
            });
            if (tmBtn.getAttribute('title')) btn.title = tmBtn.getAttribute('title');
            if (tmBtn.getAttribute('style')) btn.setAttribute('style', tmBtn.getAttribute('style'));
            if (action) btn.dataset.action = action;
            const skipAttrs = new Set(['data-label', 'data-variant', 'data-color', 'data-action', 'data-id', 'data-block', 'data-size', 'data-cls']);
            for (const attr of tmBtn.attributes) {
                if (attr.name.startsWith('data-') && !skipAttrs.has(attr.name)) btn.setAttribute(attr.name, attr.value);
            }
            tmBtn.replaceWith(btn);
            if (action) refs[action] = btn;
        });

        // tm-input
        el.querySelectorAll('tm-input').forEach(tmInput => {
            const input = TmInput.input({
                size: tmInput.dataset.size || 'sm',
                type: tmInput.dataset.type || 'text',
                value: tmInput.dataset.value || '',
                placeholder: tmInput.dataset.placeholder || '',
                min: tmInput.dataset.min,
                max: tmInput.dataset.max,
                step: tmInput.dataset.step,
            });
            if (tmInput.dataset.ref) input.dataset.ref = tmInput.dataset.ref;

            if (tmInput.dataset.label) {
                const row = TmInput.field({ label: tmInput.dataset.label, input });
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
                node.dataset.action = action;
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
            if (tmRow.dataset.align) div.style.alignItems = tmRow.dataset.align;
            if (tmRow.dataset.gap) div.style.gap = tmRow.dataset.gap;
            while (tmRow.firstChild) div.appendChild(tmRow.firstChild);
            tmRow.replaceWith(div);
        });

        // tm-col
        el.querySelectorAll('tm-col').forEach(tmCol => {
            const div = document.createElement('div');
            const size = tmCol.dataset.size;
            const cls = tmCol.dataset.cls || '';
            div.className = 'tmu-col' + (size ? ' tmu-col-' + size : '') + (cls ? ' ' + cls : '');
            while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
            tmCol.replaceWith(div);
        });

        // tm-spinner
        el.querySelectorAll('tm-spinner').forEach(tmSpinner => {
            const span = document.createElement('span');
            const size = tmSpinner.dataset.size || 'sm';
            const cls = tmSpinner.dataset.cls || '';
            span.className = `tmu-spinner tmu-spinner-${size}${cls ? ' ' + cls : ''}`;
            tmSpinner.replaceWith(span);
        });

        return refs;
    },
};
