import { TmUtils } from '../../lib/tm-utils.js';

const CSS = `
/* ── TmUI shared primitives (tmu-*) ── */
.tmu-btn {
    border: none; cursor: pointer;
    font-family: inherit; font-weight: 700; letter-spacing: 0.3px;
    transition: background 0.15s, opacity 0.15s;
}
.tmu-btn-block { width: 100%; }
.tmu-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tmu-btn-primary   { background: #3d6828; color: #e8f5d8; }
.tmu-btn-primary:hover:not(:disabled)   { background: #4e8234; }
.tmu-btn-secondary { background: rgba(42,74,28,0.4); color: #90b878; border: 1px solid #3d6828; }
.tmu-btn-secondary:hover:not(:disabled) { background: rgba(42,74,28,0.7); color: #e8f5d8; }
.tmu-btn-danger    { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.tmu-btn-danger:hover:not(:disabled)    { background: rgba(239,68,68,0.25); }
.tmu-btn-lime      { background: rgba(108,192,64,0.12); border: 1px solid rgba(108,192,64,0.3); color: #80e048; display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-lime:hover:not(:disabled)      { background: rgba(108,192,64,0.22); }
.tmu-input {
    border-radius: 4px;
    background: rgba(0,0,0,.25); border: 1px solid rgba(42,74,28,.6);
    color: #e8f5d8; font-weight: 600;
    font-family: inherit; text-align: right; outline: none;
    transition: border-color 0.15s;
}
.tmu-input:focus { border-color: #6cc040; }
.tmu-input::placeholder { color: #5a7a48; }
.tmu-input-sm { width: 70px; }
.tmu-input-md { width: 110px; }
.tmu-input-full { width: 100%; }
.tmu-field {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.tmu-field-label {
    font-size: 10px; font-weight: 600; color: #90b878;
    text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;
}
.tmu-card { background: #1c3410; border: 1px solid #3d6828; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 8px; }
.tmu-card-head {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 10px 12px 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px;
    border-bottom: 1px solid #3d6828;
}
.tmu-card-head-btn {
    background: none; border: none; color: #6a9a58; cursor: pointer;
    font-size: 13px; padding: 0 2px; line-height: 1; transition: color .15s;
}
.tmu-card-head-btn:hover { color: #80e048; }
.tmu-card-body { padding:12px 12px; display: flex; flex-direction: column; gap: 8px; }
.tmu-divider { height: 1px; background: #3d6828; margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: 8px; color: #6a9a58; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 2px; margin-top: 2px; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: rgba(42,74,28,.5); }
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: #6a9a58; border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
.tmu-row { display: flex; align-items: center; gap: 8px; }
.tmu-col { min-width: 0; }
.tmu-col-1{flex:0 0 8.333%}  .tmu-col-2{flex:0 0 16.667%} .tmu-col-3{flex:0 0 25%}     .tmu-col-4{flex:0 0 33.333%}
.tmu-col-5{flex:0 0 41.667%} .tmu-col-6{flex:0 0 50%}     .tmu-col-7{flex:0 0 58.333%} .tmu-col-8{flex:0 0 66.667%}
.tmu-col-9{flex:0 0 75%}     .tmu-col-10{flex:0 0 83.333%}.tmu-col-11{flex:0 0 91.667%}.tmu-col-12{flex:0 0 100%}
.tmu-list-item {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; color: #90b878; font-size: 12px; font-weight: 600;
    text-decoration: none; transition: all 0.15s;
}
.tmu-list-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
button.tmu-list-item {
    background: transparent; border: none; cursor: pointer;
    font-family: inherit; text-align: left; width: 100%; border-radius: 5px;
}
.tmu-card-body-flush { padding: 4px; gap: 2px; }
.tmu-stat-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 0; font-size: 11px; color: #c8e0b4;
}
.tmu-stat-row + .tmu-stat-row { border-top: 1px solid rgba(61,104,40,.15); }
.tmu-stat-lbl { color: #6a9a58; font-weight: 600; font-size: 10px; text-transform: uppercase; }
.tmu-stat-val { font-weight: 700; font-variant-numeric: tabular-nums; }
/* ── Shared color variants ── */
.yellow { color: #fbbf24; }
.red    { color: #f87171; }
.green  { color: #4ade80; }
.blue   { color: #60a5fa; }
.purple { color: #c084fc; }
.lime   { color: #80e048; }
.muted  { color: #8aac72; }
.gold   { color: gold; }
.silver { color: silver; }
.orange { color: #ee9900; }
/* ── Typography utilities ── */
.text-xs  { font-size: 10px; } .text-sm  { font-size: 12px; } .text-md  { font-size: 14px; }
.text-lg  { font-size: 16px; } .text-xl  { font-size: 18px; } .text-2xl { font-size: 20px; }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* ── Border-radius utilities ── */
.rounded-sm { border-radius: 4px; } .rounded-md { border-radius: 6px; }
.rounded-lg { border-radius: 8px; } .rounded-xl { border-radius: 12px; } .rounded-full { border-radius: 9999px; }
/* ── Spacing utilities (4px base scale) ── */
.pt-0{padding-top:0}      .pt-1{padding-top:4px}    .pt-2{padding-top:8px}    .pt-3{padding-top:12px}   .pt-4{padding-top:16px}   .pt-5{padding-top:20px}   .pt-6{padding-top:24px}
.pb-0{padding-bottom:0}   .pb-1{padding-bottom:4px} .pb-2{padding-bottom:8px} .pb-3{padding-bottom:12px}.pb-4{padding-bottom:16px}.pb-5{padding-bottom:20px}.pb-6{padding-bottom:24px}
.pl-0{padding-left:0}     .pl-1{padding-left:4px}   .pl-2{padding-left:8px}   .pl-3{padding-left:12px}  .pl-4{padding-left:16px}  .pl-5{padding-left:20px}  .pl-6{padding-left:24px}
.pr-0{padding-right:0}    .pr-1{padding-right:4px}  .pr-2{padding-right:8px}  .pr-3{padding-right:12px} .pr-4{padding-right:16px} .pr-5{padding-right:20px} .pr-6{padding-right:24px}
.px-0{padding-left:0;padding-right:0}       .px-1{padding-left:4px;padding-right:4px}     .px-2{padding-left:8px;padding-right:8px}     .px-3{padding-left:12px;padding-right:12px}
.px-4{padding-left:16px;padding-right:16px} .px-5{padding-left:20px;padding-right:20px}   .px-6{padding-left:24px;padding-right:24px}
.py-0{padding-top:0;padding-bottom:0}       .py-1{padding-top:4px;padding-bottom:4px}     .py-2{padding-top:8px;padding-bottom:8px}     .py-3{padding-top:12px;padding-bottom:12px}
.py-4{padding-top:16px;padding-bottom:16px} .py-5{padding-top:20px;padding-bottom:20px}   .py-6{padding-top:24px;padding-bottom:24px}
.pa-0{padding:0} .pa-1{padding:4px} .pa-2{padding:8px} .pa-3{padding:12px} .pa-4{padding:16px} .pa-5{padding:20px} .pa-6{padding:24px}
.mt-0{margin-top:0}      .mt-1{margin-top:4px}    .mt-2{margin-top:8px}    .mt-3{margin-top:12px}   .mt-4{margin-top:16px}   .mt-5{margin-top:20px}   .mt-6{margin-top:24px}
.mb-0{margin-bottom:0}   .mb-1{margin-bottom:4px} .mb-2{margin-bottom:8px} .mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-5{margin-bottom:20px}.mb-6{margin-bottom:24px}
.ml-0{margin-left:0}     .ml-1{margin-left:4px}   .ml-2{margin-left:8px}   .ml-3{margin-left:12px}  .ml-4{margin-left:16px}  .ml-5{margin-left:20px}  .ml-6{margin-left:24px}
.mr-0{margin-right:0}    .mr-1{margin-right:4px}  .mr-2{margin-right:8px}  .mr-3{margin-right:12px} .mr-4{margin-right:16px} .mr-5{margin-right:20px} .mr-6{margin-right:24px}
.mx-0{margin-left:0;margin-right:0}       .mx-1{margin-left:4px;margin-right:4px}     .mx-2{margin-left:8px;margin-right:8px}     .mx-3{margin-left:12px;margin-right:12px}
.mx-4{margin-left:16px;margin-right:16px} .mx-5{margin-left:20px;margin-right:20px}   .mx-6{margin-left:24px;margin-right:24px}
.my-0{margin-top:0;margin-bottom:0}       .my-1{margin-top:4px;margin-bottom:4px}     .my-2{margin-top:8px;margin-bottom:8px}     .my-3{margin-top:12px;margin-bottom:12px}
.my-4{margin-top:16px;margin-bottom:16px} .my-5{margin-top:20px;margin-bottom:20px}   .my-6{margin-top:24px;margin-bottom:24px}
.ma-0{margin:0} .ma-1{margin:4px} .ma-2{margin:8px} .ma-3{margin:12px} .ma-4{margin:16px} .ma-5{margin:20px} .ma-6{margin:24px}
/* ── Table ── */
.tmu-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmu-tbl thead th{padding:6px 6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap;transition:color .15s}
.tmu-tbl thead th.r{text-align:right} .tmu-tbl thead th.c{text-align:center}
.tmu-tbl thead th.sortable{cursor:pointer;user-select:none}
.tmu-tbl thead th.sortable:hover{color:#c8e0b4}
.tmu-tbl thead th.sort-active{color:#c8e0b4}
.tmu-tbl tbody td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums}
.tmu-tbl tbody td.r{text-align:right} .tmu-tbl tbody td.c{text-align:center}
.tmu-tbl tbody tr:hover{background:rgba(255,255,255,.03)}
.tmu-tbl a{color:#80e048;text-decoration:none;font-weight:600}
.tmu-tbl a:hover{color:#c8e0b4;text-decoration:underline}
.tmu-tbl-tot td{border-top:2px solid #3d6828;color:#e0f0cc;font-weight:800}
.tmu-tbl-avg td{color:#6a9a58;font-weight:600}
/* ── Chip ── */
.tmu-chip{display:inline-block;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:16px}
.tmu-chip-gk{background:rgba(108,192,64,.15);color:#6cc040}
.tmu-chip-d {background:rgba(110,181,255,.12);color:#6eb5ff}
.tmu-chip-m {background:rgba(255,215,64,.1); color:#ffd740}
.tmu-chip-f {background:rgba(255,112,67,.12);color:#ff7043}
.tmu-chip-default{background:rgba(200,224,180,.08);color:#8aac72}
/* ── Progress bar ── */
.tmu-prog-overlay{position:fixed;top:0;left:0;right:0;z-index:99999;
  background:rgba(20,30,15,0.95);border-bottom:2px solid #6cc040;
  padding:10px 20px;font-family:Arial,sans-serif;color:#e8f5d8;transition:opacity 0.5s}
.tmu-prog-inner{display:flex;align-items:center;gap:12px;max-width:900px;margin:0 auto}
.tmu-prog-title{font-size:14px;font-weight:700;color:#6cc040;white-space:nowrap}
.tmu-prog-track{flex:1;background:rgba(108,192,64,0.15);border-radius:8px;height:18px;
  overflow:hidden;border:1px solid rgba(108,192,64,0.3)}
.tmu-prog-bar{height:100%;width:0%;background:linear-gradient(90deg,#3d6828,#6cc040);
  border-radius:8px;transition:width 0.3s}
.tmu-prog-text{font-size:12px;min-width:180px;text-align:right}
.tmu-prog-inline{width:100%;height:5px;background:#274a18;border-radius:3px;
  margin:8px 0;overflow:hidden}
.tmu-prog-inline .tmu-prog-bar{border-radius:3px;transition:width .4s}
/* ── Modal ── */
#tmu-modal-overlay{position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.tmu-modal{background:linear-gradient(160deg,#1a2e14 0%,#0e1e0a 100%);border:1px solid #4a9030;border-radius:12px;padding:28px 24px 20px;max-width:440px;width:calc(100% - 40px);box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 0 1px rgba(74,144,48,0.15);color:#c8e0b4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.tmu-modal-icon{font-size:30px;margin-bottom:10px;line-height:1}
.tmu-modal-title{font-size:15px;font-weight:800;color:#e0f0cc;margin-bottom:8px}
.tmu-modal-msg{font-size:12px;color:#90b878;line-height:1.65;margin-bottom:22px}
.tmu-modal-btns{display:flex;flex-direction:column;gap:8px}
.tmu-modal-btn{padding:10px 16px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:all 0.14s;font-family:inherit;text-align:left}
.tmu-modal-btn-primary{background:#3d6828;color:#e8f5d8;border:1px solid #6cc040}
.tmu-modal-btn-primary:hover{background:#4d8030}
.tmu-modal-btn-secondary{background:rgba(61,104,40,0.15);color:#80c050;border:1px solid #3d6828}
.tmu-modal-btn-secondary:hover{background:rgba(61,104,40,0.3)}
.tmu-modal-btn-danger{background:rgba(60,15,5,0.3);color:#a05040;border:1px solid #5a2a1a}
.tmu-modal-btn-danger:hover{background:rgba(80,20,5,0.5);color:#c06050}
.tmu-modal-btn-sub{font-size:10px;font-weight:400;opacity:.7;display:block;margin-top:2px}
.tmu-prompt-input{width:100%;box-sizing:border-box;margin-bottom:14px;background:rgba(0,0,0,.3);border:1px solid #3d6828;border-radius:5px;color:#e8f5d8;padding:8px 10px;font-size:12px;font-family:inherit;outline:none}
.tmu-prompt-input:focus{border-color:#6cc040}
/* ── Tab bar (tmu-tabs / tmu-tab) ── */
.tmu-tabs{display:flex;gap:6px;flex-wrap:wrap}
.tmu-tab{padding:4px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#90b878;cursor:pointer;border-radius:4px;background:rgba(42,74,28,.3);border:1px solid rgba(42,74,28,.6);transition:all .15s;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmu-tab:hover:not(:disabled){color:#c8e0b4;background:rgba(42,74,28,.5);border-color:#3d6828}
.tmu-tab.active{color:#e8f5d8;background:#305820;border-color:#3d6828}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
/* ── State (loading / empty / error) ── */
.tmu-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;gap:8px;text-align:center}
.tmu-state-text{color:#6a9a58;font-size:12px;font-weight:600;letter-spacing:.5px}
.tmu-state-empty .tmu-state-text{color:#5a7a48;font-style:italic;font-weight:400}
.tmu-state-error .tmu-state-text{color:#f87171}
.tmu-state-sm{padding:8px 12px;gap:5px}
.tmu-state-sm .tmu-state-text{font-size:10px;letter-spacing:.3px}
`;

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    let _tblCounter = 0;

    /**
     * Creates a <button> element.
     *
     * @param {object}          opts
     * @param {string}         [opts.label]    — plain text label (use OR slot, not both)
     * @param {Node|string}    [opts.slot]     — DOM node or HTML string for rich content
     * @param {string}         [opts.id]       — sets btn.id (prefer keeping a ref instead)
     * @param {string}         [opts.variant]  — 'primary' | 'secondary' | 'danger'  (default: 'primary')
     * @param {string}         [opts.cls]      — extra CSS classes
     * @param {boolean}        [opts.disabled]
     * @param {Function}       [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    const button = ({ label, slot, id, variant = 'lime', size = 'md', cls = '', block = false, disabled = false, onClick } = {}) => {
        const SIZES = { xs: 'py-0 px-2 text-xs', sm: 'py-1 px-3 text-sm', md: 'py-2 px-3 text-sm' };
        const btn = document.createElement('button');
        btn.className = `tmu-btn tmu-btn-${variant} rounded-md ${SIZES[size] || SIZES.md}${block ? ' tmu-btn-block' : ''}${cls ? ' ' + cls : ''}`;
        if (id) btn.id = id;
        if (disabled) btn.disabled = true;

        if (slot instanceof Node) {
            btn.appendChild(slot);
        } else if (typeof slot === 'string') {
            btn.innerHTML = slot;
        } else if (label != null) {
            btn.textContent = label;
        }

        if (onClick) btn.addEventListener('click', onClick);
        return btn;
    };

    /**
     * Sets innerHTML on el, hydrates <tm-button> tags, collects [data-ref] elements.
     * Returns a single refs object with both button and DOM refs.
     *
     * Use `let refs; refs = TmUI.render(...)` so handlers can close over refs lazily.
     *
     * @param {Element} el        — element to render into (innerHTML will be replaced)
     * @param {string}  html      — template string
     * @param {object}  handlers  — { actionName: Function } matched to data-action
     * @returns {object}          — { [action]: HTMLButtonElement, [data-ref]: Element }
     *
     * @example
     * let refs;
     * refs = TmUI.render(root, `
     *     <input data-ref="name">
     *     <tm-button data-label="Save" data-action="save"></tm-button>
     * `, { save: () => console.log(refs.name.value) });
     */
    const render = (el, html, handlers = {}) => {
        if (html !== undefined) el.innerHTML = html;
        const refs = {};

        // tm-card: wrap children in .tmu-card > [head] + .tmu-card-body
        // Process deepest-first so nested cards work correctly
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

        el.querySelectorAll('tm-divider').forEach(tmDivider => {
            const label = tmDivider.dataset.label;
            if (label) {
                const div = document.createElement('div');
                div.className = 'tmu-divider-label';
                div.textContent = label;
                tmDivider.replaceWith(div);
            } else {
                const div = document.createElement('div');
                div.className = 'tmu-divider';
                tmDivider.replaceWith(div);
            }
        });

        el.querySelectorAll('tm-button').forEach(tmBtn => {
            const action = tmBtn.dataset.action;
            const inner = tmBtn.innerHTML.trim();
            const btn = button({
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
            const skipAttrs = new Set(['data-label','data-variant','data-action','data-id','data-block','data-size','data-cls']);
            for (const attr of tmBtn.attributes) {
                if (attr.name.startsWith('data-') && !skipAttrs.has(attr.name)) btn.setAttribute(attr.name, attr.value);
            }
            tmBtn.replaceWith(btn);
            if (action) refs[action] = btn;
        });

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

        el.querySelectorAll('[data-ref]').forEach(node => {
            refs[node.dataset.ref] = node;
        });

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

        el.querySelectorAll('tm-col').forEach(tmCol => {
            const div = document.createElement('div');
            const size = tmCol.dataset.size;
            const cls  = tmCol.dataset.cls || '';
            div.className = 'tmu-col' + (size ? ' tmu-col-' + size : '') + (cls ? ' ' + cls : '');
            while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
            tmCol.replaceWith(div);
        });

        el.querySelectorAll('tm-spinner').forEach(tmSpinner => {
            const span = document.createElement('span');
            const size = tmSpinner.dataset.size || 'sm';
            const cls  = tmSpinner.dataset.cls || '';
            span.className = `tmu-spinner tmu-spinner-${size}${cls ? ' ' + cls : ''}`;
            tmSpinner.replaceWith(span);
        });

        return refs;
    };

    const stat = (label, html = '', variant = '') =>
        `<div class="tmu-stat-row"><span class="tmu-stat-lbl">${label}</span><span class="tmu-stat-val${variant ? ' ' + variant : ''}">${html}</span></div>`;

    /**
     * Creates a chip (<span>) element.
     *
     * @param {string} text     — displayed text
     * @param {string} variant  — 'gk' | 'd' | 'm' | 'f' | 'default' (or any extra css class)
     * @returns {string}        — HTML string
     */
    const chip = (text, variant = 'default') =>
        `<span class="tmu-chip tmu-chip-${variant}">${text}</span>`;

    /**
     * Reusable sortable data table that supports per-column render slots.
     *
     * @param {object}   opts
     * @param {Array}    opts.headers        — column definitions (see below)
     * @param {Array}    opts.items          — data rows (plain objects)
     * @param {string}  [opts.sortKey]       — initial sort column key (default: first sortable column)
     * @param {number}  [opts.sortDir]       — 1 = asc, -1 = desc (default: -1)
     * @param {string}  [opts.cls]           — extra CSS class on <table>
     * @param {Function}[opts.onRowClick]    — (item, sortedIndex) => void
     *
     * Header definition object:
     *   { key, label, align?, cls?, thCls?, width?, sortable?, sort?, render? }
     *   - key       {string}   field name in the item object
     *   - label     {string}   column header text
     *   - align     {string}   'l' | 'c' | 'r'  (applied to both th and td)
     *   - cls       {string}   extra class on every <td>
     *   - thCls     {string}   extra class on <th>
     *   - width     {string}   CSS width on <th> e.g. '80px'
     *   - sortable  {boolean}  default true
     *   - sort      {Function} custom comparator (a, b) => number (receives raw items)
     *   - render    {Function} (value, item) => HTML string  — the cell "slot"
     *                          omit to render value as plain text
     *
     * @returns {HTMLDivElement}  wrapper element with a .refresh({ items, sortKey, sortDir }) method
     *
     * @example
     * const t = TmUI.table({
     *     headers: [
     *         { key: 'pos',  label: 'Pos',  align: 'c',
     *           render: (val) => TmUI.chip(val, val.toLowerCase()) },
     *         { key: 'name', label: 'Player',
     *           render: (val, item) => `<a href="${item.url}">${val}</a>` },
     *         { key: 'asi',  label: 'ASI', align: 'r' },
     *     ],
     *     items: players,
     *     sortKey: 'asi',
     *     sortDir: -1,
     * });
     * container.appendChild(t);
     *
     * // later:
     * t.refresh({ items: newPlayers });
     */
    const table = ({ headers = [], items = [], groupHeaders = [], footer = [], sortKey = null, sortDir = -1, cls = '', rowCls = null, onRowClick = null } = {}) => {
        const wrap = document.createElement('div');
        const id = 'tmu-tbl-' + (++_tblCounter);

        let _items = items;
        let _footer = footer;
        let _sk = sortKey != null ? sortKey : (headers.find(h => h.sortable !== false) || {}).key || null;
        let _sd = sortDir;

        function _render() {
            const sortHdr = _sk ? headers.find(h => h.key === _sk) : null;
            const sorted = _items.slice().sort((a, b) => {
                if (!sortHdr) return 0;
                if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
                const va = a[_sk], vb = b[_sk];
                if (typeof va === 'number' && typeof vb === 'number') return _sd * (va - vb);
                return _sd * String(va ?? '').localeCompare(String(vb ?? ''));
            });

            const arrow = _sd > 0 ? ' ▲' : ' ▼';
            let h = `<table class="tmu-tbl${cls ? ' ' + cls : ''}" id="${id}"><thead>`;

            groupHeaders.forEach(row => {
                const rc = row.cls || '';
                h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                (row.cells || []).forEach(cell => {
                    const cc = cell.cls || '';
                    h += `<th${cc ? ` class="${cc}"` : ''}${cell.colspan ? ` colspan="${cell.colspan}"` : ''}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ''}>${cell.label ?? ''}</th>`;
                });
                h += '</tr>';
            });

            h += '<tr>';
            headers.forEach(hdr => {
                const align = hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                const canSort = hdr.sortable !== false;
                const isActive = canSort && _sk === hdr.key;
                const thCls = [canSort ? 'sortable' : '', isActive ? 'sort-active' : '', align, hdr.thCls || ''].filter(Boolean).join(' ');
                h += `<th${thCls ? ` class="${thCls}"` : ''}${canSort ? ` data-sk="${hdr.key}"` : ''}${hdr.width ? ` style="width:${hdr.width}"` : ''}${hdr.title ? ` title="${hdr.title}"` : ''}>`;
                h += hdr.label + (isActive ? arrow : '') + '</th>';
            });

            h += '</tr></thead><tbody>';

            sorted.forEach((item, i) => {
                const rc = rowCls ? rowCls(item) : '';
                h += `<tr${rc ? ` class="${rc}"` : ''}${onRowClick ? ` data-ri="${i}"` : ''}>`;
                headers.forEach(hdr => {
                    const val = item[hdr.key];
                    const align = hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                    const tdCls = [align, hdr.cls || ''].filter(Boolean).join(' ');
                    const content = hdr.render ? hdr.render(val, item, i) : (val == null ? '' : val);
                    h += `<td${tdCls ? ` class="${tdCls}"` : ''}>${content}</td>`;
                });
                h += '</tr>';
            });

            h += '</tbody>';

            if (_footer.length) {
                h += '<tfoot>';
                _footer.forEach(fRow => {
                    const rc = fRow.cls || '';
                    h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                    (fRow.cells || []).forEach((cell, ci) => {
                        const hdr = headers[ci];
                        const defaultAlign = hdr && hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                        if (cell == null || typeof cell !== 'object') {
                            h += `<td${defaultAlign ? ` class="${defaultAlign}"` : ''}>${cell ?? ''}</td>`;
                        } else {
                            const tc = [defaultAlign, cell.cls || ''].filter(Boolean).join(' ');
                            h += `<td${tc ? ` class="${tc}"` : ''}>${cell.content ?? ''}</td>`;
                        }
                    });
                    h += '</tr>';
                });
                h += '</tfoot>';
            }

            h += '</table>';
            wrap.innerHTML = h;

            const tbl = wrap.firstElementChild;

            tbl.querySelectorAll('thead th[data-sk]').forEach(th => {
                th.addEventListener('click', () => {
                    const key = th.dataset.sk;
                    if (_sk === key) { _sd *= -1; } else { _sk = key; _sd = -1; }
                    _render();
                });
            });

            if (onRowClick) {
                tbl.querySelectorAll('tbody tr[data-ri]').forEach(tr => {
                    const i = +tr.dataset.ri;
                    tr.addEventListener('click', () => onRowClick(sorted[i], i));
                });
            }
        }

        _render();

        /** Update items and/or sort state, then re-render. */
        wrap.refresh = ({ items: newItems, sortKey: sk, sortDir: sd, footer: newFooter } = {}) => {
            if (newItems !== undefined) _items = newItems;
            if (sk !== undefined) _sk = sk;
            if (sd !== undefined) _sd = sd;
            if (newFooter !== undefined) _footer = newFooter;
            _render();
        };

        return wrap;
    };

    /**
     * Create a progress bar.
     *
     * @param {object}         [opts]
     * @param {string}         [opts.title]    — label shown at the left (default: '⚡ Processing')
     * @param {boolean}        [opts.inline]   — true: slim inline bar (append to container); false: fixed top overlay
     * @param {HTMLElement}    [opts.container] — required when inline:true; bar is appended here
     * @param {number}         [opts.fadeDelay] — ms before overlay auto-hides after done() (default: 2500)
     * @returns {{ update(current, total, label?): void, done(msg?): void, error(msg): void, remove(): void }}
     */
    const progressBar = ({ title = '⚡ Processing', inline = false, container = null, fadeDelay = 2500 } = {}) => {
        const wrap = document.createElement('div');

        if (inline) {
            wrap.className = 'tmu-prog-inline';
            wrap.innerHTML = '<div class="tmu-prog-bar"></div>';
            if (container) container.appendChild(wrap);
        } else {
            wrap.className = 'tmu-prog-overlay';
            wrap.innerHTML =
                `<div class="tmu-prog-inner">` +
                `<div class="tmu-prog-title">${title}</div>` +
                `<div class="tmu-prog-track"><div class="tmu-prog-bar"></div></div>` +
                `<div class="tmu-prog-text">Initializing...</div>` +
                `</div>`;
            document.body.appendChild(wrap);
        }

        const barEl = () => wrap.querySelector('.tmu-prog-bar');
        const txtEl = () => wrap.querySelector('.tmu-prog-text');

        return {
            update(current, total, label) {
                const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                const b = barEl();
                if (b) b.style.width = pct + '%';
                const t = txtEl();
                if (t) t.textContent = label != null ? label : `${current}/${total}`;
            },
            done(msg) {
                const b = barEl(), t = txtEl();
                if (b) b.style.width = '100%';
                if (t) { t.style.color = '#6cc040'; t.textContent = msg != null ? msg : '✓ Done'; }
                if (!inline) setTimeout(() => {
                    wrap.style.opacity = '0';
                    setTimeout(() => wrap.remove(), 600);
                }, fadeDelay);
            },
            error(msg) {
                const t = txtEl();
                if (t) { t.style.color = '#f87171'; t.textContent = msg; }
                if (!inline) setTimeout(() => wrap.remove(), 4000);
            },
            remove() { wrap.remove(); },
        };
    };

    const modal = ({ icon, title, message, buttons }) =>
        new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'tmu-modal-overlay';
            overlay.innerHTML =
                `<div class="tmu-modal">` +
                `<div class="tmu-modal-icon">${icon || ''}</div>` +
                `<div class="tmu-modal-title">${title}</div>` +
                `<div class="tmu-modal-msg">${message}</div>` +
                `<div class="tmu-modal-btns">${buttons.map(b =>
                    `<button class="tmu-modal-btn tmu-modal-btn-${b.style || 'secondary'}" data-val="${b.value}">` +
                    `${b.label}${b.sub ? `<span class="tmu-modal-btn-sub">${b.sub}</span>` : ''}` +
                    `</button>`
                ).join('')}</div></div>`;
            const closeWith = val => { overlay.remove(); resolve(val); };
            const onKey = e => {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeWith('cancel'); }
            };
            overlay.addEventListener('click', e => {
                if (e.target === overlay) { document.removeEventListener('keydown', onKey); closeWith('cancel'); }
            });
            document.addEventListener('keydown', onKey);
            overlay.querySelectorAll('.tmu-modal-btn').forEach(btn =>
                btn.addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(btn.dataset.val); })
            );
            document.body.appendChild(overlay);
        });

    const prompt = ({ icon, title, placeholder, defaultValue }) =>
        new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'tmu-modal-overlay';
            const esc = s => (s || '').replace(/"/g, '&quot;');
            overlay.innerHTML =
                `<div class="tmu-modal">` +
                `<div class="tmu-modal-icon">${icon || ''}</div>` +
                `<div class="tmu-modal-title">${title}</div>` +
                `<input type="text" class="tmu-prompt-input" placeholder="${esc(placeholder)}" value="${esc(defaultValue)}" />` +
                `<div class="tmu-modal-btns">` +
                `<button class="tmu-modal-btn tmu-modal-btn-primary" data-val="ok">💾 Save</button>` +
                `<button class="tmu-modal-btn tmu-modal-btn-danger" data-val="cancel">Cancel</button>` +
                `</div></div>`;
            const getVal = () => overlay.querySelector('.tmu-prompt-input').value.trim();
            const closeWith = val => { overlay.remove(); resolve(val); };
            const onKey = e => {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeWith(null); }
                if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); closeWith(getVal() || null); }
            };
            overlay.addEventListener('click', e => {
                if (e.target === overlay) { document.removeEventListener('keydown', onKey); closeWith(null); }
            });
            document.addEventListener('keydown', onKey);
            overlay.querySelector('[data-val="ok"]').addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(getVal() || null); });
            overlay.querySelector('[data-val="cancel"]').addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(null); });
            document.body.appendChild(overlay);
            setTimeout(() => overlay.querySelector('.tmu-prompt-input').focus(), 50);
        });

    /**
     * Creates a tab bar DOM node.
     *
     * @param {object}   opts
     * @param {Array}    opts.items    — [{ key, label, disabled? }]
     * @param {string}   opts.active   — initially active key
     * @param {Function} opts.onChange — (key) => void — called on tab switch (not called for disabled tabs)
     * @returns {HTMLDivElement}  — div.tmu-tabs with buttons inside; override className for custom styling
     */
    const tabs = ({ items, active, onChange }) => {
        const wrap = document.createElement('div');
        wrap.className = 'tmu-tabs';
        items.forEach(({ key, label, disabled }) => {
            const btn = document.createElement('button');
            btn.className = 'tmu-tab' + (key === active ? ' active' : '');
            btn.dataset.tab = key;
            btn.textContent = label;
            if (disabled) btn.disabled = true;
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                wrap.querySelectorAll('.tmu-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onChange(key);
            });
            wrap.appendChild(btn);
        });
        return wrap;
    };

    /**
     * Returns a sort-direction indicator string for use in table headers.
     *
     * @param {string}  key      — column key being rendered
     * @param {string}  sortKey  — currently active sort column
     * @param {boolean} asc      — true = ascending
     * @returns {string}         — ' ▲', ' ▼', or ''
     */
    const sortArrow = (key, sortKey, asc) => key === sortKey ? (asc ? ' ▲' : ' ▼') : '';

    /**
     * Returns an HTML string for a colored skill value with optional decimal superscript.
     * Renders:
     *   —  null/undefined → muted dash
     *   —  floor ≥ 20   → gold ★
     *   —  floor ≥ 19   → silver ★ + decimal superscript
     *   —  otherwise    → colored integer + decimal superscript
     *
     * @param {number|null} val — skill value (may have decimals)
     * @returns {string}        — HTML string
     */
    const skillBadge = (val) => {
        if (val == null) return '<span style="color:#4a5a40">—</span>';
        const floor = Math.floor(val);
        const frac = val - floor;
        const fracStr = frac > 0.005
            ? `<sup style="font-size:8px;opacity:.75">.${Math.round(frac * 100).toString().padStart(2, '0')}</sup>`
            : '';
        if (floor >= 20) return '<span style="color:#d4af37;font-size:13px">★</span>';
        if (floor >= 19) return `<span style="color:#c0c0c0;font-size:13px">★${fracStr}</span>`;
        return `<span style="color:${TmUtils.skillColor(floor)}">${floor}${fracStr}</span>`;
    };

    /**
     * Positions a body-appended tooltip element near an anchor element,
     * with viewport edge clamping (right and bottom edges).
     *
     * @param {HTMLElement} el     — the tooltip element (already in DOM)
     * @param {Element}     anchor — element to anchor against
     */
    const positionTooltip = (el, anchor) => {
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
    };

    /**
     * Build the standard position chip HTML used across squad, transfer, and shortlist tables.
     * The chip container uses the primary position color for background (10% opacity) and border (25% opacity).
     *
     * @param {string} primaryColor  — hex color of the first/primary position
     * @param {string} innerHTML     — pre-built inner HTML (colored position label spans)
     * @param {string} [cls]         — optional CSS class (default: 'tm-pos-chip')
     * @returns {string} HTML string
     */
    const positionChip = (primaryColor, innerHTML, cls = 'tm-pos-chip') =>
        `<span class="${cls}" style="background:${primaryColor}22;border:1px solid ${primaryColor}44">${innerHTML}</span>`;

    /**
     * Returns an HTML string for a loading state.
     * @param {string} [msg='Loading…']
     * @param {boolean} [compact]  — true: use .tmu-state-sm (smaller padding, font)
     * @returns {string}
     */
    const loading = (msg = 'Loading\u2026', compact = false) =>
        `<div class="tmu-state${compact ? ' tmu-state-sm' : ''}">`+
        `<span class="tmu-spinner tmu-spinner-md"></span>`+
        `<span class="tmu-state-text">${msg}</span></div>`;

    /**
     * Returns an HTML string for an empty state.
     * @param {string} [msg='No data']
     * @param {boolean} [compact]
     * @returns {string}
     */
    const empty = (msg = 'No data', compact = false) =>
        `<div class="tmu-state tmu-state-empty${compact ? ' tmu-state-sm' : ''}">`+
        `<span class="tmu-state-text">${msg}</span></div>`;

    /**
     * Returns an HTML string for an error state.
     * @param {string} [msg='Error']
     * @param {boolean} [compact]
     * @returns {string}
     */
    const error = (msg = 'Error', compact = false) =>
        `<div class="tmu-state tmu-state-error${compact ? ' tmu-state-sm' : ''}">`+
        `<span>\u26a0</span>`+
        `<span class="tmu-state-text">${msg}</span></div>`;

    export const TmUI = { button, render, stat, chip, table, progressBar, modal, prompt, tabs, sortArrow, skillBadge, positionTooltip, positionChip, loading, empty, error };

