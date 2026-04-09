(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/components/shared/tm-page-layout.js
  var STYLE_ID = "tmu-page-layout-style";
  var TMU_PAGE_LAYOUT_CSS = `
.tmu-page-layout-2col,
.tmu-page-layout-3rail{
display:grid!important;
gap:var(--tmu-page-gap,var(--tmu-space-lg));
align-items:start
}
.tmu-page-layout-2col{
grid-template-columns:var(--tmu-page-sidebar-width,184px) var(--tmu-page-main-track,minmax(0,1fr))
}
.tmu-page-layout-3rail{
grid-template-columns:var(--tmu-page-sidebar-width,184px) var(--tmu-page-main-track,minmax(0,1fr)) var(--tmu-page-rail-width,340px)
}
.tmu-page-sidebar-stack,
.tmu-page-section-stack,
.tmu-page-rail-stack{
min-width:0;
display:flex;
flex-direction:column;
gap:var(--tmu-section-gap,var(--tmu-space-lg))
}
.tmu-page-card-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(var(--tmu-card-grid-min,220px),1fr));
gap:var(--tmu-card-grid-gap,var(--tmu-space-md))
}
.tmu-stack{
display:flex;
flex-direction:column;
min-width:0
}
.tmu-stack-density-tight{
gap:var(--tmu-space-md)
}
.tmu-stack-density-regular{
gap:var(--tmu-space-md)
}
.tmu-stack-density-cozy{
gap:var(--tmu-space-lg)
}
.tmu-stack-density-roomy{
gap:var(--tmu-space-lg)
}
.tmu-page-density-compact{
--tmu-page-gap:var(--tmu-space-lg);
--tmu-section-gap:var(--tmu-space-lg)
}
.tmu-page-density-regular{
--tmu-page-gap:var(--tmu-space-lg);
--tmu-section-gap:var(--tmu-space-lg)
}
.tmu-page-density-roomy{
--tmu-page-gap:var(--tmu-space-xl);
--tmu-section-gap:var(--tmu-space-xl)
}
.tmu-card-grid-density-compact{
--tmu-card-grid-gap:var(--tmu-space-md)
}
.tmu-card-grid-density-tight{
--tmu-card-grid-gap:var(--tmu-space-sm)
}
.tmu-card-grid-density-regular{
--tmu-card-grid-gap:var(--tmu-space-md)
}
.tmu-card-grid-density-roomy{
--tmu-card-grid-gap:var(--tmu-space-lg)
}
.tmu-page-stack-early>.tmu-page-sidebar-stack{
order:initial
}
`;
  function injectTmPageLayoutStyles(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = TMU_PAGE_LAYOUT_CSS;
    target.appendChild(style);
  }
  injectTmPageLayoutStyles();

  // src/components/shared/tm-button.js
  var STYLE_ID2 = "tmu-button-style";
  var TMU_BUTTON_CSS = `
/* \u2500\u2500 Button \u2500\u2500 */
.tmu-btn {
    border: 1px solid transparent; cursor: pointer;
    font-family: inherit; font-weight: 800; letter-spacing: 0.02em;
    transition: background 0.15s, opacity 0.15s, border-color 0.15s, color 0.15s;
    box-shadow: none;
}
.tmu-btn-size-xs { min-height: 22px; padding: 0 5px;   font-size: var(--tmu-font-xs); }
.tmu-btn-size-sm { min-height: 26px; padding: 1px 8px;  font-size: var(--tmu-font-xs); }
.tmu-btn-size-md { min-height: 28px; padding: 2px 10px; font-size: var(--tmu-font-sm); }
.tmu-btn-size-lg { min-height: 32px; padding: 4px 14px; font-size: var(--tmu-font-sm); }
.tmu-btn-size-xl { min-height: 38px; padding: 6px 18px; font-size: var(--tmu-font-md); }
.tmu-btn.tmu-btn-size-xs { font-weight: 600; }
.tmu-btn.tmu-btn-size-sm { font-weight: 700; }
.tmu-btn.tmu-btn-size-md,
.tmu-btn.tmu-btn-size-lg,
.tmu-btn.tmu-btn-size-xl { font-weight: 800; }
.tmu-btn-icon                    { padding: 0 !important; }
.tmu-btn-icon.tmu-btn-size-xs    { width: 22px; height: 22px; }
.tmu-btn-icon.tmu-btn-size-sm    { width: 26px; height: 26px; }
.tmu-btn-icon.tmu-btn-size-md    { width: 28px; height: 28px; }
.tmu-btn-icon.tmu-btn-size-lg    { width: 32px; height: 32px; }
.tmu-btn-icon.tmu-btn-size-xl    { width: 38px; height: 38px; }
.tmu-btn-variant-button { display: inline-flex; align-items: center; justify-content: center; gap: var(--tmu-space-sm); }
.tmu-btn-variant-icon {
    display: inline-flex; align-items: center; justify-content: center;
    background: none !important; border: none !important; padding: 0 !important; min-width: 0;
    box-shadow: none !important;
}
.tmu-btn-variant-icon:hover:not(:disabled) { background: none !important; }
.tmu-btn-block { width: 100%; }
.tmu-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tmu-btn:hover:not(:disabled) { transform: none; }
.tmu-btn:focus-visible { outline: 1px solid var(--tmu-border-pill-active); outline-offset: 2px; }
.tmu-btn-primary   { background: var(--tmu-color-secondary); color: var(--tmu-text-inverse); }
.tmu-btn-primary:hover:not(:disabled)   { background: var(--tmu-color-primary); border-color: var(--tmu-color-primary); }
.tmu-btn-secondary { background: var(--tmu-color-surface) !important; color: var(--tmu-text-panel-label); border: none !important; }
.tmu-btn-secondary:hover:not(:disabled) { background: var(--tmu-surface-item-hover) !important; color: var(--tmu-text-strong); border: none !important; }
.tmu-btn-danger    { background: var(--tmu-danger-fill); color: var(--tmu-danger); border-color: var(--tmu-border-danger); }
.tmu-btn-danger:hover:not(:disabled)    { background: var(--tmu-border-danger); color: var(--tmu-text-inverse); }
.tmu-btn-lime      { background: var(--tmu-success-fill); border-color: var(--tmu-border-success); color: var(--tmu-text-accent-soft); display: flex; align-items: center; justify-content: center; gap: var(--tmu-space-sm); }
.tmu-btn-lime:hover:not(:disabled)      { background: var(--tmu-color-primary); color: var(--tmu-text-inverse); }
.tmu-btn-active { background: var(--tmu-color-primary) !important; border-color: var(--tmu-color-primary) !important; }
`;
  function injectTmButtonCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID2)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID2}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID2;
    style.textContent = TMU_BUTTON_CSS;
    target.appendChild(style);
  }
  injectTmButtonCss();
  var TmButton = {
    /**
     * Creates a <button> element.
     *
     * @param {object}       opts
     * @param {string}      [opts.label]   — plain text label (use OR slot, not both)
     * @param {Node|string} [opts.slot]    — DOM node or HTML string for rich content
     * @param {string}      [opts.id]
     * @param {string}      [opts.title]
    * @param {string}      [opts.variant] — 'button' | 'icon' (default: 'button')
    * @param {string}      [opts.color]   — 'primary' | 'secondary' | 'danger' | 'lime' (default: 'lime')
     * @param {string}      [opts.size]    — 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
     * @param {string|null} [opts.icon]    — SVG string for icon-only square button; skips label/slot
     * @param {string}      [opts.shape]   — 'md' | 'full' (default: 'md')
     * @param {string}      [opts.cls]     — extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {string}      [opts.type]    — button type attribute (default: 'button')
     * @param {object}      [opts.attrs]   — extra attributes to set on the button element
     * @param {Function}    [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    button({ label, slot, id, title = "", variant = "button", color = "lime", size = "md", icon = null, shape = "md", cls = "", block = false, disabled = false, active = false, type = "button", attrs = {}, onClick } = {}) {
      const VALID_SIZES = /* @__PURE__ */ new Set(["xs", "sm", "md", "lg", "xl"]);
      const SHAPES = { md: "rounded-md", full: "rounded-full" };
      const COLORS = /* @__PURE__ */ new Set(["primary", "secondary", "danger", "lime"]);
      const resolvedVariant = COLORS.has(variant) ? "button" : variant;
      const resolvedColor = COLORS.has(variant) ? variant : color;
      const sizeClass = `tmu-btn-size-${VALID_SIZES.has(size) ? size : "md"}`;
      const btn = document.createElement("button");
      btn.className = `tmu-btn tmu-btn-variant-${resolvedVariant} tmu-btn-${resolvedColor} ${SHAPES[shape] || SHAPES.md} ${sizeClass}${icon ? " tmu-btn-icon" : ""}${block ? " tmu-btn-block" : ""}${active ? " tmu-btn-active" : ""}${cls ? " " + cls : ""}`;
      if (id) btn.id = id;
      if (title) btn.title = title;
      btn.type = type;
      if (disabled) btn.disabled = true;
      Object.entries(attrs || {}).forEach(([key, value]) => {
        if (value == null || value === false) return;
        if (value === true) {
          btn.setAttribute(key, "");
          return;
        }
        btn.setAttribute(key, String(value));
      });
      if (icon) {
        btn.innerHTML = icon;
      } else if (slot instanceof Node) {
        btn.appendChild(slot);
      } else if (typeof slot === "string") {
        btn.innerHTML = slot;
      } else if (label != null) {
        btn.textContent = label;
      }
      if (onClick) btn.addEventListener("click", onClick);
      return btn;
    }
  };

  // src/components/shared/tm-checkbox.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
.tmu-checkbox-wrap {
    display: inline-flex;
    align-items: center;
    gap: var(--tmu-space-sm);
    cursor: pointer;
    color: var(--tmu-text-muted);
    font-size: var(--tmu-font-xs);
    font-weight: 600;
    line-height: 1.2;
}
.tmu-checkbox-wrap:has(.tmu-checkbox:disabled) {
    cursor: not-allowed;
    color: var(--tmu-text-disabled);
}
.tmu-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 13px;
    height: 13px;
    margin: 0;
    position: relative;
    cursor: pointer;
    flex: 0 0 auto;
    border: 1px solid var(--tmu-checkbox-border, var(--tmu-border-soft-alpha-mid));
    border-radius: var(--tmu-space-xs);
    background: var(--tmu-checkbox-bg, var(--tmu-surface-overlay-soft));
    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tmu-checkbox::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 3px;
    height: 7px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: 0;
}
.tmu-checkbox:checked {
    background: var(--tmu-checkbox-checked-bg, var(--tmu-accent-fill));
    border-color: var(--tmu-checkbox-checked-border, var(--tmu-checkbox-checked-bg, var(--tmu-accent-fill)));
}
.tmu-checkbox:checked::after {
    opacity: 1;
}
.tmu-checkbox:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--tmu-success-fill-hover);
}
.tmu-checkbox:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
.tmu-checkbox-label {
    cursor: inherit;
}
` }));
  var TmCheckbox = {
    checkbox({
      id,
      name,
      checked = false,
      cls = "",
      disabled = false,
      value,
      attrs = {},
      onChange
    } = {}) {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = `tmu-checkbox${cls ? " " + cls : ""}`;
      if (id) input.id = id;
      if (name) input.name = name;
      if (checked) input.checked = true;
      if (disabled) input.disabled = true;
      if (value !== void 0 && value !== null) input.value = String(value);
      Object.entries(attrs).forEach(([key, val]) => {
        if (val === void 0 || val === null) return;
        input.setAttribute(key, String(val));
      });
      if (onChange) input.addEventListener("change", onChange);
      return input;
    },
    checkboxField({
      id,
      name,
      checked = false,
      label = "",
      cls = "",
      inputCls = "",
      labelCls = "",
      disabled = false,
      value,
      attrs = {},
      onChange
    } = {}) {
      const row = document.createElement("label");
      row.className = `tmu-checkbox-wrap${cls ? " " + cls : ""}`;
      const input = TmCheckbox.checkbox({
        id,
        name,
        checked,
        cls: inputCls,
        disabled,
        value,
        attrs,
        onChange
      });
      row.appendChild(input);
      if (label) {
        const text = document.createElement("span");
        text.className = `tmu-checkbox-label${labelCls ? " " + labelCls : ""}`;
        text.textContent = label;
        row.appendChild(text);
      }
      row.inputEl = input;
      return row;
    }
  };

  // src/components/shared/tm-input.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Input / Field \u2500\u2500 */
.tmu-input {
    border-radius: var(--tmu-space-xs);
    background: var(--tmu-surface-overlay);
    border: 1px solid var(--tmu-border-input);
    color: var(--tmu-text-strong);
    font-weight: 600;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}
.tmu-input:focus { border-color: var(--tmu-success); }
.tmu-input:disabled { color: var(--tmu-text-disabled); cursor: not-allowed; }
.tmu-input::placeholder { color: var(--tmu-text-dim); }
.tmu-input[type="number"] { -moz-appearance: textfield; }
.tmu-input[type="number"]::-webkit-inner-spin-button,
.tmu-input[type="number"]::-webkit-outer-spin-button { opacity: 0; transition: opacity 0.15s; }
.tmu-input[type="number"]:focus::-webkit-inner-spin-button,
.tmu-input[type="number"]:focus::-webkit-outer-spin-button { opacity: 1; filter: invert(0.6); }
.tmu-input[type="number"]:focus { -moz-appearance: number-input; }
.tmu-input-xs { width: 54px; }
.tmu-input-sm { width: 70px; }
.tmu-input-md { width: 110px; }
.tmu-input-lg { width: 180px; }
.tmu-input-xl { width: 200px; }
.tmu-input-full { width: 100%; }
.tmu-input-grow { flex: 1; min-width: 0; }
.tmu-input-align-left { text-align: left; }
.tmu-input-align-center { text-align: center; }
.tmu-input-align-right { text-align: right; }
.tmu-input-density-compact { min-height: 26px; padding: var(--tmu-space-xs) var(--tmu-space-sm); }
.tmu-input-density-regular { min-height: 30px; padding: var(--tmu-space-xs) var(--tmu-space-sm); }
.tmu-input-density-comfy { min-height: 34px; padding: var(--tmu-space-sm) var(--tmu-space-md); }
.tmu-input-tone-default { }
.tmu-input-tone-overlay {
    background: var(--tmu-surface-overlay-strong);
    color: var(--tmu-text-main);
}
.tmu-input-tone-overlay:focus { border-color: var(--tmu-border-success); }
.tmu-input-tone-overlay:disabled { color: var(--tmu-text-disabled-strong); }
.tmu-input-tone-overlay::placeholder { color: var(--tmu-text-disabled); }
.tmu-field { display: flex; align-items: center; justify-content: space-between; gap: var(--tmu-space-sm); }
.tmu-field-label { font-size: var(--tmu-font-xs); font-weight: 600; color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
` }));
  var TmInput = {
    input({
      id,
      name,
      type = "text",
      value = "",
      placeholder = "",
      size = "md",
      tone = "default",
      density = "regular",
      align = "left",
      grow = false,
      cls = "",
      disabled = false,
      autocomplete,
      min,
      max,
      step,
      attrs = {},
      onInput,
      onChange
    } = {}) {
      const input = document.createElement("input");
      input.type = type;
      input.className = `tmu-input tmu-input-${size} tmu-input-tone-${tone} tmu-input-density-${density} tmu-input-align-${align} text-sm${grow ? " tmu-input-grow" : ""}${cls ? " " + cls : ""}`;
      if (id) input.id = id;
      if (name) input.name = name;
      if (value !== void 0 && value !== null) {
        input.value = String(value);
        input.setAttribute("value", String(value));
      }
      if (placeholder) input.placeholder = placeholder;
      if (autocomplete !== void 0) input.autocomplete = autocomplete;
      if (min !== void 0) input.min = String(min);
      if (max !== void 0) input.max = String(max);
      if (step !== void 0) input.step = String(step);
      if (disabled) input.disabled = true;
      Object.entries(attrs).forEach(([key, val]) => {
        if (val === void 0 || val === null) return;
        input.setAttribute(key, String(val));
      });
      if (onInput) input.addEventListener("input", onInput);
      if (onChange) input.addEventListener("change", onChange);
      return input;
    },
    field({ label, input, cls = "" } = {}) {
      const row = document.createElement("div");
      row.className = `tmu-field${cls ? " " + cls : ""}`;
      if (label) {
        const lbl = document.createElement("span");
        lbl.className = "tmu-field-label";
        lbl.textContent = label;
        row.appendChild(lbl);
      }
      if (input) row.appendChild(input);
      return row;
    }
  };

  // src/components/shared/tm-autocomplete.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
.tmu-ac {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--tmu-space-sm);
}
.tmu-ac-leading {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.tmu-ac-drop {
    display: none;
    position: absolute;
    top: calc(100% + var(--tmu-space-xs));
    left: 0;
    right: 0;
    background: var(--tmu-surface-card-soft);
    border: 1px solid var(--tmu-border-faint);
    border-radius: var(--tmu-space-xs);
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    scrollbar-width: thin;
    scrollbar-color: var(--tmu-border-embedded) transparent;
    box-shadow: 0 6px 20px var(--tmu-shadow-panel);
}
.tmu-ac-drop.tmu-ac-drop-open {
    display: block;
}
.tmu-ac-item {
    display: flex;
    align-items: center;
    gap: var(--tmu-space-sm);
    padding: var(--tmu-space-sm) var(--tmu-space-md);
    font-size: var(--tmu-font-xs);
    color: var(--tmu-text-main);
    cursor: pointer;
    border-bottom: 1px solid var(--tmu-border-input-overlay);
}
.tmu-ac-item:hover {
    background: var(--tmu-surface-tab-hover);
    color: var(--tmu-text-strong);
}
.tmu-ac-item.tmu-ac-item-active {
    color: var(--tmu-success);
    font-weight: 700;
}
.tmu-ac-item-icon,
.tmu-ac-media {
    width: 20px;
    height: 13px;
    object-fit: cover;
    border-radius: var(--tmu-space-xs);
    flex-shrink: 0;
    box-shadow: 0 1px 3px var(--tmu-shadow-elev);
}
` }));
  var setLeadingContent = (host, content) => {
    host.innerHTML = "";
    if (!content) {
      host.hidden = true;
      return;
    }
    if (typeof content === "string") {
      host.innerHTML = content;
    } else {
      host.appendChild(content);
    }
    host.hidden = false;
  };
  var TmAutocomplete = {
    autocomplete({
      id,
      name,
      value = "",
      placeholder = "",
      size = "full",
      tone = "default",
      density = "regular",
      grow = true,
      cls = "",
      disabled = false,
      autocomplete = "off",
      attrs = {},
      leading = null,
      onInput,
      onChange
    } = {}) {
      const root = document.createElement("div");
      root.className = `tmu-ac${cls ? ` ${cls}` : ""}`;
      const leadingHost = document.createElement("div");
      leadingHost.className = "tmu-ac-leading";
      root.appendChild(leadingHost);
      setLeadingContent(leadingHost, leading);
      const input = TmInput.input({
        id,
        name,
        value,
        placeholder,
        size,
        tone,
        density,
        grow,
        disabled,
        autocomplete,
        attrs: {
          "aria-autocomplete": "list",
          ...attrs
        },
        onInput,
        onChange
      });
      root.appendChild(input);
      const drop = document.createElement("div");
      drop.className = "tmu-ac-drop";
      root.appendChild(drop);
      root.inputEl = input;
      root.dropEl = drop;
      root.leadingEl = leadingHost;
      root.setLeading = (content) => setLeadingContent(leadingHost, content);
      root.hideDrop = () => drop.classList.remove("tmu-ac-drop-open");
      root.showDrop = () => {
        if (!drop.childElementCount) return;
        drop.classList.add("tmu-ac-drop-open");
      };
      root.setItems = (items = []) => {
        drop.innerHTML = "";
        items.forEach((item) => {
          if (!item) return;
          drop.appendChild(item);
        });
        if (drop.childElementCount) root.showDrop();
        else root.hideDrop();
      };
      root.setValue = (nextValue = "") => {
        input.value = String(nextValue);
      };
      root.setDisabled = (nextDisabled) => {
        input.disabled = !!nextDisabled;
      };
      return root;
    },
    autocompleteItem({ label = "", icon = null, active = false, onSelect } = {}) {
      const el = document.createElement("div");
      el.className = `tmu-ac-item${active ? " tmu-ac-item-active" : ""}`;
      if (icon) {
        if (typeof icon === "string") {
          const wrap = document.createElement("span");
          wrap.className = "tmu-ac-item-icon";
          wrap.innerHTML = icon;
          el.appendChild(wrap);
        } else {
          el.appendChild(icon);
        }
      }
      el.appendChild(document.createTextNode(label));
      if (onSelect) {
        el.addEventListener("mousedown", (event) => {
          event.preventDefault();
          onSelect();
        });
      }
      return el;
    }
  };

  // src/components/shared/tm-badge.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Badge \u2500\u2500 */
.tmu-badge{display:inline-flex;align-items:center;justify-content:center;gap:var(--tmu-space-sm);min-width:0;border:1px solid transparent;box-sizing:border-box;line-height:1.2;text-decoration:none}
.tmu-badge-label{color:inherit;opacity:.92}
.tmu-badge-value{color:var(--tmu-text-inverse);font-weight:inherit}
.tmu-badge-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
.tmu-badge a{color:var(--tmu-text-inverse);text-decoration:none}
.tmu-badge a:hover{text-decoration:underline}
.tmu-badge-size-xs{min-height:16px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:700;letter-spacing:.05em}
.tmu-badge-size-sm{min-height:18px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.04em}
.tmu-badge-size-md{min-height:22px;padding:var(--tmu-space-xs) var(--tmu-space-md);border-radius:999px;font-size:var(--tmu-font-sm);font-weight:700;letter-spacing:.03em}
.tmu-badge-shape-rounded{border-radius:var(--tmu-space-xs)}
.tmu-badge-shape-full{border-radius:999px}
.tmu-badge-weight-regular{font-weight:600}
.tmu-badge-weight-bold{font-weight:700}
.tmu-badge-weight-heavy{font-weight:800}
.tmu-badge-uppercase{text-transform:uppercase}
.tmu-badge-tone-muted{background:var(--tmu-surface-dark-soft);border-color:var(--tmu-border-soft-alpha);color:var(--tmu-text-muted)}
.tmu-badge-tone-success{background:var(--tmu-success-fill);border-color:var(--tmu-border-success);color:var(--tmu-success)}
.tmu-badge-tone-warn{background:var(--tmu-warning-fill);border-color:var(--tmu-border-warning);color:var(--tmu-warning-soft)}
.tmu-badge-tone-info{background:var(--tmu-info-fill);border-color:var(--tmu-border-info);color:var(--tmu-info-strong)}
.tmu-badge-tone-accent{background:var(--tmu-accent-fill-soft);border-color:var(--tmu-border-accent);color:var(--tmu-purple)}
.tmu-badge-tone-danger{background:var(--tmu-danger-fill);border-color:var(--tmu-border-danger);color:var(--tmu-danger-strong)}
.tmu-badge-tone-live{background:var(--tmu-live-fill);border-color:var(--tmu-border-live);color:var(--tmu-text-live)}
.tmu-badge-tone-preview{background:var(--tmu-preview-fill);border-color:var(--tmu-border-preview);color:var(--tmu-text-preview)}
.tmu-badge-tone-highlight{background:var(--tmu-highlight-fill);border-color:var(--tmu-border-highlight);color:var(--tmu-text-highlight)}
`
  }));
  var TmBadge = {
    /**
     * Backward compatible usage:
     *   badge('LIVE', 'live')
     * New usage:
     *   badge({ label: 'ASI', value: '12345', tone: 'highlight' })
     * @returns {string} HTML string
     */
    badge(input, tone = "muted") {
      if (typeof input !== "object" || input == null || Array.isArray(input)) {
        return `<span class="tmu-badge tmu-badge-size-sm tmu-badge-shape-rounded tmu-badge-weight-bold tmu-badge-tone-${tone}">${input != null ? input : ""}</span>`;
      }
      const {
        label = "",
        value = "",
        slot = "",
        icon = "",
        size = "sm",
        shape = "rounded",
        weight = "bold",
        uppercase = false,
        cls = "",
        attrs = {}
      } = input;
      const classes = [
        "tmu-badge",
        `tmu-badge-size-${size}`,
        `tmu-badge-shape-${shape}`,
        `tmu-badge-weight-${weight}`,
        `tmu-badge-tone-${tone || "muted"}`
      ];
      if (uppercase) classes.push("tmu-badge-uppercase");
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const content = slot || [
        icon ? `<span class="tmu-badge-icon">${icon}</span>` : "",
        value !== "" ? `<span class="tmu-badge-label">${label}</span><span class="tmu-badge-value">${value}</span>` : label
      ].join("");
      return `<span class="${classes.join(" ")}"${attrText2}>${content}</span>`;
    }
  };

  // src/components/shared/tm-chip.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Chip \u2500\u2500 */
.tmu-chip{display:inline-flex;align-items:center;justify-content:center;gap:var(--tmu-space-xs);border:1px solid transparent;box-sizing:border-box}
.tmu-chip-label{color:inherit;opacity:.9}
.tmu-chip-value{color:var(--tmu-text-inverse);font-weight:inherit}
.tmu-chip a{color:var(--tmu-text-inverse);text-decoration:none}
.tmu-chip a:hover{text-decoration:underline}
.tmu-chip-size-xs{min-height:16px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:700;letter-spacing:.05em;line-height:1.2}
.tmu-chip-size-sm{min-height:18px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.04em;line-height:1.2}
.tmu-chip-size-md{min-height:22px;padding:0 var(--tmu-space-sm);border-radius:999px;font-size:var(--tmu-font-xs);font-weight:800;letter-spacing:.04em;line-height:1.2}
.tmu-chip-shape-rounded{border-radius:var(--tmu-space-xs)}
.tmu-chip-shape-full{border-radius:999px}
.tmu-chip-weight-regular{font-weight:600}
.tmu-chip-weight-bold{font-weight:700}
.tmu-chip-weight-heavy{font-weight:800}
.tmu-chip-uppercase{text-transform:uppercase}
.tmu-chip-gk,.tmu-chip-tone-success{background:var(--tmu-success-fill-soft);border-color:var(--tmu-border-success);color:var(--tmu-success)}
.tmu-chip-d {background:var(--tmu-info-fill);border-color:var(--tmu-border-info);color:var(--tmu-info-strong)}
.tmu-chip-m {background:var(--tmu-highlight-fill);border-color:var(--tmu-border-highlight);color:var(--tmu-text-highlight)}
.tmu-chip-f {background:var(--tmu-warning-fill);border-color:var(--tmu-border-warning);color:var(--tmu-warning-soft)}
.tmu-chip-default,.tmu-chip-tone-muted{background:var(--tmu-surface-dark-soft);border-color:var(--tmu-border-soft-alpha);color:var(--tmu-text-muted)}
.tmu-chip-tone-overlay{background:var(--tmu-surface-overlay);border-color:var(--tmu-border-input-overlay);color:var(--tmu-text-main)}
.tmu-chip-tone-warn{background:var(--tmu-warning-fill);border-color:var(--tmu-border-warning);color:var(--tmu-warning-soft)}
` }));
  var TmChip = {
    /**
     * Backward compatible usage:
     *   chip('GK', 'gk')
     * New usage:
     *   chip({ label: 'GK', tone: 'warn', size: 'xs', shape: 'rounded' })
     * @returns {string} HTML string
     */
    chip(input, variant = "default") {
      if (typeof input !== "object" || input == null || Array.isArray(input)) {
        return `<span class="tmu-chip tmu-chip-size-sm tmu-chip-shape-rounded tmu-chip-${variant}">${input != null ? input : ""}</span>`;
      }
      const {
        label = "",
        value = "",
        slot = "",
        tone = "muted",
        size = "sm",
        shape = size === "md" ? "full" : "rounded",
        weight = size === "md" ? "heavy" : "bold",
        uppercase = false,
        cls = "",
        attrs = {}
      } = input;
      const classes = [
        "tmu-chip",
        `tmu-chip-size-${size}`,
        `tmu-chip-shape-${shape}`,
        `tmu-chip-weight-${weight}`,
        `tmu-chip-tone-${tone}`
      ];
      if (uppercase) classes.push("tmu-chip-uppercase");
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, value2]) => value2 !== void 0 && value2 !== null).map(([key, value2]) => ` ${key}="${String(value2).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const content = slot || (value !== "" ? `<span class="tmu-chip-label">${label}</span><span class="tmu-chip-value">${value}</span>` : label);
      return `<span class="${classes.join(" ")}"${attrText2}>${content}</span>`;
    }
  };

  // src/components/shared/tm-compare-stat.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Comparative stat row \u2500\u2500 */
.tmu-cstat{min-width:0}
.tmu-cstat-header{display:flex;align-items:baseline;justify-content:space-between;gap:var(--tmu-space-md);margin-bottom:var(--tmu-space-xs)}
.tmu-cstat-val{font-weight:800;min-width:32px;font-variant-numeric:tabular-nums}
.tmu-cstat-val-left{text-align:left}
.tmu-cstat-val-right{text-align:right}
.tmu-cstat-val-leading{font-weight:900}
.tmu-cstat-label{font-weight:600;color:var(--tmu-text-muted);font-size:var(--tmu-font-xs);text-transform:uppercase;letter-spacing:.08em}
.tmu-cstat-bar{display:flex;overflow:hidden;background:var(--tmu-compare-bar-bg);gap:var(--tmu-space-xs)}
.tmu-cstat-seg{transition:width .5s cubic-bezier(.4,0,.2,1);min-width:3px}
.tmu-cstat-size-sm{padding:var(--tmu-space-sm) 0}
.tmu-cstat-size-sm .tmu-cstat-val{font-size:var(--tmu-font-md);min-width:30px}
.tmu-cstat-size-sm .tmu-cstat-val-leading{font-size:var(--tmu-font-lg)}
.tmu-cstat-size-sm .tmu-cstat-bar{height:6px;border-radius:var(--tmu-space-xs)}
.tmu-cstat-size-sm .tmu-cstat-seg{border-radius:var(--tmu-space-xs)}
.tmu-cstat-size-md{padding:var(--tmu-space-md) var(--tmu-space-lg)}
.tmu-cstat-size-md .tmu-cstat-val{font-size:var(--tmu-font-md)}
.tmu-cstat-size-md .tmu-cstat-val-leading{font-size:17px}
.tmu-cstat-size-md .tmu-cstat-bar{height:7px;border-radius:var(--tmu-space-xs)}
.tmu-cstat-size-md .tmu-cstat-seg{border-radius:var(--tmu-space-xs)}
.tmu-cstat-highlight{background:var(--tmu-compare-fill)}
.tmu-cstat-tone-home,.tmu-cstat-tone-for{color:var(--tmu-accent)}
.tmu-cstat-tone-away,.tmu-cstat-tone-against{color:var(--tmu-info-alt)}
.tmu-cstat-seg.tmu-cstat-tone-home,.tmu-cstat-seg.tmu-cstat-tone-for{background:linear-gradient(90deg,var(--tmu-compare-home-grad-start),var(--tmu-compare-home-grad-end))}
.tmu-cstat-seg.tmu-cstat-tone-away,.tmu-cstat-seg.tmu-cstat-tone-against{background:linear-gradient(90deg,var(--tmu-compare-away-grad-start),var(--tmu-compare-away-grad-end))}
` }));
  var parseComparable = (value) => {
    const numeric = Number.parseFloat(String(value != null ? value : "").replace(/[^\d.+-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };
  var TmCompareStat = {
    compareStat({
      label = "",
      leftValue = "",
      rightValue = "",
      leftNumber,
      rightNumber,
      leftTone = "home",
      rightTone = "away",
      size = "md",
      highlight = false,
      cls = "",
      attrs = {}
    } = {}) {
      const leftNumeric = leftNumber != null ? leftNumber : parseComparable(leftValue);
      const rightNumeric = rightNumber != null ? rightNumber : parseComparable(rightValue);
      const total = leftNumeric + rightNumeric;
      const leftPct = total === 0 ? 50 : Math.round(leftNumeric / total * 100);
      const rightPct = 100 - leftPct;
      const classes = ["tmu-cstat", `tmu-cstat-size-${size}`];
      if (highlight) classes.push("tmu-cstat-highlight");
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const leftLead = leftNumeric > rightNumeric ? " tmu-cstat-val-leading" : "";
      const rightLead = rightNumeric > leftNumeric ? " tmu-cstat-val-leading" : "";
      return `<div class="${classes.join(" ")}"${attrText2}><div class="tmu-cstat-header"><span class="tmu-cstat-val tmu-cstat-val-left tmu-cstat-tone-${leftTone}${leftLead}">${leftValue}</span><span class="tmu-cstat-label">${label}</span><span class="tmu-cstat-val tmu-cstat-val-right tmu-cstat-tone-${rightTone}${rightLead}">${rightValue}</span></div><div class="tmu-cstat-bar"><div class="tmu-cstat-seg tmu-cstat-tone-${leftTone}" style="width:${leftPct}%"></div><div class="tmu-cstat-seg tmu-cstat-tone-${rightTone}" style="width:${rightPct}%"></div></div></div>`;
    }
  };

  // src/components/shared/tm-metric.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Metric \u2500\u2500 */
.tmu-metric{position:relative;min-width:0}
.tmu-metric-copy{min-width:0}
.tmu-metric-label{color:var(--tmu-text-panel-label);font-size:var(--tmu-font-xs);font-weight:700;text-transform:uppercase;letter-spacing:.12em;line-height:1.2}
.tmu-metric-value{margin-top:var(--tmu-space-sm);color:var(--tmu-text-strong);font-weight:800;line-height:1.1;letter-spacing:-.02em;word-break:break-word;font-variant-numeric:tabular-nums;text-wrap:balance}
.tmu-metric-note{margin-top:var(--tmu-space-sm);color:var(--tmu-text-accent-soft);font-size:var(--tmu-font-xs);line-height:1.45}
.tmu-metric-value a,.tmu-metric-note a{color:inherit;text-decoration:none}
.tmu-metric-value a:hover,.tmu-metric-note a:hover{text-decoration:underline}
.tmu-metric-size-sm .tmu-metric-value{font-size:var(--tmu-font-md)}
.tmu-metric-size-md .tmu-metric-value{font-size:17px}
.tmu-metric-size-lg .tmu-metric-value{font-size:var(--tmu-font-xl);font-weight:900}
.tmu-metric-size-xl .tmu-metric-value{font-size:var(--tmu-font-3xl);font-weight:900;line-height:.98}
.tmu-metric-align-left{text-align:left}
.tmu-metric-align-center{text-align:center}
.tmu-metric-align-right{text-align:right}
.tmu-metric-layout-card{padding:var(--tmu-space-lg) var(--tmu-space-xl) var(--tmu-space-lg);border-radius:var(--tmu-space-lg);background:linear-gradient(180deg,var(--tmu-surface-dark-strong),var(--tmu-surface-dark-soft));border:1px solid var(--tmu-border-soft-alpha-mid);box-shadow:inset 0 1px 0 var(--tmu-border-contrast),0 10px 24px var(--tmu-shadow-ring)}
.tmu-metric-layout-split{display:flex;align-items:center;justify-content:space-between;gap:var(--tmu-space-lg);padding:var(--tmu-space-md) var(--tmu-space-lg);border-radius:var(--tmu-space-md);background:linear-gradient(180deg,var(--tmu-surface-accent-soft),var(--tmu-surface-dark-soft));border:1px solid var(--tmu-border-soft-alpha-mid);box-shadow:inset 0 1px 0 var(--tmu-border-contrast)}
.tmu-metric-layout-split .tmu-metric-copy{flex:1 1 auto;min-width:0}
.tmu-metric-layout-split .tmu-metric-label{font-size:var(--tmu-font-2xs)}
.tmu-metric-layout-split .tmu-metric-value{margin-top:0;text-align:right;font-size:var(--tmu-font-sm);line-height:1.15}
.tmu-metric-layout-row{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--tmu-space-lg);padding:var(--tmu-space-sm) var(--tmu-space-md);border:1px solid transparent;border-radius:var(--tmu-space-md)}
.tmu-metric-layout-row .tmu-metric-copy{flex:1 1 auto}
.tmu-metric-layout-row .tmu-metric-label{font-size:var(--tmu-font-xs);letter-spacing:.02em;text-transform:none;color:var(--tmu-text-panel-label);font-weight:600}
.tmu-metric-layout-row .tmu-metric-note{margin-top:var(--tmu-space-xs);font-size:var(--tmu-font-xs)}
.tmu-metric-layout-row .tmu-metric-value{margin-top:0;text-align:right;line-height:1.15}
.tmu-metric-layout-row.tmu-metric-size-sm .tmu-metric-value{font-size:var(--tmu-font-md)}
.tmu-metric-layout-row.tmu-metric-size-md .tmu-metric-value{font-size:17px}
.tmu-metric-layout-row.tmu-metric-size-lg .tmu-metric-value{font-size:var(--tmu-font-xl)}
.tmu-metric-label-bottom .tmu-metric-label{margin-top:var(--tmu-space-xs)}
.tmu-metric-label-bottom .tmu-metric-value{margin-top:0}
.tmu-metric-size-xl.tmu-metric-label-bottom .tmu-metric-label{font-size:var(--tmu-font-2xs);letter-spacing:.05em}
.tmu-metric-tone-muted{background:linear-gradient(180deg,var(--tmu-surface-card-soft),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-soft-alpha)}
.tmu-metric-tone-overlay{background:linear-gradient(180deg,var(--tmu-surface-dark-mid),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-soft-alpha-mid)}
.tmu-metric-tone-panel{background:linear-gradient(180deg,var(--tmu-surface-panel),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-success);box-shadow:inset 0 1px 0 var(--tmu-border-contrast),0 10px 24px var(--tmu-shadow-ring)}
.tmu-metric-tone-success{background:linear-gradient(180deg,var(--tmu-success-fill-strong),var(--tmu-success-fill));border-color:var(--tmu-border-success)}
.tmu-metric-tone-warn{background:linear-gradient(180deg,var(--tmu-warning-fill),var(--tmu-highlight-fill));border-color:var(--tmu-border-warning)}
.tmu-metric-tone-danger{background:linear-gradient(180deg,var(--tmu-danger-fill),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-danger)}
` }));
  var TmMetric = {
    /**
     * metric({ label, value, note, layout, tone, size, align, labelPosition })
     * @returns {string} HTML string
     */
    metric({
      label = "",
      value = "",
      note = "",
      layout = "card",
      tone = "overlay",
      size = "md",
      align = "left",
      labelPosition = "top",
      cls = "",
      attrs = {},
      valueCls = "",
      valueAttrs = {},
      noteCls = ""
    } = {}) {
      const classes = [
        "tmu-metric",
        `tmu-metric-layout-${layout}`,
        `tmu-metric-tone-${tone}`,
        `tmu-metric-size-${size}`,
        `tmu-metric-align-${align}`,
        `tmu-metric-label-${labelPosition}`
      ];
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const valueAttrText = Object.entries(valueAttrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      if (layout === "row" || layout === "split") {
        return `<div class="${classes.join(" ")}"${attrText2}><div class="tmu-metric-copy"><div class="tmu-metric-label">${label}</div>${note ? `<div class="tmu-metric-note ${noteCls}">${note}</div>` : ""}</div><div class="tmu-metric-value ${valueCls}"${valueAttrText}>${value}</div></div>`;
      }
      const labelHtml = `<div class="tmu-metric-label">${label}</div>`;
      const valueHtml = `<div class="tmu-metric-value ${valueCls}"${valueAttrText}>${value}</div>`;
      const mainHtml = labelPosition === "bottom" ? `${valueHtml}${labelHtml}` : `${labelHtml}${valueHtml}`;
      return `<div class="${classes.join(" ")}"${attrText2}>${mainHtml}${note ? `<div class="tmu-metric-note ${noteCls}">${note}</div>` : ""}</div>`;
    }
  };

  // src/components/shared/tm-notice.js
  var STYLE_ID3 = "tm-notice-style";
  var CSS_TEXT = `
.tmu-notice {
    color: var(--tmu-text-main);
    font-size: var(--tmu-font-sm);
    line-height: 1.55;
}

.tmu-notice-surface {
    padding: var(--tmu-space-md) var(--tmu-space-md);
    border-radius: var(--tmu-space-md);
    border: 1px solid var(--tmu-border-input-overlay);
    background: var(--tmu-success-fill-faint);
}

.tmu-notice-footnote {
    color: var(--tmu-text-faint);
    font-size: var(--tmu-font-xs);
}

.tmu-notice-tone-warm.tmu-notice-surface {
    border-color: var(--tmu-border-input-overlay);
}

.tmu-notice-tone-muted.tmu-notice-surface {
    background: var(--tmu-surface-tab-active);
    border: 1px solid var(--tmu-border-input-overlay);
    border-radius: var(--tmu-space-sm);
    color: var(--tmu-text-main);
}
`;
  function ensureStyle(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID3)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID3}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID3;
    style.textContent = CSS_TEXT;
    target.appendChild(style);
  }
  function escapeHtml(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function normalizeNoticeArgs(content, opts = {}) {
    if (content && typeof content === "object" && !Array.isArray(content)) {
      return { ...content };
    }
    return { ...opts, text: content };
  }
  function buildClassName(opts) {
    return [
      "tmu-notice",
      opts.variant === "footnote" ? "tmu-notice-footnote" : "tmu-notice-surface",
      opts.tone === "warm" ? "tmu-notice-tone-warm" : "",
      opts.tone === "muted" ? "tmu-notice-tone-muted" : "",
      opts.cls || opts.className || ""
    ].filter(Boolean).join(" ");
  }
  function getInnerHtml(opts) {
    if (opts.html != null) return String(opts.html);
    return escapeHtml(opts.text);
  }
  var TmNotice = {
    notice(content, opts = {}) {
      ensureStyle(document.head);
      const normalized = normalizeNoticeArgs(content, opts);
      const tag = normalized.tag || "div";
      return `<${tag} class="${buildClassName(normalized)}">${getInnerHtml(normalized)}</${tag}>`;
    },
    noticeElement(content, opts = {}) {
      var _a;
      ensureStyle(document.head);
      const normalized = normalizeNoticeArgs(content, opts);
      const node = document.createElement(normalized.tag || "div");
      node.className = buildClassName(normalized);
      if (normalized.html != null) node.innerHTML = String(normalized.html);
      else node.textContent = String((_a = normalized.text) != null ? _a : "");
      return node;
    }
  };

  // src/components/shared/tm-stat.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Stat row \u2500\u2500 */
.tmu-stat-row { display: flex; justify-content: space-between; align-items: center; padding: var(--tmu-space-xs) 0; font-size: var(--tmu-font-xs); color: var(--tmu-text-main); }
.tmu-stat-row + .tmu-stat-row { border-top: 1px solid var(--tmu-border-input-overlay); }
.tmu-stat-lbl { color: var(--tmu-text-faint); font-weight: 600; font-size: var(--tmu-font-xs);  }
.tmu-stat-val { font-weight: 700; font-variant-numeric: tabular-nums; }
`
  }));
  var TmStat = {};

  // src/components/shared/tm-tooltip-stats.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Tooltip stat triplets \u2500\u2500 */
.tmu-tstats{display:grid;grid-template-columns:1fr auto 1fr;gap:var(--tmu-space-xs) var(--tmu-space-md);margin:var(--tmu-space-md) 0;font-size:var(--tmu-font-md)}
.tmu-tstats-home{text-align:right;font-weight:700;color:var(--tmu-text-main)}
.tmu-tstats-label{text-align:center;font-size:var(--tmu-font-xs);color:var(--tmu-text-dim);text-transform:uppercase;letter-spacing:.08em;font-weight:600;padding:0 var(--tmu-space-sm)}
.tmu-tstats-away{text-align:left;font-weight:700;color:var(--tmu-text-main)}
.tmu-tstats-home.is-leading,.tmu-tstats-away.is-leading{color:var(--tmu-success)}
` }));
  var escapeHtml2 = (value) => String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var attrText = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null).map(([key, value]) => ` ${key}="${escapeHtml2(value)}"`).join("");
  var parseComparable2 = (value) => {
    const numeric = Number.parseFloat(String(value != null ? value : "").replace(/[^\d.+-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };
  var buildMatchRows = ({ possession, statistics = {} } = {}) => {
    const rows = [];
    if (possession) {
      const homePossession = Number(possession.home || 0);
      const awayPossession = Number(possession.away || 0);
      rows.push({
        label: "Possession",
        leftValue: `${homePossession}%`,
        rightValue: `${awayPossession}%`,
        leftNumber: homePossession,
        rightNumber: awayPossession
      });
    }
    const shotsHome = Number(statistics.home_shots || 0);
    const shotsAway = Number(statistics.away_shots || 0);
    if (shotsHome || shotsAway) {
      rows.push({
        label: "Shots",
        leftValue: shotsHome,
        rightValue: shotsAway,
        leftNumber: shotsHome,
        rightNumber: shotsAway
      });
    }
    const onTargetHome = Number(statistics.home_on_target || 0);
    const onTargetAway = Number(statistics.away_on_target || 0);
    if (onTargetHome || onTargetAway) {
      rows.push({
        label: "On Target",
        leftValue: onTargetHome,
        rightValue: onTargetAway,
        leftNumber: onTargetHome,
        rightNumber: onTargetAway
      });
    }
    return rows;
  };
  function renderTooltipStats({ rows = [], cls = "", attrs = {} } = {}) {
    const visibleRows = rows.filter((row) => row && row.label !== void 0 && row.label !== null);
    if (!visibleRows.length) return "";
    const classes = ["tmu-tstats"];
    if (cls) classes.push(cls);
    const html = visibleRows.map((row) => {
      var _a, _b, _c, _d;
      const leftValue = (_a = row.leftValue) != null ? _a : "";
      const rightValue = (_b = row.rightValue) != null ? _b : "";
      const leftNumber = (_c = row.leftNumber) != null ? _c : parseComparable2(leftValue);
      const rightNumber = (_d = row.rightNumber) != null ? _d : parseComparable2(rightValue);
      const leftLead = leftNumber > rightNumber ? " is-leading" : "";
      const rightLead = rightNumber > leftNumber ? " is-leading" : "";
      return `<span class="tmu-tstats-home${leftLead}">${escapeHtml2(leftValue)}</span><span class="tmu-tstats-label">${escapeHtml2(row.label)}</span><span class="tmu-tstats-away${rightLead}">${escapeHtml2(rightValue)}</span>`;
    }).join("");
    return `<div class="${classes.join(" ")}"${attrText(attrs)}>${html}</div>`;
  }
  var TmTooltipStats = {
    matchTooltipStats({ possession, statistics = {}, cls = "", attrs = {} } = {}) {
      const rows = buildMatchRows({ possession, statistics });
      return renderTooltipStats({ rows, cls, attrs });
    }
  };

  // src/components/shared/tm-render.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Card \u2500\u2500 */
.tmu-card { background: radial-gradient(circle at top left, var(--tmu-success-fill-faint), transparent 42%), linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-dark-muted) 100%); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-md); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: var(--tmu-space-md); box-shadow: 0 14px 30px var(--tmu-shadow-elev); }
.tmu-card.tmu-card-variant-soft { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft-alpha-strong); border-radius: var(--tmu-space-lg); box-shadow: none; }
.tmu-card.tmu-card-variant-sidebar { margin-bottom: var(--tmu-space-xl); }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body { padding: var(--tmu-space-lg) var(--tmu-space-lg); gap: var(--tmu-space-lg); }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body.tmu-card-body-flush { padding: 0; gap: 0; }
.tmu-card.tmu-card-variant-embedded { margin-bottom: 0; background: var(--tmu-surface-embedded); box-shadow: none; color: var(--tmu-text-main); }
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
/* \u2500\u2500 Panel \u2500\u2500 */
.tmu-panel { background: var(--tmu-surface-panel); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-sm); color: var(--tmu-text-main); box-shadow: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tmu-panel-page { padding: var(--tmu-space-lg); }
/* \u2500\u2500 Flat panel (squad, league standings \u2014 no card gradient) \u2500\u2500 */
.tmu-flat-panel { background: var(--tmu-surface-dark-strong); border: 1px solid var(--tmu-border-soft-alpha); border-radius: var(--tmu-space-md); overflow: hidden; margin-bottom: var(--tmu-space-lg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--tmu-text-main); }
.tmu-flat-panel .tmu-card-head { background: none; border-bottom: 1px solid var(--tmu-border-soft-alpha); }
/* \u2500\u2500 Divider \u2500\u2500 */
.tmu-divider { height: 1px; background: var(--tmu-border-embedded); margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: var(--tmu-space-sm); color: var(--tmu-text-faint); font-size: var(--tmu-font-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: var(--tmu-space-sm) 0 0; margin-top: 0; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: var(--tmu-border-faint); }
/* \u2500\u2500 List item \u2500\u2500 */
.tmu-list-item { display: flex; align-items: center; gap: var(--tmu-space-sm); padding: var(--tmu-space-md) var(--tmu-space-lg); color: var(--tmu-text-panel-label); font-size: var(--tmu-font-sm); font-weight: 700; text-decoration: none; transition: background .15s, border-color .15s, color .15s; border: 1px solid transparent; }
.tmu-list-icon { font-size: var(--tmu-font-md); width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
a.tmu-list-item:hover,button.tmu-list-item:hover { background: var(--tmu-surface-item-hover); border-color: var(--tmu-border-soft-alpha); color: var(--tmu-text-strong); }
button.tmu-list-item { background: transparent; cursor: pointer; font-family: inherit; text-align: left; width: 100%; border-radius: var(--tmu-space-sm); }
`
  }));
  var TmRender = {
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
      if (html !== void 0) el.innerHTML = html;
      const refs = {};
      el.__tmRenderHandlers = handlers;
      if (!el.__tmRenderClickBound) {
        el.addEventListener("click", (event) => {
          var _a;
          const actionNode = event.target.closest("[data-action]");
          if (!actionNode || !el.contains(actionNode) || actionNode.disabled) return;
          const action = actionNode.dataset.action;
          const handler = (_a = el.__tmRenderHandlers) == null ? void 0 : _a[action];
          if (typeof handler === "function") handler.call(actionNode, event);
        });
        el.__tmRenderClickBound = true;
      }
      el.querySelectorAll("tm-card").forEach((tmCard) => {
        const card = document.createElement("div");
        card.className = "tmu-card";
        if (tmCard.dataset.variant) {
          tmCard.dataset.variant.split(/\s+/).filter(Boolean).forEach((variant) => {
            card.classList.add("tmu-card-variant-" + variant);
          });
        }
        if (tmCard.dataset.cls) {
          tmCard.dataset.cls.split(/\s+/).filter(Boolean).forEach((cls) => {
            card.classList.add(cls);
          });
        }
        if (tmCard.dataset.ref) card.dataset.ref = tmCard.dataset.ref;
        if (tmCard.dataset.title) {
          const head = document.createElement("div");
          head.className = "tmu-card-head";
          const titleSpan = document.createElement("span");
          titleSpan.textContent = tmCard.dataset.icon ? tmCard.dataset.icon + " " + tmCard.dataset.title : tmCard.dataset.title;
          head.appendChild(titleSpan);
          if (tmCard.dataset.headAction) {
            const action = tmCard.dataset.headAction;
            const hBtn = document.createElement("button");
            hBtn.type = "button";
            hBtn.className = "tmu-card-head-btn";
            hBtn.textContent = tmCard.dataset.headIcon || "\u21BB";
            hBtn.dataset.action = action;
            head.appendChild(hBtn);
            refs[action] = hBtn;
          }
          if (tmCard.dataset.headRef) refs[tmCard.dataset.headRef] = head;
          card.appendChild(head);
        }
        const body = document.createElement("div");
        body.className = "tmu-card-body" + (tmCard.dataset.flush !== void 0 ? " tmu-card-body-flush" : "");
        if (tmCard.dataset.bodyRef) body.dataset.ref = tmCard.dataset.bodyRef;
        while (tmCard.firstChild) body.appendChild(tmCard.firstChild);
        card.appendChild(body);
        tmCard.replaceWith(card);
      });
      el.querySelectorAll("tm-divider").forEach((tmDivider) => {
        const label = tmDivider.dataset.label;
        const div = document.createElement("div");
        div.className = label ? "tmu-divider-label" : "tmu-divider";
        if (label) div.textContent = label;
        tmDivider.replaceWith(div);
      });
      el.querySelectorAll("tm-button").forEach((tmBtn) => {
        const action = tmBtn.dataset.action;
        const inner = tmBtn.innerHTML.trim();
        const btn = TmButton.button({
          label: inner ? void 0 : tmBtn.dataset.label,
          slot: inner || void 0,
          id: tmBtn.dataset.id,
          variant: tmBtn.dataset.variant,
          color: tmBtn.dataset.color || tmBtn.dataset.variant,
          size: tmBtn.dataset.size,
          cls: tmBtn.dataset.cls,
          block: tmBtn.hasAttribute("data-block"),
          onClick: void 0
        });
        if (tmBtn.getAttribute("title")) btn.title = tmBtn.getAttribute("title");
        if (tmBtn.getAttribute("style")) btn.setAttribute("style", tmBtn.getAttribute("style"));
        if (action) btn.dataset.action = action;
        const skipAttrs = /* @__PURE__ */ new Set(["data-label", "data-variant", "data-color", "data-action", "data-id", "data-block", "data-size", "data-cls"]);
        for (const attr of tmBtn.attributes) {
          if (attr.name.startsWith("data-") && !skipAttrs.has(attr.name)) btn.setAttribute(attr.name, attr.value);
        }
        tmBtn.replaceWith(btn);
        if (action) refs[action] = btn;
      });
      el.querySelectorAll("tm-input").forEach((tmInput) => {
        const input = TmInput.input({
          size: tmInput.dataset.size || "sm",
          type: tmInput.dataset.type || "text",
          value: tmInput.dataset.value || "",
          placeholder: tmInput.dataset.placeholder || "",
          min: tmInput.dataset.min,
          max: tmInput.dataset.max,
          step: tmInput.dataset.step
        });
        if (tmInput.dataset.ref) input.dataset.ref = tmInput.dataset.ref;
        if (tmInput.dataset.label) {
          const row = TmInput.field({ label: tmInput.dataset.label, input });
          tmInput.replaceWith(row);
        } else {
          tmInput.replaceWith(input);
        }
      });
      el.querySelectorAll("tm-stat").forEach((tmStat) => {
        const row = document.createElement("div");
        const cls = tmStat.dataset.cls || "";
        row.className = "tmu-stat-row" + (cls ? " " + cls : "");
        const lbl = document.createElement("span");
        const lblCls = tmStat.dataset.lblCls || "";
        lbl.className = "tmu-stat-lbl" + (lblCls ? " " + lblCls : "");
        lbl.textContent = tmStat.dataset.label || "";
        row.appendChild(lbl);
        const val = document.createElement("span");
        const variant = tmStat.dataset.variant || tmStat.className;
        const valCls = tmStat.dataset.valCls || "";
        val.className = "tmu-stat-val" + (variant ? " " + variant : "") + (valCls ? " " + valCls : "");
        if (tmStat.innerHTML.trim()) val.innerHTML = tmStat.innerHTML;
        else val.textContent = tmStat.dataset.value || "";
        if (tmStat.dataset.ref) val.dataset.ref = tmStat.dataset.ref;
        row.appendChild(val);
        tmStat.replaceWith(row);
      });
      el.querySelectorAll("tm-list-item").forEach((tmItem) => {
        const action = tmItem.dataset.action;
        const node = action ? document.createElement("button") : document.createElement("a");
        node.className = "tmu-list-item";
        if (tmItem.dataset.variant) node.classList.add(tmItem.dataset.variant);
        if (action) {
          node.type = "button";
          node.dataset.action = action;
          refs[action] = node;
        } else {
          node.href = tmItem.dataset.href || "#";
        }
        if (tmItem.dataset.icon) {
          const icon = document.createElement("span");
          icon.className = "tmu-list-icon";
          icon.textContent = tmItem.dataset.icon;
          node.appendChild(icon);
        }
        if (tmItem.dataset.label) {
          const lbl = document.createElement("span");
          lbl.className = "tmu-list-lbl";
          lbl.textContent = tmItem.dataset.label;
          node.appendChild(lbl);
        }
        if (tmItem.dataset.ref) node.dataset.ref = tmItem.dataset.ref;
        tmItem.replaceWith(node);
      });
      el.querySelectorAll("[data-ref]").forEach((node) => {
        refs[node.dataset.ref] = node;
      });
      el.querySelectorAll("tm-row").forEach((tmRow) => {
        const div = document.createElement("div");
        const cls = tmRow.dataset.cls || "";
        div.className = "tmu-row" + (cls ? " " + cls : "");
        if (tmRow.dataset.justify) div.style.justifyContent = tmRow.dataset.justify;
        if (tmRow.dataset.align) div.style.alignItems = tmRow.dataset.align;
        if (tmRow.dataset.gap) div.style.gap = tmRow.dataset.gap;
        while (tmRow.firstChild) div.appendChild(tmRow.firstChild);
        tmRow.replaceWith(div);
      });
      el.querySelectorAll("tm-col").forEach((tmCol) => {
        const div = document.createElement("div");
        const size = tmCol.dataset.size;
        const cls = tmCol.dataset.cls || "";
        div.className = "tmu-col" + (size ? " tmu-col-" + size : "") + (cls ? " " + cls : "");
        while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
        tmCol.replaceWith(div);
      });
      el.querySelectorAll("tm-spinner").forEach((tmSpinner) => {
        const span = document.createElement("span");
        const size = tmSpinner.dataset.size || "sm";
        const cls = tmSpinner.dataset.cls || "";
        span.className = `tmu-spinner tmu-spinner-${size}${cls ? " " + cls : ""}`;
        tmSpinner.replaceWith(span);
      });
      return refs;
    }
  };

  // src/constants/skills.js
  var skills_exports = {};
  __export(skills_exports, {
    ASI_WEIGHT_GK: () => ASI_WEIGHT_GK,
    ASI_WEIGHT_OUTFIELD: () => ASI_WEIGHT_OUTFIELD,
    COLOR_LEVELS: () => COLOR_LEVELS,
    GRAPH_KEYS_GK: () => GRAPH_KEYS_GK,
    GRAPH_KEYS_OUT: () => GRAPH_KEYS_OUT,
    POS_MULTIPLIERS: () => POS_MULTIPLIERS,
    R5_THRESHOLDS: () => R5_THRESHOLDS,
    REC_THRESHOLDS: () => REC_THRESHOLDS,
    RTN_THRESHOLDS: () => RTN_THRESHOLDS,
    SKILL_DEFS: () => SKILL_DEFS,
    SKILL_DEFS_GK: () => SKILL_DEFS_GK,
    SKILL_DEFS_OUT: () => SKILL_DEFS_OUT,
    SKILL_EFFICIENCY_BRACKETS: () => SKILL_EFFICIENCY_BRACKETS,
    SKILL_KEYS_ALL: () => SKILL_KEYS_ALL,
    SKILL_KEYS_GK: () => SKILL_KEYS_GK,
    SKILL_KEYS_GK_WEIGHT: () => SKILL_KEYS_GK_WEIGHT,
    SKILL_KEYS_OUT: () => SKILL_KEYS_OUT,
    SKILL_LABELS: () => SKILL_LABELS,
    SKILL_LABELS_GK: () => SKILL_LABELS_GK,
    SKILL_LABELS_OUT: () => SKILL_LABELS_OUT,
    SKILL_NAMES_GK: () => SKILL_NAMES_GK,
    SKILL_NAMES_GK_SHORT: () => SKILL_NAMES_GK_SHORT,
    SKILL_NAMES_OUT: () => SKILL_NAMES_OUT,
    TI_THRESHOLDS: () => TI_THRESHOLDS,
    WEIGHT_R5: () => WEIGHT_R5,
    WEIGHT_RB: () => WEIGHT_RB
  });
  var WEIGHT_R5 = [
    [0.41029304, 0.18048062, 0.56730138, 1.06344654, 1.02312672, 0.40831256, 0.58235457, 0.12717479, 0.05454137, 0.0908983, 0.42381693, 0.04626272, 0.02199046, 0],
    [0.42126371, 0.18293193, 0.60567629, 0.91904794, 0.89070915, 0.40038476, 0.56146633, 0.15053902, 0.15955429, 0.15682932, 0.42109742, 0.09460329, 0.03589655, 0],
    [0.23412419, 0.32032289, 0.62194779, 0.63162534, 0.63143081, 0.45218831, 0.47370658, 0.55054737, 0.17744915, 0.39932519, 0.26915814, 0.16413124, 0.07404301, 0],
    [0.27276905, 0.26814289, 0.61104798, 0.39865092, 0.42862643, 0.43582015, 0.46617076, 0.44931076, 0.25175412, 0.46446692, 0.2998635, 0.43843061, 0.21494592, 0],
    [0.2521926, 0.25112993, 0.56090649, 0.18230261, 0.1837649, 0.45928749, 0.53498118, 0.59461481, 0.09851189, 0.6160195, 0.31243959, 0.65402884, 0.29982016, 0],
    [0.28155678, 0.24090675, 0.60680245, 0.19068879, 0.20018012, 0.45148647, 0.48230007, 0.42982389, 0.26268609, 0.57933805, 0.31712419, 0.65824985, 0.29885649, 0],
    [0.22029884, 0.2922969, 0.63248227, 0.09904394, 0.10043602, 0.47469498, 0.52919791, 0.7755588, 0.10531819, 0.71048302, 0.27667115, 0.56813972, 0.21537826, 0],
    [0.21151292, 0.3580471, 0.88688492, 0.14391236, 0.13769621, 0.46586605, 0.34446036, 0.51377701, 0.59723919, 0.75126119, 0.16550722, 0.29966502, 0.12417045, 0],
    [0.3547978, 0.14887553, 0.4327338, 23928e-8, 21111e-8, 0.46931131, 0.57731335, 0.41686333, 0.05607604, 0.62121195, 0.45370457, 1.03660702, 0.43205492, 0],
    [0.45462811, 0.30278232, 0.45462811, 0.90925623, 0.45462811, 0.90925623, 0.45462811, 0.45462811, 0.30278232, 0.15139116, 0.15139116]
  ];
  var WEIGHT_RB = [
    [0.10493615, 0.05208547, 0.07934211, 0.14448971, 0.13159554, 0.06553072, 0.07778375, 0.06669303, 0.05158306, 0.02753168, 0.1205517, 0.01350989, 0.02549169, 0.0388755],
    [0.07715535, 0.04943315, 0.11627229, 0.11638685, 0.12893778, 0.07747251, 0.06370799, 0.03830611, 0.10361093, 0.06253997, 0.09128094, 0.0131411, 0.02449199, 0.03726305],
    [0.08219824, 0.08668831, 0.07434242, 0.09661001, 0.08894242, 0.08998026, 0.09281287, 0.08868309, 0.04753574, 0.06042619, 0.05396986, 0.05059984, 0.05660203, 0.03060871],
    [0.06744248, 0.06641401, 0.09977251, 0.08253749, 0.09709316, 0.09241026, 0.08513703, 0.06127851, 0.1027552, 0.07985941, 0.0461896, 0.0392727, 0.05285911, 0.02697852],
    [0.07304213, 0.08174111, 0.07248656, 0.08482334, 0.07078726, 0.09568392, 0.09464529, 0.09580381, 0.04746231, 0.07093008, 0.04595281, 0.05955544, 0.07161249, 0.03547345],
    [0.06527363, 0.0641027, 0.09701305, 0.07406706, 0.08563595, 0.09648566, 0.08651209, 0.06357183, 0.10819222, 0.07386495, 0.03245554, 0.05430668, 0.06572005, 0.03279859],
    [0.07842736, 0.07744888, 0.0720115, 0.06734457, 0.05002348, 0.08350204, 0.08207655, 0.11181914, 0.03756112, 0.07486004, 0.06533972, 0.07457344, 0.09781475, 0.02719742],
    [0.06545375, 0.06145378, 0.10503536, 0.06421508, 0.07627526, 0.09232981, 0.07763931, 0.07001035, 0.11307331, 0.07298351, 0.04248486, 0.06462713, 0.07038293, 0.02403557],
    [0.07738289, 0.05022488, 0.07790481, 0.01356516, 0.01038191, 0.06495444, 0.07721954, 0.07701905, 0.02680715, 0.07759692, 0.12701687, 0.15378395, 0.12808992, 0.03805251],
    [0.07466384, 0.07466384, 0.07466384, 0.14932769, 0.10452938, 0.14932769, 0.10452938, 0.10344411, 0.0751261, 0.04492581, 0.04479831]
  ];
  var COLOR_LEVELS = [
    { color: "#ff4c4c" },
    { color: "#ff8c00" },
    { color: "#ffd700" },
    { color: "#90ee90" },
    { color: "#00cfcf" },
    { color: "#5b9bff" },
    { color: "#cc88ff" }
  ];
  var R5_THRESHOLDS = [110, 100, 90, 80, 70, 60, 0];
  var TI_THRESHOLDS = [12, 9, 6, 4, 2, 1, -Infinity];
  var REC_THRESHOLDS = [5.5, 5, 4, 3, 2, 1, 0];
  var RTN_THRESHOLDS = [90, 60, 40, 30, 20, 10, 0];
  var POS_MULTIPLIERS = [0.3, 0.3, 0.9, 0.6, 1.5, 0.9, 0.9, 0.6, 0.3];
  var ASI_WEIGHT_OUTFIELD = 26353376e4;
  var ASI_WEIGHT_GK = 48717927500;
  var SKILL_DEFS = [
    // shared (isGK + isOutfield) — must stay at the top; indices 0-2 match both weight matrices
    { name: "Strength", key: "strength", isGK: true, isOutfield: true, category: "Physical", id: 0 },
    { name: "Stamina", key: "stamina", isGK: true, isOutfield: true, category: "Physical", id: 1 },
    { name: "Pace", key: "pace", isGK: true, isOutfield: true, category: "Physical", id: 2 },
    // outfield-only (indices 3-13 after filter)
    { name: "Marking", key: "marking", isOutfield: true, category: "Tactical", id: 3 },
    { name: "Tackling", key: "tackling", isOutfield: true, category: "Tactical", id: 4 },
    { name: "Workrate", key: "workrate", isOutfield: true, category: "Tactical", id: 5 },
    { name: "Positioning", key: "positioning", isOutfield: true, category: "Tactical", id: 6 },
    { name: "Passing", key: "passing", isOutfield: true, category: "Technical", id: 7 },
    { name: "Crossing", key: "crossing", isOutfield: true, category: "Technical", id: 8 },
    { name: "Technique", key: "technique", isOutfield: true, category: "Technical", id: 9 },
    { name: "Heading", key: "heading", isOutfield: true, category: "Physical", id: 10 },
    { name: "Finishing", key: "finishing", isOutfield: true, category: "Technical", id: 11 },
    { name: "Longshots", key: "longshots", isOutfield: true, category: "Technical", id: 12 },
    { name: "Set Pieces", key: "set_pieces", isOutfield: true, category: "Technical", id: 13 },
    // GK-only (indices 3-10 after filter)
    { name: "Handling", key: "handling", isGK: true, category: "Technical", id: 3 },
    { name: "One on ones", key: "oneonones", isGK: true, category: "Tactical", key2: "one_on_ones", id: 4 },
    { name: "Reflexes", key: "reflexes", isGK: true, category: "Technical", id: 5 },
    { name: "Aerial Ability", key: "arialability", isGK: true, category: "Tactical", key2: "aerial_ability", id: 6 },
    { name: "Jumping", key: "jumping", isGK: true, category: "Physical", id: 7 },
    { name: "Communication", key: "communication", isGK: true, category: "Tactical", id: 8 },
    { name: "Kicking", key: "kicking", isGK: true, category: "Technical", id: 9 },
    { name: "Throwing", key: "throwing", isGK: true, category: "Technical", id: 10 }
  ];
  var SKILL_DEFS_OUT = SKILL_DEFS.filter((s) => s.isOutfield);
  var SKILL_DEFS_GK = SKILL_DEFS.filter((s) => s.isGK);
  var SKILL_KEYS_OUT = ["str", "sta", "pac", "mar", "tac", "wor", "pos", "pas", "cro", "tec", "hea", "fin", "lon", "set"];
  var SKILL_KEYS_GK = ["str", "sta", "pac", "han", "one", "ref", "ari", "jum", "com", "kic", "thr"];
  var SKILL_KEYS_ALL = [...SKILL_KEYS_OUT, ...SKILL_KEYS_GK.filter((s) => !SKILL_KEYS_OUT.includes(s))];
  var SKILL_LABELS = {
    str: "Str",
    sta: "Sta",
    pac: "Pac",
    mar: "Mar",
    tac: "Tac",
    wor: "Wor",
    pos: "Pos",
    pas: "Pas",
    cro: "Cro",
    tec: "Tec",
    hea: "Hea",
    fin: "Fin",
    lon: "Lon",
    set: "Set",
    han: "Han",
    one: "One",
    ref: "Ref",
    ari: "Aer",
    jum: "Jum",
    com: "Com",
    kic: "Kic",
    thr: "Thr"
  };
  var SKILL_LABELS_OUT = SKILL_KEYS_OUT.map((k) => SKILL_LABELS[k]);
  var SKILL_LABELS_GK = ["str", "pac", "jum", "sta", "one", "ref", "ari", "com", "kic", "thr", "han"].map((k) => SKILL_LABELS[k]);
  var SKILL_KEYS_GK_WEIGHT = ["str", "pac", "jum", "sta", "one", "ref", "ari", "com", "kic", "thr", "han"];
  var SKILL_NAMES_GK_SHORT = SKILL_KEYS_GK.map((k) => SKILL_LABELS[k]);
  var SKILL_NAMES_OUT = SKILL_DEFS_OUT.map((s) => s.name);
  var SKILL_NAMES_GK = SKILL_DEFS_GK.map((s) => s.name);
  var GRAPH_KEYS_OUT = SKILL_DEFS_OUT.map((s) => s.key);
  var GRAPH_KEYS_GK = ["strength", "pace", "jumping", "stamina", "one_on_ones", "reflexes", "aerial_ability", "communication", "kicking", "throwing", "handling"];
  var SKILL_EFFICIENCY_BRACKETS = [[18, 0.04], [15, 0.05], [5, 0.1], [0, 0.15]];

  // src/constants/player.js
  var player_exports = {};
  __export(player_exports, {
    AGE_THRESHOLDS: () => AGE_THRESHOLDS,
    BENCH_LABELS: () => BENCH_LABELS,
    BENCH_SLOTS: () => BENCH_SLOTS,
    FIELD_ZONES: () => FIELD_ZONES,
    MIN_WAGE_FOR_TI: () => MIN_WAGE_FOR_TI,
    POSITION_MAP: () => POSITION_MAP,
    SPECIAL_SLOTS: () => SPECIAL_SLOTS,
    WAGE_RATE: () => WAGE_RATE
  });
  var POSITION_MAP = {
    gk: { id: 9, position: "GK", row: 0, col: 2, ordering: 0, color: "var(--tmu-success-strong)" },
    dl: { id: 1, position: "DL", row: 1, col: 0, ordering: 2, color: "var(--tmu-info-dark)" },
    dcl: { id: 0, position: "DCL", row: 1, col: 1, ordering: 1, color: "var(--tmu-info-dark)" },
    dc: { id: 0, position: "DC", row: 1, col: 2, ordering: 1, color: "var(--tmu-info-dark)" },
    dcr: { id: 0, position: "DCR", row: 1, col: 3, ordering: 1, color: "var(--tmu-info-dark)" },
    dr: { id: 1, position: "DR", row: 1, col: 4, ordering: 2, color: "var(--tmu-info-dark)" },
    dml: { id: 3, position: "DML", row: 2, col: 0, ordering: 4, color: "var(--tmu-warning)" },
    dmcl: { id: 2, position: "DMCL", row: 2, col: 1, ordering: 3, color: "var(--tmu-warning)" },
    dmc: { id: 2, position: "DMC", row: 2, col: 2, ordering: 3, color: "var(--tmu-warning)" },
    dmcr: { id: 2, position: "DMCR", row: 2, col: 3, ordering: 3, color: "var(--tmu-warning)" },
    dmr: { id: 3, position: "DMR", row: 2, col: 4, ordering: 4, color: "var(--tmu-warning)" },
    ml: { id: 5, position: "ML", row: 3, col: 0, ordering: 6, color: "var(--tmu-warning)" },
    mcl: { id: 4, position: "MCL", row: 3, col: 1, ordering: 5, color: "var(--tmu-warning)" },
    mc: { id: 4, position: "MC", row: 3, col: 2, ordering: 5, color: "var(--tmu-warning)" },
    mcr: { id: 4, position: "MCR", row: 3, col: 3, ordering: 5, color: "var(--tmu-warning)" },
    mr: { id: 5, position: "MR", row: 3, col: 4, ordering: 6, color: "var(--tmu-warning)" },
    oml: { id: 7, position: "OML", row: 4, col: 0, ordering: 7, color: "var(--tmu-warning-soft)" },
    omcl: { id: 6, position: "OMCL", row: 4, col: 1, ordering: 8, color: "var(--tmu-warning-soft)" },
    omc: { id: 6, position: "OMC", row: 4, col: 2, ordering: 8, color: "var(--tmu-warning-soft)" },
    omcr: { id: 6, position: "OMCR", row: 4, col: 3, ordering: 8, color: "var(--tmu-warning-soft)" },
    omr: { id: 7, position: "OMR", row: 4, col: 4, ordering: 7, color: "var(--tmu-warning-soft)" },
    fcl: { id: 8, position: "FCL", row: 5, col: 1, ordering: 9, color: "var(--tmu-danger-deep)" },
    fc: { id: 8, position: "FC", row: 5, col: 2, ordering: 9, color: "var(--tmu-danger-deep)" },
    fcr: { id: 8, position: "FCR", row: 5, col: 3, ordering: 9, color: "var(--tmu-danger-deep)" }
  };
  var FIELD_ZONES = [
    { key: "fwd", row: 5, cols: [null, "fcl", "fc", "fcr", null] },
    { key: "om", row: 4, cols: ["oml", "omcl", "omc", "omcr", "omr"] },
    { key: "mid", row: 3, cols: ["ml", "mcl", "mc", "mcr", "mr"] },
    { key: "dm", row: 2, cols: ["dml", "dmcl", "dmc", "dmcr", "dmr"] },
    { key: "def", row: 1, cols: ["dl", "dcl", "dc", "dcr", "dr"] },
    { key: "gk", row: 0, cols: [null, null, "gk", null, null] }
  ];
  var BENCH_SLOTS = ["sub1", "sub2", "sub3", "sub4", "sub5"];
  var SPECIAL_SLOTS = ["captain", "corner", "penalty", "freekick"];
  var BENCH_LABELS = {
    sub1: "GK",
    sub2: "DEF",
    sub3: "MID",
    sub4: "Wing",
    sub5: "FWD",
    captain: "Captain",
    corner: "Corner",
    penalty: "Penalty",
    freekick: "Free Kick"
  };
  var AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];
  var WAGE_RATE = 15.8079;
  var MIN_WAGE_FOR_TI = 3e4;

  // src/constants/match.js
  var match_exports = {};
  __export(match_exports, {
    ATTACK_STYLES: () => ATTACK_STYLES,
    CROSS_VIDS: () => CROSS_VIDS,
    DEFWIN_VIDS: () => DEFWIN_VIDS,
    FINISH_VIDS: () => FINISH_VIDS,
    FOCUS_MAP: () => FOCUS_MAP,
    MENTALITY_MAP: () => MENTALITY_MAP,
    MENTALITY_MAP_LONG: () => MENTALITY_MAP_LONG,
    PASS_VIDS: () => PASS_VIDS,
    RUN_DUEL_VIDS: () => RUN_DUEL_VIDS,
    SKIP_PREFIXES: () => SKIP_PREFIXES,
    STYLE_MAP: () => STYLE_MAP,
    STYLE_MAP_SHORT: () => STYLE_MAP_SHORT,
    STYLE_ORDER: () => STYLE_ORDER
  });
  var PASS_VIDS = /^(short|preshort|through|longball|gkthrow|gkkick)/;
  var CROSS_VIDS = /^(wing(?!start)|cornerkick|freekick)/;
  var DEFWIN_VIDS = /^defwin/;
  var FINISH_VIDS = /^(finish|finishlong|header|acrobat)/;
  var RUN_DUEL_VIDS = /^finrun/;
  var ATTACK_STYLES = [
    { key: "cou", label: "Direct" },
    { key: "kco", label: "Direct" },
    { key: "klo", label: "Long Balls" },
    { key: "sho", label: "Short Passing" },
    { key: "thr", label: "Through Balls" },
    { key: "lon", label: "Long Balls" },
    { key: "win", label: "Wings" },
    { key: "doe", label: "Corners" },
    { key: "dire", label: "Free Kicks" }
  ];
  var STYLE_ORDER = ["Direct", "Short Passing", "Through Balls", "Long Balls", "Wings", "Corners", "Free Kicks", "Penalties"];
  var SKIP_PREFIXES = /* @__PURE__ */ new Set(["card", "cod", "inj"]);
  var STYLE_MAP = { 1: "Balanced", 2: "Direct", 3: "Wings", 4: "Short Passing", 5: "Long Balls", 6: "Through Balls" };
  var STYLE_MAP_SHORT = { 1: "Balanced", 2: "Direct", 3: "Wings", 4: "Short", 5: "Long", 6: "Through" };
  var MENTALITY_MAP = { 1: "V.Def", 2: "Def", 3: "Sl.Def", 4: "Normal", 5: "Sl.Att", 6: "Att", 7: "V.Att" };
  var MENTALITY_MAP_LONG = { 1: "Very Defensive", 2: "Defensive", 3: "Slightly Defensive", 4: "Normal", 5: "Slightly Attacking", 6: "Attacking", 7: "Very Attacking" };
  var FOCUS_MAP = { 1: "Balanced", 2: "Left", 3: "Central", 4: "Right" };

  // src/constants/stats.js
  var stats_exports = {};
  __export(stats_exports, {
    PLAYER_STAT_COLS: () => PLAYER_STAT_COLS,
    PLAYER_STAT_ZERO: () => PLAYER_STAT_ZERO
  });
  var PLAYER_STAT_COLS = [
    // ── Goals & Shooting ──────────────────────────────────────────────────
    {
      key: "goals",
      abbr: "G",
      title: "Goals",
      icon: "\u26BD",
      section: "shooting",
      outfieldOrder: 1,
      gkOrder: 2,
      matchOrder: 6,
      lineupIcon: true
    },
    {
      key: "assists",
      abbr: "A",
      title: "Assists",
      icon: "\u{1F45F}",
      section: "passing",
      outfieldOrder: 1,
      gkOrder: 1,
      matchOrder: 7,
      lineupIcon: true
    },
    {
      key: "keyPasses",
      abbr: "KP",
      title: "Key Passes",
      icon: "\u{1F511}",
      section: "passing",
      outfieldOrder: 2,
      gkOrder: 2
    },
    {
      key: "shots",
      abbr: "Sh",
      title: "Shots / Saves",
      icon: "\u{1F3AF}",
      section: "shooting",
      outfieldOrder: 2,
      matchOrder: 5,
      gkKey: "saves",
      gkAbbr: "Sv"
    },
    {
      key: "saves",
      title: "Saves",
      icon: "\u{1F9E4}",
      section: "shooting",
      gkOrder: 1
    },
    {
      key: "shotsOnTarget",
      abbr: "SoT",
      title: "Shots on Target",
      icon: "\u2705",
      section: "shooting",
      outfieldOrder: 3
    },
    {
      key: "goalsFoot",
      title: "Foot Goals",
      icon: "\u{1F9B6}",
      section: "shooting",
      outfieldOrder: 4
    },
    {
      key: "goalsHead",
      title: "Head Goals",
      icon: "\u{1F5E3}\uFE0F",
      section: "shooting",
      outfieldOrder: 5
    },
    // ── Passing (computed card entries) ───────────────────────────────────
    {
      key: "__passAcc",
      title: "Pass %",
      icon: "\u{1F4E8}",
      section: "passing",
      outfieldOrder: 3,
      gkOrder: 3
    },
    {
      key: "__crossAcc",
      title: "Cross %",
      icon: "\u2197\uFE0F",
      section: "passing",
      outfieldOrder: 4,
      gkOrder: 4
    },
    {
      key: "__totalPass",
      title: "Total",
      icon: "\u{1F4C8}",
      section: "passing",
      outfieldOrder: 5,
      gkOrder: 5
    },
    // ── Passing (table columns) ───────────────────────────────────────────
    {
      key: "passesCompleted",
      abbr: "SP",
      title: "Successful Passes",
      matchOrder: 1
    },
    {
      key: "passesFailed",
      abbr: "UP",
      title: "Unsuccessful Passes",
      warn: true,
      matchOrder: 2
    },
    {
      key: "crossesCompleted",
      abbr: "SC",
      title: "Successful Crosses",
      matchOrder: 3
    },
    {
      key: "crossesFailed",
      abbr: "UC",
      title: "Unsuccessful Crosses",
      warn: true,
      matchOrder: 4
    },
    // ── Defending & Duels ─────────────────────────────────────────────────
    {
      key: "interceptions",
      abbr: "INT",
      title: "Interceptions",
      icon: "\u{1F441}\uFE0F",
      section: "defending",
      outfieldOrder: 1,
      gkOrder: 1
    },
    {
      key: "tackles",
      abbr: "TKL",
      title: "Tackles",
      icon: "\u{1F9B5}",
      section: "defending",
      outfieldOrder: 2,
      gkOrder: 2
    },
    {
      key: "headerClearances",
      abbr: "HC",
      title: "Header Clearances",
      icon: "\u{1F5E3}\uFE0F",
      section: "defending",
      outfieldOrder: 3,
      gkOrder: 3
    },
    {
      key: "tackleFails",
      abbr: "TF",
      title: "Tackle Fails",
      icon: "\u274C",
      section: "defending",
      outfieldOrder: 4,
      gkOrder: 4,
      warn: true
    },
    {
      key: "duelsWon",
      abbr: "DW",
      title: "Duels Won",
      matchOrder: 8
    },
    {
      key: "duelsLost",
      abbr: "DL",
      title: "Duels Lost",
      warn: true,
      matchOrder: 9
    },
    {
      key: "fouls",
      abbr: "Fls",
      title: "Fouls Committed",
      icon: "\u26A0\uFE0F",
      section: "defending",
      outfieldOrder: 5,
      gkOrder: 5,
      warn: true
    },
    {
      key: "yellowCards",
      abbr: "\u{1F7E8}",
      title: "Yellow Cards",
      yc: true,
      lineupIcon: true
    },
    {
      key: "yellowRedCards",
      abbr: "\u{1F7E8}\u{1F7E5}",
      title: "Yellow-Red Cards",
      lineupIcon: true
    },
    {
      key: "redCards",
      abbr: "\u{1F7E5}",
      title: "Red Cards",
      rc: true,
      lineupIcon: true
    },
    // ── Lineup-only status flags ───────────────────────────────────────────
    {
      key: "injured",
      title: "Injured",
      icon: "\u271A",
      iconStyle: "color:var(--tmu-danger);font-size:var(--tmu-font-sm);font-weight:800",
      lineupIcon: true,
      lineupBool: true
    },
    {
      key: "subIn",
      title: "Subbed In",
      icon: "\u{1F53C}",
      lineupIcon: true,
      lineupBool: true
    },
    {
      key: "subOut",
      title: "Subbed Out",
      icon: "\u{1F53D}",
      lineupIcon: true,
      lineupBool: true
    }
  ];
  var PLAYER_STAT_ZERO = {
    passesCompleted: 0,
    passesFailed: 0,
    crossesCompleted: 0,
    crossesFailed: 0,
    shots: 0,
    shotsOnTarget: 0,
    shotsOffTarget: 0,
    shotsFoot: 0,
    shotsOnTargetFoot: 0,
    goalsFoot: 0,
    shotsHead: 0,
    shotsOnTargetHead: 0,
    goalsHead: 0,
    saves: 0,
    goals: 0,
    assists: 0,
    keyPasses: 0,
    duelsWon: 0,
    duelsLost: 0,
    interceptions: 0,
    tackles: 0,
    headerClearances: 0,
    tackleFails: 0,
    fouls: 0,
    yellowCards: 0,
    yellowRedCards: 0,
    redCards: 0,
    setpieceTakes: 0,
    freekickGoals: 0,
    penaltiesTaken: 0,
    penaltiesScored: 0,
    subIn: false,
    subOut: false,
    injured: false
  };

  // src/constants/training.js
  var training_exports = {};
  __export(training_exports, {
    ROUTINE_AGE_MIN: () => ROUTINE_AGE_MIN,
    ROUTINE_CAP: () => ROUTINE_CAP,
    ROUTINE_DECAY: () => ROUTINE_DECAY,
    ROUTINE_SCALE: () => ROUTINE_SCALE,
    SMOOTH_WEIGHT: () => SMOOTH_WEIGHT,
    STD_FOCUS: () => STD_FOCUS,
    TRAINING_GROUPS_GK: () => TRAINING_GROUPS_GK,
    TRAINING_GROUPS_OUT: () => TRAINING_GROUPS_OUT,
    TRAINING_LABELS: () => TRAINING_LABELS,
    TRAINING_NAMES: () => TRAINING_NAMES,
    _SEASON_DAYS: () => _SEASON_DAYS,
    _TRAINING1: () => _TRAINING1
  });
  var _TRAINING1 = /* @__PURE__ */ new Date("2023-01-16T23:00:00Z");
  var _SEASON_DAYS = 84;
  var ROUTINE_CAP = 40;
  var ROUTINE_DECAY = 0.1;
  var SMOOTH_WEIGHT = 0.5;
  var STD_FOCUS = { "1": 3, "2": 0, "3": 1, "4": 5, "5": 4, "6": 2 };
  var TRAINING_GROUPS_OUT = [[0, 5, 1], [3, 4], [8, 2], [7, 9, 13], [10, 6], [11, 12]];
  var TRAINING_GROUPS_GK = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
  var TRAINING_NAMES = { "1": "Technical", "2": "Fitness", "3": "Tactical", "4": "Finishing", "5": "Defending", "6": "Wings" };
  var TRAINING_LABELS = ["Str/Wor/Sta", "Mar/Tac", "Cro/Pac", "Pas/Tec/Set", "Hea/Pos", "Fin/Lon"];
  var ROUTINE_SCALE = 4.2;
  var ROUTINE_AGE_MIN = 15;

  // src/constants/app.js
  var app_exports = {};
  __export(app_exports, {
    GAMEPLAY: () => GAMEPLAY,
    POLL_INTERVAL_MS: () => POLL_INTERVAL_MS
  });
  var POLL_INTERVAL_MS = 6e4;
  var GAMEPLAY = {
    HOME_ADVANTAGE: 0.04
    // ~4% home advantage applied in match prediction
  };

  // src/lib/tm-constants.js
  var TmConst = {
    ...skills_exports,
    ...player_exports,
    ...match_exports,
    ...stats_exports,
    ...training_exports,
    ...app_exports
  };

  // src/lib/tm-position.js
  var ensureChipCSS = /* @__PURE__ */ (() => {
    let done = false;
    return () => {
      if (done || typeof document === "undefined") return;
      done = true;
      const s = document.createElement("style");
      s.id = "tm-pos-chip-styles";
      s.textContent = `.tm-pos-chip{display:inline-block;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.3px;line-height:16px;text-align:center;min-width:28px;text-transform:uppercase;}`;
      document.head.appendChild(s);
    };
  })();
  var MAP = TmConst.POSITION_MAP;
  var FILTER_GROUPS = { 9: "gk", 0: "de", 1: "de", 2: "dm", 3: "dm", 4: "mf", 5: "mf", 6: "om", 7: "om", 8: "fw" };
  var GROUP_COLORS = {
    9: "var(--tmu-success-strong)",
    // GK
    0: "var(--tmu-info-dark)",
    1: "var(--tmu-info-dark)",
    // DC, DLR
    2: "var(--tmu-warning)",
    3: "var(--tmu-warning)",
    // DMC, DMLR
    4: "var(--tmu-warning)",
    5: "var(--tmu-warning)",
    // MC, MLR
    6: "var(--tmu-warning)",
    7: "var(--tmu-warning)",
    // OMC, OMLR
    8: "var(--tmu-danger-deep)"
    // F
  };
  var GROUP_LABELS = {
    9: "GK",
    0: "DC",
    1: "DLR",
    2: "DMC",
    3: "DMLR",
    4: "MC",
    5: "MLR",
    6: "OMC",
    7: "OMLR",
    8: "F"
  };
  var norm = (pos) => (pos || "").replace(/sub/i, "").trim().toLowerCase().split(/[\/,]/)[0];
  var TmPosition = {
    /**
     * Display label for a position string.
     * e.g. "subdc" → "DC",  "dl" → "DL",  null → "?"
     */
    label(pos) {
      if (!pos) return "?";
      const cleaned = pos.replace(/sub/i, "").trim().toUpperCase().split(/[\/,]/)[0];
      return cleaned || "SUB";
    },
    /**
     * Stat group classification: 'gk' | 'def' | 'mid' | 'att'
     * Used for grouping players in stats tables.
     */
    group(pos) {
      const p = norm(pos);
      if (p === "gk") return "gk";
      if (/^d/.test(p) || p === "lb" || p === "rb" || p === "sw") return "def";
      if (/^(fc|st|cf|lw|rw|lf|rf|fw)/.test(p)) return "att";
      return "mid";
    },
    /**
     * Chip variant key for TmUI.chip(): 'gk' | 'd' | 'm' | 'f'
     */
    variant(pos) {
      const p = norm(pos);
      if (p === "gk") return "gk";
      if (/^d/.test(p)) return "d";
      if (/^f/.test(p) || /^(fc|st|cf|lw|rw)/.test(p)) return "f";
      return "m";
    },
    /**
     * Filter group for a POSITION_MAP id number.
     * e.g. 9 → 'gk', 4 → 'mf', 8 → 'fw'
     */
    filterGroup(id) {
      var _a;
      return (_a = FILTER_GROUPS[id]) != null ? _a : "mf";
    },
    /**
     * Group color for a POSITION_MAP id number (charts, legends).
     * e.g. 9 → success token, 8 → danger token
     */
    groupColor(id) {
      var _a;
      return (_a = GROUP_COLORS[id]) != null ? _a : "var(--tmu-text-disabled)";
    },
    /**
     * Short group label for a POSITION_MAP id number.
     * e.g. 9 → 'GK', 1 → 'DLR', 8 → 'F'
     */
    groupLabel(id) {
      var _a;
      return (_a = GROUP_LABELS[id]) != null ? _a : "?";
    },
    /**
     * Render a position chip — identical layout to the squad table.
     * @param {Array<{position:string,color:string}> | Array<string>} positions
     * @param {string} [cls] CSS class for the outer chip span
     */
    chip(positions, cls = "tm-pos-chip", { attrs = {} } = {}) {
      ensureChipCSS();
      if (!positions || Array.isArray(positions) && !positions.length) return "-";
      const arr = Array.isArray(positions) ? positions : [positions];
      const items = arr.map((pp) => {
        var _a, _b, _c, _d;
        if (typeof pp === "string") {
          const key = norm(pp);
          const entry = (_a = MAP[key]) != null ? _a : MAP[key.replace(/[lrc]$/, "")];
          return { label: (_b = entry == null ? void 0 : entry.position) != null ? _b : key.replace(/sub/i, "").toUpperCase(), color: (_c = entry == null ? void 0 : entry.color) != null ? _c : "var(--tmu-text-disabled)" };
        }
        return { label: pp.position, color: (_d = pp.color) != null ? _d : "var(--tmu-text-disabled)" };
      });
      if (!items.length) return "-";
      const firstColor = items[0].color;
      const inner = items.map((it) => `<span style="color:${it.color}">${it.label}</span>`).join('<span style="color:var(--tmu-text-faint)">, </span>');
      const attrStr = Object.entries(attrs).map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`).join("");
      return TmUI.positionChip(firstColor, inner, cls, attrStr);
    }
  };

  // src/lib/tm-utils.js
  var { COLOR_LEVELS: COLOR_LEVELS2 } = TmConst;
  var getColor = (value, thresholds) => {
    for (let i = 0; i < thresholds.length; i++) {
      if (value >= thresholds[i]) return COLOR_LEVELS2[i].color;
    }
    return COLOR_LEVELS2[COLOR_LEVELS2.length - 1].color;
  };
  var parseNum = (v, fallback = 0) => {
    if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
    return parseInt(String(v != null ? v : "").replace(/[^0-9]/g, ""), 10) || fallback;
  };
  var ageToMonths = (k) => {
    const [y, m] = k.split(".").map(Number);
    return y * 12 + m;
  };
  var monthsToAge = (m) => `${Math.floor(m / 12)}.${m % 12}`;
  var classifyPosition = (pos) => TmPosition.group(pos || "");
  var posLabel = (pos) => TmPosition.label(pos);
  var fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  var fmtCoins = (n) => {
    if (n == null || isNaN(n) || n === 0) return "-";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
    return String(Math.round(n));
  };
  var ratingColor = (r) => {
    if (!r || r === 0) return "var(--tmu-text-dim)";
    const v = Number(r);
    if (v >= 9) return "#00c040";
    if (v >= 8.5) return "#00dd50";
    if (v >= 8) return "#22e855";
    if (v >= 7.5) return "#44ee55";
    if (v >= 7) return "#66dd44";
    if (v >= 6.5) return "#88cc33";
    if (v >= 6) return "#99bb22";
    if (v >= 5.5) return "#aacc00";
    if (v >= 5) return "#bbcc00";
    if (v >= 4.5) return "#dd9900";
    if (v >= 4) return "#ee7733";
    if (v >= 3.5) return "#ee5533";
    if (v >= 3) return "#dd3333";
    if (v >= 2) return "#cc2222";
    return "#bb1111";
  };
  var toggleSort = (clickedKey, currentKey, currentDir, defaultDir = -1) => {
    if (clickedKey === currentKey) return { key: currentKey, dir: currentDir * -1 };
    return { key: clickedKey, dir: defaultDir };
  };
  var skillColor = (v) => {
    const n = parseInt(v);
    if (!n || n <= 0) return "#2a3a28";
    if (n >= 20) return "#d4af37";
    if (n >= 19) return "#c0c0c0";
    if (n >= 16) return "#66dd44";
    if (n >= 12) return "#cccc00";
    if (n >= 8) return "#ee9900";
    return "#ee6633";
  };
  var skillEff = (lvl) => {
    if (lvl >= 20) return 0;
    const bracket = TmConst.SKILL_EFFICIENCY_BRACKETS.find(([min]) => lvl >= min);
    return bracket ? bracket[1] : 0.15;
  };
  var getMainContainer = (root = document) => root.querySelector(".tmvu-main");
  var getMainContainers = (root = document) => Array.from(root.querySelectorAll(".tmvu-main"));
  var r5Color = /* @__PURE__ */ (() => {
    const cache = /* @__PURE__ */ new Map();
    const hsl2rgb = (h, s, l) => {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(h / 60 % 2 - 1));
      const m = l - c / 2;
      let r, g, b;
      if (h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
      } else {
        r = 0;
        g = c;
        b = x;
      }
      return "#" + [r + m, g + m, b + m].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
    };
    const topColors = {
      95: "#8db024",
      96: "#7aad22",
      97: "#68a820",
      98: "#57a31e",
      99: "#479e1c",
      100: "#38991a",
      101: "#2e9418",
      102: "#258e16",
      103: "#1d8814",
      104: "#168212",
      105: "#107c10",
      106: "#0c720e",
      107: "#09680c",
      108: "#075e0a",
      109: "#055408",
      110: "#044a07",
      111: "#034106",
      112: "#033905",
      113: "#023204",
      114: "#022c04",
      115: "#022603",
      116: "#012103",
      117: "#011d02",
      118: "#011902"
    };
    const tiers = [
      [25, 50, 0, 10, 65, 68, 28, 32],
      [50, 70, 10, 25, 68, 72, 34, 40],
      [70, 80, 25, 42, 72, 75, 42, 46],
      [80, 90, 42, 58, 75, 78, 46, 48],
      [90, 95, 58, 78, 78, 80, 48, 46]
    ];
    return (v) => {
      if (!v) return "var(--tmu-text-dim)";
      const rounded = Math.round(v);
      if (cache.has(rounded)) return cache.get(rounded);
      let color;
      if (rounded >= 95) {
        color = topColors[Math.min(118, rounded)] || topColors[118];
      } else {
        const clamped = Math.max(25, Math.min(95, v));
        let hue = 0, sat = 65, lit = 28;
        for (const [from, to, h0, h1, s0, s1, l0, l1] of tiers) {
          if (clamped <= to) {
            const t = (clamped - from) / (to - from);
            hue = h0 + t * (h1 - h0);
            sat = s0 + t * (s1 - s0);
            lit = l0 + t * (l1 - l0);
            break;
          }
        }
        color = hsl2rgb(hue, sat, lit);
      }
      cache.set(rounded, color);
      return color;
    };
  })();
  var TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, fmtCoins, ratingColor, r5Color, toggleSort, skillColor, skillEff, getMainContainer, getMainContainers };

  // src/components/shared/tm-skill.js
  var TmSkill = {
    /**
     * Returns an HTML string for a colored skill value with optional decimal superscript.
     *   — null/undefined → muted dash
     *   — floor ≥ 20    → gold ★
     *   — floor ≥ 19    → silver ★ + decimal superscript
     *   — otherwise     → colored integer + decimal superscript
     *
     * @param {number|null} val
     * @returns {string} HTML string
     */
    skillBadge(val) {
      if (val == null) return '<span style="color:var(--tmu-text-disabled-strong)">\u2014</span>';
      const floor = Math.floor(val);
      const frac = val - floor;
      const fracStr = frac > 5e-3 ? `<sup style="font-size:var(--tmu-font-2xs);opacity:.75">.${Math.round(frac * 100).toString().padStart(2, "0")}</sup>` : "";
      if (floor >= 20) return '<span style="color:var(--tmu-metal-gold);font-size:var(--tmu-font-sm)">\u2605</span>';
      if (floor >= 19) return `<span style="color:var(--tmu-metal-silver);font-size:var(--tmu-font-sm)">\u2605${fracStr}</span>`;
      return `<span style="color:${TmUtils.skillColor(floor)}">${floor}${fracStr}</span>`;
    }
  };

  // src/components/shared/tm-tooltip.js
  var TmTooltip = {
    /**
     * Positions a body-appended tooltip near an anchor element,
     * clamping to right and bottom viewport edges.
     *
     * @param {HTMLElement} el     — tooltip element (already in DOM)
     * @param {Element}     anchor — element to anchor against
     */
    positionTooltip(el, anchor) {
      const rect = anchor.getBoundingClientRect();
      const isFixed = getComputedStyle(el).position === "fixed";
      const scrollX = isFixed ? 0 : window.scrollX;
      const scrollY = isFixed ? 0 : window.scrollY;
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tmvu-header-height")) || 0;
      const topMin = (isFixed ? 0 : window.scrollY) + headerH + 8;
      el.style.top = rect.bottom + scrollY + 4 + "px";
      el.style.left = rect.left + scrollX + "px";
      requestAnimationFrame(() => {
        const tipRect = el.getBoundingClientRect();
        if (tipRect.right > window.innerWidth - 10)
          el.style.left = Math.max(8 + scrollX, window.innerWidth - tipRect.width - 10 + scrollX) + "px";
        if (tipRect.bottom > window.innerHeight - 10) {
          const aboveTop = rect.top + scrollY - tipRect.height - 4;
          el.style.top = Math.max(topMin, aboveTop) + "px";
        }
        const finalTop = parseFloat(el.style.top);
        if (finalTop < topMin) el.style.top = topMin + "px";
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
    positionChip: (primaryColor, innerHTML, cls = "tm-pos-chip", extraAttrs = "") => `<span class="${cls}"${extraAttrs} style="background:color-mix(in srgb, ${primaryColor} 13%, transparent);border:1px solid color-mix(in srgb, ${primaryColor} 27%, transparent)">${innerHTML}</span>`,
    /**
     * Renders a country flag `<ib>` element, or empty string if no country.
     * @param {string} country — country code (e.g. 'gb', 'de')
     * @param {string} [cls]   — extra CSS class to append
     * @returns {string} HTML string
     */
    flag: (country, cls = "") => country ? `<ib class="flag-img-${country}${cls ? " " + cls : ""}"></ib>` : ""
  };

  // src/components/shared/tm-state.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 State (loading / empty / error) \u2500\u2500 */
.tmu-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--tmu-space-xxl) var(--tmu-space-xl);gap:var(--tmu-space-sm);text-align:center}
.tmu-state-text{color:var(--tmu-text-faint);font-size:var(--tmu-font-sm);font-weight:600;letter-spacing:.5px}
.tmu-state-empty .tmu-state-text{color:var(--tmu-text-dim);font-style:italic;font-weight:400}
.tmu-state-error .tmu-state-text{color:var(--tmu-danger)}
.tmu-state-info{border:1px solid var(--tmu-border-soft);border-radius:var(--tmu-space-md);background:var(--tmu-surface-card-soft)}
.tmu-state-info .tmu-state-text{color:var(--tmu-text-muted);font-weight:500;letter-spacing:.2px}
.tmu-state-sm{padding:var(--tmu-space-sm) var(--tmu-space-md);gap:var(--tmu-space-xs)}
.tmu-state-sm .tmu-state-text{font-size:var(--tmu-font-xs);letter-spacing:.3px}
` }));
  var TmState = {
    loading: (msg = "Loading\u2026", compact = false) => `<div class="tmu-state${compact ? " tmu-state-sm" : ""}"><span class="tmu-spinner tmu-spinner-md"></span><span class="tmu-state-text">${msg}</span></div>`,
    empty: (msg = "No data", compact = false) => `<div class="tmu-state tmu-state-empty${compact ? " tmu-state-sm" : ""}"><span class="tmu-state-text">${msg}</span></div>`,
    error: (msg = "Error", compact = false) => `<div class="tmu-state tmu-state-error${compact ? " tmu-state-sm" : ""}"><span>\u26A0</span><span class="tmu-state-text">${msg}</span></div>`,
    info: (msg = "Info", compact = false) => `<div class="tmu-state tmu-state-info${compact ? " tmu-state-sm" : ""}"><span>\u2139</span><span class="tmu-state-text">${msg}</span></div>`
  };

  // src/components/shared/tm-table.js
  var STYLE_ID4 = "tmu-table-style";
  var TMU_TABLE_CSS = `
/* \u2500\u2500 Table \u2500\u2500 */
.tmu-tbl{width:100%;border-collapse:collapse;font-size:var(--tmu-font-sm);--tmu-tbl-head-py:var(--tmu-space-sm);--tmu-tbl-head-px:var(--tmu-space-sm);--tmu-tbl-body-py:var(--tmu-space-xs);--tmu-tbl-body-px:var(--tmu-space-sm)}
.tmu-tbl.tmu-tbl-density-cozy{--tmu-tbl-head-py:var(--tmu-space-sm);--tmu-tbl-head-px:var(--tmu-space-sm);--tmu-tbl-body-py:var(--tmu-space-sm);--tmu-tbl-body-px:var(--tmu-space-sm)}
.tmu-tbl.tmu-tbl-density-tight{--tmu-tbl-head-py:var(--tmu-space-xs);--tmu-tbl-head-px:var(--tmu-space-xs);--tmu-tbl-body-py:var(--tmu-space-xs);--tmu-tbl-body-px:var(--tmu-space-xs)}
.tmu-tbl thead th{padding:var(--tmu-tbl-head-py) var(--tmu-tbl-head-px);font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-faint);text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid var(--tmu-border-soft);text-align:left;white-space:nowrap;transition:color .15s}
.tmu-tbl thead th.r{text-align:right} .tmu-tbl thead th.c{text-align:center}
.tmu-tbl thead th.sortable{cursor:pointer;user-select:none}
.tmu-tbl thead th.sortable:hover{color:var(--tmu-text-main)}
.tmu-tbl thead th.sort-active{color:var(--tmu-text-main)}
.tmu-tbl tbody td{padding:var(--tmu-tbl-body-py) var(--tmu-tbl-body-px);border-bottom:1px solid var(--tmu-border-faint);color:var(--tmu-text-main);font-variant-numeric:tabular-nums;text-align:left}
.tmu-tbl tbody td.r{text-align:right} .tmu-tbl tbody td.c{text-align:center}
.tmu-tbl tbody tr:nth-child(odd){background:var(--tmu-color-accent)}
.tmu-tbl tbody tr:nth-child(even){background:var(--tmu-color-base)}
.tmu-tbl tbody tr:hover{background:var(--tmu-surface-dark-mid) !important}
.tmu-tbl thead th.tmu-tbl-col-action,.tmu-tbl tbody td.tmu-tbl-col-action{width:1%;white-space:nowrap;text-align:right}
.tmu-tbl tbody tr.tmu-tbl-empty-row:hover{background:transparent}
.tmu-tbl tbody tr.tmu-tbl-empty-row td{padding:0;border-bottom:none}
.tmu-tbl-empty-cell{padding:var(--tmu-space-sm) 0}
.tmu-tbl-tot td{border-top:2px solid var(--tmu-border-embedded);color:var(--tmu-text-strong);font-weight:800}
.tmu-tbl-avg td{color:var(--tmu-text-faint);font-weight:600}
.tmu-tbl .tmu-grp-row th{background:var(--tmu-surface-tab-active);color:var(--tmu-text-faint);font-size:var(--tmu-font-2xs);text-align:center;letter-spacing:.2px;border-bottom:1px solid var(--tmu-border-soft);padding:var(--tmu-space-xs) var(--tmu-space-xs);white-space:nowrap;font-weight:600;text-transform:none;border-right:1px solid var(--tmu-border-soft)}
`;
  function injectTmTableCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID4)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID4}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID4;
    style.textContent = TMU_TABLE_CSS;
    target.appendChild(style);
  }
  injectTmTableCss();
  var _tblCounter = 0;
  var TmTable = {
    table({ headers = [], items = [], groupHeaders = [], footer = [], sortDefs = {}, sortKey = null, sortDir = -1, density = "cozy", cls = "", emptyText = "", emptyHtml = "", prependIndex = false, rowCls = null, rowAttrs = null, onRowClick = null, renderRowsHtml = null, afterRender = null } = {}) {
      const wrap = document.createElement("div");
      const id = "tmu-tbl-" + ++_tblCounter;
      const tableDensityClass = density === "tight" ? "tmu-tbl-density-tight" : density === "cozy" ? "tmu-tbl-density-cozy" : "tmu-tbl-density-compact";
      const indexCfg = prependIndex ? {
        label: "#",
        align: "c",
        cls: "",
        thCls: "",
        width: "32px",
        render: null,
        ...typeof prependIndex === "object" ? prependIndex : {}
      } : null;
      const getSortDef = (key) => {
        if (!key) return null;
        return headers.find((h) => h.key === key) || sortDefs[key] || null;
      };
      let _items = items;
      let _footer = footer;
      let _sk = sortKey != null ? sortKey : (headers.find((h) => h.sortable !== false) || {}).key || null;
      let _sd = sortDir;
      let _sortedItems = [];
      const attrText2 = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null && value !== false).map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const isActionCol = (hdr) => {
        var _a;
        return !!hdr && (hdr.kind === "action" || !String((_a = hdr.label) != null ? _a : "").trim() && hdr.align === "r" && hdr.sortable === false);
      };
      function _render() {
        const sortHdr = getSortDef(_sk);
        const sorted = _items.slice().sort((a, b) => {
          if (!sortHdr) return 0;
          if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
          const va = a[_sk], vb = b[_sk];
          if (typeof va === "number" && typeof vb === "number") return _sd * (va - vb);
          return _sd * String(va != null ? va : "").localeCompare(String(vb != null ? vb : ""));
        });
        _sortedItems = sorted;
        const arrow = _sd > 0 ? " \u25B2" : " \u25BC";
        const emptyStateHtml = emptyHtml ? String(emptyHtml) : emptyText ? TmState.empty(emptyText, true) : "";
        let h = `<table class="tmu-tbl ${tableDensityClass}${cls ? " " + cls : ""}" id="${id}"><thead>`;
        groupHeaders.forEach((row) => {
          const rc = row.cls || "";
          h += `<tr${rc ? ` class="${rc}"` : ""}>`;
          (row.cells || []).forEach((cell) => {
            var _a;
            const canSort = !!cell.key;
            const isActive = canSort && _sk === cell.key;
            const cc = [cell.cls || "", canSort ? "sortable" : "", isActive ? "sort-active" : "", cell.kind === "action" ? "tmu-tbl-col-action" : ""].filter(Boolean).join(" ");
            const label = `${(_a = cell.label) != null ? _a : ""}${isActive ? arrow : ""}`;
            h += `<th${cc ? ` class="${cc}"` : ""}${canSort ? ` data-sk="${cell.key}"` : ""}${cell.colspan ? ` colspan="${cell.colspan}"` : ""}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ""}${cell.title ? ` title="${cell.title}"` : ""}${cell.style ? ` style="${cell.style}"` : ""}${cell.attrs ? attrText2(cell.attrs) : ""}>${label}</th>`;
          });
          h += "</tr>";
        });
        if (indexCfg || headers.length) {
          h += "<tr>";
          if (indexCfg) {
            const align = indexCfg.align && indexCfg.align !== "l" ? " " + indexCfg.align : "";
            const thCls = [align, indexCfg.thCls || ""].filter(Boolean).join(" ");
            h += `<th${thCls ? ` class="${thCls}"` : ""}${indexCfg.width ? ` style="width:${indexCfg.width}"` : ""}>${indexCfg.label}</th>`;
          }
          headers.forEach((hdr) => {
            const align = hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
            const canSort = hdr.sortable !== false && !isActionCol(hdr);
            const isActive = canSort && _sk === hdr.key;
            const thCls = [canSort ? "sortable" : "", isActive ? "sort-active" : "", align, isActionCol(hdr) ? "tmu-tbl-col-action" : "", hdr.thCls || ""].filter(Boolean).join(" ");
            h += `<th${thCls ? ` class="${thCls}"` : ""}${canSort ? ` data-sk="${hdr.key}"` : ""}${hdr.width ? ` style="width:${hdr.width}"` : ""}${hdr.title ? ` title="${hdr.title}"` : ""}>`;
            h += hdr.label + (isActive ? arrow : "") + "</th>";
          });
          h += "</tr>";
        }
        h += "</thead><tbody>";
        if (!sorted.length && emptyStateHtml) {
          const colCount = Math.max((indexCfg ? 1 : 0) + headers.length, 1);
          h += `<tr class="tmu-tbl-empty-row"><td colspan="${colCount}"><div class="tmu-tbl-empty-cell">${emptyStateHtml}</div></td></tr>`;
        } else if (typeof renderRowsHtml === "function") {
          h += renderRowsHtml(sorted);
        } else {
          sorted.forEach((item, i) => {
            const rc = rowCls ? rowCls(item, i) : "";
            const ra = rowAttrs ? rowAttrs(item, i) : null;
            h += `<tr${rc ? ` class="${rc}"` : ""}${onRowClick ? ` data-ri="${i}"` : ""}${ra ? attrText2(ra) : ""}>`;
            if (indexCfg) {
              const align = indexCfg.align && indexCfg.align !== "l" ? " " + indexCfg.align : "";
              const tdCls = [align, indexCfg.cls || ""].filter(Boolean).join(" ");
              const content = typeof indexCfg.render === "function" ? indexCfg.render(item, i) : i + 1;
              h += `<td${tdCls ? ` class="${tdCls}"` : ""}>${content}</td>`;
            }
            headers.forEach((hdr) => {
              const val = item[hdr.key];
              const align = hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
              const tdCls = [align, isActionCol(hdr) ? "tmu-tbl-col-action" : "", hdr.cls || ""].filter(Boolean).join(" ");
              const content = hdr.render ? hdr.render(val, item, i) : val == null ? "" : val;
              h += `<td${tdCls ? ` class="${tdCls}"` : ""}>${content}</td>`;
            });
            h += "</tr>";
          });
        }
        h += "</tbody>";
        if (_footer.length) {
          h += "<tfoot>";
          _footer.forEach((fRow) => {
            const rc = fRow.cls || "";
            h += `<tr${rc ? ` class="${rc}"` : ""}>`;
            if (indexCfg) {
              h += "<td></td>";
            }
            (fRow.cells || []).forEach((cell, ci) => {
              var _a;
              const hdr = headers[ci];
              const defaultAlign = hdr && hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
              if (cell == null || typeof cell !== "object") {
                h += `<td${defaultAlign ? ` class="${defaultAlign}"` : ""}>${cell != null ? cell : ""}</td>`;
              } else {
                const tc = [defaultAlign, cell.cls || ""].filter(Boolean).join(" ");
                h += `<td${tc ? ` class="${tc}"` : ""}>${(_a = cell.content) != null ? _a : ""}</td>`;
              }
            });
            h += "</tr>";
          });
          h += "</tfoot>";
        }
        h += "</table>";
        wrap.innerHTML = h;
        const tbl = wrap.firstElementChild;
        if (afterRender) {
          afterRender({ wrap, table: tbl, sortedItems: sorted, sortKey: _sk, sortDir: _sd });
        }
      }
      wrap.addEventListener("click", (event) => {
        const sortHeader = event.target.closest("thead th[data-sk]");
        if (sortHeader && wrap.contains(sortHeader)) {
          const key = sortHeader.dataset.sk;
          if (_sk === key) {
            _sd *= -1;
          } else {
            _sk = key;
            const nextHdr = getSortDef(key);
            _sd = Number(nextHdr == null ? void 0 : nextHdr.defaultSortDir) || -1;
          }
          _render();
          return;
        }
        if (!onRowClick) return;
        const row = event.target.closest("tbody tr[data-ri]");
        if (!row || !wrap.contains(row)) return;
        const index = Number(row.dataset.ri);
        if (!Number.isFinite(index) || !_sortedItems[index]) return;
        onRowClick(_sortedItems[index], index);
      });
      _render();
      wrap.refresh = ({ items: newItems, sortKey: sk, sortDir: sd, footer: newFooter } = {}) => {
        if (newItems !== void 0) _items = newItems;
        if (sk !== void 0) _sk = sk;
        if (sd !== void 0) _sd = sd;
        if (newFooter !== void 0) _footer = newFooter;
        _render();
      };
      return wrap;
    }
  };

  // src/components/shared/tm-modal.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Modal \u2500\u2500 */
#tmu-modal-overlay{position:fixed;inset:0;z-index:200000;background:var(--tmu-surface-overlay-strong);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.tmu-modal{background:var(--tmu-color-accent);border:1px solid var(--tmu-border-success);border-radius:var(--tmu-space-md);padding:var(--tmu-space-xxl) var(--tmu-space-xxl) var(--tmu-space-xl);max-width:440px;width:calc(100% - 40px);box-shadow:0 20px 60px var(--tmu-shadow-panel),0 0 0 1px var(--tmu-success-fill-soft);color:var(--tmu-text-main);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.tmu-modal-icon{font-size:var(--tmu-font-3xl);margin-bottom:var(--tmu-space-md);line-height:1}
.tmu-modal-title{font-size:var(--tmu-font-md);font-weight:800;color:var(--tmu-text-strong);margin-bottom:var(--tmu-space-sm)}
.tmu-modal-msg{font-size:var(--tmu-font-sm);color:var(--tmu-text-muted);line-height:1.65;margin-bottom:var(--tmu-space-xl)}
.tmu-modal-btns{display:flex;flex-direction:column;gap:var(--tmu-space-sm)}
.tmu-modal-btn-sub{font-size:var(--tmu-font-xs);font-weight:400;opacity:.7;display:block;margin-top:var(--tmu-space-xs)}
.tmu-prompt-field{margin-bottom:var(--tmu-space-lg)}
`
  }));
  var htmlOf = (node) => node ? node.outerHTML : "";
  var buttonHtml = ({ style = "secondary", size = "sm", selected = false, label = "", sub = "", attrs = {} } = {}) => htmlOf(TmButton.button({
    slot: `${label}${sub ? `<span class="tmu-modal-btn-sub">${sub}</span>` : ""}`,
    color: style === "danger" ? "danger" : style === "primary" ? "primary" : "secondary",
    size,
    active: selected,
    cls: `tmu-modal-btn tmu-modal-btn-${style}`,
    attrs
  }));
  var inputHtml = (opts = {}) => htmlOf(TmInput.input({
    size: "full",
    density: "comfy",
    tone: "overlay",
    grow: true,
    ...opts
  }));
  var TmModal = {
    modal({ icon, title, message, buttons }) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.id = "tmu-modal-overlay";
        overlay.innerHTML = `<div class="tmu-modal"><div class="tmu-modal-icon">${icon || ""}</div><div class="tmu-modal-title">${title}</div><div class="tmu-modal-msg">${message}</div><div class="tmu-modal-btns">${buttons.map(
          (b) => buttonHtml({
            style: b.style || "secondary",
            size: b.size || "sm",
            selected: Boolean(b.selected),
            label: b.label,
            sub: b.sub,
            attrs: { "data-val": b.value }
          })
        ).join("")}</div></div>`;
        const closeWith = (val) => {
          overlay.remove();
          resolve(val);
        };
        const onKey = (e) => {
          if (e.key === "Escape") {
            document.removeEventListener("keydown", onKey);
            closeWith("cancel");
          }
        };
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            document.removeEventListener("keydown", onKey);
            closeWith("cancel");
            return;
          }
          const button = e.target.closest(".tmu-modal-btn");
          if (!button || !overlay.contains(button)) return;
          document.removeEventListener("keydown", onKey);
          closeWith(button.dataset.val);
        });
        document.addEventListener("keydown", onKey);
        document.body.appendChild(overlay);
      });
    },
    prompt({ icon, title, placeholder, defaultValue }) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.id = "tmu-modal-overlay";
        const esc = (s) => (s || "").replace(/"/g, "&quot;");
        overlay.innerHTML = `<div class="tmu-modal"><div class="tmu-modal-icon">${icon || ""}</div><div class="tmu-modal-title">${title}</div><div class="tmu-prompt-field">${inputHtml({ id: "tmu-prompt-input", type: "text", placeholder: esc(placeholder), value: esc(defaultValue) })}</div><div class="tmu-modal-btns">` + buttonHtml({ style: "primary", label: "\u{1F4BE} Save", attrs: { "data-val": "ok" } }) + buttonHtml({ style: "danger", label: "Cancel", attrs: { "data-val": "cancel" } }) + `</div></div>`;
        const getVal = () => overlay.querySelector("#tmu-prompt-input").value.trim();
        const closeWith = (val) => {
          overlay.remove();
          resolve(val);
        };
        const onKey = (e) => {
          if (e.key === "Escape") {
            document.removeEventListener("keydown", onKey);
            closeWith(null);
          }
          if (e.key === "Enter") {
            document.removeEventListener("keydown", onKey);
            closeWith(getVal() || null);
          }
        };
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            document.removeEventListener("keydown", onKey);
            closeWith(null);
            return;
          }
          const button = e.target.closest(".tmu-modal-btn");
          if (!button || !overlay.contains(button)) return;
          document.removeEventListener("keydown", onKey);
          closeWith(button.dataset.val === "ok" ? getVal() || null : null);
        });
        document.addEventListener("keydown", onKey);
        document.body.appendChild(overlay);
        setTimeout(() => overlay.querySelector("#tmu-prompt-input").focus(), 50);
      });
    },
    open({ title, contentEl, maxWidth = "440px" } = {}) {
      const overlay = document.createElement("div");
      overlay.id = "tmu-modal-overlay";
      const modal = document.createElement("div");
      modal.className = "tmu-modal";
      modal.style.padding = "0";
      modal.style.maxWidth = maxWidth;
      if (title) {
        const titleEl = document.createElement("div");
        titleEl.className = "tmu-modal-title";
        titleEl.style.padding = "var(--tmu-space-md) var(--tmu-space-lg)";
        titleEl.textContent = title;
        modal.appendChild(titleEl);
      }
      modal.appendChild(contentEl);
      overlay.appendChild(modal);
      const destroy = () => {
        document.removeEventListener("keydown", onKey);
        overlay.remove();
      };
      const onKey = (e) => {
        if (e.key === "Escape") destroy();
      };
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) destroy();
      });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(overlay);
      return { destroy };
    }
  };

  // src/components/shared/tm-progress.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Progress bar \u2500\u2500 */
.tmu-prog-overlay{position:fixed;top:0;left:0;right:0;z-index:99999;
    background:var(--tmu-surface-input-dark-focus);border-bottom:2px solid var(--tmu-success);
    padding:var(--tmu-space-md) var(--tmu-space-xl);font-family:Arial,sans-serif;color:var(--tmu-text-strong);transition:opacity 0.5s}
.tmu-prog-inner{display:flex;align-items:center;gap:var(--tmu-space-md);max-width:900px;margin:0 auto}
.tmu-prog-title{font-size:var(--tmu-font-md);font-weight:700;color:var(--tmu-success);white-space:nowrap}
.tmu-prog-track{flex:1;background:var(--tmu-success-fill-soft);border-radius:var(--tmu-space-sm);height:18px;
    overflow:hidden;border:1px solid var(--tmu-border-success)}
.tmu-prog-bar{height:100%;width:0%;background:linear-gradient(90deg,var(--tmu-border-embedded),var(--tmu-success));
    border-radius:var(--tmu-space-sm);transition:width 0.3s}
.tmu-prog-text{font-size:var(--tmu-font-sm);min-width:180px;text-align:right}
.tmu-prog-inline{width:100%;height:5px;background:var(--tmu-surface-tab-active);border-radius:var(--tmu-space-xs);
    margin:var(--tmu-space-sm) 0;overflow:hidden}
.tmu-prog-inline .tmu-prog-bar{border-radius:var(--tmu-space-xs);transition:width .4s}
` }));
  var TmProgress = {
    progressBar({ title = "\u26A1 Processing", inline = false, container = null, fadeDelay = 2500 } = {}) {
      const wrap = document.createElement("div");
      if (inline) {
        wrap.className = "tmu-prog-inline";
        wrap.innerHTML = '<div class="tmu-prog-bar"></div>';
        if (container) container.appendChild(wrap);
      } else {
        wrap.className = "tmu-prog-overlay";
        wrap.innerHTML = `<div class="tmu-prog-inner"><div class="tmu-prog-title">${title}</div><div class="tmu-prog-track"><div class="tmu-prog-bar"></div></div><div class="tmu-prog-text">Initializing...</div></div>`;
        document.body.appendChild(wrap);
      }
      const barEl = () => wrap.querySelector(".tmu-prog-bar");
      const txtEl = () => wrap.querySelector(".tmu-prog-text");
      return {
        update(current, total, label) {
          const pct = total > 0 ? Math.round(current / total * 100) : 0;
          const b = barEl();
          if (b) b.style.width = pct + "%";
          const t = txtEl();
          if (t) t.textContent = label != null ? label : `${current}/${total}`;
        },
        done(msg) {
          const b = barEl(), t = txtEl();
          if (b) b.style.width = "100%";
          if (t) {
            t.style.color = "var(--tmu-success)";
            t.textContent = msg != null ? msg : "\u2713 Done";
          }
          if (!inline) setTimeout(() => {
            wrap.style.opacity = "0";
            setTimeout(() => wrap.remove(), 600);
          }, fadeDelay);
        },
        error(msg) {
          const t = txtEl();
          if (t) {
            t.style.color = "var(--tmu-danger)";
            t.textContent = msg;
          }
          if (!inline) setTimeout(() => wrap.remove(), 4e3);
        },
        remove() {
          wrap.remove();
        }
      };
    }
  };

  // src/components/shared/tm-theme.js
  var THEME_STYLE_ID = "tmu-theme-style";
  var TMU_THEME_CSS = `
:root{
--tmu-color-primary:#00fea7;
--tmu-color-secondary:#0a1614;
--tmu-color-accent:#001810;
--tmu-color-surface:#142420;
--tmu-color-base:#001012;
--tmu-color-elevated:#1e342c;
--tmu-surface-card:var(--tmu-surface-dark-strong);
--tmu-surface-card-soft:var(--tmu-color-surface);
--tmu-surface-panel:var(--tmu-color-base);
--tmu-surface-dark-soft:rgba(0,0,0,.2);
--tmu-surface-dark-mid:rgba(0,0,0,.32);
--tmu-surface-dark-strong:rgba(0,0,0,.46);
--tmu-surface-dark-muted:rgba(0,0,0,.26);
--tmu-surface-item-dark:rgba(255,255,255,.025);
--tmu-surface-input-dark:rgba(6,12,8,.92);
--tmu-surface-input-dark-focus:rgba(6,12,8,.98);
--tmu-surface-panel-dark:rgba(8,14,10,.92);
--tmu-surface-accent-soft:rgba(34,197,94,.1);
--tmu-surface-card-elevated:var(--tmu-color-elevated);
--tmu-surface-card-hero:rgba(26,44,34,.96);
--tmu-surface-item-strong:rgba(255,255,255,.07);
--tmu-surface-item-hover:rgba(34,197,94,.12);
--tmu-surface-header:rgba(6,14,8,.98);
--tmu-surface-header-soft:rgba(6,14,8,.88);
--tmu-surface-nav-pill:transparent;
--tmu-surface-nav-pill-hover:rgba(255,255,255,.05);
--tmu-surface-nav-pill-active:rgba(34,197,94,.14);
--tmu-surface-embedded:var(--tmu-color-surface);
--tmu-surface-overlay-soft:rgba(0,0,0,.15);
--tmu-surface-overlay:rgba(0,0,0,.25);
--tmu-surface-overlay-strong:rgba(0,0,0,.35);
--tmu-surface-tab:var(--tmu-color-surface);
--tmu-surface-tab-hover:var(--tmu-color-elevated);
--tmu-surface-tab-active:rgba(34,197,94,.1);
--tmu-border-soft:rgba(255,255,255,.06);
--tmu-border-strong:var(--tmu-color-primary);
--tmu-border-embedded:var(--tmu-color-primary);
--tmu-border-soft-alpha:rgba(255,255,255,.08);
--tmu-border-soft-alpha-mid:rgba(255,255,255,.13);
--tmu-border-soft-alpha-strong:rgba(255,255,255,.2);
--tmu-border-glow-soft:rgba(34,197,94,.25);
--tmu-border-header:rgba(0,0,0,.4);
--tmu-border-pill:rgba(255,255,255,.1);
--tmu-border-pill-active:rgba(34,197,94,.4);
--tmu-border-contrast:rgba(255,255,255,.02);
--tmu-border-faint:rgba(255,255,255,.07);
--tmu-border-input:rgba(255,255,255,.11);
--tmu-border-input-overlay:rgba(34,197,94,.34);
--tmu-border-success:rgba(34,197,94,.28);
--tmu-border-warning:rgba(251,191,36,.34);
--tmu-border-info:rgba(96,165,250,.3);
--tmu-border-accent:rgba(34,197,94,.22);
--tmu-border-danger:rgba(248,113,113,.3);
--tmu-border-live:#34d399;
--tmu-border-preview:#60a5fa;
--tmu-border-highlight:#fbbf24;
--tmu-shadow-ring:rgba(0,0,0,.35);
--tmu-shadow-elev:rgba(0,0,0,.3);
--tmu-shadow-panel:rgba(0,0,0,.55);
--tmu-shadow-soft:rgba(0,0,0,.22);
--tmu-shadow-deep:rgba(0,0,0,.38);
--tmu-shadow-glow:rgba(34,197,94,.1);
--tmu-shadow-header:rgba(0,0,0,.5);
--tmu-shadow-card-strong:rgba(0,0,0,.32);
--tmu-shadow-pill:rgba(0,0,0,.2);
--tmu-text-strong:#f2f5f3;
--tmu-text-main:#c2cac5;
--tmu-text-muted:#7a8880;
--tmu-text-dim:#4c5c52;
--tmu-text-faint:#5e6e64;
--tmu-text-disabled:#38483e;
--tmu-text-disabled-strong:#2a3830;
--tmu-text-inverse:#fff;
--tmu-text-panel-label:#8a9e92;
--tmu-text-accent-soft:#bbf7d0;
--tmu-text-live:#6ee7b7;
--tmu-text-preview:#93c5fd;
--tmu-text-highlight:#fde68a;
--tmu-text-warm-strong:#f5e8c8;
--tmu-text-warm-muted:#d4c8a4;
--tmu-text-warm-accent:#fbbf24;
--tmu-space-xs:4px;
--tmu-space-sm:8px;
--tmu-space-md:12px;
--tmu-space-lg:16px;
--tmu-space-xl:20px;
--tmu-space-xxl:24px;
--tmu-font-2xs:8px;
--tmu-font-xs:10px;
--tmu-font-sm:12px;
--tmu-font-md:14px;
--tmu-font-lg:16px;
--tmu-font-xl:20px;
--tmu-font-2xl:24px;
--tmu-font-3xl:28px;
--tmu-accent:var(--tmu-color-primary);
--tmu-success:#22bb33;
--tmu-warning:#ff8c00;
--tmu-danger:#bb2124;
--tmu-info:#60a5fa;
--tmu-purple:#c084fc;
--tmu-success-strong:#16a34a;
--tmu-warning-soft:#fbbf24;
--tmu-danger-strong:#f04040;
--tmu-info-strong:#38bdf8;
--tmu-info-dark:#2563eb;
--tmu-danger-deep:#dc2626;
--tmu-info-alt:#60a5fa;
--tmu-accent-fill:var(--tmu-color-accent);
--tmu-success-fill:var(--tmu-color-secondary);
--tmu-success-fill-faint:rgba(34,197,94,.07);
--tmu-success-fill-soft:rgba(34,197,94,.1);
--tmu-success-fill-hover:rgba(34,197,94,.14);
--tmu-success-fill-strong:rgba(34,197,94,.2);
--tmu-warning-fill:#1c1000;
--tmu-info-fill:#04101e;
--tmu-accent-fill-soft:rgba(12,26,16,.7);
--tmu-danger-fill:#1a0808;
--tmu-live-fill:#011a0c;
--tmu-preview-fill:#040c1c;
--tmu-highlight-fill:#1c1000;
--tmu-compare-fill:rgba(34,197,94,.07);
--tmu-compare-bar-bg:rgba(0,0,0,.2);
--tmu-compare-home-grad-start:var(--tmu-color-secondary);
--tmu-compare-home-grad-end:var(--tmu-color-primary);
--tmu-compare-away-grad-start:#1a3060;
--tmu-compare-away-grad-end:#4878c8;
--tmu-spinner:var(--tmu-text-faint);
--tmu-metal-gold:gold;
--tmu-metal-silver:silver;
--tmu-metal-bronze:#cd7f32;
--tmu-tabs-primary-bg:var(--tmu-surface-card);
--tmu-tabs-primary-border:var(--tmu-border-soft-alpha-strong);
--tmu-tabs-primary-text:var(--tmu-text-muted);
--tmu-tabs-primary-hover-text:var(--tmu-text-strong);
--tmu-tabs-primary-hover-bg:var(--tmu-surface-card-elevated);
--tmu-tabs-primary-active-text:var(--tmu-text-strong);
--tmu-tabs-primary-active-bg:var(--tmu-surface-card-soft);
--tmu-tabs-primary-active-border:var(--tmu-accent);
--tmu-tabs-secondary-bg:var(--tmu-surface-card);
--tmu-tabs-secondary-border:var(--tmu-border-soft-alpha-mid);
--tmu-tabs-secondary-text:var(--tmu-text-muted);
--tmu-tabs-secondary-hover-text:var(--tmu-text-strong);
--tmu-tabs-secondary-hover-bg:var(--tmu-surface-item-strong);
--tmu-tabs-secondary-active-text:var(--tmu-text-inverse);
--tmu-tabs-secondary-active-bg:var(--tmu-surface-card-elevated);
--tmu-tabs-secondary-active-border:var(--tmu-color-primary)
}
`;
  var TMU_THEME_SHADOW_CSS = TMU_THEME_CSS.replace(":root{", ":host{");
  var TMU_THEME_DIFF_BLUE = `
:root{
--tmu-color-primary:#ff0046;
--tmu-color-secondary:#0f2d37;
--tmu-color-accent:#001e28;
--tmu-color-surface:#0f2d37;
--tmu-color-base:#00141e;
--tmu-color-elevated:#19414f;
--tmu-surface-input-dark:rgba(1,10,15,.92);
--tmu-surface-input-dark-focus:rgba(1,10,15,.98);
--tmu-surface-panel-dark:rgba(1,10,15,.92);
--tmu-surface-card-hero:rgba(15,45,55,.96);
--tmu-surface-accent-soft:rgba(255,0,70,.1);
--tmu-surface-card-elevated:#19414f;
--tmu-surface-card-soft:#0f2d37;
--tmu-surface-panel:#00141e;
--tmu-surface-embedded:#0f2d37;
--tmu-surface-item-hover:rgba(255,0,70,.12);
--tmu-surface-nav-pill-active:rgba(255,0,70,.14);
--tmu-surface-header:rgba(1,10,15,.98);
--tmu-surface-header-soft:rgba(1,10,15,.88);
--tmu-surface-tab:var(--tmu-color-surface);
--tmu-surface-tab-hover:#19414f;
--tmu-surface-tab-active:rgba(255,0,70,.1);
--tmu-border-strong:#ff0046;
--tmu-border-embedded:#ff0046;
--tmu-border-glow-soft:rgba(255,0,70,.25);
--tmu-border-pill-active:rgba(255,0,70,.4);
--tmu-border-input-overlay:rgba(255,0,70,.34);
--tmu-border-success:rgba(255,0,70,.28);
--tmu-border-accent:rgba(255,0,70,.22);
--tmu-border-live:#ff4070;
--tmu-shadow-glow:rgba(255,0,70,.1);
--tmu-text-accent-soft:#ffccd6;
--tmu-text-live:#ff7090;
--tmu-accent:var(--tmu-color-primary);
--tmu-success:#22bb33;
--tmu-accent-fill:var(--tmu-color-accent);
--tmu-success-fill:var(--tmu-color-secondary);
--tmu-success-fill-faint:rgba(255,0,70,.07);
--tmu-success-fill-soft:rgba(255,0,70,.1);
--tmu-success-fill-hover:rgba(255,0,70,.14);
--tmu-success-fill-strong:rgba(255,0,70,.2);
--tmu-live-fill:#1a0008;
--tmu-accent-fill-soft:rgba(0,30,40,.7);
--tmu-tabs-primary-active-border:#ff0046;
--tmu-tabs-secondary-active-border:#ff0046
}
`;
  var THEME_STORAGE_KEY = "tmu-theme-id";
  function getSavedThemeId() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || "green";
    } catch (e) {
      return "green";
    }
  }
  function buildThemeCss(id) {
    return id === "blue" ? TMU_THEME_CSS + TMU_THEME_DIFF_BLUE : TMU_THEME_CSS;
  }
  function ensureTmTheme(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(THEME_STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${THEME_STYLE_ID}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = THEME_STYLE_ID;
    const css = target === document.head ? buildThemeCss(getSavedThemeId()) : TMU_THEME_SHADOW_CSS;
    style.textContent = css;
    target.appendChild(style);
  }

  // src/components/shared/tm-tabs.js
  var STYLE_ID5 = "tmu-tabs-style";
  var TMU_TABS_CSS = `
/* \u2500\u2500 Tab bar (tmu-tabs / tmu-tab) \u2500\u2500 */
.tmu-tabs{
display:flex;align-items:center;
background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg));
border:none;
overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;
scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border)) transparent;
border-radius:0;padding:0;gap:0;
box-shadow:inset 0 -1px 0 var(--tmu-border-soft-alpha)
}
.tmu-card-body-flush > .tmu-tabs:first-child{
border:none;
border-radius:0;
padding:0;
gap:0;
box-shadow:inset 0 -1px 0 var(--tmu-border-soft-alpha)
}
.tmu-tabs-color-primary{
--tmu-tabs-bg:var(--tmu-tabs-primary-bg);
--tmu-tabs-border:var(--tmu-tabs-primary-border);
--tmu-tabs-text:var(--tmu-tabs-primary-text);
--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text);
--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg);
--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text);
--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg);
--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border)
}
.tmu-tabs-color-secondary{
--tmu-tabs-bg:var(--tmu-tabs-secondary-bg);
--tmu-tabs-border:var(--tmu-tabs-secondary-border);
--tmu-tabs-text:var(--tmu-tabs-secondary-text);
--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text);
--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg);
--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text);
--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg);
--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border)
}
.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}
.tmu-tab{padding:var(--tmu-space-md) var(--tmu-space-lg);text-align:center;font-size:var(--tmu-font-sm);font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text));cursor:pointer;border:none;transition:background .15s,color .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:var(--tmu-space-sm);flex:0 0 auto;min-width:max-content;border-radius:0;min-height:44px;position:relative}
.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg))}
.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg));box-shadow:inset 0 -2px 0 var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border))}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
.tmu-tab:focus-visible{outline:1px solid var(--tmu-border-pill-active);outline-offset:2px}
.tmu-tab-icon{font-size:var(--tmu-font-md);line-height:1;flex-shrink:0}
`;
  function injectTmTabsCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID5)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID5}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID5;
    style.textContent = TMU_TABS_CSS;
    target.appendChild(style);
  }
  injectTmTabsCss();
  var setActive = (wrap, activeKey) => {
    wrap.querySelectorAll(".tmu-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === String(activeKey));
    });
  };
  var TmTabs = {
    tabs({ items, active, onChange, stretch = false, color = "primary", cls = "", itemCls = "" }) {
      const wrap = document.createElement("div");
      wrap.className = ["tmu-tabs", `tmu-tabs-color-${color}`, stretch ? "tmu-tabs-stretch" : "", cls].filter(Boolean).join(" ");
      wrap.onclick = (event) => {
        const btn = event.target.closest(".tmu-tab");
        if (!btn || !wrap.contains(btn) || btn.disabled) return;
        const key = btn.dataset.tab;
        setActive(wrap, key);
        onChange == null ? void 0 : onChange(key);
      };
      items.forEach(({ key, label, slot, disabled, icon, cls: itemOwnCls, title }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = ["tmu-tab", itemCls, itemOwnCls, key === active ? "active" : ""].filter(Boolean).join(" ");
        btn.dataset.tab = key;
        if (title) btn.title = title;
        if (icon) {
          const iconEl = document.createElement("span");
          iconEl.className = "tmu-tab-icon";
          iconEl.textContent = icon;
          btn.appendChild(iconEl);
          const labelEl = document.createElement("span");
          labelEl.textContent = label;
          btn.appendChild(labelEl);
        } else if (slot instanceof Node) {
          btn.appendChild(slot);
        } else if (typeof slot === "string") {
          btn.innerHTML = slot;
        } else {
          btn.textContent = label;
        }
        if (disabled) btn.disabled = true;
        wrap.appendChild(btn);
      });
      return wrap;
    },
    setActive
  };

  // src/components/shared/tm-alert.js
  var STYLE_ID6 = "tmu-alert-style";
  var HOST_ID = "tmu-alert-host";
  var CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var CSS = `
#tmu-alert-host {
    position: fixed;
    bottom: var(--tmu-space-xl, 24px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300000;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: var(--tmu-space-sm, 6px);
    pointer-events: none;
}
.tmu-alert {
    display: flex;
    align-items: center;
    gap: var(--tmu-space-sm, 6px);
    padding: var(--tmu-space-sm, 6px) var(--tmu-space-md, 10px);
    border-radius: var(--tmu-space-md, 10px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: var(--tmu-font-sm, 13px);
    font-weight: 700;
    box-shadow: 0 4px 24px rgba(0,0,0,.4);
    pointer-events: auto;
    max-width: min(440px, calc(100vw - 48px));
    border: 1px solid transparent;
    animation: tmu-alert-in 0.2s ease;
}
.tmu-alert-success { background: var(--tmu-success); color: var(--tmu-text-inverse); border-color: transparent; }
.tmu-alert-error   { background: var(--tmu-danger-fill);  color: var(--tmu-danger);           border-color: var(--tmu-border-danger); }
.tmu-alert-info    { background: var(--tmu-surface-card-soft); color: var(--tmu-text-main);   border-color: var(--tmu-border-soft); }
.tmu-alert-warning { background: var(--tmu-surface-card-soft); color: var(--tmu-warning);     border-color: var(--tmu-border-soft); }
.tmu-alert-text { flex: 1; min-width: 0; }
.tmu-alert-close {
    flex-shrink: 0;
    background: none; border: none; cursor: pointer;
    padding: 2px; color: inherit; opacity: 0.6; line-height: 1;
    border-radius: 4px;
    transition: opacity 0.15s;
}
.tmu-alert-close:hover { opacity: 1; }
@keyframes tmu-alert-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;
  function ensureHost() {
    if (!document.getElementById(STYLE_ID6)) {
      const style = document.createElement("style");
      style.id = STYLE_ID6;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      document.body.appendChild(host);
    }
    return host;
  }
  var TmAlert = {
    /**
     * Show a toast notification.
     * @param {object}  opts
     * @param {string}  opts.message
     * @param {'success'|'error'|'info'|'warning'} [opts.tone='info']
     * @param {number}  [opts.duration=4000]  ms before auto-dismiss; 0 = never
     */
    show({ message, tone = "info", duration = 4e3 } = {}) {
      const host = ensureHost();
      const el = document.createElement("div");
      el.className = `tmu-alert tmu-alert-${tone}`;
      el.setAttribute("role", "alert");
      const textEl = document.createElement("span");
      textEl.className = "tmu-alert-text";
      textEl.textContent = String(message || "");
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "tmu-alert-close";
      closeBtn.setAttribute("aria-label", "Dismiss");
      closeBtn.innerHTML = CLOSE_SVG;
      const dismiss = () => el.remove();
      closeBtn.addEventListener("click", dismiss);
      el.appendChild(textEl);
      el.appendChild(closeBtn);
      host.appendChild(el);
      if (duration > 0) {
        const t = setTimeout(dismiss, duration);
        closeBtn.addEventListener("click", () => clearTimeout(t), { once: true });
      }
    }
  };

  // src/components/shared/tm-ui.js
  ensureTmTheme();
  var STYLE_ID7 = "tmu-ui-style";
  var TMU_UI_CSS = `
/* -- Spinner -- */
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: var(--tmu-spinner); border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
/* -- Row / Col grid -- */
.tmu-row { display: flex; align-items: center; gap: var(--tmu-space-sm); }
.tmu-col { min-width: 0; }
.tmu-col-1{flex:0 0 8.333%}  .tmu-col-2{flex:0 0 16.667%} .tmu-col-3{flex:0 0 25%}     .tmu-col-4{flex:0 0 33.333%}
.tmu-col-5{flex:0 0 41.667%} .tmu-col-6{flex:0 0 50%}     .tmu-col-7{flex:0 0 58.333%} .tmu-col-8{flex:0 0 66.667%}
.tmu-col-9{flex:0 0 75%}     .tmu-col-10{flex:0 0 83.333%}.tmu-col-11{flex:0 0 91.667%}.tmu-col-12{flex:0 0 100%}
/* -- Theme utilities -- */
.tmu-surface-card{background:var(--tmu-surface-card)}
.tmu-surface-card-soft{background:var(--tmu-surface-card-soft)}
.tmu-surface-panel{background:var(--tmu-surface-panel)}
.tmu-surface-tab{background:var(--tmu-surface-tab)}
.tmu-surface-tab-hover{background:var(--tmu-surface-tab-hover)}
.tmu-surface-tab-active{background:var(--tmu-surface-tab-active)}
.tmu-border-soft{border-color:var(--tmu-border-soft)}
.tmu-border-strong{border-color:var(--tmu-border-strong)}
.tmu-text-strong{color:var(--tmu-text-strong)}
.tmu-text-main{color:var(--tmu-text-main)}
.tmu-text-muted{color:var(--tmu-text-muted)}
.tmu-text-dim{color:var(--tmu-text-dim)}
.tmu-text-faint{color:var(--tmu-text-faint)}
.tmu-text-panel-label{color:var(--tmu-text-panel-label)}
.tmu-text-inverse{color:var(--tmu-text-inverse)}
.tmu-text-accent{color:var(--tmu-accent)}
.tmu-text-accent-soft{color:var(--tmu-text-accent-soft)}
.tmu-text-success{color:var(--tmu-success)}
.tmu-text-warning{color:var(--tmu-warning)}
.tmu-text-danger{color:var(--tmu-danger)}
.tmu-text-info{color:var(--tmu-info)}
.tmu-text-warm-strong{color:var(--tmu-text-warm-strong)}
.tmu-text-warm-muted{color:var(--tmu-text-warm-muted)}
.tmu-text-warm-accent{color:var(--tmu-text-warm-accent)}

/* -- Semantic text utilities -- */
.tmu-kicker{font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tmu-text-panel-label)}
.tmu-meta{font-size:var(--tmu-font-xs);color:var(--tmu-text-faint)}
.tmu-note{color:var(--tmu-text-muted);line-height:1.6}
.tmu-tabular{font-variant-numeric:tabular-nums}

/* -- Color variants -- */
.yellow { color: var(--tmu-warning); } .red    { color: var(--tmu-danger); } .green  { color: var(--tmu-success-strong); }
.blue   { color: var(--tmu-info); } .purple { color: var(--tmu-purple); } .lime   { color: var(--tmu-accent); }
.muted  { color: var(--tmu-text-muted); } .gold   { color: var(--tmu-metal-gold); } .silver { color: var(--tmu-metal-silver); } .orange { color: var(--tmu-warning-soft); }
/* -- Typography -- */
.text-xs  { font-size: var(--tmu-font-xs); } .text-sm  { font-size: var(--tmu-font-sm); } .text-md  { font-size: var(--tmu-font-md); }
.text-lg  { font-size: var(--tmu-font-lg); } .text-xl  { font-size: var(--tmu-font-lg); } .text-2xl { font-size: var(--tmu-font-xl); }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* -- Border-radius -- */
.rounded-sm { border-radius: var(--tmu-space-xs); } .rounded-md { border-radius: var(--tmu-space-sm); }
.rounded-lg { border-radius: var(--tmu-space-sm); } .rounded-xl { border-radius: var(--tmu-space-md); } .rounded-full { border-radius: 9999px; }
/* -- Spacing tokens -- */
.pt-0{padding-top:0}      .pt-1{padding-top:var(--tmu-space-xs)}    .pt-2{padding-top:var(--tmu-space-sm)}    .pt-3{padding-top:var(--tmu-space-md)}   .pt-4{padding-top:var(--tmu-space-lg)}   .pt-5{padding-top:var(--tmu-space-xl)}   .pt-6{padding-top:var(--tmu-space-xxl)}
.pb-0{padding-bottom:0}   .pb-1{padding-bottom:var(--tmu-space-xs)} .pb-2{padding-bottom:var(--tmu-space-sm)} .pb-3{padding-bottom:var(--tmu-space-md)}.pb-4{padding-bottom:var(--tmu-space-lg)}.pb-5{padding-bottom:var(--tmu-space-xl)}.pb-6{padding-bottom:var(--tmu-space-xxl)}
.pl-0{padding-left:0}     .pl-1{padding-left:var(--tmu-space-xs)}   .pl-2{padding-left:var(--tmu-space-sm)}   .pl-3{padding-left:var(--tmu-space-md)}  .pl-4{padding-left:var(--tmu-space-lg)}  .pl-5{padding-left:var(--tmu-space-xl)}  .pl-6{padding-left:var(--tmu-space-xxl)}
.pr-0{padding-right:0}    .pr-1{padding-right:var(--tmu-space-xs)}  .pr-2{padding-right:var(--tmu-space-sm)}  .pr-3{padding-right:var(--tmu-space-md)} .pr-4{padding-right:var(--tmu-space-lg)} .pr-5{padding-right:var(--tmu-space-xl)} .pr-6{padding-right:var(--tmu-space-xxl)}
.px-0{padding-left:0;padding-right:0}       .px-1{padding-left:var(--tmu-space-xs);padding-right:var(--tmu-space-xs)}     .px-2{padding-left:var(--tmu-space-sm);padding-right:var(--tmu-space-sm)}     .px-3{padding-left:var(--tmu-space-md);padding-right:var(--tmu-space-md)}
.px-4{padding-left:var(--tmu-space-lg);padding-right:var(--tmu-space-lg)} .px-5{padding-left:var(--tmu-space-xl);padding-right:var(--tmu-space-xl)}   .px-6{padding-left:var(--tmu-space-xxl);padding-right:var(--tmu-space-xxl)}
.py-0{padding-top:0;padding-bottom:0}       .py-1{padding-top:var(--tmu-space-xs);padding-bottom:var(--tmu-space-xs)}     .py-2{padding-top:var(--tmu-space-sm);padding-bottom:var(--tmu-space-sm)}     .py-3{padding-top:var(--tmu-space-md);padding-bottom:var(--tmu-space-md)}
.py-4{padding-top:var(--tmu-space-lg);padding-bottom:var(--tmu-space-lg)} .py-5{padding-top:var(--tmu-space-xl);padding-bottom:var(--tmu-space-xl)}   .py-6{padding-top:var(--tmu-space-xxl);padding-bottom:var(--tmu-space-xxl)}
.pa-0{padding:0} .pa-1{padding:var(--tmu-space-xs)} .pa-2{padding:var(--tmu-space-sm)} .pa-3{padding:var(--tmu-space-md)} .pa-4{padding:var(--tmu-space-lg)} .pa-5{padding:var(--tmu-space-xl)} .pa-6{padding:var(--tmu-space-xxl)}
.mt-0{margin-top:0}      .mt-1{margin-top:var(--tmu-space-xs)}    .mt-2{margin-top:var(--tmu-space-sm)}    .mt-3{margin-top:var(--tmu-space-md)}   .mt-4{margin-top:var(--tmu-space-lg)}   .mt-5{margin-top:var(--tmu-space-xl)}   .mt-6{margin-top:var(--tmu-space-xxl)}
.mb-0{margin-bottom:0}   .mb-1{margin-bottom:var(--tmu-space-xs)} .mb-2{margin-bottom:var(--tmu-space-sm)} .mb-3{margin-bottom:var(--tmu-space-md)}.mb-4{margin-bottom:var(--tmu-space-lg)}.mb-5{margin-bottom:var(--tmu-space-xl)}.mb-6{margin-bottom:var(--tmu-space-xxl)}
.ml-0{margin-left:0}     .ml-1{margin-left:var(--tmu-space-xs)}   .ml-2{margin-left:var(--tmu-space-sm)}   .ml-3{margin-left:var(--tmu-space-md)}  .ml-4{margin-left:var(--tmu-space-lg)}  .ml-5{margin-left:var(--tmu-space-xl)}  .ml-6{margin-left:var(--tmu-space-xxl)}
.mr-0{margin-right:0}    .mr-1{margin-right:var(--tmu-space-xs)}  .mr-2{margin-right:var(--tmu-space-sm)}  .mr-3{margin-right:var(--tmu-space-md)} .mr-4{margin-right:var(--tmu-space-lg)} .mr-5{margin-right:var(--tmu-space-xl)} .mr-6{margin-right:var(--tmu-space-xxl)}
.mx-0{margin-left:0;margin-right:0}       .mx-1{margin-left:var(--tmu-space-xs);margin-right:var(--tmu-space-xs)}     .mx-2{margin-left:var(--tmu-space-sm);margin-right:var(--tmu-space-sm)}     .mx-3{margin-left:var(--tmu-space-md);margin-right:var(--tmu-space-md)}
.mx-4{margin-left:var(--tmu-space-lg);margin-right:var(--tmu-space-lg)} .mx-5{margin-left:var(--tmu-space-xl);margin-right:var(--tmu-space-xl)}   .mx-6{margin-left:var(--tmu-space-xxl);margin-right:var(--tmu-space-xxl)}
.my-0{margin-top:0;margin-bottom:0}       .my-1{margin-top:var(--tmu-space-xs);margin-bottom:var(--tmu-space-xs)}     .my-2{margin-top:var(--tmu-space-sm);margin-bottom:var(--tmu-space-sm)}     .my-3{margin-top:var(--tmu-space-md);margin-bottom:var(--tmu-space-md)}
.my-4{margin-top:var(--tmu-space-lg);margin-bottom:var(--tmu-space-lg)} .my-5{margin-top:var(--tmu-space-xl);margin-bottom:var(--tmu-space-xl)}   .my-6{margin-top:var(--tmu-space-xxl);margin-bottom:var(--tmu-space-xxl)}
.ma-0{margin:0} .ma-1{margin:var(--tmu-space-xs)} .ma-2{margin:var(--tmu-space-sm)} .ma-3{margin:var(--tmu-space-md)} .ma-4{margin:var(--tmu-space-lg)} .ma-5{margin:var(--tmu-space-xl)} .ma-6{margin:var(--tmu-space-xxl)}
`;
  function injectTmUiCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID7)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID7}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID7;
    style.textContent = TMU_UI_CSS;
    target.appendChild(style);
  }
  injectTmUiCss();
  var TmUI = {
    ...TmButton,
    ...TmCheckbox,
    ...TmAutocomplete,
    ...TmBadge,
    ...TmInput,
    ...TmChip,
    ...TmCompareStat,
    ...TmMetric,
    ...TmNotice,
    ...TmStat,
    ...TmTooltipStats,
    ...TmRender,
    ...TmSkill,
    ...TmTooltip,
    ...TmTable,
    ...TmModal,
    ...TmProgress,
    ...TmTabs,
    ...TmState,
    ...TmAlert
  };

  // src/lib/tm-playerdb.js
  var PlayerDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerData";
    const STORE_NAME = "players";
    const DB_VERSION = 1;
    let db = null;
    let initPromise = null;
    const cache = {};
    const cacheKey = (pid) => String(pid);
    const open = () => new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME))
          d.createObjectStore(STORE_NAME);
      };
      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
    const get = (pid) => cache[cacheKey(pid)] || null;
    const set = (pid, value) => {
      var _a, _b;
      const key = cacheKey(pid);
      const prev = cache[key] || null;
      if ((prev == null ? void 0 : prev.graphSync) && !(value == null ? void 0 : value.graphSync)) {
        console.warn("[DB] graphSync downgrade detected", {
          pid,
          prevGraphSync: prev.graphSync,
          nextGraphSync: value == null ? void 0 : value.graphSync,
          prevGraphWeekCount: (_a = prev == null ? void 0 : prev.graphWeekCount) != null ? _a : null,
          nextGraphWeekCount: (_b = value == null ? void 0 : value.graphWeekCount) != null ? _b : null,
          prevRecordCount: Object.keys((prev == null ? void 0 : prev.records) || {}).length,
          nextRecordCount: Object.keys((value == null ? void 0 : value.records) || {}).length,
          stack: new Error().stack
        });
      }
      cache[key] = value;
      if (!db) return Promise.resolve();
      const idbKey = parseInt(pid);
      console.log("[DB] Writing player", pid, "to IndexedDB (graphSync:", value == null ? void 0 : value.graphSync, "weekCount:", value == null ? void 0 : value.graphWeekCount, "recordCount:", Object.keys((value == null ? void 0 : value.records) || {}).length, ")");
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, isFinite(idbKey) ? idbKey : pid);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[DB] write failed:", e));
    };
    const remove = (pid) => {
      delete cache[cacheKey(pid)];
      if (!db) return Promise.resolve();
      const idbKey = parseInt(pid);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        if (isFinite(idbKey)) store.delete(idbKey);
        store.delete(String(pid));
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[DB] delete failed:", e));
    };
    const allPids = () => Object.keys(cache);
    const init = async () => {
      if (db) return db;
      if (initPromise) return initPromise;
      initPromise = (async () => {
        await open();
        const toMigrate = [];
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || !k.endsWith("_data")) continue;
          const pid = k.replace("_data", "");
          if (!/^\d+$/.test(pid)) continue;
          try {
            const data = JSON.parse(localStorage.getItem(k));
            if (data) toMigrate.push({ pid, data });
            keysToRemove.push(k);
          } catch (e) {
            keysToRemove.push(k);
          }
        }
        if (toMigrate.length > 0) {
          const tx2 = db.transaction(STORE_NAME, "readwrite");
          const store2 = tx2.objectStore(STORE_NAME);
          for (const item of toMigrate) store2.put(item.data, parseInt(item.pid));
          await new Promise((res, rej) => {
            tx2.oncomplete = res;
            tx2.onerror = rej;
          });
          for (const k of keysToRemove) localStorage.removeItem(k);
          console.log(
            `%c[DB] Migrated ${toMigrate.length} player(s) from localStorage \u2192 IndexedDB`,
            "font-weight:bold;color:var(--tmu-success)"
          );
        }
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const reqAll = store.getAll();
        const reqKeys = store.getAllKeys();
        await new Promise((res, rej) => {
          tx.oncomplete = res;
          tx.onerror = rej;
        });
        for (let i = 0; i < reqKeys.result.length; i++)
          cache[cacheKey(reqKeys.result[i])] = reqAll.result[i];
        console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);
        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist().then((granted) => {
            console.log(`[DB] Persistent storage: ${granted ? "\u2713 granted" : "\u2717 denied"}`);
          });
        }
        return db;
      })();
      try {
        return await initPromise;
      } catch (error) {
        initPromise = null;
        throw error;
      }
    };
    return { init, get, set, remove, allPids };
  })();
  var PlayerArchiveDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerArchive";
    const STORE_NAME = "players";
    const DB_VERSION = 1;
    let db = null;
    let initPromise = null;
    const open = () => new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME))
          d.createObjectStore(STORE_NAME);
      };
      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
    const init = () => {
      if (db) return Promise.resolve(db);
      if (initPromise) return initPromise;
      initPromise = open().catch((e) => {
        initPromise = null;
        console.warn("[ArchiveDB] open failed:", e);
        return null;
      });
      return initPromise;
    };
    const set = (pid, value) => {
      if (!db) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, pid);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[ArchiveDB] write failed:", e));
    };
    return { init, set };
  })();
  var TmPlayerDB = PlayerDB;
  var TmPlayerArchiveDB = PlayerArchiveDB;

  // src/services/engine.js
  var _errors = [];
  var _logError = (context, err) => {
    const entry = { context, err, time: Date.now() };
    _errors.push(entry);
    if (typeof (TmApiEngine == null ? void 0 : TmApiEngine.onError) === "function") TmApiEngine.onError(entry);
    console.warn(`[TmApi] ${context}`, err);
  };
  var _post = (url, data) => new Promise((resolve) => {
    const $ = window.jQuery;
    if (!$) {
      resolve(null);
      return;
    }
    const isFeedDebugRequest = /top_user_info\.ajax\.php|feed_get\.ajax\.php/i.test(String(url || ""));
    $.post(url, data).done((res) => {
      if (isFeedDebugRequest) {
      }
      try {
        resolve(typeof res === "object" ? res : JSON.parse(res));
      } catch (e) {
        if (isFeedDebugRequest) {
          console.error("[tmvu api post:parse-error]", url, data, res, e);
        }
        _logError(`JSON parse: ${url}`, e);
        resolve(null);
      }
    }).fail((xhr, s, e) => {
      if (isFeedDebugRequest) {
        console.error("[tmvu api post:fail]", url, data, {
          status: xhr == null ? void 0 : xhr.status,
          statusText: xhr == null ? void 0 : xhr.statusText,
          responseText: xhr == null ? void 0 : xhr.responseText,
          error: e || s
        });
      }
      _logError(`POST ${url}`, e || s);
      resolve(null);
    });
  });
  var _getHtml = (url) => new Promise((resolve) => {
    const $ = window.jQuery;
    if (!$) {
      resolve(null);
      return;
    }
    $.ajax({ url, type: "GET", dataType: "html" }).done((res) => resolve(res || null)).fail(() => resolve(null));
  });
  var _inflight = /* @__PURE__ */ new Map();
  var _dedup = (key, promiseFn) => {
    if (_inflight.has(key)) return _inflight.get(key);
    const p = promiseFn().finally(() => _inflight.delete(key));
    _inflight.set(key, p);
    return p;
  };
  var TmApiEngine = {
    errors: _errors,
    onError: null
  };

  // src/lib/tm-lib.js
  var {
    WEIGHT_R5: WEIGHT_R52,
    WEIGHT_RB: WEIGHT_RB2,
    WAGE_RATE: WAGE_RATE2,
    _TRAINING1: _TRAINING12,
    _SEASON_DAYS: _SEASON_DAYS2,
    POS_MULTIPLIERS: POS_MULTIPLIERS2,
    ASI_WEIGHT_OUTFIELD: ASI_WEIGHT_OUTFIELD2,
    ASI_WEIGHT_GK: ASI_WEIGHT_GK2,
    TRAINING_GROUPS_OUT: TRAINING_GROUPS_OUT2,
    TRAINING_GROUPS_GK: TRAINING_GROUPS_GK2,
    ROUTINE_DECAY: ROUTINE_DECAY2
  } = TmConst;
  var { ageToMonths: ageToMonths2, monthsToAge: monthsToAge2 } = TmUtils;
  var _fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  var _sv = (s) => {
    var _a;
    return typeof s === "object" && s !== null ? Number((_a = s.value) != null ? _a : 0) : Number(s);
  };
  var _calcRemainderRaw = (posIdx, skills, asi) => {
    const weight = posIdx === 9 ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const skillSum = skills.reduce((s, v) => s + parseFloat(v), 0);
    const remainder = Math.round((Math.pow(2, Math.log(weight * asi) / Math.log(128)) - skillSum) * 10) / 10;
    let rec = 0, ratingR = 0, rW1 = 0, rW2 = 0, not20 = 0;
    for (let i = 0; i < WEIGHT_RB2[posIdx].length; i++) {
      rec += skills[i] * WEIGHT_RB2[posIdx][i];
      ratingR += skills[i] * WEIGHT_R52[posIdx][i];
      if (skills[i] !== 20) {
        rW1 += WEIGHT_RB2[posIdx][i];
        rW2 += WEIGHT_R52[posIdx][i];
        not20++;
      }
    }
    if (remainder / not20 > 0.9 || !not20) {
      not20 = posIdx === 9 ? 11 : 14;
      rW1 = 1;
      rW2 = 5;
    }
    return { remainder, remainderW2: rW2, not20, ratingR, rec: parseFloat(_fix2((rec + remainder * rW1 / not20 - 2) / 3)) };
  };
  var calcR5 = (posIdx, skills, asi, rou) => {
    const r = _calcRemainderRaw(posIdx, skills, asi);
    const { pow, E } = Math;
    const routineBonus = 3 / 100 * (100 - 100 * pow(E, -(rou || 0) * 0.035));
    let rating = parseFloat(_fix2(r.ratingR + r.remainder * r.remainderW2 / r.not20 + routineBonus * 5));
    const goldstar = skills.filter((s) => s === 20).length;
    const denom = skills.length - goldstar || 1;
    const skillsB = skills.map((s) => s === 20 ? 20 : s + r.remainder / denom);
    const sr = skillsB.map((s, i) => i === 1 ? s : s + routineBonus);
    if (skills.length !== 11) {
      const hb = sr[10] > 12 ? parseFloat(_fix2((pow(E, (sr[10] - 10) ** 3 / 1584.77) - 1) * 0.8 + pow(E, sr[0] ** 2 * 7e-3 / 8.73021) * 0.15 + pow(E, sr[6] ** 2 * 7e-3 / 8.73021) * 0.05)) : 0;
      const fk = parseFloat(_fix2(pow(E, (sr[13] + sr[12] + sr[9] * 0.5) ** 2 * 2e-3) / 327.92526));
      const ck = parseFloat(_fix2(pow(E, (sr[13] + sr[8] + sr[9] * 0.5) ** 2 * 2e-3) / 983.6577));
      const pk = parseFloat(_fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 2e-3) / 1967.31409));
      const ds = sr[0] ** 2 + sr[1] ** 2 * 0.5 + sr[2] ** 2 * 0.5 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
      const os = sr[0] ** 2 * 0.5 + sr[1] ** 2 * 0.5 + sr[2] ** 2 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
      const m = POS_MULTIPLIERS2[posIdx];
      return parseFloat(_fix2(rating + hb + fk + ck + pk + parseFloat(_fix2(ds / 6 / 22.9 ** 2)) * m + parseFloat(_fix2(os / 6 / 22.9 ** 2)) * m));
    }
    return parseFloat(_fix2(rating));
  };
  var calcRec = (posIdx, skills, asi) => _calcRemainderRaw(posIdx, skills, asi).rec;
  var calculatePlayerR5 = (position, player) => {
    return calcR5(position.id, player.skills.map(_sv), player.asi, player.routine || 0).toFixed(2);
  };
  var calculatePlayerREC = (position, player) => calcRec(position.id, player.skills.map(_sv), player.asi).toFixed(2);
  var _getCurrentSession = () => {
    const now = /* @__PURE__ */ new Date();
    let day = (now.getTime() - _TRAINING12.getTime()) / 1e3 / 3600 / 24;
    while (day > _SEASON_DAYS2 - 16 / 24) day -= _SEASON_DAYS2;
    const s = Math.floor(day / 7) + 1;
    return s <= 0 ? 12 : s;
  };
  var calculateTIPerSession = (player) => {
    const totalTI = calculateTI(player);
    const session = _getCurrentSession();
    return totalTI !== null && session > 0 ? Number((totalTI / session).toFixed(1)) : null;
  };
  var calculateTI = (player) => {
    const { asi, wage, isGK } = player;
    if (!asi || !wage || wage <= TmConst.MIN_WAGE_FOR_TI) return null;
    const w = isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const { pow, log, round } = Math;
    const log27 = log(pow(2, 7));
    return round((pow(2, log(w * asi) / log27) - pow(2, log(w * wage / WAGE_RATE2) / log27)) * 10);
  };
  var calcASIProjection = ({ player, trainings, avgTI }) => {
    const { asi, isGK = false, ageMonths = 0 } = player;
    const K = ASI_WEIGHT_OUTFIELD2;
    const base = Math.pow(asi * K, 1 / 7);
    const added = avgTI * trainings / 10;
    let newASI;
    let curSkillSum, futSkillSum;
    if (isGK) {
      const ss11 = base / 14 * 11;
      const fs11 = ss11 + added;
      newASI = Math.round(Math.pow(fs11 / 11 * 14, 7) / K);
      curSkillSum = ss11;
      futSkillSum = fs11;
    } else {
      newASI = Math.round(Math.pow(base + added, 7) / K);
      curSkillSum = base;
      futSkillSum = base + added;
    }
    const _agentVal = (si, totMonths) => {
      const a = totMonths / 12;
      if (a < 18) return 0;
      let p = Math.round(si * 500 * Math.pow(25 / a, 2.5));
      if (isGK) p = Math.round(p * 0.75);
      return p;
    };
    const curAgentVal = _agentVal(asi, ageMonths);
    const futAgentVal = _agentVal(newASI, ageMonths + trainings);
    return {
      newASI,
      asiDiff: newASI - asi,
      curSkillSum,
      futSkillSum,
      curAgentVal,
      futAgentVal,
      agentDiff: futAgentVal - curAgentVal
    };
  };
  var calcSkillDecimalsSimple = (player) => {
    const K = player.isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    if (!Array.isArray(player.skills)) {
      console.error("[calcSkillDecimalsSimple] player.skills missing or not array", player);
      return [];
    }
    const nums = player.skills.map((v) => typeof v === "object" && v !== null ? parseFloat(v.value) || 0 : parseFloat(v) || 0);
    const allSum = nums.reduce((s, v) => s + v, 0);
    const remainder = Math.round((Math.pow(2, Math.log(K * player.asi) / Math.log(128)) - allSum) * 10) / 10;
    const nonStar = nums.filter((v) => v < 20).length;
    if (remainder <= 0) return nums;
    if (nonStar === 0) return nums.map((v) => v + remainder / nums.length);
    return nums.map((v) => v === 20 ? 20 : v + remainder / nonStar);
  };
  var fillMissingMonths = (records) => {
    const keys = Object.keys(records).sort((a, b) => ageToMonths2(a) - ageToMonths2(b));
    const intSkills = (r) => r.skills.map((v) => Math.floor(typeof v === "string" ? parseFloat(v) : v));
    for (let idx = 0; idx < keys.length - 1; idx++) {
      const aM = ageToMonths2(keys[idx]);
      const bM = ageToMonths2(keys[idx + 1]);
      const gap = bM - aM;
      if (gap <= 1) continue;
      const rA = records[keys[idx]], rB = records[keys[idx + 1]];
      const siA = parseInt(rA.SI) || 0, siB = parseInt(rB.SI) || 0;
      const skA = intSkills(rA), skB = intSkills(rB);
      for (let step = 1; step < gap; step++) {
        const t = step / gap;
        const interpKey = monthsToAge2(aM + step);
        if (records[interpKey]) continue;
        records[interpKey] = {
          SI: Math.round(siA + (siB - siA) * t),
          REREC: null,
          R5: null,
          skills: skA.map((sa, i) => sa + Math.floor((skB[i] - sa) * t)),
          _estimated: true
        };
      }
    }
  };
  var calcSkillDecimals = (intSkills, asi, isGK, gw) => {
    const N = intSkills.length;
    const GRP = isGK ? TRAINING_GROUPS_GK2 : TRAINING_GROUPS_OUT2;
    const GRP_COUNT = GRP.length;
    if (!gw) gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);
    const KASIW = isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const totalPts = Math.pow(2, Math.log(KASIW * asi) / Math.log(128));
    const remainder = totalPts - intSkills.reduce((a, b) => a + b, 0);
    const eff = TmUtils.skillEff;
    const base = new Array(N).fill(0);
    let overflow = 0;
    for (let gi = 0; gi < GRP_COUNT; gi++) {
      const grp = GRP[gi], perSk = gw[gi] / grp.length;
      for (const si of grp) {
        if (si >= N) continue;
        if (intSkills[si] >= 20) overflow += perSk;
        else base[si] = perSk;
      }
    }
    const nonMax = intSkills.filter((v) => v < 20).length;
    const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
    const wE = base.map((b, i) => intSkills[i] >= 20 ? 0 : (b + ovfEach) * eff(intSkills[i]));
    const tot = wE.reduce((a, b) => a + b, 0);
    const shares = tot > 0 ? wE.map((x) => x / tot) : new Array(N).fill(nonMax > 0 ? 1 / nonMax : 0);
    let dec = shares.map((s) => Math.max(0, remainder * s));
    const CAP = 0.99;
    let passes = 0;
    do {
      let ovfl = 0, freeCount = 0;
      for (let i = 0; i < N; i++) {
        if (intSkills[i] >= 20) {
          dec[i] = 0;
          continue;
        }
        if (dec[i] > CAP) {
          ovfl += dec[i] - CAP;
          dec[i] = CAP;
        } else if (dec[i] < CAP) freeCount++;
      }
      if (ovfl > 1e-4 && freeCount > 0) {
        const add = ovfl / freeCount;
        for (let i = 0; i < N; i++) if (intSkills[i] < 20 && dec[i] < CAP) dec[i] += add;
      } else break;
    } while (++passes < 20);
    return intSkills.map((v, i) => v >= 20 ? 20 : v + dec[i]);
  };
  var computeGrowthDecimals = (records, ageKeys, player, gw) => {
    const N = player.isGK ? 11 : 14;
    const GRP = player.isGK ? TRAINING_GROUPS_GK2 : TRAINING_GROUPS_OUT2;
    const GRP_COUNT = GRP.length;
    const ASI_WEIGHT = player.isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const totalPts = (si) => Math.pow(2, Math.log(ASI_WEIGHT * (si || 0)) / Math.log(128));
    const eff = TmUtils.skillEff;
    const calcShares = (intS) => {
      const base = new Array(N).fill(0);
      let overflow = 0;
      for (let gi = 0; gi < GRP_COUNT; gi++) {
        const grp = GRP[gi];
        const perSk = gw[gi] / grp.length;
        for (const si of grp) {
          if (intS[si] >= 20) overflow += perSk;
          else base[si] = perSk;
        }
      }
      const nonMax = intS.filter((v) => v < 20).length;
      const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
      const w = base.map((b, i) => intS[i] >= 20 ? 0 : b + ovfEach);
      const wE = w.map((wi, i) => wi * eff(intS[i]));
      const tot = wE.reduce((a, b) => a + b, 0);
      return tot > 0 ? wE.map((x) => x / tot) : new Array(N).fill(0);
    };
    const capDecimals = (decArr, intArr) => {
      const CAP = 0.99;
      const d = [...decArr];
      let overflow = 0, passes = 0;
      do {
        overflow = 0;
        let freeCount = 0;
        for (let i = 0; i < N; i++) {
          if (intArr[i] >= 20) {
            d[i] = 0;
            continue;
          }
          if (d[i] > CAP) {
            overflow += d[i] - CAP;
            d[i] = CAP;
          } else if (d[i] < CAP) freeCount++;
        }
        if (overflow > 1e-4 && freeCount > 0) {
          const add = overflow / freeCount;
          for (let i = 0; i < N; i++) {
            if (intArr[i] < 20 && d[i] < CAP) d[i] += add;
          }
        }
      } while (overflow > 1e-4 && ++passes < 20);
      return d;
    };
    const safeSkills = (skills) => skills.map((v) => {
      const n = typeof v === "object" ? v.value : v;
      return isFinite(n) ? Math.floor(n) : 0;
    });
    const result = {};
    const r0 = records[ageKeys[0]];
    const rem0 = totalPts(r0.SI) - safeSkills(r0.skills).reduce((a, b) => a + b, 0);
    let dec = capDecimals(calcShares(safeSkills(r0.skills)).map((s) => Math.max(0, rem0 * s)), safeSkills(r0.skills));
    result[ageKeys[0]] = dec;
    for (let m = 1; m < ageKeys.length; m++) {
      const prevKey = ageKeys[m - 1], currKey = ageKeys[m];
      const piSkills = safeSkills(records[prevKey].skills), ciSkills = safeSkills(records[currKey].skills);
      const ptg = totalPts(records[prevKey].SI), ctg = totalPts(records[currKey].SI);
      const delta = ctg - ptg;
      const cRem = ctg - ciSkills.reduce((a, b) => a + b, 0);
      const gains = calcShares(piSkills).map((s) => delta * s);
      let newDec = dec.map((d, i) => d + gains[i]);
      for (let i = 0; i < N; i++) {
        const chg = ciSkills[i] - piSkills[i];
        if (chg > 0) {
          newDec[i] -= chg;
          if (newDec[i] < 0) newDec[i] = 0;
        }
        if (ciSkills[i] >= 20) newDec[i] = 0;
      }
      const ndSum = newDec.reduce((a, b) => a + b, 0);
      if (ndSum > 1e-3) {
        const scale = cRem / ndSum;
        dec = capDecimals(newDec.map((d, i) => ciSkills[i] >= 20 ? 0 : d * scale), ciSkills);
      } else {
        dec = capDecimals(calcShares(ciSkills).map((s) => Math.max(0, cRem * s)), ciSkills);
      }
      result[currKey] = dec;
    }
    return result;
  };
  var buildRoutineMap = (liveRou, liveAgeY, liveAgeM, gpData, ageKeys) => {
    const map = {};
    if (!gpData) {
      ageKeys.forEach((k) => {
        map[k] = liveRou;
      });
      return map;
    }
    const { gpBySeason, curSeason } = gpData;
    const curWeek = _getCurrentSession();
    const curAgeMonths = liveAgeY * 12 + liveAgeM;
    for (const ageKey of ageKeys) {
      const recMon = ageToMonths2(ageKey);
      const weeksBack = curAgeMonths - recMon;
      if (weeksBack <= 0) {
        map[ageKey] = liveRou;
        continue;
      }
      let gamesAfter = 0;
      for (let w = 0; w < weeksBack; w++) {
        const absWeek = (curSeason - 65) * 12 + (curWeek - 1) - w;
        const season = 65 + Math.floor(absWeek / 12);
        const gp = gpBySeason[season] || 0;
        gamesAfter += season === curSeason ? curWeek > 0 ? gp / curWeek : 0 : gp / 12;
      }
      map[ageKey] = Math.max(0, Math.round((liveRou - gamesAfter * ROUTINE_DECAY2) * 10) / 10);
    }
    return map;
  };
  var getPositionIndex = (pos) => {
    const p = (pos || "").split(",")[0].toLowerCase().replace(/[^a-z]/g, "");
    switch (p) {
      case "gk":
        return 9;
      case "dc":
      case "dcl":
      case "dcr":
        return 0;
      case "dl":
      case "dr":
        return 1;
      case "dmc":
      case "dmcl":
      case "dmcr":
        return 2;
      case "dml":
      case "dmr":
        return 3;
      case "mc":
      case "mcl":
      case "mcr":
        return 4;
      case "ml":
      case "mr":
        return 5;
      case "omc":
      case "omcl":
      case "omcr":
        return 6;
      case "oml":
      case "omr":
        return 7;
      default:
        return 8;
    }
  };
  var TmLib = {
    getPositionIndex,
    calcR5,
    calcRec,
    calcSkillDecimalsSimple,
    calcSkillDecimals,
    fillMissingMonths,
    computeGrowthDecimals,
    buildRoutineMap,
    calculatePlayerR5,
    calculatePlayerREC,
    calcASIProjection,
    getCurrentSession: _getCurrentSession,
    calculateTI,
    calculateTIPerSession
  };

  // src/lib/tm-dbsync.js
  var { GRAPH_KEYS_OUT: GRAPH_KEYS_OUT2, GRAPH_KEYS_GK: GRAPH_KEYS_GK2, ASI_WEIGHT_GK: ASI_WEIGHT_GK3, ASI_WEIGHT_OUTFIELD: ASI_WEIGHT_OUTFIELD3 } = TmConst;
  var { ageToMonths: ageToMonths3 } = TmUtils;
  var { calcSkillDecimalsSimple: calcSkillDecimalsSimple2, fillMissingMonths: fillMissingMonths2, computeGrowthDecimals: computeGrowthDecimals2, getCurrentSession, calculatePlayerR5: calculatePlayerR52, calculatePlayerREC: calculatePlayerREC2 } = TmLib;
  var buildGroupWeights = (player, trainingInfo) => {
    var _a, _b;
    const count = player.isGK ? 1 : 6;
    const gw = new Array(count).fill(1 / count);
    if (player.isGK || !(trainingInfo == null ? void 0 : trainingInfo.custom)) return gw;
    const c = trainingInfo.custom;
    const cd = c.custom;
    if (c.custom_on && cd) {
      let dtot = 0;
      const dots = [];
      for (let i = 0; i < 6; i++) {
        const d = parseInt((_a = cd["team" + (i + 1)]) == null ? void 0 : _a.points) || 0;
        dots.push(d);
        dtot += d;
      }
      const sm = TmConst.SMOOTH_WEIGHT, den = dtot + 6 * sm;
      return dots.map((d) => (d + sm) / den);
    } else {
      const STD_FOCUS2 = TmConst.STD_FOCUS;
      const fg = (_b = STD_FOCUS2[String(c.team || "3")]) != null ? _b : 1;
      const gw2 = new Array(6).fill(0.125);
      gw2[fg] = 0.375;
      return gw2;
    }
  };
  var buildRoutineMap2 = (ageKeys, tooltipPlayer, historyInfo) => {
    var _a;
    const curRoutine = tooltipPlayer == null ? void 0 : tooltipPlayer.routine;
    if (curRoutine == null || !((_a = historyInfo == null ? void 0 : historyInfo.table) == null ? void 0 : _a.total)) return {};
    const totalRows = historyInfo.table.total.map((r) => ({ ...r, season: parseInt(r.season) })).filter((r) => isFinite(r.season));
    if (!totalRows.length) return {};
    const gpBySeason = {};
    totalRows.forEach((r) => {
      gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0);
    });
    const curSeason = Math.max(...totalRows.map((r) => r.season));
    return TmLib.buildRoutineMap(
      curRoutine,
      parseInt(tooltipPlayer == null ? void 0 : tooltipPlayer.age) || 0,
      parseInt(tooltipPlayer == null ? void 0 : tooltipPlayer.months) || 0,
      { gpBySeason, curSeason },
      ageKeys
    );
  };
  var ageMonthsToKey = (ageMonths) => `${Math.floor(ageMonths / 12)}.${ageMonths % 12}`;
  var getGraphStartAgeMonths = (currentAgeMonths, weekCount) => {
    const ageMonths = Number(currentAgeMonths);
    const count = Number(weekCount);
    if (!Number.isFinite(ageMonths) || !Number.isFinite(count) || count < 1) return null;
    return ageMonths - (count - 1);
  };
  function syncPlayerStore(player, DBPlayer) {
    var _a, _b, _c;
    const api = TmPlayerService;
    const isOwnPlayer = player.isOwnPlayer;
    if (!isOwnPlayer) {
      console.log("[syncPlayerStore] opponent player \u2014 savePlayerVisit only", {
        pid: player.id,
        ageKey: player.ageMonthsString
      });
      return savePlayerVisit(player, DBPlayer);
    }
    const ageKey = player.ageMonthsString;
    const curRec = (_a = DBPlayer == null ? void 0 : DBPlayer.records) == null ? void 0 : _a[ageKey];
    const allComputed = (DBPlayer == null ? void 0 : DBPlayer.records) && Object.values(DBPlayer.records).every((r) => r.R5 != null && r.REREC != null);
    if ((DBPlayer == null ? void 0 : DBPlayer.records) && !(DBPlayer == null ? void 0 : DBPlayer.graphSync) && allComputed) {
      DBPlayer.graphSync = true;
      DBPlayer.lastSeen = Date.now();
      TmPlayerDB.set(player.id, DBPlayer);
      console.log("[syncPlayerStore] promoted fully-computed store to graphSync", {
        pid: player.id,
        ageKey,
        recordCount: Object.keys(DBPlayer.records).length
      });
    }
    const graphStartAgeMonths = Number(DBPlayer == null ? void 0 : DBPlayer.graphStartAgeMonths);
    const hasGraphStart = Number.isFinite(graphStartAgeMonths);
    const firstGraphKey = hasGraphStart ? ageMonthsToKey(graphStartAgeMonths) : "";
    const hasFullGraphHistory = !!(DBPlayer == null ? void 0 : DBPlayer.graphSync);
    console.log("[syncPlayerStore] own player decision state", {
      pid: player.id,
      ageKey,
      currentAgeMonths: player.ageMonths,
      currentRecordExists: !!curRec,
      currentRecordComputed: !!((curRec == null ? void 0 : curRec.R5) != null && (curRec == null ? void 0 : curRec.REREC) != null),
      recordCount: Object.keys((DBPlayer == null ? void 0 : DBPlayer.records) || {}).length,
      allComputed: !!allComputed,
      graphSync: !!(DBPlayer == null ? void 0 : DBPlayer.graphSync),
      graphWeekCount: (_b = DBPlayer == null ? void 0 : DBPlayer.graphWeekCount) != null ? _b : null,
      graphStartAgeMonths: hasGraphStart ? graphStartAgeMonths : null,
      firstGraphKey: firstGraphKey || null,
      firstGraphRecordExists: !!(firstGraphKey && ((_c = DBPlayer == null ? void 0 : DBPlayer.records) == null ? void 0 : _c[firstGraphKey])),
      hasFullGraphHistory,
      trustedVia: hasFullGraphHistory ? "graphSync" : null
    });
    if (hasFullGraphHistory && (curRec == null ? void 0 : curRec.R5) != null && (curRec == null ? void 0 : curRec.REREC) != null && allComputed) {
      console.log(`[syncPlayerStore] ${ageKey} already fully computed \u2014 dispatching growthUpdated`);
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return Promise.resolve(DBPlayer);
    }
    const hasOtherRecords = (DBPlayer == null ? void 0 : DBPlayer.records) && Object.keys(DBPlayer.records).length > 0;
    const pastRecordsOk = hasOtherRecords && Object.entries(DBPlayer.records).filter(([k]) => k !== ageKey).every(([, r]) => r.R5 != null && r.REREC != null);
    console.log("[syncPlayerStore] partial fast-path check", {
      pid: player.id,
      hasFullGraphHistory,
      hasOtherRecords: !!hasOtherRecords,
      pastRecordsOk: !!pastRecordsOk,
      currentRecordExists: !!curRec
    });
    if (hasFullGraphHistory && !curRec && pastRecordsOk) {
      console.log(`[syncPlayerStore] ${ageKey} missing, past records OK \u2014 savePlayerVisit`);
      return savePlayerVisit(player, DBPlayer);
    }
    console.log("[syncPlayerStore] \u2192 fetching graphs+training+history", {
      pid: player.id,
      reason: {
        hasFullGraphHistory,
        currentRecordComputed: !!((curRec == null ? void 0 : curRec.R5) != null && (curRec == null ? void 0 : curRec.REREC) != null),
        allComputed: !!allComputed,
        currentRecordExists: !!curRec,
        pastRecordsOk: !!pastRecordsOk
      }
    });
    const graphKeys = player.isGK ? GRAPH_KEYS_GK2 : GRAPH_KEYS_OUT2;
    const trainingInfoFromPlayer = (() => {
      if (player.isGK) return null;
      const raw = player.training_custom;
      const customParsed = raw ? typeof raw === "object" ? raw : (() => {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return null;
        }
      })() : null;
      if (!customParsed && !player.training) return null;
      return { custom: { team: String(player.training || "3"), custom_on: customParsed ? 1 : 0, custom: customParsed || {} } };
    })();
    const trainReq = trainingInfoFromPlayer ? Promise.resolve(trainingInfoFromPlayer) : api.fetchPlayerInfo(player.id, "training");
    const histReq = api.fetchPlayerInfo(player.id, "history");
    return Promise.all([api.fetchPlayerInfo(player.id, "graphs"), trainReq, histReq]).then(([data, t, h]) => {
      var _a2;
      if (!data) {
        console.warn("[syncPlayerStore] Graphs request failed \u2014 falling back to savePlayerVisit");
        return savePlayerVisit(player, DBPlayer);
      }
      console.log("[syncPlayerStore] graphs payload received", {
        pid: player.id,
        graphKey: graphKeys[0],
        graphWeeks: Array.isArray((_a2 = data == null ? void 0 : data.graphs) == null ? void 0 : _a2[graphKeys[0]]) ? data.graphs[graphKeys[0]].length : 0,
        playerAgeMonths: player.ageMonths
      });
      const newDBPlayer = buildStoreFromGraphs(player, data.graphs, DBPlayer, graphKeys);
      if (!newDBPlayer) {
        console.warn("[syncPlayerStore] buildStoreFromGraphs returned null \u2014 falling back to savePlayerVisit");
        return savePlayerVisit(player, DBPlayer);
      }
      console.log(`[syncPlayerStore] buildStoreFromGraphs OK \u2014 ${Object.keys(newDBPlayer.records).length} weeks, calling analyzeGrowth`);
      return analyzeGrowth(player, DBPlayer, t, h, newDBPlayer);
    });
  }
  function buildStoreFromGraphs(player, graphsRaw, DBPlayer, graphKeys) {
    try {
      const g = graphsRaw;
      if (!(g == null ? void 0 : g[graphKeys[0]]) || g[graphKeys[0]].length < 2) {
        console.warn("[buildStoreFromGraphs] missing or too-short graph data for key", graphKeys[0], "\u2192 null");
        return null;
      }
      const weekCount = g[graphKeys[0]].length;
      const graphStartAgeMonths = getGraphStartAgeMonths(player.ageMonths, weekCount);
      const SI = player.asi;
      const K = player.isGK ? ASI_WEIGHT_GK3 : ASI_WEIGHT_OUTFIELD3;
      console.log("[buildStoreFromGraphs] graph boundaries", {
        pid: player.id,
        weekCount,
        playerAgeMonths: player.ageMonths,
        graphStartAgeMonths,
        graphStartKey: Number.isFinite(graphStartAgeMonths) ? ageMonthsToKey(graphStartAgeMonths) : null,
        currentKey: ageMonthsToKey(player.ageMonths)
      });
      const asiArr = (() => {
        var _a, _b;
        if (((_a = g.skill_index) == null ? void 0 : _a.length) >= weekCount)
          return g.skill_index.slice(-weekCount).map((v) => parseInt(v) || 0);
        if (((_b = g.ti) == null ? void 0 : _b.length) >= weekCount) {
          const tiOff = g.ti.length - weekCount;
          const arr = new Array(weekCount);
          arr[weekCount - 1] = SI;
          for (let j = weekCount - 2; j >= 0; j--) {
            const ti = parseInt(g.ti[j + 1 + tiOff]) || 0;
            const base = Math.pow(arr[j + 1] * K, 1 / 7);
            arr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
          }
          return arr;
        }
        return new Array(weekCount).fill(0);
      })();
      const oldRecords = (DBPlayer == null ? void 0 : DBPlayer.records) || {};
      DBPlayer.graphSync = true;
      DBPlayer.graphWeekCount = weekCount;
      DBPlayer.graphStartAgeMonths = graphStartAgeMonths;
      DBPlayer.lastSeen = Date.now();
      DBPlayer.records = Object.fromEntries(
        Array.from({ length: weekCount }, (_, i) => {
          const ageMonths = player.ageMonths - (weekCount - 1 - i);
          const key = ageMonthsToKey(ageMonths);
          const existing = oldRecords[key];
          const existingValid = (existing == null ? void 0 : existing.locked) && Array.isArray(existing.skills) && existing.skills.every((v) => v != null && isFinite(v));
          if (existingValid) return [key, existing];
          return [key, {
            SI: parseInt(asiArr[i]) || 0,
            REREC: null,
            R5: null,
            skills: graphKeys.map((k) => {
              var _a;
              return parseInt((_a = g[k]) == null ? void 0 : _a[i]) || 0;
            }),
            routine: null
          }];
        })
      );
      console.log("[buildStoreFromGraphs] persisted graph metadata", {
        pid: player.id,
        graphSync: DBPlayer.graphSync,
        graphWeekCount: DBPlayer.graphWeekCount,
        graphStartAgeMonths: DBPlayer.graphStartAgeMonths,
        firstRecordKey: Number.isFinite(graphStartAgeMonths) ? ageMonthsToKey(graphStartAgeMonths) : null,
        recordCount: Object.keys(DBPlayer.records || {}).length
      });
      return DBPlayer;
    } catch (e) {
      console.warn("[buildStoreFromGraphs] exception:", e.message);
      return null;
    }
  }
  function savePlayerVisit(player, DBPlayer) {
    var _a;
    const year = player.age;
    const month = player.months;
    console.log(`[savePlayerVisit] Player visit: ${year}.${month} (SI: ${player.asi})`, player.ageMonthsString);
    const SI = player.asi;
    if (!SI || SI <= 0 || !year) {
      console.warn("[savePlayerVisit] early return \u2014 missing SI or age", { SI, year });
      return Promise.resolve(null);
    }
    const ageKey = `${year}.${month}`;
    try {
      if (!DBPlayer) DBPlayer = { records: {} };
      if (!DBPlayer.records) DBPlayer.records = {};
      const skillsC = calcSkillDecimalsSimple2(player);
      if ((_a = DBPlayer.records[ageKey]) == null ? void 0 : _a.locked) {
        console.log(`[TmPlayer] Record ${ageKey} is locked (squad sync) \u2014 skipping overwrite`);
        return Promise.resolve(DBPlayer);
      }
      const existingRec = DBPlayer.records[ageKey];
      console.log(`[savePlayerVisit] existing record for ${ageKey}:`, DBPlayer, existingRec);
      if ((existingRec == null ? void 0 : existingRec.R5) != null && (existingRec == null ? void 0 : existingRec.REREC) != null && Object.values(DBPlayer.records).every((r) => r.R5 != null && r.REREC != null)) {
        DBPlayer.lastSeen = Date.now();
        TmPlayerDB.set(player.id, DBPlayer);
        return Promise.resolve(DBPlayer);
      }
      DBPlayer.records[ageKey] = { SI, REREC: null, R5: null, skills: skillsC, routine: null };
      DBPlayer.lastSeen = Date.now();
      TmPlayerDB.set(player.id, DBPlayer);
      console.log(`[savePlayerVisit] saved record ${ageKey}, calling analyzeGrowth`);
      return analyzeGrowth(player, DBPlayer);
    } catch (e) {
      console.warn("[TmPlayer] savePlayerVisit failed:", e.message);
      return Promise.resolve(null);
    }
  }
  function analyzeGrowth(player, DBPlayer, trainingInfo, historyInfo, overrideRecord) {
    var _a, _b;
    if (overrideRecord) {
      DBPlayer = overrideRecord;
    }
    if (!(DBPlayer == null ? void 0 : DBPlayer.records)) {
      console.warn("[analyzeGrowth] no records, abort");
      return Promise.resolve(null);
    }
    if (Object.keys(DBPlayer.records).length < 2) {
      const positions = ((_a = player.positions) == null ? void 0 : _a.length) ? player.positions : [{ id: 0 }];
      const key = Object.keys(DBPlayer.records)[0];
      const record = DBPlayer.records[key];
      const skillsC = calcSkillDecimalsSimple2(player);
      const fakePlayer = { skills: skillsC, asi: parseInt(record.SI) || 0, routine: player.routine || 0 };
      record.REREC = Math.max(...positions.map((p) => Number(calculatePlayerREC2(p, fakePlayer))));
      record.R5 = 0;
      record.skills = skillsC;
      record.routine = (_b = player.routine) != null ? _b : null;
      console.log("[TmPlayer] Single-record growth analysis completed for player", player.id, { record });
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return Promise.resolve(DBPlayer);
    }
    fillMissingMonths2(DBPlayer.records);
    const ageKeys = Object.keys(DBPlayer.records).sort((a, b) => ageToMonths3(a) - ageToMonths3(b));
    const run = (trainingInfo2, historyInfo2) => {
      var _a2, _b2, _c, _d, _e;
      const gw = buildGroupWeights(player, trainingInfo2);
      const decsByKey = computeGrowthDecimals2(DBPlayer.records, ageKeys, player, gw);
      const routineMap = buildRoutineMap2(ageKeys, player, historyInfo2);
      const positions = ((_a2 = player.positions) == null ? void 0 : _a2.length) ? player.positions : [{ id: 0 }];
      for (let m = 0; m < ageKeys.length; m++) {
        const key = ageKeys[m];
        const rec = DBPlayer.records[key];
        const ci = rec.skills.map((v) => {
          const n = typeof v === "object" && v !== null ? parseFloat(v.value) : parseFloat(v);
          return isFinite(n) ? Math.floor(n) : 0;
        });
        const dec = decsByKey[key];
        const allMax = ci.every((v) => v >= 20);
        const skillsC = allMax ? (() => {
          const K = player.isGK ? ASI_WEIGHT_GK3 : ASI_WEIGHT_OUTFIELD3;
          const totalPts = Math.pow(2, Math.log(K * (parseInt(rec.SI) || 0)) / Math.log(128));
          const rem = totalPts - ci.reduce((a, b) => a + b, 0);
          return ci.map((v) => v + rem / ci.length);
        })() : ci.map((v, i) => v >= 20 ? 20 : v + (isFinite(dec[i]) ? dec[i] : 0));
        const fakePlayer = { skills: skillsC, asi: parseInt(rec.SI) || 0, routine: (_c = (_b2 = routineMap[key]) != null ? _b2 : rec.routine) != null ? _c : 0 };
        rec.REREC = Math.max(...positions.map((p) => Number(calculatePlayerREC2(p, fakePlayer))));
        rec.R5 = Math.max(...positions.map((p) => Number(calculatePlayerR52(p, fakePlayer))));
        rec.skills = skillsC;
        rec.routine = (_e = (_d = routineMap[key]) != null ? _d : rec.routine) != null ? _e : null;
      }
      console.log("[TmPlayer] Growth analysis completed for player", player.id, { ageKeys, records: DBPlayer.records });
      TmPlayerDB.set(player.id, DBPlayer);
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return DBPlayer;
    };
    if (trainingInfo !== void 0 && historyInfo !== void 0) {
      return Promise.resolve(run(trainingInfo, historyInfo));
    } else {
      return Promise.all([
        TmPlayerService.fetchPlayerInfo(player.id, "training"),
        TmPlayerService.fetchPlayerInfo(player.id, "history")
      ]).then(([t, h]) => run(t, h));
    }
  }
  var TmSync = {
    syncPlayerStore,
    analyzeGrowth
  };

  // src/services/player.js
  var _tooltipResolvedCache = /* @__PURE__ */ new Map();
  var _playerDbReadyPromise = null;
  var ensurePlayerDbReady = () => {
    if (!_playerDbReadyPromise) {
      _playerDbReadyPromise = TmPlayerDB.init().then(() => TmPlayerArchiveDB.init()).catch((error) => {
        console.warn("[PlayerService] DB init failed, continuing without DB-backed tooltip normalization:", error);
        return null;
      });
    }
    return _playerDbReadyPromise;
  };
  var TmPlayerService = {
    /**
     * Fetch raw player tooltip response without normalization or DB writes.
     * Use this when you need the plain API response in non-playerdb contexts.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTooltipRaw(playerId) {
      return _dedup(`tooltip:${playerId}`, () => _post("/ajax/tooltip.ajax.php", { player_id: playerId }));
    },
    /**
     * Like fetchTooltipRaw but keeps the resolved promise in a page-level cache.
     * Subsequent calls return the same promise immediately — no re-fetch, no re-dedup.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTooltipCached(playerId) {
      const pid = String(playerId);
      if (!_tooltipResolvedCache.has(pid)) {
        _tooltipResolvedCache.set(pid, this.fetchTooltipRaw(pid));
      }
      return _tooltipResolvedCache.get(pid);
    },
    fetchPlayerTooltip(player_id) {
      return ensurePlayerDbReady().then(() => _dedup(`tooltip:${player_id}`, () => _post("/ajax/tooltip.ajax.php", { player_id }))).then((data) => {
        if (!(data == null ? void 0 : data.player)) return data;
        data.retired = data.player.club_id === null || data.club === null;
        const DBPlayer = TmPlayerDB.get(player_id);
        if (data.retired) {
          if (DBPlayer) {
            TmPlayerArchiveDB.set(player_id, DBPlayer).then(() => TmPlayerDB.remove(player_id));
            console.log(`%c[Cleanup] Archived retired/deleted player ${player_id}`, "font-weight:bold;color:var(--tmu-warning)");
          }
          return data;
        }
        this.normalizePlayer(data.player, DBPlayer);
        return data;
      });
    },
    /**
     * Fetch the players_get_info endpoint.
     * show_non_pro_graphs is always included automatically.
     * @param {string|number} pid
     * @param {string} type — 'history' | 'training' | 'graphs' | 'scout' | etc.
     * @param {object} [extra={}] — optional extra params (e.g. { scout_id: '123' })
     * @returns {Promise<object|null>}
     */
    fetchPlayerInfo(pid, type, extra = {}) {
      return _post("/ajax/players_get_info.ajax.php", {
        player_id: pid,
        type,
        show_non_pro_graphs: true,
        ...extra
      });
    },
    /**
     * One-time migration: backfill meta (name, pos, isGK, country) on existing DB records
     * that were saved before the meta field existed. Safe to call on every tooltip fetch —
     * no-ops once the record already has meta.pos populated.
     * @param {object} player — normalized player object
     * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
     */
    _migratePlayerMeta(player, DBPlayer) {
      try {
        if (!DBPlayer || !DBPlayer.meta) {
          if (!DBPlayer) DBPlayer = {};
          DBPlayer.meta = {
            name: player.name || "",
            pos: player.favposition,
            isGK: player.isGK,
            country: player.country || "",
            club_id: player.club_id != null ? String(player.club_id) : void 0
          };
          TmPlayerDB.set(player.id, DBPlayer);
        } else {
          let dirty = false;
          if (!DBPlayer.meta.name && player.name) {
            DBPlayer.meta.name = player.name;
            dirty = true;
          }
          if (!DBPlayer.meta.country && player.country) {
            DBPlayer.meta.country = player.country;
            dirty = true;
          }
          if (player.favposition && player.favposition !== DBPlayer.meta.pos) {
            DBPlayer.meta.pos = player.favposition;
            DBPlayer.meta.isGK = player.isGK;
            dirty = true;
          } else if (DBPlayer.meta.isGK == null) {
            DBPlayer.meta.isGK = player.isGK;
            dirty = true;
          }
          if (player.club_id != null && String(player.club_id) !== DBPlayer.meta.club_id) {
            DBPlayer.meta.club_id = String(player.club_id);
            dirty = true;
          }
          if (dirty) TmPlayerDB.set(player.id, DBPlayer);
        }
      } catch (e) {
        _logError("_migratePlayerMeta", e);
      }
    },
    /**
     * Parses all raw string/numeric scalar fields on a player object in-place.
     * Called by normalizePlayer() before skill or position resolution.
     */
    _parseScalars(player) {
      player.asi = TmUtils.parseNum(player.asi || player.skill_index);
      player.wage = TmUtils.parseNum(player.wage);
      player.age = parseInt(player.age) || 0;
      player.id = parseInt(player.player_id || player.id);
      player.months = parseInt(player.month || player.months) || 0;
      player.ageMonths = player.age * 12 + player.months;
      player.ageMonthsString = `${player.age}.${player.months}`;
      player.trainingCustom = player.training_custom || "";
      player.training = player.training || "";
      const s = window.SESSION;
      const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
      player.isOwnPlayer = ownClubIds.includes(Number(player.club_id));
      player.routine = parseFloat(player.rutine || player.routine) || 0;
      player.isGK = String(player.favposition || "").split(",")[0].trim().toLowerCase() === "gk";
    },
    /**
     * Resolves a player's skills array from one of three sources (in priority order):
     *   1. IndexedDB record for the player's current age key
     *   2. Tooltip-API rich objects (already { key, value } shaped)
     *   3. Squad-API flat numeric fields on the player object
     * Returns an array of skill objects matching the given defs.
     */
    _resolveSkills(player, defs, DBRecord) {
      var _a;
      const ageKey = player.ageMonthsString;
      if (DBRecord && ((_a = DBRecord.records) == null ? void 0 : _a[ageKey])) {
        const skills = DBRecord.records[ageKey].skills;
        return defs.map((def) => {
          const raw = skills[def.id];
          const v = typeof raw === "object" && raw !== null ? raw.value : raw;
          return { ...def, value: parseFloat(v) || 0 };
        });
      }
      if (player.skills && Array.isArray(player.skills) && typeof player.skills[0] === "object" && "key" in player.skills[0]) {
        return defs.map((def) => {
          var _a2;
          const sk = player.skills.find((s) => s.key === def.key || def.key2 && s.key === def.key2);
          const raw = (_a2 = sk == null ? void 0 : sk.value) != null ? _a2 : 0;
          const value = typeof raw === "string" && raw.includes("star") ? raw.includes("silver") ? 19 : 20 : parseFloat(raw) || 0;
          return { ...def, value };
        });
      }
      return defs.map((def) => {
        var _a2;
        const raw = (_a2 = player[def.key]) != null ? _a2 : player[def.key.replace(/_/g, "")];
        return { ...def, value: parseFloat(raw) || 0 };
      });
    },
    _toNumericSkills(skills) {
      return (Array.isArray(skills) ? skills : []).map((skill) => {
        if (typeof skill === "object" && skill !== null) return parseFloat(skill.value) || 0;
        return parseFloat(skill) || 0;
      });
    },
    _buildAllPositionRatings(player, calcPlayer) {
      if (player.isGK) return [...player.positions || []];
      const map = /* @__PURE__ */ new Map();
      const positionData = Object.values(TmConst.POSITION_MAP).filter((position) => position.id !== 9).sort((a, b) => a.ordering - b.ordering);
      for (const position of positionData) {
        if (map.has(position.id)) {
          map.get(position.id).position += ", " + position.position;
          continue;
        }
        map.set(position.id, {
          ...position,
          r5: TmLib.calculatePlayerR5(position, calcPlayer),
          rec: TmLib.calculatePlayerREC(position, calcPlayer)
        });
      }
      return [...map.values()];
    },
    /**
     * Converts string fields (asi, wage, age, months, routine) to numbers.
     * Safe to call multiple times (idempotent once numeric).
     * @param {object} player — raw player from fetchPlayerTooltip / tooltip.ajax.php
     * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
     * @param {{skipSync?: boolean}} [options]
     * @returns {object} the same player, mutated
     */
    normalizePlayer(player, DBPlayer, { skipSync = false } = {}) {
      var _a, _b;
      const shouldSync = !skipSync;
      this._parseScalars(player);
      if (shouldSync) this._migratePlayerMeta(player, DBPlayer);
      const defs = player.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
      player.skills = this._resolveSkills(player, defs, DBPlayer);
      const applyPositions = (currentRecord = null) => {
        const calcSkills = (currentRecord == null ? void 0 : currentRecord.skills) ? this._toNumericSkills(currentRecord.skills) : this._toNumericSkills(player.skills);
        const calcPlayer = {
          ...player,
          skills: calcSkills,
          asi: parseFloat(currentRecord == null ? void 0 : currentRecord.SI) || player.asi,
          routine: parseFloat(currentRecord == null ? void 0 : currentRecord.routine) || player.routine || 0
        };
        player.positions = String(player.favposition || "").split(",").map((s) => {
          const pos = s.trim().toLowerCase();
          const positionData = TmConst.POSITION_MAP[pos];
          if (!positionData) return null;
          return {
            ...positionData,
            r5: TmLib.calculatePlayerR5(positionData, calcPlayer),
            rec: TmLib.calculatePlayerREC(positionData, calcPlayer)
          };
        }).filter(Boolean).sort((a, b) => a.ordering - b.ordering);
        player.allPositionRatings = this._buildAllPositionRatings(player, calcPlayer);
        player.r5 = Math.max(0, ...player.positions.map((p) => parseFloat(p.r5) || 0));
        player.rec = Math.max(0, ...player.positions.map((p) => parseFloat(p.rec) || 0));
        player.ti = TmLib.calculateTIPerSession(calcPlayer);
      };
      const syncPromise = shouldSync ? (_a = TmSync) == null ? void 0 : _a.syncPlayerStore(player, DBPlayer) : null;
      if (syncPromise instanceof Promise) {
        syncPromise.then((updatedDB) => {
          var _a2;
          const curRec = (_a2 = updatedDB == null ? void 0 : updatedDB.records) == null ? void 0 : _a2[player.ageMonthsString];
          if (!(curRec == null ? void 0 : curRec.skills)) return;
          player.skills = this._resolveSkills(player, defs, updatedDB);
          applyPositions(curRec);
          window.dispatchEvent(new CustomEvent("tm:player-synced", { detail: { id: player.id, player } }));
        });
      }
      applyPositions(((_b = DBPlayer == null ? void 0 : DBPlayer.records) == null ? void 0 : _b[player.ageMonthsString]) || null);
      player.name = player.player_name || player.name;
      return player;
    }
  };

  // src/services/club.js
  var TmClubService = {
    /**
     * Fetch club fixtures (all matches for a given club this season).
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    fetchClubFixtures(clubId) {
      return _post("/ajax/fixtures.ajax.php", { type: "club", var1: clubId });
    },
    /**
     * Fetch the match history HTML page for a club in a given season.
     * Returns the raw HTML string (not JSON) or null on failure.
     * @param {string|number} clubId
     * @param {string|number} seasonId
     * @returns {Promise<string|null>}
     */
    fetchClubMatchHistory(clubId, seasonId) {
      return _getHtml(`/history/club/matches/${clubId}/${seasonId}/`);
    },
    /**
     * Fetch the club transfer history HTML page for a given season.
     * @param {string|number} clubId
     * @param {string|number} seasonId
     * @returns {Promise<string|null>}
     */
    fetchClubTransferHistory(clubId, seasonId) {
      return _getHtml(`/history/club/transfers/${clubId}/${seasonId}/`);
    },
    /**
     * Fetch the club records HTML page.
     * @param {string|number} clubId
     * @returns {Promise<string|null>}
     */
    fetchClubRecords(clubId) {
      return _getHtml(`/history/club/records/${clubId}/`);
    },
    /**
     * Fetch the raw club page HTML.
     * @param {string|number} clubId
     * @returns {Promise<string|null>}
     */
    fetchClubPageHtml(clubId) {
      return _getHtml(`/club/${clubId}/`);
    },
    /**
     * Fetch the club league history HTML page for a given season.
     * @param {string|number} clubId
     * @param {string|number} seasonId
     * @returns {Promise<string|null>}
     */
    fetchClubLeagueHistory(clubId, seasonId) {
      return _getHtml(`/history/club/league/${clubId}/${seasonId}/`);
    },
    /**
     * Fetch the players_get_select post map for a club (raw, no normalization).
     * Returns a { [playerId: string]: player } map, or null on failure.
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    async fetchSquadPost(clubId) {
      return _dedup(`club:squad-post:${clubId}`, async () => {
        const data = await _post("/ajax/players_get_select.ajax.php", { type: "change", club_id: clubId });
        if (!(data == null ? void 0 : data.post)) return null;
        const map = {};
        for (const [id, p] of Object.entries(data.post)) map[String(id)] = p;
        return map;
      });
    },
    /**
     * Fetch the squad player list for a club (players_get_select endpoint).
     * All entries in data.post are normalized in place via normalizePlayer.
     * @param {string|number} clubId
     * @returns {Promise<{squad: object[], post: object, [key: string]: any}|null>}
     */
    async fetchSquadRaw(clubId, { skipSync = false } = {}) {
      return _dedup(`club:squad-raw:${clubId}:${skipSync ? "nosync" : "sync"}`, async () => {
        const data = await _post("/ajax/players_get_select.ajax.php", { type: "change", club_id: clubId });
        if (data == null ? void 0 : data.post) {
          const players = Object.values(data.post).map((player) => {
            player.club_id = clubId;
            const DBPlayer = TmPlayerDB.get(player.id || player.player_id);
            TmPlayerService.normalizePlayer(player, DBPlayer, { skipSync });
            return player;
          });
          data.post = players;
        }
        return data;
      });
    }
  };

  // src/components/tactics/tm-tactics-styles.js
  var STYLE_ID8 = "tmtc-style";
  function injectTacticsStyles() {
    if (document.getElementById(STYLE_ID8)) return;
    const pitchSvg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 420">`,
      `<rect x="0" y="0" width="280" height="420" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>`,
      // corner arcs
      `<path d="M2,18 A16,16 0 0,0 18,2" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<path d="M262,2 A16,16 0 0,0 278,18" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<path d="M2,402 A16,16 0 0,1 18,418" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<path d="M262,418 A16,16 0 0,1 278,402" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      // center line + circle
      `<line x1="2" y1="210" x2="278" y2="210" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>`,
      `<circle cx="140" cy="210" r="52" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>`,
      `<circle cx="140" cy="210" r="3" fill="rgba(255,255,255,0.35)"/>`,
      // top penalty area + goal area
      `<path d="M56,2 L56,74 L224,74 L224,2" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<line x1="95" y1="2" x2="95" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<line x1="95" y1="28" x2="185" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<line x1="185" y1="2" x2="185" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<circle cx="140" cy="68" r="2.5" fill="rgba(255,255,255,0.3)"/>`,
      // bottom penalty area + goal area
      `<path d="M56,418 L56,346 L224,346 L224,418" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<line x1="95" y1="392" x2="95" y2="418" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<line x1="95" y1="392" x2="185" y2="392" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<line x1="185" y1="392" x2="185" y2="418" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`,
      `<circle cx="140" cy="352" r="2.5" fill="rgba(255,255,255,0.3)"/>`,
      `</svg>`
    ].join("");
    const pitchBg = `url("data:image/svg+xml,${encodeURIComponent(pitchSvg)}")`;
    const s = document.createElement("style");
    s.id = STYLE_ID8;
    s.textContent = `
        /* \u2500\u2500 full-width override \u2500\u2500 */
        body:has(.tmtc-page) .tmvu-main {
            width: calc(100% - 24px) !important;
            max-width: none !important;
            overflow-x: clip !important;
            overflow-y: visible !important;
        }
        body:has(.tmtc-page) .tmvu-main * {
            --sticky-unblock: 1;
        }
        /* Ensure nothing between body and field-col sets overflow-y */
        body:has(.tmtc-page) .tmu-page-section-stack,
        body:has(.tmtc-page) .tmtc-main-grid,
        body:has(.tmtc-page) .tmtc-main-left,
        body:has(.tmtc-page) .tmtc-lineup-2col {
            overflow: visible;
        }

        /* \u2500\u2500 page layout \u2500\u2500 */
        .tmtc-page {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1 1 0;
            gap: var(--tmu-space-lg);
        }

        .tmtc-topbar {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            flex-wrap: wrap;
        }

        .tmtc-topbar-copy {
            display: grid;
            gap: 2px;
        }

        .tmtc-topbar-title {
            font-size: var(--tmu-font-xl);
            font-weight: 800;
            color: var(--tmu-text-strong);
            line-height: 1.1;
        }

        /* \u2500\u2500 3-col main grid \u2500\u2500 */
        .tmtc-main-grid {
            display: flex;
            gap: var(--tmu-space-md);
            align-items: stretch;
        }
        .tmtc-main-left {
            flex: 0 0 auto;
            flex-shrink: 0;
            min-width: 0;
            display: flex;
            flex-direction: column;
        }
        .tmtc-main-mid {
            flex: 1 1 0;
            min-width: 0;
        }
        .tmtc-main-right {
            flex: 0 0 400px;
            min-width: 0;
        }

        /* \u2500\u2500 formation grid \u2500\u2500 */
        .tmtc-lineup-2col {
            display: flex;
            gap: var(--tmu-space-md);
            align-items: flex-start;
            height: 100%;
        }
        .tmtc-field-col {
            flex: 0 0 auto;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--tmu-space-sm);
            position: sticky;
            top: 160px;
            align-self: flex-start;
        }
        .tmtc-squad-col {
            flex: 1 1 0;
            min-width: 0;
            height: 100%;
            overflow-y: auto;
        }
        .tmtc-field {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            flex: 0 0 auto;
            height: calc(100dvh - 160px);
            aspect-ratio: 2 / 3;
            background-color: rgb(19 19 19);
            background-image: ${pitchBg};
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border: 1px solid rgba(255,255,255,0.1);
            overflow: hidden;
        }
        .tmtc-field-spacer {
            flex: 0 0 8%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 8px;
        }
        .tmtc-fob {
            display: flex;
            align-items: stretch;
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.08);
        }
        .tmtc-fob-formation,
        .tmtc-fob-item {
            flex: 1 1 25%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1px;
            padding: 5px 4px;
            background: rgba(0,0,0,0.42);
        }
        .tmtc-fob-formation:not(:last-child),
        .tmtc-fob-item:not(:last-child) {
            border-right: 1px solid rgba(255,255,255,0.07);
        }
        .tmtc-fob-formation {
            font-size: var(--tmu-font-xs);
            font-weight: 800;
            color: rgba(255,255,255,0.88);
            letter-spacing: .06em;
        }
        .tmtc-fob-sep { display: none; }
        .tmtc-fob-label {
            font-size: 9px;
            font-weight: 600;
            color: rgba(255,255,255,0.30);
            text-transform: uppercase;
            letter-spacing: .08em;
        }
        .tmtc-fob-value {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            font-variant-numeric: tabular-nums;
        }
        .tmtc-field-line {
            display: flex;
            flex-direction: column;
            gap: 2px;
            height: 16.66666%;
            justify-content: center;
        }
        .tmtc-line {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
        }
        .tmtc-slot-spacer {
            /* empty cell to maintain 5-col grid alignment */
        }
        .tmtc-line-label {
            font-size: var(--tmu-font-2xs);
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.4);
            text-align: center;
        }
        .tmtc-slot {
            flex: 1 1 0;
            min-width: 48px;
            max-width: 100px;
            padding: var(--tmu-space-xs) 4px;
            border-radius: var(--tmu-space-sm);
            background: rgba(0,0,0,0.45);
            backdrop-filter: blur(2px);
            border: 1px solid rgba(255,255,255,0.14);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
            text-align: center;
            text-decoration: none;
            cursor: grab;
            user-select: none;
            transition: background .12s, border-color .12s;
        }
        .tmtc-slot[draggable="true"]:active { cursor: grabbing; }
        .tmtc-slot:hover:not(.tmtc-slot-empty) {
            background: rgba(0,0,0,0.65);
            border-color: rgba(255,255,255,0.28);
        }
        .tmtc-slot-empty {
            opacity: .35;
            min-height: 72px; /* match populated slot height so empty zones don't collapse */
        }
        .tmtc-slot-no {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            color: var(--tmu-text-faint);
            font-variant-numeric: tabular-nums;
        }
        .tmtc-slot-name {
            font-size: var(--tmu-font-xs);
            font-weight: 600;
            color: var(--tmu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }
        .tmtc-slot-pos {
            font-key: var(--tmu-font-2xs);
        }
        .tmtc-slot-meta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            min-height: 12px;
        }
        .tmtc-slot-rec {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .tmtc-rec-stars {
            display: inline-flex;
            align-items: center;
            letter-spacing: .4px;
        }
        .tmtc-rec-stars-sm {
            font-size: 10px;
        }
        .tmtc-rec-stars-xs {
            font-size: 9px;
        }
        .tmtc-slot-rec-empty {
            font-size: var(--tmu-font-2xs);
            color: var(--tmu-text-dim);
        }
        .tmtc-slot-mood {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
            border-radius: 999px;
            font-size: 10px;
            line-height: 1;
            border: 1px solid rgba(0,0,0,0.18);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .tmtc-slot-mood-1 {
            background: #f7e08a;
            color: #6c5400;
        }
        .tmtc-slot-mood-2 {
            background: #efc36b;
            color: #744500;
        }
        .tmtc-slot-mood-3 {
            background: #ee9560;
            color: #6d2400;
        }
        .tmtc-slot-mood-4 {
            background: #e2614e;
            color: #ffffff;
        }
        .tmtc-slot-poskey {
            font-size: var(--tmu-font-2xs);
            color: var(--tmu-text-muted);
            text-transform: uppercase;
            letter-spacing: .05em;
        }

        /* \u2500\u2500 bench (below field) \u2500\u2500 */
        .tmtc-bench-col {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            margin-bottom: var(--tmu-space-sm);
        }
        .tmtc-bench-section-head {
            grid-column: 1 / -1;
            font-size: var(--tmu-font-2xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--tmu-text-panel-label);
            padding-top: var(--tmu-space-xs);
        }
        .tmtc-bench-slot {
            padding: 3px 4px;
            border-radius: var(--tmu-space-sm);
            background: var(--tmu-surface-dark-soft);
            border: 1px dashed var(--tmu-border-faint);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
            min-height: 42px;
            text-align: center;
            cursor: default;
        }
        .tmtc-bench-slot:hover {
            background: var(--tmu-surface-tab-hover);
        }
        .tmtc-bench-slot.has-player {
            border-style: solid;
            border-color: var(--tmu-border-embedded);
        }
        .tmtc-bench-role {
            font-size: var(--tmu-font-2xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--tmu-text-panel-label);
            line-height: 1.2;
        }
        .tmtc-bench-name {
            font-size: var(--tmu-font-2xs);
            font-weight: 600;
            color: var(--tmu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }
        .tmtc-bench-empty {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-disabled);
            font-style: italic;
        }

        .tmtc-row-bench-placeholder td {
            opacity: .55;
            font-style: italic;
            cursor: default;
        }
        .tmtc-row-bench-placeholder.tmtc-drag-over td {
            opacity: 1;
            background: rgba(77,171,247,0.08);
        }
        /* \u2500\u2500 player list \u2500\u2500 */
        .tmtc-filters {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-sm);
            align-items: center;
            margin-bottom: var(--tmu-space-md);
        }
        .tmtc-filter-group {
            display: flex;
            gap: 2px;
        }
        .tmtc-filter-sep {
            width: 1px;
            background: var(--tmu-border-soft-alpha);
            align-self: stretch;
            margin: 0 var(--tmu-space-xs);
        }

        /* \u2500\u2500 settings \u2500\u2500 */
        .tmtc-settings-rows {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-sm);
        }
        .tmtc-setting-row {
            flex-direction: column;
            align-items: stretch;
            gap: var(--tmu-space-xs);
        }

        /* \u2500\u2500 special roles list \u2500\u2500 */
        .tmtc-roles-section {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-top: var(--tmu-space-xs);
        }
        .tmtc-role-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-sm);
            padding: 4px var(--tmu-space-sm);
            border-radius: var(--tmu-space-xs);
            background: var(--tmu-surface-dark-soft);
            border: 1px solid var(--tmu-border-faint);
            min-height: 30px;
        }
        .tmtc-role-label {
            font-size: var(--tmu-font-xs);
            font-weight: 600;
            color: var(--tmu-text-panel-label);
            text-transform: uppercase;
            letter-spacing: .06em;
            flex-shrink: 0;
        }
        .tmtc-role-slot {
            flex: 1 1 0;
            min-width: 0;
            display: flex;
            justify-content: flex-end;
        }
        .tmtc-role-slot.tmtc-drag-over {
            outline: 2px dashed var(--tmu-info) !important;
            outline-offset: -2px;
            border-radius: var(--tmu-space-xs);
            background: rgba(77,171,247,0.10) !important;
        }
        .tmtc-role-chip {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            color: var(--tmu-text-inverse);
            background: var(--tmu-surface-overlay);
            border: 1px solid var(--tmu-border-soft);
            border-radius: var(--tmu-space-xs);
            padding: 2px 8px;
            cursor: grab;
            user-select: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 120px;
        }
        .tmtc-role-chip:active { cursor: grabbing; }
        .tmtc-role-empty {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-faint);
        }

        /* \u2500\u2500 orders table \u2500\u2500 */
        .tmtc-orders-empty {
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-muted);
            padding: var(--tmu-space-lg) 0;
            text-align: center;
        }
        .tmtc-order-check { color: var(--tmu-success); font-weight: 700; }
        .tmtc-order-pending { color: var(--tmu-text-disabled); }
        .tmtc-order-action-cell { display: flex; flex-direction: column; gap: 2px; }
        .tmtc-order-action-type {
            font-size: var(--tmu-font-2xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .07em;
            color: var(--tmu-text-panel-label);
        }
        .tmtc-order-action-val {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-main);
        }

        /* \u2500\u2500 ghost placeholders: only visible during drag \u2500\u2500 */
        .tmtc-slot.tmtc-slot-empty { visibility: hidden; }
        .tmtc-slot-spacer { visibility: hidden; }
        .tmtc-field.is-dragging .tmtc-slot.tmtc-slot-empty,
        .tmtc-field.is-dragging .tmtc-slot-spacer { visibility: visible; }

        /* \u2500\u2500 drag-and-drop visuals \u2500\u2500 */
        .tmtc-drag-over {
            outline: 2px dashed var(--tmu-info, #4dabf7) !important;
            outline-offset: -2px;
            background: rgba(77,171,247,0.10) !important;
        }
        .tmtc-drag-source {
            opacity: 0.40;
        }
        .tmtc-bench-inner {
            width: 100%;
            cursor: grab;
            user-select: none;
        }
        .tmtc-bench-inner:active { cursor: grabbing; }

        /* \u2500\u2500 save status bar \u2500\u2500 */
        .tmtc-save-status {
            min-height: 0;
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            text-align: right;
            padding: 0 var(--tmu-space-sm);
            transition: opacity .3s;
            opacity: 0;
        }
        .tmtc-save-status:not(:empty) { opacity: 1; }
        .tmtc-save-ok  { color: var(--tmu-success); }
        .tmtc-save-err { color: var(--tmu-danger);  }

        .tmtc-row-sep td {
            border-top: 2px solid !important;
            border-color: var(--tmu-border-pill-active) !important;
            border-bottom: none !important;
        }

        /* \u2500\u2500 squad table column \u2500\u2500 */
        .tmtc-row-on-field td {
            background: rgba(70,200,120,0.08) !important;
        }
        .tmtc-row-on-bench td {
            background: rgba(70,140,200,0.06) !important;
        }
        .tmtc-row-out td {
            opacity: 0.45;
        }
        .tmtc-sub-badge {
            display: inline-block;
            font-size: var(--tmu-font-3xs);
            font-weight: 800;
            letter-spacing: .06em;
            padding: 1px 5px;
            border-radius: 4px;
            background: var(--tmu-surface-dark-soft);
            color: var(--tmu-text-muted);
            border: 1px solid var(--tmu-border-faint);
        }
        .tmtc-pb-cell {
            width: 5px !important;
            padding: 0 !important;
        }
        .tmtc-pb-inner {
            display: block;
            width: 4px;
            min-height: 16px;
            border-radius: 2px;
        }

        /* \u2500\u2500 foreigners notice \u2500\u2500 */
        .tmtc-foreigners-note {
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-muted);
            padding: var(--tmu-space-md);
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        /* \u2500\u2500 conditional orders table \u2500\u2500 */
        .tmtc-co-row-empty td { opacity: 0.35; }
        .tmu-tbl tbody tr[data-ri] { cursor: grab; }
        .tmu-tbl tbody tr[data-ri]:hover td { background: var(--tmu-surface-hover) !important; }
        .tmu-tbl tbody tr.tmtc-co-row-dragging td { opacity: 0.4; }
        .tmu-tbl tbody tr.tmtc-co-row-drag-over td { background: var(--tmu-primary-muted) !important; outline: 2px dashed var(--tmu-primary); }

        /* \u2500\u2500 conditional orders dialog \u2500\u2500 */
        .tmtc-co-dialog-body {
            display: flex; border-bottom: 1px solid var(--tmu-border-faint);
        }
        .tmtc-co-col {
            flex: 1; min-width: 0;
            padding: var(--tmu-space-md);
            border-right: 1px solid var(--tmu-border-faint);
            overflow-y: auto; max-height: 65vh;
        }
        .tmtc-co-col:last-child { border-right: none; }
        .tmtc-co-col-label {
            font-size: var(--tmu-font-xs); font-weight: 700; text-transform: uppercase;
            letter-spacing: .06em; color: var(--tmu-text-faint);
            padding-bottom: var(--tmu-space-xs);
            border-bottom: 1px solid var(--tmu-border-faint);
            margin-bottom: var(--tmu-space-sm);
        }
        .tmtc-co-radio-item {
            border-radius: 6px;
        }
        .tmtc-co-radio-row {
            display: flex; align-items: center; gap: 10px;
            padding: 7px 8px; cursor: pointer; border-radius: 6px;
            border: 1px solid transparent;
            transition: background .1s, border-color .1s;
        }
        .tmtc-co-radio-row:hover { background: var(--tmu-surface-hover); border-color: var(--tmu-border-faint); }
        .tmtc-co-radio-item.selected .tmtc-co-radio-row {
            background: var(--tmu-primary-muted); border-color: var(--tmu-primary);
        }
        .tmtc-co-radio-input {
            width: 15px; height: 15px; flex-shrink: 0;
            accent-color: var(--tmu-primary); cursor: pointer;
        }
        .tmtc-co-radio-txt { font-size: var(--tmu-font-sm); color: var(--tmu-text-muted); line-height: 1.3; }
        .tmtc-co-radio-item.selected .tmtc-co-radio-txt { font-weight: 700; color: var(--tmu-text-strong); }
        .tmtc-co-radio-sub {
            padding: var(--tmu-space-xs) var(--tmu-space-sm) var(--tmu-space-sm) 28px;
            display: flex; flex-direction: column; gap: var(--tmu-space-xs);
        }
        .tmtc-co-radio-sub:empty { display: none; }
        .tmtc-co-param-label {
            font-size: var(--tmu-font-xs); font-weight: 600;
            color: var(--tmu-text-muted); margin-top: var(--tmu-space-xs);
        }
        .tmtc-co-chips { display: flex; flex-wrap: wrap; gap: 4px; }
        .tmtc-co-modal-footer {
            display: flex; gap: var(--tmu-space-sm);
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border-top: 1px solid var(--tmu-border-faint);
            flex-shrink: 0;
        }

        /* \u2500\u2500 analytics/formation panel (4th column) \u2500\u2500 */
        .tmtc-main-stats {
            flex: 0 0 270px;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-md);
            overflow-y: auto;
        }
        .tmtc-panel-row {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
        }
        .tmtc-panel-fm-badge {
            font-size: var(--tmu-font-xl);
            font-weight: 900;
            color: var(--tmu-text-strong);
            letter-spacing: .03em;
            white-space: nowrap;
            flex-shrink: 0;
            min-width: 72px;
        }
        .tmtc-panel-stats {
            display: flex;
            flex-direction: column;
        }
        .tmtc-panel-sep {
            border: none;
            border-top: 1px solid var(--tmu-border-soft-alpha);
            margin: 0;
        }
    `;
    document.head.appendChild(s);
  }

  // src/components/shared/tm-stars.js
  var STYLE_ID9 = "tmu-stars-style";
  var STAR_CSS = `
.tmu-stars{line-height:1}
.tmu-star-full{color:var(--tmu-warning)}
.tmu-star-half{background:linear-gradient(90deg,var(--tmu-warning) 50%,var(--tmu-border-embedded) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tmu-star-empty{color:var(--tmu-border-embedded)}
.tmu-star-green{color:var(--tmu-success)}
.tmu-star-green-half{background:linear-gradient(90deg,var(--tmu-success) 50%,var(--tmu-border-embedded) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tmu-star-split{background:linear-gradient(90deg,var(--tmu-warning) 50%,var(--tmu-success) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
`;
  function injectStyles(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID9)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID9}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID9;
    style.textContent = STAR_CSS;
    target.appendChild(style);
  }
  var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  var toNumber = (value) => {
    const numeric = parseFloat(value);
    return Number.isFinite(numeric) ? numeric : NaN;
  };
  function wrapStars(html, cls = "") {
    return `<span class="tmu-stars${cls ? ` ${cls}` : ""}">${html}</span>`;
  }
  function recommendation(value, cls = "") {
    injectStyles();
    const score = clamp(toNumber(value), 0, 5);
    if (!Number.isFinite(score)) return "";
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let html = "";
    for (let index = 0; index < fullStars; index += 1) html += '<span class="tmu-star-full">\u2605</span>';
    if (hasHalfStar) html += '<span class="tmu-star-half">\u2605</span>';
    for (let index = 0; index < emptyStars; index += 1) html += '<span class="tmu-star-empty">\u2605</span>';
    return wrapStars(html, cls);
  }
  function green(value, cls = "") {
    injectStyles();
    const score = clamp(toNumber(value), 0, 5);
    if (!Number.isFinite(score)) return "";
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.25;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let html = "";
    for (let index = 0; index < fullStars; index += 1) html += '<span class="tmu-star-green">\u2605</span>';
    if (hasHalfStar) html += '<span class="tmu-star-green-half">\u2605</span>';
    for (let index = 0; index < emptyStars; index += 1) html += '<span class="tmu-star-empty">\u2605</span>';
    return wrapStars(html, cls);
  }
  function combined(current, potential, cls = "") {
    injectStyles();
    const currentValue = clamp(toNumber(current), 0, 5);
    let potentialValue = clamp(toNumber(potential), 0, 5);
    if (!Number.isFinite(currentValue)) return "";
    if (!Number.isFinite(potentialValue) || potentialValue < currentValue) potentialValue = currentValue;
    let html = "";
    for (let index = 1; index <= 5; index += 1) {
      if (index <= currentValue) html += '<span class="tmu-star-full">\u2605</span>';
      else if (index - 0.5 <= currentValue && currentValue < index) html += potentialValue >= index ? '<span class="tmu-star-split">\u2605</span>' : '<span class="tmu-star-half">\u2605</span>';
      else if (index <= potentialValue) html += '<span class="tmu-star-green">\u2605</span>';
      else if (index - 0.5 <= potentialValue && potentialValue < index) html += '<span class="tmu-star-green-half">\u2605</span>';
      else html += '<span class="tmu-star-empty">\u2605</span>';
    }
    return wrapStars(html, cls);
  }
  injectStyles();
  var TmStars = { injectStyles, recommendation, green, combined };

  // src/components/tactics/tm-tactics-lineup.js
  var FIELD_ZONES2 = TmConst.FIELD_ZONES;
  var BENCH_SLOTS2 = TmConst.BENCH_SLOTS;
  var SPECIAL_SLOTS2 = TmConst.SPECIAL_SLOTS;
  var ALL_BENCH = [...BENCH_SLOTS2, ...SPECIAL_SLOTS2];
  var BENCH_LABELS2 = TmConst.BENCH_LABELS;
  var POSKEY_TO_ZONE = {};
  for (const z of FIELD_ZONES2) {
    for (const pk of z.cols) {
      if (pk) POSKEY_TO_ZONE[pk] = z.key;
    }
  }
  var LINE_PENALTIES = {
    1: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
    2: { 1: 1, 2: 0, 3: 1, 4: 2, 5: 3 },
    3: { 1: 2, 2: 1, 3: 0, 4: 1, 5: 2 },
    4: { 1: 3, 2: 2, 3: 1, 4: 0, 5: 1 },
    5: { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 }
  };
  function getTargetRanks(total, count) {
    if (count <= 0) return [];
    if (count >= total) return Array.from({ length: total }, (_, i) => i);
    const c = Math.floor((total - 1) / 2);
    const result = [];
    if (count % 2 === 1) result.push(c);
    for (let r = 1; result.length < count; r++) {
      if (c - r >= 0) result.push(c - r);
      if (result.length < count && c + r < total) result.push(c + r);
    }
    return result.sort((a, b) => a - b);
  }
  var escHtml = (v) => String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var gc = TmUtils.getColor;
  function encodeNested(obj, prefix = "") {
    const parts = [];
    for (const [key, val] of Object.entries(obj)) {
      const k = prefix ? `${prefix}[${key}]` : key;
      if (val !== null && val !== void 0 && typeof val === "object") {
        parts.push(encodeNested(val, k));
      } else if (val !== null && val !== void 0) {
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(val)}`);
      }
    }
    return parts.join("&");
  }
  async function postSave(assoc, changedPlayers, reserves, national, miniGameId) {
    return fetch("/ajax/tactics_post.ajax.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: encodeNested({ on_field: assoc, players: changedPlayers, reserves, national, miniGameId })
    });
  }
  function mountTacticsLineup(container, data, opts = {}) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;
    const { players_by_id = {} } = data;
    const { R5_THRESHOLDS: R5_THRESHOLDS2, RTN_THRESHOLDS: RTN_THRESHOLDS2, REC_THRESHOLDS: REC_THRESHOLDS2 } = TmConst;
    const assignment = { ...data.formation_assoc };
    for (const [role, pid] of Object.entries(data.formation_subs || {})) {
      if (!assignment[role] && pid) assignment[role] = pid;
    }
    const getOccupiedFieldKeys = () => new Set(
      Object.keys(assignment).filter(
        (pk) => TmConst.POSITION_MAP[pk] != null && assignment[pk] && String(assignment[pk]) !== "0"
      )
    );
    const getFieldPosKey = (pid) => {
      const s = String(pid);
      for (const [pk, id] of Object.entries(assignment)) {
        if (ALL_BENCH.includes(pk)) continue;
        if (id != null && String(id) === s) return pk;
      }
      return null;
    };
    const getBenchRole = (pid) => {
      const s = String(pid);
      return BENCH_SLOTS2.find((r) => assignment[r] != null && String(assignment[r]) === s) || null;
    };
    const getSortKey = (pid) => {
      const pk = getFieldPosKey(pid);
      if (pk) {
        for (let zi = 0; zi < FIELD_ZONES2.length; zi++) {
          const ci = FIELD_ZONES2[zi].cols.indexOf(pk);
          if (ci >= 0) return (FIELD_ZONES2.length - 1 - zi) * 5 + ci;
        }
      }
      const si = BENCH_SLOTS2.findIndex((r) => assignment[r] != null && String(assignment[r]) === String(pid));
      if (si >= 0) return 100 + si;
      return 999;
    };
    const buildAssocForSave = (outPid = null) => {
      const result = {};
      for (const pk of Object.keys(TmConst.POSITION_MAP)) {
        result[pk] = assignment[pk] || 0;
      }
      for (const role of [...BENCH_SLOTS2, ...SPECIAL_SLOTS2]) {
        if (assignment[role]) result[role] = assignment[role];
      }
      if (outPid) result.out = outPid;
      return result;
    };
    const changeListeners = [];
    const notifyChange = () => changeListeners.forEach((fn) => fn());
    const parseFavPositions = (player) => String((player == null ? void 0 : player.favposition) || (player == null ? void 0 : player.fp) || "").split(",").map((pos) => pos.trim().toLowerCase()).filter(Boolean);
    const getPositionRating = (player, posKey) => {
      var _a, _b;
      const positionId = (_a = TmConst.POSITION_MAP[String(posKey || "").toLowerCase()]) == null ? void 0 : _a.id;
      if (positionId == null || !((_b = player == null ? void 0 : player.allPositionRatings) == null ? void 0 : _b.length)) return null;
      return player.allPositionRatings.find((rating) => rating.id === positionId) || null;
    };
    const getSlotRecommendation = (player, posKey) => {
      const rating = getPositionRating(player, posKey);
      if ((rating == null ? void 0 : rating.rec) != null) {
        const score = parseFloat(rating.rec);
        if (Number.isFinite(score)) return Math.round(score * 100) / 100;
      }
      const fallback = parseFloat(player == null ? void 0 : player.rec_sort);
      return Number.isFinite(fallback) ? fallback : null;
    };
    const getMoodPenalty = (player, posKey) => {
      var _a, _b;
      const placed = TmConst.POSITION_MAP[String(posKey || "").toLowerCase()];
      if (!placed) return 0;
      const favEntries = parseFavPositions(player).map((favKey) => TmConst.POSITION_MAP[favKey] || null).filter(Boolean);
      if (!favEntries.length) return 0;
      if (placed.row === 0) return favEntries.some((entry) => entry.row === 0) ? 0 : 4;
      if (favEntries.some((entry) => entry.row === 0)) return 4;
      const placedSide = placed.col === 0 ? "L" : placed.col === 4 ? "R" : "C";
      let bestPenalty = 4;
      for (const fav of favEntries) {
        const favSide = fav.col === 0 ? "L" : fav.col === 4 ? "R" : "C";
        let penalty = 0;
        if (favSide !== placedSide) {
          penalty += favSide === "C" || placedSide === "C" ? 2 : 1;
        }
        penalty += (_b = (_a = LINE_PENALTIES[placed.row]) == null ? void 0 : _a[fav.row]) != null ? _b : 4;
        bestPenalty = Math.min(bestPenalty, Math.min(penalty, 4));
      }
      return bestPenalty;
    };
    const sortedPlayers = () => {
      var _a, _b, _c, _d;
      const rows = Object.values(data.players || {}).map((p) => {
        var _a2;
        const fmPosKey = getFieldPosKey(p.player_id);
        const benchRole = !fmPosKey ? getBenchRole(p.player_id) : null;
        const posStr = fmPosKey ? fmPosKey : ((_a2 = String(p.favposition || "").split(",")[0]) == null ? void 0 : _a2.trim().toLowerCase()) || "";
        const rating = getPositionRating(p, posStr);
        const _fmR5 = (rating == null ? void 0 : rating.r5) != null ? parseFloat(rating.r5) : null;
        const _fmRec = getSlotRecommendation(p, posStr);
        return {
          ...p,
          _fmOrder: getSortKey(p.player_id),
          _fmPosKey: fmPosKey,
          _benchRole: benchRole,
          _fmR5,
          _fmRec
        };
      }).sort((a, b) => a._fmOrder - b._fmOrder);
      _firstSubPid = (_b = (_a = rows.find((p) => BENCH_SLOTS2.some((r) => assignment[r] != null && String(assignment[r]) === String(p.player_id)))) == null ? void 0 : _a.player_id) != null ? _b : null;
      _firstOutPid = (_d = (_c = rows.find((p) => getFieldPosKey(p.player_id) === null && getBenchRole(p.player_id) === null)) == null ? void 0 : _c.player_id) != null ? _d : null;
      BENCH_SLOTS2.forEach((role, idx) => {
        if (assignment[role] == null)
          rows.push({
            _isBenchPlaceholder: true,
            _benchRole: role,
            _fmOrder: 100 + idx,
            player_id: `_bench_${role}`,
            no: "",
            name: "",
            lastname: "",
            rec_sort: null,
            _fmR5: null,
            _fmRec: null,
            routine: null
          });
      });
      rows.sort((a, b) => a._fmOrder - b._fmOrder);
      let _ms = false, _mo = false;
      for (const r of rows) {
        if (!_ms && r._fmOrder >= 100) {
          r._needsSep = true;
          _ms = true;
        }
        if (!_mo && r._fmOrder >= 999) {
          r._needsSep = true;
          _mo = true;
        }
      }
      return rows;
    };
    const body = container;
    const layout = document.createElement("div");
    layout.className = "tmtc-lineup-2col";
    body.appendChild(layout);
    const fieldCol = document.createElement("div");
    fieldCol.className = "tmtc-field-col";
    layout.appendChild(fieldCol);
    const externalSquadContainer = opts.squadContainer || null;
    const squadCol = document.createElement("div");
    squadCol.className = "tmtc-squad-col";
    if (!externalSquadContainer) layout.appendChild(squadCol);
    const specialRolesCol = document.createElement("div");
    specialRolesCol.className = "tmtc-bench-col";
    const fieldEl = document.createElement("div");
    fieldEl.className = "tmtc-field";
    fieldCol.appendChild(fieldEl);
    const topSpacer = document.createElement("div");
    topSpacer.className = "tmtc-field-spacer";
    fieldEl.appendChild(topSpacer);
    const fieldOverlayBar = document.createElement("div");
    fieldOverlayBar.className = "tmtc-fob";
    topSpacer.appendChild(fieldOverlayBar);
    const BADGE_ZONES_LU = [...FIELD_ZONES2].reverse().filter((z) => z.key !== "gk");
    function getFormationStr() {
      return BADGE_ZONES_LU.map((z) => z.cols.filter((pk) => pk && assignment[pk] && String(assignment[pk]) !== "0").length).filter((n) => n > 0).join("-") || "?";
    }
    function refreshFieldOverlay() {
      var _a, _b;
      const activeKeys = getOccupiedFieldKeys();
      let totalR5 = 0, countR5 = 0, totalRtn = 0, countRtn = 0, totalAge = 0, countAge = 0;
      for (const posKey of activeKeys) {
        const pid = assignment[posKey];
        if (!pid || String(pid) === "0") continue;
        const p = players_by_id[String(pid)];
        if (!p) continue;
        const posId = (_a = TmConst.POSITION_MAP[posKey]) == null ? void 0 : _a.id;
        if (((_b = p.allPositionRatings) == null ? void 0 : _b.length) && posId != null) {
          const rating = p.allPositionRatings.find((r) => r.id === posId);
          if (rating) {
            totalR5 += parseFloat(rating.r5) || 0;
            countR5++;
          }
        }
        if (p.routine != null && Number(p.routine) > 0) {
          totalRtn += parseFloat(p.routine);
          countRtn++;
        }
        const age2 = p.ageMonths != null ? p.ageMonths / 12 : parseInt(p.age) || 0;
        if (age2 > 0) {
          totalAge += age2;
          countAge++;
        }
      }
      const gc2 = TmUtils.getColor;
      const r5 = countR5 > 0 ? (totalR5 / countR5).toFixed(2) : null;
      const rtn = countRtn > 0 ? (totalRtn / countRtn).toFixed(1) : null;
      const age = countAge > 0 ? (totalAge / countAge).toFixed(1) : null;
      const sep = `<span class="tmtc-fob-sep">\xB7</span>`;
      const item = (label, value, color) => `<span class="tmtc-fob-item"><span class="tmtc-fob-label">${label}</span><span class="tmtc-fob-value" style="color:${color}">${value}</span></span>`;
      fieldOverlayBar.innerHTML = [
        `<span class="tmtc-fob-formation">${getFormationStr()}</span>`,
        sep,
        item("R5", r5 != null ? r5 : "\u2014", r5 ? gc2(parseFloat(r5), TmConst.R5_THRESHOLDS) : "var(--tmu-text-faint)"),
        sep,
        item("Rtn", rtn != null ? rtn : "\u2014", rtn ? gc2(parseFloat(rtn), TmConst.RTN_THRESHOLDS) : "var(--tmu-text-faint)"),
        sep,
        item("Age", age != null ? age : "\u2014", "var(--tmu-text-muted)")
      ].join("");
    }
    const slotEls = {};
    const benchSlotEls = {};
    let tblWrap = null;
    function buildField() {
      while (fieldEl.lastChild !== topSpacer) fieldEl.removeChild(fieldEl.lastChild);
      for (const k of Object.keys(slotEls)) delete slotEls[k];
      for (const zone of FIELD_ZONES2) {
        const section = document.createElement("div");
        section.className = "tmtc-field-line";
        fieldEl.appendChild(section);
        const lineEl = document.createElement("div");
        lineEl.className = "tmtc-line";
        section.appendChild(lineEl);
        for (const posKey of zone.cols) {
          if (!posKey) {
            const sp = document.createElement("div");
            sp.className = "tmtc-slot-spacer";
            lineEl.appendChild(sp);
          } else {
            const slotEl = makeFieldSlot(posKey);
            slotEls[posKey] = slotEl;
            lineEl.appendChild(slotEl);
          }
        }
      }
    }
    function normalizeZone(zoneKey, changed) {
      const zone = FIELD_ZONES2.find((z) => z.key === zoneKey);
      if (!zone) return;
      const centerPks = [zone.cols[1], zone.cols[2], zone.cols[3]].filter((pk) => pk != null);
      if (!centerPks.length) return;
      const occupied = centerPks.filter((pk) => assignment[pk] != null && String(assignment[pk]) !== "0");
      if (!occupied.length) return;
      const targetRanks = getTargetRanks(centerPks.length, occupied.length);
      const targetPks = targetRanks.map((r) => centerPks[r]);
      if (occupied.every((pk, i) => pk === targetPks[i])) return;
      const pids = occupied.map((pk) => String(assignment[pk]));
      for (const pk of occupied) assignment[pk] = null;
      for (let i = 0; i < pids.length; i++) {
        assignment[targetPks[i]] = pids[i];
        if (changed) changed[pids[i]] = targetPks[i];
      }
      for (const pk of centerPks) {
        const pid = assignment[pk];
        if (slotEls[pk]) renderFieldSlot(slotEls[pk], pid ? players_by_id[pid] || null : null, pk);
      }
    }
    function makeFieldSlot(posKey) {
      const pid = assignment[posKey];
      const player = pid ? players_by_id[pid] || null : null;
      const slotEl = document.createElement("div");
      slotEl.className = "tmtc-slot";
      slotEl.dataset.posKey = posKey;
      renderFieldSlot(slotEl, player, posKey);
      setupDropTarget(slotEl, posKey);
      return slotEl;
    }
    function renderFieldSlot(slotEl, player, posKey) {
      if (!slotEl) return;
      slotEl.innerHTML = "";
      slotEl.dataset.posKey = posKey;
      slotEl.classList.toggle("tmtc-slot-empty", !player);
      if (player) {
        slotEl.setAttribute("draggable", "true");
        slotEl.dataset.playerId = player.player_id;
        slotEl.removeEventListener("dragstart", onFieldDragStart);
        slotEl.addEventListener("dragstart", onFieldDragStart);
        const slotRec = getSlotRecommendation(player, posKey);
        const moodPenalty = getMoodPenalty(player, posKey);
        slotEl.innerHTML = `
                <span class="tmtc-slot-no">${escHtml(player.no || "")}</span>
                <span class="tmtc-slot-name">${escHtml(player.lastname || player.name || "")}</span>
                ${TmPosition.chip([posKey || ""])}
                <span class="tmtc-slot-meta">
                    <span class="tmtc-slot-rec">${TmStars.recommendation(slotRec, "tmtc-rec-stars tmtc-rec-stars-sm") || '<span class="tmtc-slot-rec-empty">\u2014</span>'}</span>
                    ${moodPenalty > 0 ? `<span class="tmtc-slot-mood tmtc-slot-mood-${moodPenalty}" title="Out of natural position">\u2639</span>` : ""}
                </span>
            `;
      } else {
        slotEl.removeAttribute("draggable");
        delete slotEl.dataset.playerId;
        slotEl.innerHTML = `<span class="tmtc-slot-poskey">${escHtml(posKey.toUpperCase() || "\u2014")}</span>`;
      }
    }
    function makeBenchSlot(role) {
      const el = document.createElement("div");
      el.className = "tmtc-bench-slot";
      el.dataset.role = role;
      const pid = assignment[role];
      const player = pid ? players_by_id[pid] || null : null;
      renderBenchSlot(el, player, BENCH_LABELS2[role] || role);
      setupBenchDropTarget(el, role);
      return el;
    }
    function renderBenchSlot(el, player, label) {
      el.innerHTML = "";
      el.classList.toggle("has-player", !!player);
      const roleEl = document.createElement("span");
      roleEl.className = "tmtc-bench-role";
      roleEl.textContent = label;
      el.appendChild(roleEl);
      if (player) {
        const inner = document.createElement("div");
        inner.setAttribute("draggable", "true");
        inner.dataset.playerId = player.player_id;
        inner.className = "tmtc-bench-inner";
        inner.innerHTML = `<span class="tmtc-bench-name">${escHtml(player.lastname || player.name || "")}</span>`;
        inner.addEventListener("dragstart", onBenchDragStart);
        el.appendChild(inner);
      } else {
        const emptyEl = document.createElement("span");
        emptyEl.className = "tmtc-bench-empty";
        emptyEl.textContent = "\u2014";
        el.appendChild(emptyEl);
      }
    }
    function buildSquadTable() {
      const wrap = TmTable.table({
        items: sortedPlayers(),
        sortKey: "_fmOrder",
        sortDir: 1,
        density: "tight",
        rowAttrs: (p) => p._isBenchPlaceholder ? { "data-bench-role": p._benchRole } : { draggable: "true", "data-player-id": p.player_id },
        rowCls: (p) => {
          const sep = p._needsSep ? " tmtc-row-sep" : "";
          if (p._isBenchPlaceholder) return "tmtc-row-bench-placeholder" + sep;
          if (getFieldPosKey(p.player_id)) return "tmtc-row-on-field" + sep;
          if (getBenchRole(p.player_id)) return "tmtc-row-on-bench" + sep;
          return "tmtc-row-out" + sep;
        },
        headers: [
          {
            key: "_bar",
            label: "",
            sortable: false,
            cls: "tmtc-pb-cell",
            thCls: "tmtc-pb-cell",
            render: (_, p) => {
              var _a, _b;
              if (p._isBenchPlaceholder) return '<span class="tmtc-pb-inner" style="background:var(--tmu-border-soft-alpha)"></span>';
              const posStr = (p._fmPosKey || ((_a = String(p.favposition || "").split(",")[0]) == null ? void 0 : _a.trim()) || "").toLowerCase();
              const color = ((_b = TmConst.POSITION_MAP[posStr]) == null ? void 0 : _b.color) || "var(--tmu-text-dim)";
              return `<span class="tmtc-pb-inner" style="background:${color}"></span>`;
            }
          },
          {
            key: "no",
            label: "#",
            align: "r",
            width: "28px",
            sortable: false,
            render: (v, p) => p._isBenchPlaceholder ? "" : `<span style="color:var(--tmu-text-muted);font-variant-numeric:tabular-nums">${escHtml(v)}</span>`
          },
          {
            key: "_fmPosKey",
            label: "Pos",
            align: "c",
            width: "68px",
            sortable: false,
            render: (v, p) => {
              if (p._isBenchPlaceholder)
                return `<span class="tmtc-sub-badge" style="opacity:.5">${escHtml(BENCH_LABELS2[p._benchRole] || p._benchRole)}</span>`;
              if (p._benchRole)
                return `<span class="tmtc-sub-badge">${escHtml(BENCH_LABELS2[p._benchRole] || p._benchRole)}</span>`;
              if (!v) {
                const positions = String((p == null ? void 0 : p.favposition) || "").split(",").map((s) => s.trim()).filter(Boolean);
                if (!positions.length) return "";
                return `<span style="opacity:0.45;filter:grayscale(1)">${TmPosition.chip(positions)}</span>`;
              }
              return TmPosition.chip([v.toUpperCase()]);
            }
          },
          {
            key: "name",
            label: "Player",
            render: (_, p) => {
              if (p._isBenchPlaceholder) return '<span style="color:var(--tmu-text-disabled);font-style:italic">drop player here</span>';
              return `<a href="/players/${p.player_id}/" style="color:var(--tmu-text-inverse);text-decoration:none;font-weight:600" onclick="event.stopPropagation()">${escHtml(p.lastname || p.name || "")}</a>`;
            }
          },
          {
            key: "rec_sort",
            label: "\u2605",
            align: "c",
            width: "58px",
            render: (v, p) => {
              if (p._isBenchPlaceholder) return "";
              const starValue = p._fmRec != null ? p._fmRec : v;
              return TmStars.recommendation(starValue, "tmtc-rec-stars tmtc-rec-stars-xs") || "\u2014";
            }
          },
          {
            key: "_fmRec",
            label: "REC",
            align: "r",
            width: "40px",
            sortable: false,
            render: (v, p) => p._isBenchPlaceholder ? "" : v != null ? `<span class="tmu-tabular" style="color:${gc(v, REC_THRESHOLDS2)};font-weight:700">${v.toFixed(2)}</span>` : `<span style="color:var(--tmu-text-dim)">\u2014</span>`
          },
          {
            key: "_fmR5",
            label: "R5",
            align: "r",
            width: "40px",
            sortable: false,
            render: (v, p) => p._isBenchPlaceholder ? "" : v != null ? `<span class="tmu-tabular" style="color:${gc(v, R5_THRESHOLDS2)};font-weight:700">${v}</span>` : `<span style="color:var(--tmu-text-dim)">\u2014</span>`
          },
          {
            key: "routine",
            label: "Routine",
            align: "r",
            width: "42px",
            render: (v, p) => p._isBenchPlaceholder ? "" : v != null && v > 0 ? `<span class="tmu-tabular" style="color:${gc(v, RTN_THRESHOLDS2)};font-weight:700">${Number(v).toFixed(1)}</span>` : `<span style="color:var(--tmu-text-dim)">\u2014</span>`
          }
        ],
        emptyText: "No players."
      });
      wrap.addEventListener("dragstart", (e) => {
        const tr = e.target.closest("tr[data-player-id]");
        if (!tr || !wrap.contains(tr)) return;
        const pid = tr.dataset.playerId;
        if (!pid) return;
        dragState = { pid, fromType: "sidebar" };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", pid);
        tr.classList.add("tmtc-drag-source");
        if (getFieldPosKey(pid) || getOccupiedFieldKeys().size < 11) fieldEl.classList.add("is-dragging");
      });
      let _hovRow = null;
      const _setHovRow = (tr) => {
        if (_hovRow === tr) return;
        if (_hovRow) _hovRow.classList.remove("tmtc-drag-over");
        _hovRow = tr;
        if (tr) tr.classList.add("tmtc-drag-over");
      };
      wrap.addEventListener("dragover", (e) => {
        if (!dragState) return;
        const tr = e.target.closest("tr[data-bench-role], tr[data-player-id]");
        if (tr) {
          e.preventDefault();
          _setHovRow(tr);
        }
      });
      wrap.addEventListener("dragleave", (e) => {
        if (_hovRow && !wrap.contains(e.relatedTarget)) _setHovRow(null);
      });
      wrap.addEventListener("drop", async (e) => {
        _setHovRow(null);
        const benchTr = e.target.closest("tr[data-bench-role]");
        const playerTr = !benchTr && e.target.closest("tr[data-player-id]");
        if (!benchTr && !playerTr) return;
        e.preventDefault();
        clearDragVisuals();
        const ds = dragState;
        dragState = null;
        if (!ds) return;
        const { pid } = ds;
        const player = players_by_id[pid];
        if (!player) return;
        const changed = {};
        if (benchTr) {
          const roleKey = benchTr.dataset.benchRole;
          const prevPid = assignment[roleKey] ? String(assignment[roleKey]) : null;
          if (prevPid === String(pid)) {
            refreshSquadTable();
            return;
          }
          clearSourceOldSpot(ds, changed);
          if (prevPid) backfillDisplaced(prevPid, ds, changed);
          assignment[roleKey] = pid;
          changed[pid] = roleKey;
          renderBenchSlot(benchSlotEls[roleKey], player, BENCH_LABELS2[roleKey] || roleKey);
          if (ds.fromPosKey) normalizeZone(POSKEY_TO_ZONE[ds.fromPosKey], changed);
        } else {
          const targetPid = playerTr.dataset.playerId;
          if (!targetPid || targetPid === String(pid)) {
            refreshSquadTable();
            return;
          }
          const targetPosKey = getFieldPosKey(targetPid);
          const targetBenchRole = !targetPosKey ? getBenchRole(targetPid) : null;
          if (targetPosKey) {
            clearSourceOldSpot(ds, changed);
            backfillDisplaced(targetPid, ds, changed);
            assignment[targetPosKey] = pid;
            changed[pid] = targetPosKey;
            renderFieldSlot(slotEls[targetPosKey], player, targetPosKey);
            for (const zone of FIELD_ZONES2) normalizeZone(zone.key, changed);
          } else if (targetBenchRole && BENCH_SLOTS2.includes(targetBenchRole)) {
            clearSourceOldSpot(ds, changed);
            backfillDisplaced(targetPid, ds, changed);
            assignment[targetBenchRole] = pid;
            changed[pid] = targetBenchRole;
            renderBenchSlot(benchSlotEls[targetBenchRole], player, BENCH_LABELS2[targetBenchRole] || targetBenchRole);
            for (const zone of FIELD_ZONES2) normalizeZone(zone.key, changed);
          } else {
            refreshSquadTable();
            return;
          }
        }
        refreshSquadTable();
        try {
          const outPid = Object.keys(changed).find((p) => changed[p] === "out") || null;
          await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
          TmAlert.show({ message: "Saved", tone: "success" });
          notifyChange();
        } catch (e2) {
          TmAlert.show({ message: "Save failed", tone: "error" });
        }
      });
      return wrap;
    }
    function refreshSquadTable() {
      tblWrap == null ? void 0 : tblWrap.refresh({ items: sortedPlayers() });
      refreshFieldOverlay();
    }
    let dragState = null;
    function onFieldDragStart(e) {
      const pid = e.currentTarget.dataset.playerId;
      const posKey = e.currentTarget.dataset.posKey;
      if (!pid) {
        e.preventDefault();
        return;
      }
      dragState = { pid, fromType: "field", fromPosKey: posKey };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", pid);
      e.currentTarget.classList.add("tmtc-drag-source");
      fieldEl.classList.add("is-dragging");
    }
    function onBenchDragStart(e) {
      var _a;
      e.stopPropagation();
      const pid = e.currentTarget.dataset.playerId;
      const roleKey = ((_a = e.currentTarget.closest(".tmtc-bench-slot")) == null ? void 0 : _a.dataset.role) || "";
      if (!pid) {
        e.preventDefault();
        return;
      }
      dragState = { pid, fromType: "bench", fromRoleKey: roleKey };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", pid);
      e.currentTarget.classList.add("tmtc-drag-source");
    }
    function clearSourceOldSpot(ds, changed) {
      const { pid, fromType, fromPosKey, fromRoleKey } = ds;
      if (fromType === "field" && fromPosKey) {
        assignment[fromPosKey] = null;
        if (slotEls[fromPosKey]) renderFieldSlot(slotEls[fromPosKey], null, fromPosKey);
      } else if (fromType === "bench" && fromRoleKey) {
        assignment[fromRoleKey] = null;
        renderBenchSlot(benchSlotEls[fromRoleKey], null, BENCH_LABELS2[fromRoleKey] || fromRoleKey);
      } else if (fromType === "sidebar") {
        const oldPk = getFieldPosKey(pid);
        if (oldPk) {
          assignment[oldPk] = null;
          if (slotEls[oldPk]) renderFieldSlot(slotEls[oldPk], null, oldPk);
          ds.fromPosKey = oldPk;
        }
        const oldRole = getBenchRole(pid);
        if (oldRole) {
          assignment[oldRole] = null;
          renderBenchSlot(benchSlotEls[oldRole], null, BENCH_LABELS2[oldRole] || oldRole);
        }
      }
    }
    function backfillDisplaced(displacedPid, ds, changed) {
      const { fromType, fromPosKey, fromRoleKey } = ds;
      if (fromType === "field" && fromPosKey) {
        assignment[fromPosKey] = displacedPid;
        if (slotEls[fromPosKey]) renderFieldSlot(slotEls[fromPosKey], players_by_id[displacedPid] || null, fromPosKey);
        changed[displacedPid] = fromPosKey;
      } else if (fromType === "bench" && fromRoleKey) {
        assignment[fromRoleKey] = displacedPid;
        renderBenchSlot(benchSlotEls[fromRoleKey], players_by_id[displacedPid] || null, BENCH_LABELS2[fromRoleKey] || fromRoleKey);
        changed[displacedPid] = fromRoleKey;
      } else {
        changed[displacedPid] = "out";
      }
    }
    function setupDropTarget(slotEl, posKey) {
      let n = 0;
      slotEl.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (++n === 1) slotEl.classList.add("tmtc-drag-over");
      });
      slotEl.addEventListener("dragleave", () => {
        if (--n <= 0) {
          n = 0;
          slotEl.classList.remove("tmtc-drag-over");
        }
      });
      slotEl.addEventListener("dragover", (e) => e.preventDefault());
      slotEl.addEventListener("drop", async (e) => {
        e.preventDefault();
        n = 0;
        slotEl.classList.remove("tmtc-drag-over");
        clearDragVisuals();
        const ds = dragState;
        dragState = null;
        if (!ds) return;
        const { pid } = ds;
        const player = players_by_id[pid];
        if (!player) return;
        const prevPid = assignment[posKey] ? String(assignment[posKey]) : null;
        if (prevPid === String(pid)) return;
        if (!prevPid && ds.fromType !== "field" && getOccupiedFieldKeys().size >= 11) return;
        const changed = {};
        clearSourceOldSpot(ds, changed);
        if (prevPid) backfillDisplaced(prevPid, ds, changed);
        assignment[posKey] = pid;
        changed[pid] = posKey;
        renderFieldSlot(slotEl, player, posKey);
        for (const zone of FIELD_ZONES2) normalizeZone(zone.key, changed);
        refreshSquadTable();
        try {
          const outPid = Object.keys(changed).find((p) => changed[p] === "out") || null;
          await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
          TmAlert.show({ message: "Saved", tone: "success" });
          notifyChange();
        } catch (e2) {
          TmAlert.show({ message: "Save failed", tone: "error" });
        }
      });
    }
    function setupBenchDropTarget(el, roleKey) {
      let n = 0;
      el.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (++n === 1) el.classList.add("tmtc-drag-over");
      });
      el.addEventListener("dragleave", () => {
        if (--n <= 0) {
          n = 0;
          el.classList.remove("tmtc-drag-over");
        }
      });
      el.addEventListener("dragover", (e) => e.preventDefault());
      el.addEventListener("drop", async (e) => {
        e.preventDefault();
        n = 0;
        el.classList.remove("tmtc-drag-over");
        clearDragVisuals();
        const ds = dragState;
        dragState = null;
        if (!ds) return;
        const { pid } = ds;
        const player = players_by_id[pid];
        if (!player) return;
        const prevPid = assignment[roleKey] ? String(assignment[roleKey]) : null;
        if (prevPid === String(pid)) return;
        const changed = {};
        clearSourceOldSpot(ds, changed);
        if (prevPid) backfillDisplaced(prevPid, ds, changed);
        assignment[roleKey] = pid;
        changed[pid] = roleKey;
        renderBenchSlot(el, player, BENCH_LABELS2[roleKey] || roleKey);
        for (const zone of FIELD_ZONES2) normalizeZone(zone.key, changed);
        refreshSquadTable();
        try {
          const outPid = Object.keys(changed).find((p) => changed[p] === "out") || null;
          await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
          TmAlert.show({ message: "Saved", tone: "success" });
          notifyChange();
        } catch (e2) {
          TmAlert.show({ message: "Save failed", tone: "error" });
        }
      });
    }
    function clearDragVisuals() {
      document.querySelectorAll(".tmtc-drag-source, .tmtc-drag-over").forEach((el) => el.classList.remove("tmtc-drag-source", "tmtc-drag-over"));
      fieldEl.classList.remove("is-dragging");
    }
    document.addEventListener("dragend", () => {
      dragState = null;
      clearDragVisuals();
    });
    buildField();
    for (const role of BENCH_SLOTS2) {
      benchSlotEls[role] = makeBenchSlot(role);
    }
    for (const role of SPECIAL_SLOTS2) {
      benchSlotEls[role] = makeBenchSlot(role);
    }
    const squadTarget = externalSquadContainer || squadCol;
    tblWrap = buildSquadTable();
    squadTarget.appendChild(tblWrap);
    async function applyAssignment(newAssignment) {
      const prevFieldPids = new Set(
        [...getOccupiedFieldKeys()].map((pk) => String(assignment[pk]))
      );
      for (const pk of getOccupiedFieldKeys()) assignment[pk] = null;
      const touchesBench = BENCH_SLOTS2.some((r) => r in newAssignment);
      if (touchesBench) for (const role of BENCH_SLOTS2) assignment[role] = null;
      const changed = {};
      for (const [key, pid] of Object.entries(newAssignment)) {
        if (!pid) continue;
        assignment[key] = pid;
        changed[String(pid)] = key;
      }
      for (const pid of prevFieldPids) {
        if (!changed[pid]) changed[pid] = "out";
      }
      buildField();
      for (const [role, el] of Object.entries(benchSlotEls)) {
        const pid = assignment[role];
        renderBenchSlot(el, pid ? players_by_id[pid] || null : null, BENCH_LABELS2[role] || role);
      }
      refreshSquadTable();
      try {
        const outPid = Object.keys(changed).find((p) => changed[p] === "out") || null;
        await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
        TmAlert.show({ message: "Saved", tone: "success" });
        notifyChange();
      } catch (e) {
        TmAlert.show({ message: "Save failed", tone: "error" });
      }
    }
    const getAssignment = () => ({ ...assignment });
    const getActiveKeys = () => getOccupiedFieldKeys();
    const subscribe = (fn) => {
      changeListeners.push(fn);
      return () => {
        const i = changeListeners.indexOf(fn);
        if (i >= 0) changeListeners.splice(i, 1);
      };
    };
    function mountSpecialRoles(target) {
      const ROLE_LABELS = { captain: "Captain", corner: "Corners", penalty: "Penalty", freekick: "Free Kick" };
      for (const role of SPECIAL_SLOTS2) {
        const row = document.createElement("div");
        row.className = "tmtc-role-row";
        row.dataset.role = role;
        const lbl = document.createElement("span");
        lbl.className = "tmtc-role-label";
        lbl.textContent = ROLE_LABELS[role] || role;
        row.appendChild(lbl);
        const slot = document.createElement("div");
        slot.className = "tmtc-role-slot";
        slot.dataset.role = role;
        row.appendChild(slot);
        const renderSlot = () => {
          const pid = assignment[role];
          const p = pid ? players_by_id[String(pid)] : null;
          slot.innerHTML = "";
          if (p) {
            const chip = document.createElement("span");
            chip.className = "tmtc-role-chip";
            chip.setAttribute("draggable", "true");
            chip.dataset.playerId = p.player_id;
            chip.textContent = p.lastname || p.name || "";
            chip.addEventListener("dragstart", (e) => {
              dragState = { pid: String(p.player_id), fromType: "bench", fromRoleKey: role };
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(p.player_id));
              chip.classList.add("tmtc-drag-source");
            });
            slot.appendChild(chip);
          } else {
            const empty = document.createElement("span");
            empty.className = "tmtc-role-empty";
            empty.textContent = "\u2014";
            slot.appendChild(empty);
          }
        };
        renderSlot();
        let _n = 0;
        slot.addEventListener("dragenter", (e) => {
          e.preventDefault();
          if (++_n === 1) slot.classList.add("tmtc-drag-over");
        });
        slot.addEventListener("dragleave", () => {
          if (--_n <= 0) {
            _n = 0;
            slot.classList.remove("tmtc-drag-over");
          }
        });
        slot.addEventListener("dragover", (e) => e.preventDefault());
        slot.addEventListener("drop", async (e) => {
          var _a;
          e.preventDefault();
          _n = 0;
          slot.classList.remove("tmtc-drag-over");
          const ds = dragState;
          dragState = null;
          clearDragVisuals();
          if (!ds) return;
          const { pid } = ds;
          const player = players_by_id[pid];
          if (!player) return;
          const prevPid = assignment[role] ? String(assignment[role]) : null;
          if (prevPid === String(pid)) return;
          const changed = {};
          if (prevPid) {
            changed[prevPid] = "out";
          }
          assignment[role] = pid;
          changed[pid] = role;
          refreshSquadTable();
          for (const r of SPECIAL_SLOTS2) {
            (_a = target.querySelector(`[data-role="${r}"] .tmtc-role-slot`)) == null ? void 0 : _a.dispatchEvent(new CustomEvent("_refresh"));
          }
          try {
            const outPid = Object.keys(changed).find((p) => changed[p] === "out") || null;
            await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
            TmAlert.show({ message: "Saved", tone: "success" });
            notifyChange();
          } catch (e2) {
            TmAlert.show({ message: "Save failed", tone: "error" });
          }
        });
        slot.addEventListener("_refresh", renderSlot);
        changeListeners.push(renderSlot);
        target.appendChild(row);
      }
    }
    return { refresh: refreshSquadTable, applyAssignment, getAssignment, getActiveKeys, subscribe, mountSpecialRoles };
  }

  // src/components/tactics/tm-tactics-settings.js
  var MENTALITY_LABELS = { 1: "Very Defensive", 2: "Defensive", 3: "Slightly Defensive", 4: "Normal", 5: "Slightly Attacking", 6: "Attacking", 7: "Very Attacking" };
  var STYLE_LABELS = { 1: "Balanced", 2: "Direct", 3: "Wings", 4: "Short Passing", 5: "Long Balls", 6: "Through Balls" };
  var FOCUS_LABELS = { 1: "Balanced", 2: "Left", 3: "Central", 4: "Right" };
  async function saveSetting(saveKey, value, reserves, national, miniGameId) {
    var _a, _b, _c;
    const clubId = String(((_a = window.SESSION) == null ? void 0 : _a.id) || ((_b = window.SESSION) == null ? void 0 : _b.main_id) || ((_c = window.SESSION) == null ? void 0 : _c.club_id) || "");
    const body = { save: saveKey, value: String(value), reserves, national, club_id: clubId };
    if (saveKey !== "focus") body.miniGameId = miniGameId;
    return fetch("/ajax/tactics_post.ajax.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams(body).toString()
    });
  }
  function mountTacticsSettings(container, initialValues = {}, opts = {}, lineupApi = null) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;
    const wrap = document.createElement("div");
    wrap.className = "tmtc-settings-rows";
    container.appendChild(wrap);
    function buildRow({ label, labelsMap, saveKey, current }) {
      var _a;
      const row = document.createElement("div");
      row.className = "tmu-field tmtc-setting-row";
      const lbl = document.createElement("span");
      lbl.className = "tmu-field-label";
      lbl.textContent = label;
      row.appendChild(lbl);
      let currentVal = current;
      const ac = TmAutocomplete.autocomplete({
        value: (_a = labelsMap[currentVal]) != null ? _a : "",
        placeholder: "Select\u2026",
        tone: "overlay",
        density: "compact",
        size: "full",
        grow: true,
        autocomplete: "off"
      });
      const makeItems = (query = "") => {
        const q = query.trim().toLowerCase();
        return Object.entries(labelsMap).filter(([, text]) => !q || text.toLowerCase().includes(q)).map(([val, text]) => TmAutocomplete.autocompleteItem({
          label: text,
          active: Number(val) === currentVal,
          onSelect: () => {
            currentVal = Number(val);
            ac.setValue(text);
            ac.hideDrop();
            saveSetting(saveKey, currentVal, reserves, national, miniGameId);
          }
        }));
      };
      ac.inputEl.addEventListener("focus", () => {
        ac.setItems(makeItems(""));
      });
      ac.inputEl.addEventListener("input", () => {
        ac.setItems(makeItems(ac.inputEl.value));
      });
      ac.inputEl.addEventListener("blur", () => {
        setTimeout(() => {
          var _a2;
          ac.hideDrop();
          ac.setValue((_a2 = labelsMap[currentVal]) != null ? _a2 : "");
        }, 200);
      });
      row.appendChild(ac);
      return row;
    }
    wrap.appendChild(buildRow({ label: "Mentality", labelsMap: MENTALITY_LABELS, saveKey: "mentality", current: Number(initialValues.mentality) || 4 }));
    wrap.appendChild(buildRow({ label: "Style", labelsMap: STYLE_LABELS, saveKey: "attacking", current: Number(initialValues.style) || 1 }));
    wrap.appendChild(buildRow({ label: "Focus", labelsMap: FOCUS_LABELS, saveKey: "focus", current: Number(initialValues.focus) || 1 }));
    if (lineupApi == null ? void 0 : lineupApi.mountSpecialRoles) {
      const rolesSection = document.createElement("div");
      rolesSection.className = "tmtc-roles-section";
      wrap.appendChild(rolesSection);
      lineupApi.mountSpecialRoles(rolesSection);
    }
  }

  // src/components/tactics/tm-tactics-panel.js
  var DEF_KEYS = {
    1: ["dc"],
    2: ["dcl", "dcr"],
    3: ["dcl", "dc", "dcr"],
    4: ["dl", "dcl", "dcr", "dr"],
    5: ["dl", "dcl", "dc", "dcr", "dr"]
  };
  var DM_KEYS = {
    1: ["dmc"],
    2: ["dmcl", "dmcr"],
    3: ["dml", "dmc", "dmr"],
    4: ["dml", "dmcl", "dmcr", "dmr"],
    5: ["dml", "dmcl", "dmc", "dmcr", "dmr"]
  };
  var MID_KEYS = {
    1: ["mc"],
    2: ["mcl", "mcr"],
    3: ["mcl", "mc", "mcr"],
    4: ["ml", "mcl", "mcr", "mr"],
    5: ["ml", "mcl", "mc", "mcr", "mr"]
  };
  var OM_KEYS = {
    1: ["omc"],
    2: ["omcl", "omcr"],
    3: ["oml", "omc", "omr"],
    4: ["oml", "omcl", "omcr", "omr"],
    5: ["oml", "omcl", "omc", "omcr", "omr"]
  };
  var FWD_KEYS = {
    1: ["fc"],
    2: ["fcl", "fcr"],
    3: ["fcl", "fc", "fcr"]
  };
  function buildPresetPositions(nDef, nDm, nMid, nOm, nFwd) {
    const pos = new Array(24).fill(null);
    pos[0] = "gk";
    const set = (start, keys) => (keys || []).forEach((k, i) => {
      pos[start + i] = k;
    });
    set(1, DEF_KEYS[nDef]);
    set(6, DM_KEYS[nDm]);
    set(11, MID_KEYS[nMid]);
    set(16, OM_KEYS[nOm]);
    set(21, FWD_KEYS[nFwd]);
    return pos;
  }
  var FORMATION_PRESETS = {
    "4-4-2": buildPresetPositions(4, 0, 4, 0, 2),
    "4-3-3": buildPresetPositions(4, 0, 3, 0, 3),
    "4-2-3-1": buildPresetPositions(4, 2, 0, 3, 1),
    "4-5-1": buildPresetPositions(4, 0, 5, 0, 1),
    "4-1-4-1": buildPresetPositions(4, 1, 4, 0, 1),
    "4-3-2-1": buildPresetPositions(4, 0, 3, 2, 1),
    "4-2-2-2": buildPresetPositions(4, 2, 2, 0, 2),
    "4-1-2-3": buildPresetPositions(4, 1, 2, 0, 3),
    "3-5-2": buildPresetPositions(3, 0, 5, 0, 2),
    "3-4-3": buildPresetPositions(3, 0, 4, 0, 3),
    "5-3-2": buildPresetPositions(5, 0, 3, 0, 2),
    "5-4-1": buildPresetPositions(5, 0, 4, 0, 1),
    "4-1-3-2": buildPresetPositions(4, 1, 3, 0, 2)
  };
  var FORMATION_NAMES = Object.keys(FORMATION_PRESETS);
  function pickBest11(activeKeys, players_by_id) {
    const activeSlots = [...activeKeys].map((pk) => {
      var _a;
      return { posKey: pk, posId: (_a = TmConst.POSITION_MAP[pk]) == null ? void 0 : _a.id };
    }).filter((s) => s.posId != null);
    const players = Object.values(players_by_id).filter((p2) => {
      var _a;
      return (p2 == null ? void 0 : p2.player_id) && ((_a = p2.allPositionRatings) == null ? void 0 : _a.length);
    });
    const n = activeSlots.length;
    if (!players.length || !n) return {};
    const profit = players.map(
      (p2) => activeSlots.map(({ posId }) => {
        const r = p2.allPositionRatings.find((rt) => rt.id === posId);
        return r ? parseFloat(r.r5) || 0 : 0;
      })
    );
    const m = players.length;
    const maxV = profit.reduce((mx, row) => Math.max(mx, ...row), 0) + 1;
    const getCost = (i, j) => j < n ? maxV - profit[i][j] : 0;
    const INF = 1e15;
    const u = new Float64Array(m + 1);
    const v = new Float64Array(m + 1);
    const p = new Int32Array(m + 1);
    const way = new Int32Array(m + 1);
    for (let i = 1; i <= m; i++) {
      p[0] = i;
      let j0 = 0;
      const minval = new Float64Array(m + 1).fill(INF);
      const used = new Uint8Array(m + 1);
      do {
        used[j0] = 1;
        const i0 = p[j0];
        let delta = INF, j1 = 0;
        for (let j = 1; j <= m; j++) {
          if (!used[j]) {
            const cur = getCost(i0 - 1, j - 1) - u[i0] - v[j];
            if (cur < minval[j]) {
              minval[j] = cur;
              way[j] = j0;
            }
            if (minval[j] < delta) {
              delta = minval[j];
              j1 = j;
            }
          }
        }
        for (let j = 0; j <= m; j++) {
          if (used[j]) {
            u[p[j]] += delta;
            v[j] -= delta;
          } else minval[j] -= delta;
        }
        j0 = j1;
      } while (p[j0] !== 0);
      for (; j0; ) {
        const j1 = way[j0];
        p[j0] = p[j1];
        j0 = j1;
      }
    }
    const result = {};
    for (let j = 1; j <= n; j++) {
      result[activeSlots[j - 1].posKey] = players[p[j] - 1].player_id;
    }
    return result;
  }
  var OUTFIELD_ZONE_DEFS = [
    { keys: FWD_KEYS, max: 3 },
    { keys: OM_KEYS, max: 5 },
    { keys: MID_KEYS, max: 5 },
    { keys: DM_KEYS, max: 5 },
    { keys: DEF_KEYS, max: 5 }
  ];
  function computeAssignmentR5(assignment, players_by_id) {
    var _a;
    let total = 0;
    for (const [posKey, pid] of Object.entries(assignment)) {
      if (!pid) continue;
      const p = players_by_id[String(pid)];
      const posId = (_a = TmConst.POSITION_MAP[posKey]) == null ? void 0 : _a.id;
      if (!(p == null ? void 0 : p.allPositionRatings) || posId == null) continue;
      const r = p.allPositionRatings.find((rt) => rt.id === posId);
      if (r) total += parseFloat(r.r5) || 0;
    }
    return total;
  }
  function findBestR5Formation(players_by_id, gkPid) {
    const outfieldById = {};
    for (const [id, p] of Object.entries(players_by_id)) {
      if (String(p == null ? void 0 : p.player_id) !== String(gkPid)) outfieldById[id] = p;
    }
    let bestR5 = -Infinity;
    let bestAssignment = null;
    function enumerate(zoneIdx, remaining, counts) {
      if (zoneIdx === OUTFIELD_ZONE_DEFS.length) {
        if (remaining !== 0) return;
        const activeKeys = /* @__PURE__ */ new Set();
        for (let i = 0; i < OUTFIELD_ZONE_DEFS.length; i++) {
          if (counts[i] > 0) for (const pk of OUTFIELD_ZONE_DEFS[i].keys[counts[i]] || []) activeKeys.add(pk);
        }
        if (activeKeys.size !== 10) return;
        const assignment = pickBest11(activeKeys, outfieldById);
        if (Object.keys(assignment).length < 10) return;
        const r5 = computeAssignmentR5(assignment, outfieldById);
        if (r5 > bestR5) {
          bestR5 = r5;
          bestAssignment = assignment;
        }
        return;
      }
      const max = Math.min(OUTFIELD_ZONE_DEFS[zoneIdx].max, remaining);
      for (let n = 0; n <= max; n++) {
        counts.push(n);
        enumerate(zoneIdx + 1, remaining - n, counts);
        counts.pop();
      }
    }
    enumerate(0, 10, []);
    return bestAssignment || {};
  }
  function mountTacticsPanel(container, data, initialSettings, opts, lineupApi) {
    const { players_by_id = {} } = data;
    const { getAssignment, getActiveKeys, applyAssignment, subscribe } = lineupApi;
    function refreshStats() {
    }
    subscribe(() => {
    });
    const pickBtn = TmButton.button({
      label: "Pick Best 11",
      color: "primary",
      size: "sm",
      block: true,
      onClick: async () => {
        pickBtn.disabled = true;
        const currentAssignment = getAssignment();
        const currentActiveKeys = new Set(
          Object.keys(currentAssignment).filter(
            (pk) => TmConst.POSITION_MAP[pk] != null && currentAssignment[pk] && String(currentAssignment[pk]) !== "0"
          )
        );
        console.log("Current active keys before picking best 11:", currentActiveKeys);
        const newFBP = pickBest11(currentActiveKeys, players_by_id);
        if (Object.keys(newFBP).length) {
          const usedPids = new Set(Object.values(newFBP).map(String));
          const DEF_POS = /* @__PURE__ */ new Set(["dl", "dcl", "dc", "dcr", "dr"]);
          const MID_POS = /* @__PURE__ */ new Set(["dmc", "dmcl", "dmcr", "mc", "mcl", "mcr", "omc", "omcl", "omcr"]);
          const WING_POS = /* @__PURE__ */ new Set(["dml", "dmr", "ml", "mr", "oml", "omr"]);
          const FWD_POS = /* @__PURE__ */ new Set(["fc", "fcl", "fcr"]);
          const avail = Object.values(players_by_id).filter((p) => (p == null ? void 0 : p.player_id) && !usedPids.has(String(p.player_id))).map((p) => {
            var _a;
            const r5 = ((_a = p.allPositionRatings) == null ? void 0 : _a.length) ? Math.max(0, ...p.allPositionRatings.map((r) => parseFloat(r.r5) || 0)) : parseFloat(p.rec_sort) || 0;
            const favPositions = new Set(
              String(p.favposition || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
            );
            return { pid: p.player_id, favPositions, ratings: p.allPositionRatings || [], r5 };
          }).sort((a, b) => b.r5 - a.r5);
          const pickBestSub = (posSet) => {
            const posIds = new Set(
              [...posSet].map((pk) => {
                var _a;
                return (_a = TmConst.POSITION_MAP[pk]) == null ? void 0 : _a.id;
              }).filter((id) => id != null)
            );
            const hit = avail.find((a) => {
              if (usedPids.has(String(a.pid))) return false;
              if (a.ratings.length) {
                return a.ratings.some((r) => posIds.has(r.id) && (parseFloat(r.r5) || 0) > 0);
              }
              return [...a.favPositions].some((fp) => posSet.has(fp));
            });
            if (!hit) return null;
            usedPids.add(String(hit.pid));
            return hit.pid;
          };
          const newAssignment = { ...newFBP };
          newAssignment.sub1 = pickBestSub(/* @__PURE__ */ new Set(["gk"]));
          newAssignment.sub2 = pickBestSub(DEF_POS);
          newAssignment.sub3 = pickBestSub(MID_POS);
          newAssignment.sub4 = pickBestSub(WING_POS);
          newAssignment.sub5 = pickBestSub(FWD_POS);
          await applyAssignment(newAssignment);
          refreshStats();
        }
        pickBtn.disabled = false;
      }
    });
    container.appendChild(pickBtn);
    const bestFmBtn = TmButton.button({
      label: "Best R5 Formation",
      color: "secondary",
      size: "sm",
      block: true,
      onClick: async () => {
        bestFmBtn.disabled = true;
        const currentAssignment = getAssignment();
        const gkPid = currentAssignment["gk"];
        const newFBP = findBestR5Formation(players_by_id, gkPid);
        if (Object.keys(newFBP).length) {
          if (gkPid) newFBP["gk"] = gkPid;
          const usedPids = new Set(Object.values(newFBP).map(String));
          const DEF_POS = /* @__PURE__ */ new Set(["dl", "dcl", "dc", "dcr", "dr"]);
          const MID_POS = /* @__PURE__ */ new Set(["dmc", "dmcl", "dmcr", "mc", "mcl", "mcr", "omc", "omcl", "omcr"]);
          const WING_POS = /* @__PURE__ */ new Set(["dml", "dmr", "ml", "mr", "oml", "omr"]);
          const FWD_POS = /* @__PURE__ */ new Set(["fc", "fcl", "fcr"]);
          const avail = Object.values(players_by_id).filter((p) => (p == null ? void 0 : p.player_id) && !usedPids.has(String(p.player_id))).map((p) => {
            var _a;
            const r5 = ((_a = p.allPositionRatings) == null ? void 0 : _a.length) ? Math.max(0, ...p.allPositionRatings.map((r) => parseFloat(r.r5) || 0)) : parseFloat(p.rec_sort) || 0;
            const favPositions = new Set(
              String(p.favposition || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
            );
            return { pid: p.player_id, favPositions, ratings: p.allPositionRatings || [], r5 };
          }).sort((a, b) => b.r5 - a.r5);
          const pickBestSub = (posSet) => {
            const posIds = new Set(
              [...posSet].map((pk) => {
                var _a;
                return (_a = TmConst.POSITION_MAP[pk]) == null ? void 0 : _a.id;
              }).filter((id) => id != null)
            );
            const hit = avail.find((a) => {
              if (usedPids.has(String(a.pid))) return false;
              if (a.ratings.length) return a.ratings.some((r) => posIds.has(r.id) && (parseFloat(r.r5) || 0) > 0);
              return [...a.favPositions].some((fp) => posSet.has(fp));
            });
            if (!hit) return null;
            usedPids.add(String(hit.pid));
            return hit.pid;
          };
          newFBP.sub1 = pickBestSub(/* @__PURE__ */ new Set(["gk"]));
          newFBP.sub2 = pickBestSub(DEF_POS);
          newFBP.sub3 = pickBestSub(MID_POS);
          newFBP.sub4 = pickBestSub(WING_POS);
          newFBP.sub5 = pickBestSub(FWD_POS);
          await applyAssignment(newFBP);
          refreshStats();
        }
        bestFmBtn.disabled = false;
      }
    });
    container.appendChild(bestFmBtn);
    const hr = document.createElement("hr");
    hr.className = "tmtc-panel-sep";
    container.appendChild(hr);
    mountTacticsSettings(container, initialSettings, opts, lineupApi);
    return { refreshStats };
  }

  // src/components/shared/tm-section-card.js
  if (!document.getElementById("tm-section-card-style")) {
    const style = document.createElement("style");
    style.id = "tm-section-card-style";
    style.textContent = `
        .tm-section-card-titlebar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: var(--tmu-space-sm);
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
        }
        .tm-section-card-title {
            font-size: var(--tmu-font-lg);
            font-weight: 800;
            color: var(--tmu-text-strong);
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
            letter-spacing: .01em;
        }
    `;
    document.head.appendChild(style);
  }
  var TmSectionCard = {
    mount(container, {
      title = "",
      icon = "",
      titleMode = "head",
      titleBarClass = "tm-section-card-titlebar",
      titleClass = "tm-section-card-title",
      subtitle = "",
      subtitleId = "",
      flush = false,
      cardVariant = "",
      hostClass = "",
      metaClass = "",
      subtitleClass = "",
      beforeBodyHtml = "",
      bodyClass = "",
      bodyId = "",
      bodyHtml = ""
    } = {}) {
      if (!container) return {};
      const hostCls = hostClass ? ` class="${hostClass}"` : "";
      const titleHtml = title && titleMode === "body" ? `<div data-ref="titleBar"${titleBarClass ? ` class="${titleBarClass}"` : ""}><div data-ref="title"${titleClass ? ` class="${titleClass}"` : ""}>${icon ? `${icon} ` : ""}${title}</div></div>` : "";
      const metaHtml = subtitle ? `<div data-ref="meta"${metaClass ? ` class="${metaClass}"` : ""}><div data-ref="subtitle"${subtitleClass ? ` class="${subtitleClass}"` : ""}${subtitleId ? ` id="${subtitleId}"` : ""}>${subtitle}</div></div>` : "";
      return TmUI.render(container, `
            <div${hostCls}>
                <tm-card${titleMode === "head" ? ` data-title="${title}"${icon ? ` data-icon="${icon}"` : ""}` : ""}${flush ? " data-flush" : ""}${cardVariant ? ` data-variant="${cardVariant}"` : ""}>
                    ${titleHtml}
                    ${metaHtml}
                    ${beforeBodyHtml}
                    <div data-ref="body"${bodyClass ? ` class="${bodyClass}"` : ""}${bodyId ? ` id="${bodyId}"` : ""}>${bodyHtml}</div>
                </tm-card>
            </div>
        `);
    }
  };

  // src/components/tactics/tm-tactics-orders.js
  var escHtml2 = (v) => String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var EVENT_LABELS = { 1: "Minute", 2: "Injury", 3: "Yellow Card", 4: "Red Card", 5: "Goal Scored" };
  var CONDITION_LABELS = { 1: "Winning", 2: "Draw", 3: "Losing", 4: "Any" };
  var ORDER_LABELS = { 1: "Substitution", 2: "Change Mentality", 3: "Change Style", 4: "Change Position" };
  var POSITIONS = ["GK", "DC", "DCL", "DCR", "DL", "DR", "DMC", "DMCL", "DMCR", "DML", "DMR", "MC", "MCL", "MCR", "ML", "MR", "OMC", "OMCL", "OMCR", "OML", "OMR", "FC", "FCL", "FCR"];
  var SUB_ROLES = ["sub1", "sub2", "sub3", "sub4", "sub5"];
  function actionCell(typeLabel, value) {
    if (!typeLabel) return '<span style="color:var(--tmu-text-disabled)">\u2014</span>';
    return `<div class="tmtc-order-action-cell">
        <span class="tmtc-order-action-type">${escHtml2(typeLabel)}</span>
        ${value ? `<span class="tmtc-order-action-val">${escHtml2(String(value))}</span>` : ""}
    </div>`;
  }
  function eventPar(eventId, parVal, players_by_id) {
    if (Number(eventId) === 1) return parVal ? `${parVal}'` : "";
    if (Number(eventId) === 5) return "";
    const p = players_by_id == null ? void 0 : players_by_id[parVal];
    return p ? p.lastname || p.name || String(parVal) : parVal ? "Any Player" : "";
  }
  function orderPar(orderId, par1, par2, par3, players_by_id) {
    if (Number(orderId) === 2) return MENTALITY_MAP_LONG[Number(par1)] || (par1 ? String(par1) : "");
    if (Number(orderId) === 3) return STYLE_MAP[Number(par1)] || (par1 ? String(par1) : "");
    const parts = [];
    const p2 = players_by_id == null ? void 0 : players_by_id[par2];
    if (p2) parts.push(p2.lastname || p2.name || "");
    const p1 = players_by_id == null ? void 0 : players_by_id[par1];
    if (p1) parts.push("\u2192 " + (p1.lastname || p1.name || ""));
    if (par3) parts.push(String(par3).toUpperCase());
    return parts.join(" ");
  }
  function showOrderDialog(co, data, opts, onSaved) {
    const { reserves, national, miniGameId } = opts;
    const players_by_id = data.players_by_id || {};
    const formation_by_pos = data.formation_by_pos || {};
    const formation_assoc = data.formation_assoc || {};
    const activePositions = [...new Set(Object.keys(formation_by_pos).map((pos) => String(pos || "").toUpperCase()).filter((pos) => POSITIONS.includes(pos)))];
    const positionOptions = activePositions.length ? activePositions.sort((a, b) => POSITIONS.indexOf(a) - POSITIONS.indexOf(b)) : POSITIONS;
    const fieldPlayers = Object.values(formation_by_pos).filter(Boolean).map(String).map((pid) => players_by_id[pid]).filter(Boolean);
    const benchPlayers = SUB_ROLES.map((r) => formation_assoc[r]).filter(Boolean).map(String).map((pid) => players_by_id[pid]).filter(Boolean);
    const state = {
      COND_ORDER_NUM: co.COND_ORDER_NUM,
      EVENT_ID: Number(co.EVENT_ID) || 0,
      EVENT_PAR: co.EVENT_PAR || 0,
      COND_ID: Number(co.COND_ID) || 0,
      COND_PAR: co.COND_PAR || 0,
      ORDER_ID: Number(co.ORDER_ID) || 0,
      ORDER_PAR1: co.ORDER_PAR1 || 0,
      ORDER_PAR2: co.ORDER_PAR2 || 0,
      ORDER_PAR3: co.ORDER_PAR3 || ""
    };
    const getFieldPositionForPlayer = (pid) => {
      var _a, _b;
      return ((_b = (_a = Object.entries(formation_by_pos).find(([, playerId]) => String(playerId) === String(pid))) == null ? void 0 : _a[0]) == null ? void 0 : _b.toLowerCase()) || "";
    };
    let destroy;
    function pickBtn(label, isActive, onPick, container) {
      const btn = TmButton.button({
        label: String(label),
        color: "primary",
        size: "xs",
        active: isActive,
        onClick: () => {
          container.querySelectorAll(".tmu-btn").forEach((b) => b.classList.remove("tmu-btn-active"));
          btn.classList.add("tmu-btn-active");
          onPick();
        }
      });
      return btn;
    }
    function chipGroup(map, getKey, onPick) {
      const el = document.createElement("div");
      el.className = "tmtc-co-chips";
      for (const [id, label] of Object.entries(map)) {
        el.appendChild(pickBtn(label, getKey() === Number(id), () => onPick(Number(id)), el));
      }
      return el;
    }
    function playerGroup(players, getCurrent, onPick, allowAny = false) {
      const el = document.createElement("div");
      el.className = "tmtc-co-chips";
      const mkBtn = (label, pid) => el.appendChild(pickBtn(label, getCurrent() == pid, () => onPick(pid), el));
      if (allowAny) mkBtn("Any Player", 0);
      players.forEach((p) => mkBtn(p.lastname || p.name || p.player_id, p.player_id));
      return el;
    }
    function positionGroup(getCurrent, onPick, options = positionOptions) {
      const el = document.createElement("div");
      el.className = "tmtc-co-chips";
      options.forEach((pos) => el.appendChild(
        pickBtn(pos, getCurrent() === pos.toLowerCase(), () => onPick(pos.toLowerCase()), el)
      ));
      return el;
    }
    function minuteGroup() {
      const el = document.createElement("div");
      el.className = "tmtc-co-chips";
      for (let m = 5; m <= 120; m += 5) {
        el.appendChild(pickBtn(`${m}'`, state.EVENT_PAR == m, () => {
          state.EVENT_PAR = m;
        }, el));
      }
      return el;
    }
    function goalDiffGroup(getCurrent, onPick) {
      const el = document.createElement("div");
      el.className = "tmtc-co-chips";
      for (let g = 1; g <= 5; g++) {
        el.appendChild(pickBtn(g, getCurrent() == g, () => onPick(g), el));
      }
      return el;
    }
    function lbl(text) {
      const el = document.createElement("div");
      el.className = "tmtc-co-param-label";
      el.textContent = text;
      return el;
    }
    function renderOrderSub(id) {
      if (id === 1) {
        const w = document.createElement("div");
        w.appendChild(lbl("Player out:"));
        w.appendChild(playerGroup(fieldPlayers, () => state.ORDER_PAR1, (v) => {
          state.ORDER_PAR1 = v;
          if (!state.ORDER_PAR3) state.ORDER_PAR3 = getFieldPositionForPlayer(v);
        }));
        w.appendChild(lbl("Player in:"));
        w.appendChild(playerGroup(benchPlayers, () => state.ORDER_PAR2, (v) => {
          state.ORDER_PAR2 = v;
        }));
        w.appendChild(lbl("Position:"));
        w.appendChild(positionGroup(() => state.ORDER_PAR3, (v) => {
          state.ORDER_PAR3 = v;
        }));
        return w;
      }
      if (id === 2) return chipGroup(MENTALITY_MAP_LONG, () => state.ORDER_PAR1, (v) => {
        state.ORDER_PAR1 = v;
      });
      if (id === 3) return chipGroup(STYLE_MAP, () => state.ORDER_PAR1, (v) => {
        state.ORDER_PAR1 = v;
      });
      if (id === 4) {
        const w = document.createElement("div");
        w.appendChild(lbl("Player:"));
        w.appendChild(playerGroup(fieldPlayers, () => state.ORDER_PAR1, (v) => {
          state.ORDER_PAR1 = v;
        }));
        w.appendChild(lbl("New position:"));
        w.appendChild(positionGroup(() => state.ORDER_PAR3, (v) => {
          state.ORDER_PAR3 = v;
        }, POSITIONS));
        return w;
      }
      return null;
    }
    function radioSection(header, map, getVal, onSelect, buildSub) {
      const col = document.createElement("div");
      col.className = "tmtc-co-col";
      col.appendChild(Object.assign(document.createElement("div"), { className: "tmtc-co-col-label", textContent: header }));
      const groupName = "tmtc-co-rg-" + Math.random().toString(36).slice(2);
      const entries = Object.entries(map);
      const itemEls = [];
      for (const [id, label] of entries) {
        const numId = Number(id);
        const isSelected = getVal() === numId;
        const item = document.createElement("div");
        item.className = "tmtc-co-radio-item" + (isSelected ? " selected" : "");
        const lbl2 = document.createElement("label");
        lbl2.className = "tmtc-co-radio-row";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = groupName;
        radio.className = "tmtc-co-radio-input";
        radio.checked = isSelected;
        lbl2.appendChild(radio);
        lbl2.appendChild(Object.assign(document.createElement("span"), { className: "tmtc-co-radio-txt", textContent: label }));
        item.appendChild(lbl2);
        const sub = document.createElement("div");
        sub.className = "tmtc-co-radio-sub";
        if (isSelected) {
          const built = buildSub(numId);
          if (built) sub.appendChild(built);
        }
        item.appendChild(sub);
        radio.addEventListener("change", () => {
          if (!radio.checked) return;
          onSelect(numId);
          itemEls.forEach((el, i) => {
            const isNow = Number(entries[i][0]) === numId;
            el.classList.toggle("selected", isNow);
            const elSub = el.querySelector(".tmtc-co-radio-sub");
            elSub.innerHTML = "";
            if (isNow) {
              const built = buildSub(numId);
              if (built) elSub.appendChild(built);
            }
          });
        });
        col.appendChild(item);
        itemEls.push(item);
      }
      return col;
    }
    function render() {
      const content = document.createElement("div");
      const body = document.createElement("div");
      body.className = "tmtc-co-dialog-body";
      body.appendChild(radioSection(
        "When",
        EVENT_LABELS,
        () => state.EVENT_ID,
        (v) => {
          state.EVENT_ID = v;
          state.EVENT_PAR = 0;
        },
        (id) => {
          if (id === 1) {
            const w = document.createElement("div");
            w.appendChild(lbl("Minute:"));
            w.appendChild(minuteGroup());
            return w;
          }
          if (id === 2 || id === 3 || id === 4) {
            const w = document.createElement("div");
            w.appendChild(lbl("Player:"));
            w.appendChild(playerGroup(fieldPlayers, () => state.EVENT_PAR, (v) => {
              state.EVENT_PAR = v;
            }, true));
            return w;
          }
          return null;
        }
      ));
      body.appendChild(radioSection(
        "If score is",
        CONDITION_LABELS,
        () => state.COND_ID,
        (v) => {
          state.COND_ID = v;
          state.COND_PAR = 0;
        },
        (id) => {
          if (id === 1) {
            const w = document.createElement("div");
            w.appendChild(lbl("Winning by:"));
            w.appendChild(goalDiffGroup(() => state.COND_PAR, (v) => {
              state.COND_PAR = v;
            }));
            return w;
          }
          if (id === 3) {
            const w = document.createElement("div");
            w.appendChild(lbl("Losing by:"));
            w.appendChild(goalDiffGroup(() => state.COND_PAR, (v) => {
              state.COND_PAR = v;
            }));
            return w;
          }
          return null;
        }
      ));
      body.appendChild(radioSection(
        "Then",
        ORDER_LABELS,
        () => state.ORDER_ID,
        (v) => {
          state.ORDER_ID = v;
          state.ORDER_PAR1 = 0;
          state.ORDER_PAR2 = 0;
          state.ORDER_PAR3 = "";
        },
        renderOrderSub
      ));
      content.appendChild(body);
      const footer = document.createElement("div");
      footer.className = "tmtc-co-modal-footer";
      footer.appendChild(TmButton.button({ label: "Save", color: "primary", size: "sm", onClick: save }));
      footer.appendChild(TmButton.button({
        label: "Clear",
        color: "danger",
        size: "sm",
        onClick: () => {
          state.EVENT_ID = 0;
          state.EVENT_PAR = 0;
          state.COND_ID = 0;
          state.COND_PAR = 0;
          state.ORDER_ID = 0;
          state.ORDER_PAR1 = 0;
          state.ORDER_PAR2 = 0;
          state.ORDER_PAR3 = "";
          save();
        }
      }));
      content.appendChild(footer);
      const handle = TmModal.open({
        title: `Conditional Order #${Number(co.COND_ORDER_NUM) + 1}`,
        contentEl: content,
        maxWidth: "min(900px, 96vw)"
      });
      destroy = handle.destroy;
    }
    async function save() {
      const orderPar3 = state.ORDER_ID === 1 && !state.ORDER_PAR3 ? getFieldPositionForPlayer(state.ORDER_PAR1) : state.ORDER_PAR3;
      const payload = new URLSearchParams({
        COND_ORDER_NUM: state.COND_ORDER_NUM,
        EVENT_ID: state.EVENT_ID || 0,
        EVENT_PAR: state.EVENT_PAR || 0,
        COND_ID: state.COND_ID || 0,
        COND_PAR: state.COND_PAR || 0,
        ORDER_ID: state.ORDER_ID || 0,
        ORDER_PAR1: state.ORDER_PAR1 || 0,
        ORDER_PAR2: state.ORDER_PAR2 || 0,
        ORDER_PAR3: orderPar3 || 0,
        reserves,
        national,
        miniGameId
      });
      try {
        await fetch("/ajax/tactics_co_post.ajax.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload
        });
      } catch (e) {
        console.error("[tactics] co save failed", e);
      }
      destroy();
      onSaved == null ? void 0 : onSaved();
    }
    render();
  }
  async function mountTacticsOrders(container, data, opts = {}) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;
    const players_by_id = data.players_by_id || {};
    const refs = TmSectionCard.mount(container, {
      flush: true,
      cardVariant: "soft"
    });
    const body = refs.body;
    body.innerHTML = TmUI.loading();
    const $ = window.jQuery;
    if (!$) {
      body.innerHTML = TmUI.error("jQuery not available.");
      return;
    }
    const load = async () => {
      body.innerHTML = "";
      const raw = await new Promise((resolve) => {
        $.post("/ajax/tactics_co_get.ajax.php", { get: "cond_orders", reserves, national, miniGameId }, (d) => resolve(d), "json").fail(() => resolve(null));
      });
      if (!raw) {
        body.innerHTML = TmUI.error("Could not load conditional orders.");
        return;
      }
      const items = Object.values(raw).map((co) => {
        const eventId = Number(co.EVENT_ID);
        const condId = Number(co.COND_ID);
        const ordId = Number(co.ORDER_ID);
        return {
          num: Number(co.COND_ORDER_NUM) + 1,
          _raw: co,
          event: EVENT_LABELS[eventId] || "",
          eventPar: eventPar(eventId, co.EVENT_PAR, players_by_id),
          condition: CONDITION_LABELS[condId] || "",
          condPar: co.COND_PAR ? String(co.COND_PAR) : "",
          order: ORDER_LABELS[ordId] || "",
          orderPar: orderPar(ordId, co.ORDER_PAR1, co.ORDER_PAR2, co.ORDER_PAR3, players_by_id),
          _empty: !eventId && !condId && !ordId
        };
      });
      const tbl = TmTable.table({
        items,
        sortKey: "num",
        sortDir: 1,
        density: "tight",
        rowCls: (o) => o._empty ? "tmtc-co-row-empty" : "",
        onRowClick: (o) => showOrderDialog(o._raw, data, { reserves, national, miniGameId }, load),
        headers: [
          { key: "num", label: "#", align: "c", width: "28px", sortable: false },
          { key: "event", label: "Event", sortable: false, render: (v, o) => actionCell(v, o.eventPar) },
          { key: "condition", label: "Score", sortable: false, render: (v, o) => actionCell(v, o.condPar) },
          { key: "order", label: "Order", sortable: false, render: (v, o) => actionCell(v, o.orderPar) }
        ]
      });
      body.appendChild(tbl);
      let dragSrcNum = null;
      const rows = tbl.querySelectorAll("tbody tr[data-ri]");
      rows.forEach((tr) => {
        const idx = Number(tr.dataset.ri);
        const item = items[idx];
        if (!item) return;
        tr.draggable = true;
        tr.addEventListener("dragstart", (e) => {
          dragSrcNum = item._raw.COND_ORDER_NUM;
          e.dataTransfer.effectAllowed = "move";
          tr.classList.add("tmtc-co-row-dragging");
        });
        tr.addEventListener("dragend", () => {
          tr.classList.remove("tmtc-co-row-dragging");
          rows.forEach((r) => r.classList.remove("tmtc-co-row-drag-over"));
        });
        tr.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          rows.forEach((r) => r.classList.remove("tmtc-co-row-drag-over"));
          tr.classList.add("tmtc-co-row-drag-over");
        });
        tr.addEventListener("dragleave", () => tr.classList.remove("tmtc-co-row-drag-over"));
        tr.addEventListener("drop", async (e) => {
          var _a;
          e.preventDefault();
          tr.classList.remove("tmtc-co-row-drag-over");
          const dropNum = item._raw.COND_ORDER_NUM;
          if (dragSrcNum == null || dragSrcNum === dropNum) return;
          const srcRaw = (_a = items.find((i) => i._raw.COND_ORDER_NUM === dragSrcNum)) == null ? void 0 : _a._raw;
          const dstRaw = item._raw;
          if (!srcRaw) return;
          body.innerHTML = TmUI.loading();
          const postOrder = (raw2, newNum) => fetch("/ajax/tactics_co_post.ajax.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              COND_ORDER_NUM: newNum,
              EVENT_ID: raw2.EVENT_ID || 0,
              EVENT_PAR: raw2.EVENT_PAR || 0,
              COND_ID: raw2.COND_ID || 0,
              COND_PAR: raw2.COND_PAR || 0,
              ORDER_ID: raw2.ORDER_ID || 0,
              ORDER_PAR1: raw2.ORDER_PAR1 || 0,
              ORDER_PAR2: raw2.ORDER_PAR2 || 0,
              ORDER_PAR3: raw2.ORDER_PAR3 || 0,
              reserves,
              national,
              miniGameId
            })
          });
          try {
            await Promise.all([postOrder(srcRaw, dropNum), postOrder(dstRaw, dragSrcNum)]);
          } catch (err) {
            console.error("[tactics] co swap failed", err);
          }
          await load();
        });
      });
    };
    await load();
  }

  // src/pages/tactics.js
  var mountedMain = null;
  var mountedPath = "";
  function getBTeamClubId() {
    var _a;
    return String(((_a = window.SESSION) == null ? void 0 : _a.b_team) || "").trim();
  }
  function hasReservesTeam() {
    return Boolean(getBTeamClubId());
  }
  function getTacticsTeamMode(pathname = window.location.pathname) {
    return /^\/tactics\/reserves\/?$/i.test(pathname) ? "reserves" : "first-team";
  }
  function getTacticsRoute(pathname = window.location.pathname, teamMode = getTacticsTeamMode(pathname)) {
    return teamMode === "reserves" ? "/tactics/reserves/" : "/tactics/";
  }
  function captureNativeSettings() {
    const getVal = (id) => {
      var _a;
      return parseInt(((_a = document.getElementById(id)) == null ? void 0 : _a.value) || "0", 10) || 0;
    };
    return {
      mentality: getVal("mentality_select"),
      style: getVal("attacking_select"),
      focus: getVal("focus_side_select")
    };
  }
  async function fetchTacticsData(reserves, national, miniGameId) {
    const body = new URLSearchParams({ reserves, national, miniGameId }).toString();
    const res = await fetch("/ajax/tactics_get.ajax.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body
    });
    if (!res.ok) throw new Error(`tactics_get failed: ${res.status}`);
    return res.json();
  }
  async function initTacticsPage(main) {
    var _a, _b, _c, _d;
    if (!/^\/tactics(?:\/reserves)?\/?$/i.test(window.location.pathname)) return;
    if (!main || !main.isConnected) return;
    if (mountedMain === main && mountedPath === window.location.pathname && ((_a = main.querySelector(".tmtc-page")) == null ? void 0 : _a.isConnected)) return;
    mountedMain = main;
    mountedPath = window.location.pathname;
    const teamMode = getTacticsTeamMode(window.location.pathname);
    const bTeamClubId = getBTeamClubId();
    const showReserves = hasReservesTeam();
    if (teamMode === "reserves" && !showReserves) {
      window.location.assign("/tactics/");
      return;
    }
    const reserves = teamMode === "reserves" ? 1 : 0;
    const national = Number((_b = window.national) != null ? _b : 0);
    const miniGameId = Number((_c = window.miniGameId) != null ? _c : 0);
    const initialSettings = captureNativeSettings();
    injectTmPageLayoutStyles();
    injectTacticsStyles();
    main.classList.add("tmtc-page");
    main.replaceChildren();
    const host = document.createElement("section");
    host.className = "tmu-page-section-stack";
    main.appendChild(host);
    host.innerHTML = TmUI.loading();
    let rawData;
    try {
      rawData = await fetchTacticsData(reserves, national, miniGameId);
    } catch (err) {
      host.innerHTML = TmUI.error((err == null ? void 0 : err.message) || "Failed to load tactics data.");
      return;
    }
    if (!rawData) {
      host.innerHTML = TmUI.error("No tactics data returned from server.");
      return;
    }
    const players = rawData.players || {};
    const players_by_id = {};
    for (const p of Object.values(players)) {
      if (p == null ? void 0 : p.player_id) players_by_id[p.player_id] = p;
    }
    const data = {
      players,
      players_by_id,
      formation: rawData.formation || {},
      formation_by_pos: rawData.formation_by_pos || {},
      formation_subs: rawData.formation_subs || {},
      formation_assoc: rawData.formation_assoc || {},
      positions: rawData.positions || []
    };
    const opts = { reserves, national, miniGameId };
    host.innerHTML = "";
    const topBar = document.createElement("div");
    topBar.className = "tmtc-topbar";
    topBar.innerHTML = `
        <div class="tmtc-topbar-copy">
            <div class="tmu-kicker">Tactics</div>
            <div class="tmtc-topbar-title">${teamMode === "reserves" ? "Reserves" : "First Team"}</div>
        </div>
    `;
    topBar.appendChild(TmUI.tabs({
      items: [
        { key: "first-team", label: "First Team" },
        ...showReserves ? [{ key: "reserves", label: "Reserves" }] : []
      ],
      active: teamMode,
      onChange: (nextMode) => {
        const nextPath = getTacticsRoute(window.location.pathname, nextMode);
        if (nextPath === window.location.pathname) return;
        window.location.assign(nextPath);
      }
    }));
    host.appendChild(topBar);
    const mainGrid = document.createElement("div");
    mainGrid.className = "tmtc-main-grid";
    host.appendChild(mainGrid);
    const leftPanel = document.createElement("div");
    leftPanel.className = "tmtc-main-left";
    const midPanel = document.createElement("div");
    midPanel.className = "tmtc-main-mid";
    const statsPanel = document.createElement("div");
    statsPanel.className = "tmtc-main-stats";
    const rightPanel = document.createElement("div");
    rightPanel.className = "tmtc-main-right";
    mainGrid.appendChild(leftPanel);
    mainGrid.appendChild(midPanel);
    mainGrid.appendChild(statsPanel);
    mainGrid.appendChild(rightPanel);
    const lineupApi = mountTacticsLineup(leftPanel, data, { ...opts, squadContainer: midPanel });
    const panelApi = mountTacticsPanel(statsPanel, data, initialSettings, opts, lineupApi);
    mountTacticsOrders(rightPanel, data, opts);
    const clubId = teamMode === "reserves" ? bTeamClubId : String(((_d = window.SESSION) == null ? void 0 : _d.main_id) || "");
    if (clubId) {
      await TmPlayerDB.init();
      TmClubService.fetchSquadRaw(clubId, { skipSync: true }).then((data2) => {
        var _a2;
        if (!((_a2 = data2 == null ? void 0 : data2.post) == null ? void 0 : _a2.length)) return;
        for (const sp of data2.post) {
          const pid = String(sp.id || sp.player_id || "");
          if (!pid) continue;
          const existing = players_by_id[pid];
          if (existing) {
            existing.allPositionRatings = sp.allPositionRatings;
            existing.routine = sp.routine;
            existing.favposition = sp.favposition;
          } else {
            players_by_id[pid] = sp;
          }
        }
        lineupApi.refresh();
        panelApi.refreshStats();
      }).catch(() => {
      });
    }
  }
})();
