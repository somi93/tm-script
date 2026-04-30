(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/components/shared/tm-button.js
  var STYLE_ID = "tmu-button-style";
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
.tmu-btn-primary:hover:not(:disabled)   { background: var(--tmu-color-primary); }
.tmu-btn-secondary { background: var(--tmu-color-surface) !important; color: var(--tmu-text-panel-label); border: none !important; }
.tmu-btn-secondary:hover:not(:disabled) { background: var(--tmu-surface-item-hover) !important; color: var(--tmu-text-strong); border: none !important; }
.tmu-btn-danger    { background: var(--tmu-danger-fill); color: var(--tmu-danger); }
.tmu-btn-danger:hover:not(:disabled)    { background: var(--tmu-border-danger); color: var(--tmu-text-inverse); }
.tmu-btn-lime      { background: var(--tmu-success-fill); color: var(--tmu-text-accent-soft); display: flex; align-items: center; justify-content: center; gap: var(--tmu-space-sm); }
.tmu-btn-lime:hover:not(:disabled)      { background: var(--tmu-color-primary); color: var(--tmu-text-inverse); }
.tmu-btn-active { background: var(--tmu-color-primary) !important; }
`;
  function injectTmButtonCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
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
      if (checked) {
        input.checked = true;
        input.setAttribute("checked", "");
      }
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
  var STYLE_ID2 = "tm-notice-style";
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
      if (document.getElementById(STYLE_ID2)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID2}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID2;
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
.tmu-card { background: var(--tmu-card-bg, radial-gradient(circle at top left, var(--tmu-success-fill-faint), transparent 42%), linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-dark-muted) 100%)); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-md); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: var(--tmu-space-md); box-shadow: 0 14px 30px var(--tmu-shadow-elev); }
.tmu-card.tmu-card-variant-soft { background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft-alpha-strong); border-radius: var(--tmu-space-lg); box-shadow: none; }
.tmu-card.tmu-card-variant-sidebar { margin-bottom: var(--tmu-space-xl); }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body { padding: var(--tmu-space-lg) var(--tmu-space-lg); gap: var(--tmu-space-lg); }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body.tmu-card-body-flush { padding: 0; gap: 0; }
.tmu-card.tmu-card-variant-embedded { margin-bottom: 0; background: var(--tmu-surface-embedded); box-shadow: none; color: var(--tmu-text-main); }
.tmu-card.tmu-card-variant-embedded .tmu-card-body,
.tmu-card.tmu-card-variant-embedded .tmu-card-body.tmu-card-body-flush { padding: 0; gap: 0; }
.tmu-card.tmu-card-variant-flatpanel { background: var(--tmu-surface-dark-strong); border: 1px solid var(--tmu-border-soft-alpha); border-radius: var(--tmu-space-md); box-shadow: none; margin-bottom: 0; }
.tmu-card.tmu-card-variant-flatpanel .tmu-card-head { background: none; border-bottom: 1px solid var(--tmu-border-soft-alpha); }
.tmu-card-head { font-size: var(--tmu-font-md); font-weight: 800; color: var(--tmu-text-strong); text-transform: none; letter-spacing: 0.02em; padding: 0 var(--tmu-space-lg); min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft-alpha); background: var(--tmu-card-head-bg, linear-gradient(180deg, var(--tmu-success-fill-soft), var(--tmu-success-fill-faint))); }
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
    { name: "Strength", key: "strength", isGK: true, isOutfield: true, category: "Physical", id: 0, color: "#22cc22" },
    { name: "Stamina", key: "stamina", isGK: true, isOutfield: true, category: "Physical", id: 1, color: "#00bcd4" },
    { name: "Pace", key: "pace", isGK: true, isOutfield: true, category: "Physical", id: 2, color: "#8bc34a" },
    // outfield-only (indices 3-13 after filter)
    { name: "Marking", key: "marking", isOutfield: true, category: "Tactical", id: 3, color: "#f44336" },
    { name: "Tackling", key: "tackling", isOutfield: true, category: "Tactical", id: 4, color: "#26a69a" },
    { name: "Workrate", key: "workrate", isOutfield: true, category: "Tactical", id: 5, color: "#3f51b5" },
    { name: "Positioning", key: "positioning", isOutfield: true, category: "Tactical", id: 6, color: "#9c27b0" },
    { name: "Passing", key: "passing", isOutfield: true, category: "Technical", id: 7, color: "#e91e63" },
    { name: "Crossing", key: "crossing", isOutfield: true, category: "Technical", id: 8, color: "#2196f3" },
    { name: "Technique", key: "technique", isOutfield: true, category: "Technical", id: 9, color: "#ff4081" },
    { name: "Heading", key: "heading", isOutfield: true, category: "Physical", id: 10, color: "#757575" },
    { name: "Finishing", key: "finishing", isOutfield: true, category: "Technical", id: 11, color: "#4caf50" },
    { name: "Longshots", key: "longshots", isOutfield: true, category: "Technical", id: 12, color: "#00e5ff" },
    { name: "Set Pieces", key: "set_pieces", isOutfield: true, category: "Technical", id: 13, color: "#607d8b" },
    // GK-only (indices 3-10 after filter)
    { name: "Handling", key: "handling", isGK: true, category: "Technical", id: 3, color: "#f44336" },
    { name: "One on ones", key: "oneonones", isGK: true, category: "Tactical", key2: "one_on_ones", id: 4, color: "#26a69a" },
    { name: "Reflexes", key: "reflexes", isGK: true, category: "Technical", id: 5, color: "#3f51b5" },
    { name: "Aerial Ability", key: "arialability", isGK: true, category: "Tactical", key2: "aerial_ability", id: 6, color: "#9c27b0" },
    { name: "Jumping", key: "jumping", isGK: true, category: "Physical", id: 7, color: "#e91e63" },
    { name: "Communication", key: "communication", isGK: true, category: "Tactical", id: 8, color: "#2196f3" },
    { name: "Kicking", key: "kicking", isGK: true, category: "Technical", id: 9, color: "#ff4081" },
    { name: "Throwing", key: "throwing", isGK: true, category: "Technical", id: 10, color: "#757575" }
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
    POSKEY_TO_ZONE: () => POSKEY_TO_ZONE,
    SPECIAL_SLOTS: () => SPECIAL_SLOTS,
    WAGE_RATE: () => WAGE_RATE
  });
  var POSITION_MAP = {
    gk: { id: 9, position: "GK", main: true, row: 0, col: 2, ordering: 0, section: "gk", color: "var(--tmu-success-strong)" },
    dl: { id: 1, position: "DL", main: true, row: 1, col: 0, ordering: 2, section: "def", color: "var(--tmu-info-dark)" },
    dcl: { id: 0, position: "DCL", main: false, row: 1, col: 1, ordering: 1, section: "def", color: "var(--tmu-info-dark)" },
    dc: { id: 0, position: "DC", main: true, row: 1, col: 2, ordering: 1, section: "def", color: "var(--tmu-info-dark)" },
    dcr: { id: 0, position: "DCR", main: false, row: 1, col: 3, ordering: 1, section: "def", color: "var(--tmu-info-dark)" },
    dr: { id: 1, position: "DR", main: true, row: 1, col: 4, ordering: 2, section: "def", color: "var(--tmu-info-dark)" },
    dml: { id: 3, position: "DML", main: true, row: 2, col: 0, ordering: 4, section: "wing", color: "var(--tmu-warning)" },
    dmcl: { id: 2, position: "DMCL", main: false, row: 2, col: 1, ordering: 3, section: "mid", color: "var(--tmu-warning)" },
    dmc: { id: 2, position: "DMC", main: true, row: 2, col: 2, ordering: 3, section: "mid", color: "var(--tmu-warning)" },
    dmcr: { id: 2, position: "DMCR", main: false, row: 2, col: 3, ordering: 3, section: "mid", color: "var(--tmu-warning)" },
    dmr: { id: 3, position: "DMR", main: true, row: 2, col: 4, ordering: 4, section: "wing", color: "var(--tmu-warning)" },
    ml: { id: 5, position: "ML", main: true, row: 3, col: 0, ordering: 6, section: "wing", color: "var(--tmu-warning)" },
    mcl: { id: 4, position: "MCL", main: false, row: 3, col: 1, ordering: 5, section: "mid", color: "var(--tmu-warning)" },
    mc: { id: 4, position: "MC", main: true, row: 3, col: 2, ordering: 5, section: "mid", color: "var(--tmu-warning)" },
    mcr: { id: 4, position: "MCR", main: false, row: 3, col: 3, ordering: 5, section: "mid", color: "var(--tmu-warning)" },
    mr: { id: 5, position: "MR", main: true, row: 3, col: 4, ordering: 6, section: "wing", color: "var(--tmu-warning)" },
    oml: { id: 7, position: "OML", main: true, row: 4, col: 0, ordering: 7, section: "wing", color: "var(--tmu-warning-soft)" },
    omcl: { id: 6, position: "OMCL", main: false, row: 4, col: 1, ordering: 8, section: "mid", color: "var(--tmu-warning-soft)" },
    omc: { id: 6, position: "OMC", main: true, row: 4, col: 2, ordering: 8, section: "mid", color: "var(--tmu-warning-soft)" },
    omcr: { id: 6, position: "OMCR", main: false, row: 4, col: 3, ordering: 8, section: "mid", color: "var(--tmu-warning-soft)" },
    omr: { id: 7, position: "OMR", main: true, row: 4, col: 4, ordering: 7, section: "wing", color: "var(--tmu-warning-soft)" },
    fcl: { id: 8, position: "FCL", main: false, row: 5, col: 1, ordering: 9, section: "fwd", color: "var(--tmu-danger-deep)" },
    fc: { id: 8, position: "FC", main: true, row: 5, col: 2, ordering: 9, section: "fwd", color: "var(--tmu-danger-deep)" },
    fcr: { id: 8, position: "FCR", main: false, row: 5, col: 3, ordering: 9, section: "fwd", color: "var(--tmu-danger-deep)" }
  };
  var FIELD_ZONES = [
    { key: "fwd", row: 5, cols: [null, "fcl", "fc", "fcr", null] },
    { key: "om", row: 4, cols: ["oml", "omcl", "omc", "omcr", "omr"] },
    { key: "mid", row: 3, cols: ["ml", "mcl", "mc", "mcr", "mr"] },
    { key: "dm", row: 2, cols: ["dml", "dmcl", "dmc", "dmcr", "dmr"] },
    { key: "def", row: 1, cols: ["dl", "dcl", "dc", "dcr", "dr"] },
    { key: "gk", row: 0, cols: [null, null, "gk", null, null] }
  ];
  var POSKEY_TO_ZONE = Object.fromEntries(
    FIELD_ZONES.flatMap((z) => z.cols.filter(Boolean).map((pk) => [pk, z.key]))
  );
  var BENCH_SLOTS = ["sub1", "sub2", "sub3", "sub4", "sub5"];
  var SPECIAL_SLOTS = ["captain", "corner", "penalty", "freekick"];
  var BENCH_LABELS = {
    sub1: "GK",
    sub2: "DEF",
    sub3: "MID",
    sub4: "Wing",
    sub5: "FWD",
    captain: "Captain",
    corner: "Corners",
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
    TRAINING_CUSTOM: () => TRAINING_CUSTOM,
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
  var TRAINING_CUSTOM = [
    { label: "Strength/Workrate/Stamina", color: "var(--tmu-success)" },
    { label: "Marking/Tackling", color: "var(--tmu-info-strong)" },
    { label: "Crossing/Pace", color: "var(--tmu-warning)" },
    { label: "Passing/Technique/Set Pieces", color: "var(--tmu-warning-soft)" },
    { label: "Heading/Positioning", color: "var(--tmu-purple)" },
    { label: "Finishing/Long Shots", color: "var(--tmu-danger)" }
  ];
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
    },
    /**
     * Mood penalty for placing a player in a given posKey.
     * Returns 0-4 (0 = natural position, 4 = maximum unhappiness).
     */
    moodPenalty(player, posKey) {
      var _a, _b;
      const LINE_PEN = {
        1: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
        2: { 1: 1, 2: 0, 3: 1, 4: 2, 5: 3 },
        3: { 1: 2, 2: 1, 3: 0, 4: 1, 5: 2 },
        4: { 1: 3, 2: 2, 3: 1, 4: 0, 5: 1 },
        5: { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 }
      };
      const placed = MAP[String(posKey || "").toLowerCase()];
      if (!placed) return 0;
      const favs = Array.isArray(player == null ? void 0 : player.positions) ? player.positions.filter((p) => p.preferred) : [];
      if (!favs.length) return 0;
      if (placed.row === 0) return favs.some((p) => p.row === 0) ? 0 : 4;
      if (favs.some((p) => p.row === 0)) return 4;
      const side = (c) => c === 0 ? "L" : c === 4 ? "R" : "C";
      const ps = side(placed.col);
      let best = 4;
      for (const fav of favs) {
        const fs = side(fav.col);
        let pen = fs !== ps ? fs === "C" || ps === "C" ? 2 : 1 : 0;
        pen += (_b = (_a = LINE_PEN[placed.row]) == null ? void 0 : _a[fav.row]) != null ? _b : 4;
        best = Math.min(best, Math.min(pen, 4));
      }
      return best;
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
  var formatR5 = (v, fallback = "-") => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : fallback;
  };
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
  var extractFaceUrl = (appearance, fallback = null) => {
    var _a;
    const src = ((_a = String(appearance || "").match(/src=['"]([^'"]+)['"]/i)) == null ? void 0 : _a[1]) || fallback;
    if (!src) return null;
    return String(src).replace(/([?&])w=\d+(&?)/i, (_match, prefix, suffix) => {
      if (prefix === "?" && suffix) return "?";
      return suffix ? prefix : "";
    }).replace(/[?&]$/, "");
  };
  var parseSkillValue = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const text = String(value || "");
    const attrMatch = text.match(/(?:title|alt)=['"]?(\d+(?:\.\d+)?)/i);
    if (attrMatch) return Number(attrMatch[1]);
    if (/star/i.test(text)) {
      if (/silver/i.test(text)) return 19;
      return 20;
    }
    const numericMatch = text.match(/\d+(?:\.\d+)?/);
    return numericMatch ? Number(numericMatch[0]) : null;
  };
  var skillValue = (skill) => {
    var _a;
    return typeof skill === "object" && skill !== null ? Number((_a = skill.value) != null ? _a : 0) : Number(skill);
  };
  var sortAgeKeys = (keys) => Array.from(new Set(keys || [])).sort((a, b) => {
    const [ay, am] = String(a).split(".").map(Number);
    const [by, bm] = String(b).split(".").map(Number);
    return ay * 12 + am - (by * 12 + bm);
  });
  var applyTooltipSkills = (player, tooltipSkills) => {
    if (!Array.isArray(player == null ? void 0 : player.skills) || !Array.isArray(tooltipSkills)) return player;
    const tooltipMap = /* @__PURE__ */ new Map();
    for (const skill of tooltipSkills) {
      if (!(skill == null ? void 0 : skill.key)) continue;
      tooltipMap.set(skill.key, parseSkillValue(skill.value));
    }
    player.skills = player.skills.map((skill) => {
      var _a, _b;
      return {
        ...skill,
        value: (_b = tooltipMap.get(skill.key)) != null ? _b : skill.key2 ? (_a = tooltipMap.get(skill.key2)) != null ? _a : null : null
      };
    }).filter((skill) => skill.value != null);
    return player;
  };
  var applyPlayerPositions = (player, favposition = "", allPositions = false) => {
    if (!Array.isArray(player == null ? void 0 : player.positions)) return player;
    const preferredKeys = new Set(String(favposition || "").split(",").map((value) => value.trim().toLowerCase().replace(/\s+/g, "")).filter(Boolean));
    player.positions = player.positions.filter((position) => allPositions || (player.isGK ? position.key === "gk" : position.key !== "gk")).map((position) => ({
      ...position,
      preferred: preferredKeys.has(String(position.key || "").toLowerCase())
    }));
    return player;
  };
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
  var getOwnClubIds = () => {
    const s = window.SESSION;
    if (!s) return [];
    const ids = [];
    if (s.main_id) ids.push(String(s.main_id));
    if (s.b_team) ids.push(String(s.b_team));
    return ids;
  };
  var applySquadSkills = (player, postPlayer) => {
    if (!Array.isArray(player == null ? void 0 : player.skills)) return player;
    const remap = { set_pieces: "setpieces", arialability: "aerial" };
    player.skills = player.skills.map((skill) => {
      var _a, _b, _c, _d;
      const postKey = (_a = remap[skill.key]) != null ? _a : skill.key;
      const value = (_d = postPlayer[postKey]) != null ? _d : skill.key2 ? (_c = postPlayer[(_b = remap[skill.key2]) != null ? _b : skill.key2]) != null ? _c : null : null;
      return { ...skill, value: value != null ? Number(value) : null };
    }).filter((skill) => skill.value != null && skill.value !== 0);
    return player;
  };
  var escHtml = (v) => String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, formatR5, fmtCoins, ratingColor, r5Color, toggleSort, skillColor, skillEff, getMainContainer, extractFaceUrl, skillValue, sortAgeKeys, applyTooltipSkills, applyPlayerPositions, applySquadSkills, getOwnClubIds, escHtml };

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
  var STYLE_ID3 = "tmu-table-style";
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
.tmu-tbl tbody td{padding:var(--tmu-tbl-body-py) var(--tmu-tbl-body-px);border-bottom:1px solid var(--tmu-border-faint);color:var(--tmu-text-main);font-variant-numeric:tabular-nums;}
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
      if (document.getElementById(STYLE_ID3)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID3}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID3;
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
--tmu-color-primary-rgb:0,254,167;
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
--tmu-color-primary-rgb:255,0,70;
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
  var TMU_THEME_DIFF_PITCH = `
:root{
--tmu-color-primary:#8ecf47;
--tmu-color-primary-rgb:142,207,71;
--tmu-color-secondary:#12311d;
--tmu-color-accent:#08170c;
--tmu-color-surface:#183624;
--tmu-color-base:#07100a;
--tmu-color-elevated:#264a34;
--tmu-surface-card-soft:#183624;
--tmu-surface-panel:#07100a;
--tmu-surface-dark-soft:rgba(2,8,4,.24);
--tmu-surface-dark-mid:rgba(2,8,4,.34);
--tmu-surface-dark-strong:rgba(2,8,4,.5);
--tmu-surface-dark-muted:rgba(2,8,4,.28);
--tmu-surface-item-dark:rgba(255,255,255,.02);
--tmu-surface-input-dark:rgba(4,12,6,.94);
--tmu-surface-input-dark-focus:rgba(4,12,6,.98);
--tmu-surface-panel-dark:rgba(5,14,8,.94);
--tmu-surface-accent-soft:rgba(142,207,71,.11);
--tmu-surface-card-elevated:#264a34;
--tmu-surface-card-hero:rgba(22,52,33,.96);
--tmu-surface-item-strong:rgba(255,255,255,.06);
--tmu-surface-item-hover:rgba(142,207,71,.14);
--tmu-surface-header:rgba(5,14,8,.98);
--tmu-surface-header-soft:rgba(5,14,8,.88);
--tmu-surface-nav-pill-active:rgba(142,207,71,.16);
--tmu-surface-embedded:#183624;
--tmu-surface-tab:#183624;
--tmu-surface-tab-hover:#264a34;
--tmu-surface-tab-active:rgba(142,207,71,.12);
--tmu-border-strong:#8ecf47;
--tmu-border-embedded:#8ecf47;
--tmu-border-glow-soft:rgba(142,207,71,.24);
--tmu-border-header:rgba(0,0,0,.45);
--tmu-border-pill-active:rgba(142,207,71,.42);
--tmu-border-input-overlay:rgba(142,207,71,.36);
--tmu-border-success:rgba(142,207,71,.28);
--tmu-border-accent:rgba(142,207,71,.24);
--tmu-border-live:#7ddc62;
--tmu-shadow-ring:rgba(0,0,0,.38);
--tmu-shadow-elev:rgba(0,0,0,.34);
--tmu-shadow-panel:rgba(0,0,0,.58);
--tmu-shadow-soft:rgba(0,0,0,.24);
--tmu-shadow-deep:rgba(0,0,0,.42);
--tmu-shadow-glow:rgba(142,207,71,.1);
--tmu-text-strong:#f1f6ee;
--tmu-text-main:#c6d0c3;
--tmu-text-muted:#839180;
--tmu-text-dim:#536250;
--tmu-text-faint:#687663;
--tmu-text-disabled:#394836;
--tmu-text-disabled-strong:#2a3628;
--tmu-text-panel-label:#95a48f;
--tmu-text-accent-soft:#e0f2c8;
--tmu-text-live:#9be27c;
--tmu-accent:var(--tmu-color-primary);
--tmu-success-fill:var(--tmu-color-secondary);
--tmu-success-fill-faint:rgba(142,207,71,.075);
--tmu-success-fill-soft:rgba(142,207,71,.11);
--tmu-success-fill-hover:rgba(142,207,71,.16);
--tmu-success-fill-strong:rgba(142,207,71,.22);
--tmu-accent-fill:var(--tmu-color-accent);
--tmu-accent-fill-soft:rgba(8,23,12,.72);
--tmu-live-fill:#0a1f0d;
--tmu-compare-fill:rgba(142,207,71,.08);
--tmu-compare-home-grad-start:#12311d;
--tmu-compare-home-grad-end:#8ecf47;
--tmu-tabs-primary-active-border:#8ecf47;
--tmu-tabs-secondary-active-border:#8ecf47
}
`;
  var TMU_THEME_DIFF_CLASSIC = `
:root{
--tmu-color-primary:#c7df3a;
--tmu-color-primary-rgb:199,223,58;
--tmu-color-secondary:#30332d;
--tmu-color-accent:#171914;
--tmu-color-surface:#3d413a;
--tmu-color-base:#1b1d18;
--tmu-color-elevated:#2c3029;
--tmu-surface-card-soft:#171914;
--tmu-surface-panel:#12140f;
--tmu-surface-dark-soft:rgba(9,10,8,.24);
--tmu-surface-dark-mid:rgba(8,9,7,.32);
--tmu-surface-dark-strong:rgba(5,6,5,.5);
--tmu-surface-dark-muted:rgba(10,11,9,.3);
--tmu-surface-item-dark:rgba(255,255,255,.035);
--tmu-surface-input-dark:rgba(22,24,20,.96);
--tmu-surface-input-dark-focus:rgba(28,31,25,.98);
--tmu-surface-panel-dark:rgba(18,20,16,.95);
--tmu-surface-accent-soft:rgba(255,255,255,.03);
--tmu-surface-card-elevated:#232620;
--tmu-surface-card-hero:rgba(28,31,26,.96);
--tmu-card-bg:#151712;
--tmu-card-head-bg:#1b1d18;
--tmu-surface-item-strong:rgba(255,255,255,.075);
--tmu-surface-item-hover:rgba(255,255,255,.07);
--tmu-shell-body-bg:#2d460f;
--tmu-shell-header-bg:#315f05;
--tmu-league-panel-bg:#161813;
--tmu-league-panel-border:rgba(255,255,255,.09);
--tmu-league-head-bg:linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.015));
--tmu-league-head-border:rgba(255,255,255,.1);
--tmu-league-table-shell:#121410;
--tmu-league-table-even:rgba(255,255,255,.022);
--tmu-league-table-row-hover:#22251f;
--tmu-league-sidebar-card-bg:#181b15;
--tmu-match-shell-bg:var(--tmu-shell-body-bg);
--tmu-match-content-bg:linear-gradient(180deg, rgba(49,95,5,.18) 0%, rgba(45,70,15,.92) 100%);
--tmu-match-header-bg:var(--tmu-shell-header-bg);
--tmu-match-panel-accent:rgba(199,223,58,.1);
--tmu-match-panel-border:rgba(199,223,58,.16);
--tmu-surface-header:rgba(55,69,17,.96);
--tmu-surface-header-soft:rgba(55,69,17,.86);
--tmu-surface-nav-pill-active:rgba(255,255,255,.07);
--tmu-surface-embedded:#181a15;
--tmu-surface-overlay-soft:rgba(22,33,6,.14);
--tmu-surface-overlay:rgba(15,17,15,.26);
--tmu-surface-overlay-strong:rgba(9,11,9,.38);
--tmu-surface-tab:#232620;
--tmu-surface-tab-hover:#2f332c;
--tmu-surface-tab-active:rgba(255,255,255,.05);
--tmu-border-soft:rgba(255,255,255,.09);
--tmu-border-strong:#c7df3a;
--tmu-border-embedded:#c7df3a;
--tmu-border-soft-alpha:rgba(255,255,255,.1);
--tmu-border-soft-alpha-mid:rgba(255,255,255,.15);
--tmu-border-soft-alpha-strong:rgba(255,255,255,.22);
--tmu-border-glow-soft:rgba(199,223,58,.24);
--tmu-border-header:rgba(27,35,8,.44);
--tmu-border-pill:rgba(255,255,255,.14);
--tmu-border-pill-active:rgba(199,223,58,.38);
--tmu-border-contrast:rgba(255,255,255,.035);
--tmu-border-faint:rgba(255,255,255,.09);
--tmu-border-input:rgba(255,255,255,.14);
--tmu-border-input-overlay:rgba(199,223,58,.32);
--tmu-border-success:rgba(199,223,58,.28);
--tmu-border-accent:rgba(199,223,58,.24);
--tmu-border-live:#d8f06a;
--tmu-shadow-ring:rgba(5,6,5,.34);
--tmu-shadow-elev:rgba(4,5,4,.3);
--tmu-shadow-panel:rgba(3,4,3,.46);
--tmu-shadow-soft:rgba(4,5,4,.22);
--tmu-shadow-deep:rgba(2,3,2,.34);
--tmu-shadow-glow:rgba(199,223,58,.1);
--tmu-shadow-header:rgba(10,16,3,.32);
--tmu-shadow-card-strong:rgba(4,5,4,.3);
--tmu-text-strong:#f8f9ef;
--tmu-text-main:#e8eadf;
--tmu-text-muted:#cfd4c4;
--tmu-text-dim:#959d87;
--tmu-text-faint:#acb39d;
--tmu-text-disabled:#7a8f49;
--tmu-text-disabled-strong:#65783d;
--tmu-text-panel-label:#e1e6d4;
--tmu-text-accent-soft:#f3f5ed;
--tmu-text-live:#efff91;
--tmu-accent:var(--tmu-color-primary);
--tmu-success:#9ce046;
--tmu-success-fill:#30332d;
--tmu-success-fill-faint:rgba(255,255,255,.025);
--tmu-success-fill-soft:rgba(255,255,255,.04);
--tmu-success-fill-hover:rgba(255,255,255,.075);
--tmu-success-fill-strong:rgba(255,255,255,.11);
--tmu-accent-fill:var(--tmu-color-accent);
--tmu-accent-fill-soft:rgba(23,25,20,.72);
--tmu-danger-fill:#5d1b10;
--tmu-info-fill:#1d211b;
--tmu-live-fill:#3d4428;
--tmu-compare-fill:rgba(255,255,255,.04);
--tmu-compare-home-grad-start:#2f332c;
--tmu-compare-home-grad-end:#565b52;
--tmu-tabs-primary-active-border:#c7df3a;
--tmu-tabs-secondary-active-border:#c7df3a
}
`;
  var THEME_STORAGE_KEY = "tmu-theme-id";
  function getSavedThemeId() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) || "green";
      return ["green", "blue", "pitch", "classic"].includes(saved) ? saved : "green";
    } catch (e) {
      return "green";
    }
  }
  function buildThemeCss(id) {
    if (id === "blue") return TMU_THEME_CSS + TMU_THEME_DIFF_BLUE;
    if (id === "pitch") return TMU_THEME_CSS + TMU_THEME_DIFF_PITCH;
    if (id === "classic") return TMU_THEME_CSS + TMU_THEME_DIFF_CLASSIC;
    return TMU_THEME_CSS;
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
  var STYLE_ID4 = "tmu-tabs-style";
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
      if (document.getElementById(STYLE_ID4)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID4}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID4;
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

  // src/components/shared/tm-button-group.js
  var STYLE_ID5 = "tmu-button-group-style";
  var injectStyles = (target = document.head) => {
    var _a;
    if (!target) return;
    const existing = target === document.head ? document.getElementById(STYLE_ID5) : (_a = target.querySelector) == null ? void 0 : _a.call(target, `#${STYLE_ID5}`);
    if (existing) return;
    injectTmButtonCss(target);
    const s = document.createElement("style");
    s.id = STYLE_ID5;
    s.textContent = `
        .tmu-btn-group {
            display: inline-flex;
        }
        .tmu-btn-group .tmu-btn {
            border-radius: 0;
            border-right-width: 0;
        }
        .tmu-btn-group .tmu-btn:first-child { border-radius: 4px 0 0 4px; }
        .tmu-btn-group .tmu-btn:last-child  { border-radius: 0 4px 4px 0; border-right-width: 1px; }
        .tmu-btn-group .tmu-btn:only-child  { border-radius: 4px; border-right-width: 1px; }
    `;
    target.appendChild(s);
  };
  var TmButtonGroup = {
    /**
     * Creates a segmented button group where one button is active at a time.
     *
     * @param {object}   opts
     * @param {Array}    opts.items    — [{ key, label, title? }]
     * @param {string}   opts.active   — initially active key
     * @param {string}  [opts.size]    — 'xs'|'sm'|'md'|'lg'|'xl' (default: 'sm')
     * @param {string}  [opts.cls]     — extra classes on the wrapper
     * @param {Function} opts.onChange — (key) => void
     * @returns {{ el: HTMLDivElement, setActive(key): void }}
     */
    buttonGroup({ items, active, size = "sm", cls = "", onChange } = {}) {
      injectStyles();
      const wrap = document.createElement("div");
      wrap.className = ["tmu-btn-group", cls].filter(Boolean).join(" ");
      const buttons = /* @__PURE__ */ new Map();
      const setActive2 = (key) => {
        buttons.forEach((btn, k) => {
          btn.classList.toggle("tmu-btn-active", k === key);
        });
      };
      items.forEach(({ key, label, title }) => {
        const btn = TmButton.button({
          label,
          title,
          variant: "primary",
          size,
          active: key === active,
          onClick: () => {
            setActive2(key);
            onChange == null ? void 0 : onChange(key);
          }
        });
        buttons.set(key, btn);
        wrap.appendChild(btn);
      });
      return { el: wrap, setActive: setActive2 };
    }
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
    ...TmButtonGroup,
    ...TmState,
    ...TmAlert
  };

  // src/components/shared/tm-hero-card.js
  if (!document.getElementById("tm-hero-card-style")) {
    const style = document.createElement("style");
    style.id = "tm-hero-card-style";
    style.textContent = `
        .tmvu-hero-card-shell.tmu-card {
            border-radius: var(--tmu-space-lg);
        }

        .tmvu-hero-card {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(220px, .52fr);
            gap: var(--tmu-space-xl);
            padding: var(--tmu-space-xl);
            background:
                radial-gradient(circle at top left, var(--tmu-success-fill-soft), transparent 36%),
                linear-gradient(135deg, var(--tmu-surface-panel), var(--tmu-surface-input-dark-focus));
        }

        .tmvu-hero-card-main,
        .tmvu-hero-card-side,
        .tmvu-hero-card-footer {
            min-width: 0;
        }

        .tmvu-hero-card-kicker {
            color: var(--tmu-text-panel-label);
            font-size: var(--tmu-font-xs);
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        .tmvu-hero-card-title {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-3xl);
            font-weight: 900;
            line-height: 1.02;
        }

        .tmvu-hero-card-subtitle {
            margin-top: var(--tmu-space-sm);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-md);
            font-weight: 700;
            line-height: 1.3;
        }

        .tmvu-hero-card-main-slot {
            margin-top: var(--tmu-space-md);
        }

        .tmvu-hero-card-actions {
            margin-top: var(--tmu-space-lg);
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-md);
        }

        .tmvu-hero-card-actions a.tmu-btn:hover {
            text-decoration: none;
        }

        .tmvu-hero-card-footer {
            grid-column: 1 / -1;
        }
    `;
    document.head.appendChild(style);
  }
  var toSlotHtml = (slot) => {
    if (!slot) return "";
    if (typeof slot === "function") return String(slot() || "");
    return String(slot);
  };
  var TmHeroCard = {
    button({
      label = "",
      id = "",
      href = "",
      className = "",
      attrs = "",
      type = "button"
    } = {}) {
      const cls = ["tmu-btn", "tmu-btn-secondary", "rounded-full", "py-1", "px-3", "text-sm", className].filter(Boolean).join(" ");
      if (href) {
        const idAttr = id ? ` id="${id}"` : "";
        const extraAttrs = attrs ? ` ${attrs.trim()}` : "";
        return `<a${idAttr} class="${cls}" href="${href}"${extraAttrs}>${label}</a>`;
      }
      return TmButton.button({
        label,
        id,
        color: "secondary",
        size: "sm",
        shape: "full",
        type,
        cls: className
      }).outerHTML;
    },
    mount(container, {
      cardClass = "",
      cardVariant = "soft",
      heroClass = "",
      mainClass = "",
      sideClass = "",
      footerClass = "",
      slots = {}
    } = {}) {
      if (!container) return {};
      const kickerHtml = toSlotHtml(slots.kicker);
      const titleHtml = toSlotHtml(slots.title);
      const subtitleHtml = toSlotHtml(slots.subtitle);
      const mainSlotHtml = toSlotHtml(slots.main);
      const actionsHtml = toSlotHtml(slots.actions);
      const sideHtml = toSlotHtml(slots.side);
      const footerHtml = toSlotHtml(slots.footer);
      const shellClass = ["tmvu-hero-card-shell", cardClass].filter(Boolean).join(" ");
      return TmUI.render(container, `
            <tm-card data-ref="card" data-body-ref="body" data-flush${cardVariant ? ` data-variant="${cardVariant}"` : ""}${shellClass ? ` data-cls="${shellClass}"` : ""}>
                <div data-ref="hero" class="tmvu-hero-card${heroClass ? ` ${heroClass}` : ""}">
                    <div data-ref="main" class="tmvu-hero-card-main${mainClass ? ` ${mainClass}` : ""}">
                        ${kickerHtml ? `<div class="tmvu-hero-card-kicker">${kickerHtml}</div>` : ""}
                        ${titleHtml ? `<div class="tmvu-hero-card-title">${titleHtml}</div>` : ""}
                        ${subtitleHtml ? `<div class="tmvu-hero-card-subtitle">${subtitleHtml}</div>` : ""}
                        ${mainSlotHtml ? `<div class="tmvu-hero-card-main-slot">${mainSlotHtml}</div>` : ""}
                        ${actionsHtml ? `<div data-ref="actions" class="tmvu-hero-card-actions">${actionsHtml}</div>` : ""}
                    </div>
                    ${sideHtml ? `<div data-ref="side" class="tmvu-hero-card-side${sideClass ? ` ${sideClass}` : ""}">${sideHtml}</div>` : ""}
                    ${footerHtml ? `<div data-ref="footer" class="tmvu-hero-card-footer${footerClass ? ` ${footerClass}` : ""}">${footerHtml}</div>` : ""}
                </div>
            </tm-card>
        `);
    }
  };

  // src/components/shared/tm-page-hero.js
  var STYLE_ID8 = "tmu-page-hero-style";
  var injectStyles2 = () => {
    if (document.getElementById(STYLE_ID8)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID8;
    style.textContent = `
        .tmu-page-hero {
            grid-template-columns: 1fr auto;
            gap: var(--tmu-space-lg);
            padding: var(--tmu-space-xl);
            background:
                radial-gradient(ellipse 70% 90% at 30% 50%, rgba(40,70,110,.20) 0%, transparent 100%),
                var(--tmu-surface-dark-strong);
            box-shadow: 0 12px 28px var(--tmu-shadow-elev);
        }

        .tmu-page-hero-side {
            min-width: 0;
            display: grid;
            gap: var(--tmu-space-md);
            align-content: start;
        }

        @media (max-width: 1120px) {
            .tmu-page-hero {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
  };
  var TmPageHero = {
    mount(container, opts = {}) {
      injectStyles2();
      return TmHeroCard.mount(container, {
        ...opts,
        heroClass: ["tmu-page-hero", opts.heroClass].filter(Boolean).join(" "),
        sideClass: ["tmu-page-hero-side", opts.sideClass].filter(Boolean).join(" ")
      });
    }
  };

  // src/services/engine.js
  var _logError = (context, err) => {
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
  var _get = (url) => new Promise((resolve) => {
    const $ = window.jQuery;
    if (!$) {
      resolve(null);
      return;
    }
    $.get(url).done((res) => {
      try {
        resolve(typeof res === "object" ? res : JSON.parse(res));
      } catch (e) {
        _logError(`JSON parse: ${url}`, e);
        resolve(null);
      }
    }).fail((xhr, s, e) => {
      _logError(`GET ${url}`, e || s);
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
    GRAPH_KEYS_OUT: GRAPH_KEYS_OUT2,
    GRAPH_KEYS_GK: GRAPH_KEYS_GK2,
    TRAINING_GROUPS_OUT: TRAINING_GROUPS_OUT2,
    TRAINING_GROUPS_GK: TRAINING_GROUPS_GK2,
    ROUTINE_DECAY: ROUTINE_DECAY2,
    STD_FOCUS: STD_FOCUS2,
    SMOOTH_WEIGHT: SMOOTH_WEIGHT2
  } = TmConst;
  var { ageToMonths: ageToMonths2, skillValue: skillValue2 } = TmUtils;
  var _fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  var _sv = skillValue2;
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
  var calcAsiSkillSum = (player) => {
    const K = player.isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    return Math.pow(2, Math.log(K * player.asi) / Math.log(128));
  };
  var calcASIFromSkillSum = (skillSum, isGK) => {
    const weight = isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    return Math.max(0, Math.round(Math.pow(Math.max(0, skillSum), 7) / weight));
  };
  var calcSkillDecimalsSimple = (player) => {
    const K = player.isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const skills = player.skills;
    const nums = skills.map((s) => parseFloat(s.value) || 0);
    const allSum = nums.reduce((s, v) => s + v, 0);
    const remainder = Math.round((Math.pow(2, Math.log(K * player.asi) / Math.log(128)) - allSum) * 10) / 10;
    const nonStar = nums.filter((v) => v < 20).length;
    let result;
    if (remainder <= 0) result = nums;
    else if (nonStar === 0) result = nums.map((v) => v + remainder / nums.length);
    else result = nums.map((v) => v === 20 ? 20 : v + remainder / nonStar);
    return skills.map((s, i) => ({ ...s, value: result[i] }));
  };
  var calcSkillDecimals = (intSkills, asi, isGK, gw, { maxIntegers } = {}) => {
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
        const cap = maxIntegers ? Math.max(0, maxIntegers[i] - intSkills[i]) + CAP : CAP;
        if (dec[i] > cap) {
          ovfl += dec[i] - cap;
          dec[i] = cap;
        } else if (dec[i] < cap) freeCount++;
      }
      if (ovfl > 1e-4 && freeCount > 0) {
        const add = ovfl / freeCount;
        for (let i = 0; i < N; i++) {
          const cap = maxIntegers ? Math.max(0, maxIntegers[i] - intSkills[i]) + CAP : CAP;
          if (intSkills[i] < 20 && dec[i] < cap) dec[i] += add;
        }
      } else break;
    } while (++passes < 20);
    return intSkills.map((v, i) => v >= 20 ? 20 : v + dec[i]);
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
    calcAsiSkillSum,
    calcASIFromSkillSum,
    calcSkillDecimalsSimple,
    calcSkillDecimals,
    calculatePlayerR5,
    calculatePlayerREC,
    calcASIProjection,
    calculateTI,
    calculateTIPerSession
  };

  // src/utils/match.js
  var TmMatchUtils = {
    /**
     * Returns true if the given player id is in the home side's lineup.
     * @param {Set<string>} homeIds — Set of home player ids as strings
     * @param {string|number} pid
     * @returns {boolean}
     */
    isHome(homeIds, pid) {
      return homeIds.has(String(pid));
    },
    extractStats(mData, teamData) {
      var _a, _b;
      const teamId = String((_b = (_a = teamData.club) == null ? void 0 : _a.id) != null ? _b : teamData.id);
      const acts = (mData.actions || []).filter((a) => String(a.teamId) === teamId);
      const { ATTACK_STYLES: ATTACK_STYLES2, STYLE_ORDER: STYLE_ORDER3 } = TmConst;
      const advanced = {};
      STYLE_ORDER3.forEach((s) => {
        advanced[s] = { a: 0, sh: 0, l: 0, g: 0, events: [] };
      });
      for (const [minKey, plays] of Object.entries(mData.visiblePlays || {})) {
        const eMin = Number(minKey);
        (plays || []).forEach((play) => {
          if (String(play.team) !== teamId) return;
          let label;
          if (/^p_/.test(play.style)) {
            label = "Penalties";
          } else {
            const entry = ATTACK_STYLES2.find((s) => s.key === play.style);
            if (!entry) return;
            label = entry.label;
          }
          const d = advanced[label];
          d.a++;
          if (play.outcome === "goal") {
            d.g++;
            d.sh++;
          } else if (play.outcome === "shot") d.sh++;
          else d.l++;
          d.events.push({ min: eMin, evt: play, evtIdx: play.reportEventIndex, result: play.outcome });
        });
      }
      return {
        goals: acts.filter((a) => a.action === "shot" && a.goal).length,
        shots: acts.filter((a) => a.action === "shot").length,
        shotsOnTarget: acts.filter((a) => a.action === "shot" && a.onTarget).length,
        saves: acts.filter((a) => a.action === "save").length,
        passes: acts.filter((a) => a.action === "pass").length,
        passesCompleted: acts.filter((a) => a.action === "pass" && a.success).length,
        crosses: acts.filter((a) => a.action === "cross").length,
        crossesCompleted: acts.filter((a) => a.action === "cross" && a.success).length,
        fouls: acts.filter((a) => a.action === "foul").length,
        yellowCards: acts.filter((a) => a.action === "yellow" || a.action === "yellowRed").length,
        redCards: acts.filter((a) => a.action === "red" || a.action === "yellowRed").length,
        advanced
      };
    },
    getMatchEndMin(mData) {
      var _a, _b;
      const playMins = Object.keys((mData == null ? void 0 : mData.plays) || {}).map(Number).filter(Number.isFinite);
      const reportMins = Object.keys((mData == null ? void 0 : mData.report) || {}).map(Number).filter(Number.isFinite);
      const actionMins = ((mData == null ? void 0 : mData.actions) || []).map((a) => Number(a.min)).filter(Number.isFinite);
      const candidates = [
        Number((_a = mData == null ? void 0 : mData.duration) == null ? void 0 : _a.total),
        Number((_b = mData == null ? void 0 : mData.duration) == null ? void 0 : _b.regular),
        Number(mData == null ? void 0 : mData.liveMin),
        ...playMins,
        ...reportMins,
        ...actionMins
      ].filter((n) => Number.isFinite(n) && n > 0);
      return candidates.length ? Math.max(90, ...candidates) : 90;
    },
    getPlayerStats(liveState, player) {
      var _a;
      const { mData } = liveState;
      const pid = String(player.id || player.player_id);
      const actions = (mData.actions || []).filter((a) => String(a.by) === pid);
      const perMinute = actions.map(({ action, by, teamId, ...rest }) => ({ [action]: true, ...rest }));
      const _test = {
        goals: (e) => e.shot && e.goal,
        assists: (e) => e.assist,
        keyPasses: (e) => e.keyPass,
        shots: (e) => e.shot,
        saves: (e) => e.save,
        shotsOnTarget: (e) => e.shot && e.onTarget,
        goalsFoot: (e) => e.shot && e.goal && e.foot,
        goalsHead: (e) => e.shot && e.goal && e.head,
        passesCompleted: (e) => e.pass && e.success,
        passesFailed: (e) => e.pass && !e.success,
        crossesCompleted: (e) => e.cross && e.success,
        crossesFailed: (e) => e.cross && !e.success,
        interceptions: (e) => e.interception,
        tackles: (e) => e.tackle,
        headerClearances: (e) => e.headerClear,
        tackleFails: (e) => e.tackleFail,
        duelsWon: (e) => e.duelWon,
        duelsLost: (e) => e.duelLost,
        fouls: (e) => e.foul,
        yellowCards: (e) => e.yellow,
        yellowRedCards: (e) => e.yellowRed,
        redCards: (e) => e.red,
        injured: (e) => e.injury,
        subIn: (e) => e.subIn,
        subOut: (e) => e.subOut
      };
      const grouped = TmConst.PLAYER_STAT_COLS.flatMap((col) => {
        const fn = _test[col.key];
        if (!fn) return [];
        const count = col.lineupBool ? perMinute.some(fn) ? 1 : 0 : perMinute.filter(fn).length;
        return count ? [{ ...col, count }] : [];
      });
      const matchEndMin = this.getMatchEndMin(mData);
      const subInAct = actions.find((a) => a.action === "subIn");
      const subOutAct = actions.find((a) => a.action === "subOut");
      const originalPos = player.originalPosition || player.position;
      let minsPlayed;
      if (subInAct) {
        minsPlayed = (subOutAct ? subOutAct.min : matchEndMin) - (subInAct.min || 0);
      } else if (/^sub/.test(originalPos)) {
        minsPlayed = 0;
      } else {
        minsPlayed = subOutAct ? subOutAct.min : matchEndMin;
      }
      const entry = { perMinute, grouped, minsPlayed };
      const posKey = (player.position || "").split(",")[0].toLowerCase().replace(/[^a-z]/g, "");
      const posEntry = POSITION_MAP[posKey] || POSITION_MAP[(player.fp || "").split(",")[0].toLowerCase().replace(/[^a-z]/g, "")];
      const r5 = posEntry && ((_a = player.skills) == null ? void 0 : _a.length) && player.asi ? Number(TmLib.calculatePlayerR5(posEntry, player)) : null;
      return {
        ...player,
        grouped: entry.grouped || [],
        perMinute: entry.perMinute || [],
        statsArray: entry.perMinute || [],
        minsPlayed: entry.minsPlayed || 0,
        r5
      };
    },
    /**
     * Render the goals+cards events section HTML from legacy tooltip API data.
     * (tooltip.ajax.php format — events have .minute, .scorer_name, .score, .assist_id)
     * @param {Array} goals  — sorted goal event objects with .isHome flag
     * @param {Array} cards  — sorted card event objects with .isHome flag
     * @returns {string} HTML string (empty string if no events)
     */
    renderLegacyEvents(goals, cards) {
      const all = [
        ...goals.map((e) => ({ ...e, _type: "goal" })),
        ...cards.map((e) => ({ ...e, _type: "card" }))
      ].sort((a, b) => Number(a.minute) - Number(b.minute));
      if (!all.length) return "";
      let t = '<div class="rnd-h2h-tooltip-events">';
      all.forEach((e) => {
        const sideClass = e.isHome ? "" : " away-evt";
        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
        t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
        if (e._type === "goal") {
          t += `<span class="rnd-h2h-tooltip-evt-icon">\u26BD</span>`;
          t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ""}`;
          if (e.assist_id && e.assist_id !== "") {
            t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.score})</span>`;
          } else {
            t += ` <span class="rnd-h2h-tooltip-evt-assist">${e.score}</span>`;
          }
          t += `</span>`;
        } else {
          const icon = e.score === "yellow" ? "\u{1F7E1}" : e.score === "orange" ? "\u{1F7E1}\u{1F7E1}\u2192\u{1F534}" : "\u{1F534}";
          t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
          t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ""}</span>`;
        }
        t += `</div>`;
      });
      t += "</div>";
      return t;
    },
    /**
     * Render the goals+cards events section HTML from full match API data.
     * (match.ajax.php format — events have .min, .name, .assist, .type)
     * @param {Array} goals  — goal event objects with .isHome flag
     * @param {Array} cards  — card event objects with .isHome flag
     * @returns {string} HTML string (empty string if no events)
     */
    renderRichEvents(goals, cards) {
      const all = [...goals, ...cards].sort((a, b) => a.min - b.min);
      if (!all.length) return "";
      let t = '<div class="rnd-h2h-tooltip-events">';
      all.forEach((e) => {
        const sideClass = e.isHome ? "" : " away-evt";
        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
        t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
        if (e.type === "goal") {
          t += `<span class="rnd-h2h-tooltip-evt-icon">\u26BD</span>`;
          t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}`;
          if (e.assist) t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.assist})</span>`;
          t += `</span>`;
        } else {
          const icon = e.type === "yellow" ? "\u{1F7E1}" : "\u{1F534}";
          t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
          t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}</span>`;
        }
        t += `</div>`;
      });
      t += "</div>";
      return t;
    },
    /**
     * Count non-empty text lines in a segment.
     * @param {object} seg
     * @returns {number}
     */
    countSegmentLines(seg) {
      return Math.max(1, ((seg == null ? void 0 : seg.text) || []).filter((line) => line && line.trim()).length);
    },
    /**
     * Return segment line ranges inside a play.
     * @param {object} play
     * @returns {Array<{ seg: object, startLineIdx: number, endLineIdx: number }>}
     */
    getSegmentRanges(play) {
      let lineCursor = 0;
      return ((play == null ? void 0 : play.segments) || []).map((seg) => {
        const startLineIdx = lineCursor;
        const endLineIdx = lineCursor + this.countSegmentLines(seg) - 1;
        lineCursor = endLineIdx + 1;
        return { seg, startLineIdx, endLineIdx };
      });
    },
    /**
     * Check if an event or event line is visible at the current live step.
     * @param {number} evtMin    — minute of the event
     * @param {number} evtIdx    — event index within that minute
     * @param {number} curMin    — current live minute
     * @param {number} curEvtIdx — current live event index
     * @param {number} [curLineIdx=999] — current visible line index within the event
     * @param {number} [evtLineIdx=-1]  — tested line index within the event
     * @returns {boolean}
     */
    isEventVisible(evtMin, evtIdx, curMin, curEvtIdx, curLineIdx = 999, evtLineIdx = -1) {
      if (evtMin < curMin) return true;
      if (evtMin > curMin) return false;
      if (evtIdx < curEvtIdx) return true;
      if (evtIdx > curEvtIdx) return false;
      return evtLineIdx <= curLineIdx;
    },
    /**
     * Build the active lineup map for a side at the given live step.
     * Starts from the original XI and applies visible substitutions and red cards.
     * @param {object} mData
     * @param {string} side        — 'home' | 'away'
     * @param {number} [curMin]
      * @param {number} [curEvtIdx]
      * @param {number} [curLineIdx]
     * @returns {{ [playerId: string]: object }}
     */
    buildActiveLineup(liveState, side) {
      var _a;
      const { mData } = liveState;
      const sourceLineup = ((_a = mData[side]) == null ? void 0 : _a.lineup) || [];
      const players = sourceLineup.map((p) => ({ ...p, originalPosition: p.position }));
      const teamId = String(mData[side].club.id);
      const teamActions = (mData.actions || []).filter((a) => String(a.teamId) === String(teamId));
      const usedSubSlots = new Set(
        players.filter((p) => /^sub\d+$/.test(p.position)).map((p) => p.position)
      );
      const getNextSubSlot = () => {
        for (let i = 1; i <= 15; i++) {
          const slot = `sub${i}`;
          if (!usedSubSlots.has(slot)) {
            usedSubSlots.add(slot);
            return slot;
          }
        }
        return "sub99";
      };
      for (const act of teamActions) {
        const p = players.find((x) => String(x.id) === String(act.by));
        if (!p) continue;
        if (act.action === "subOut" || act.action === "red" || act.action === "yellowRed") {
          p.position = getNextSubSlot();
        } else if (act.action === "positionChange" && act.position) {
          p.position = act.position;
        }
      }
      return players;
    },
    /**
     * Resolve live tactical settings for a side at the current match step.
     * Currently mentality can change during the match; style and focus stay at base values.
    * @param {object} liveState
    * @param {string} side        — 'home' | 'away'
     * @returns {{ mentality: number }}
     */
    buildLiveTeamTactics(liveState, side) {
      var _a, _b;
      const { mData } = liveState || {};
      const teamId = String((_b = (_a = mData[side]) == null ? void 0 : _a.club) == null ? void 0 : _b.id);
      const mentalityActions = mData.actions.filter((a) => a.action === "mentality_change" && String(a.team) === teamId);
      if (!mentalityActions.length) return null;
      return mentalityActions[mentalityActions.length - 1].mentality;
    },
    getVisiblePlays(liveState) {
      const { mData, min: curMin, curEvtIdx, curLineIdx } = liveState;
      const playedMinutes = Object.keys(mData.plays || {}).map(Number).filter((min) => min <= curMin);
      const visiblePlays = {};
      playedMinutes.forEach((min) => {
        var _a;
        const plays = ((_a = mData.plays) == null ? void 0 : _a[String(min)]) || [];
        const visibleEvents = plays.filter((play) => {
          var _a2;
          const evtIdx = (_a2 = play.reportEventIndex) != null ? _a2 : null;
          return this.isEventVisible(min, evtIdx, curMin, curEvtIdx, curLineIdx);
        });
        visibleEvents.forEach((ev) => {
          var _a2;
          const evtIdx = (_a2 = ev.reportEventIndex) != null ? _a2 : null;
          const segRanges = this.getSegmentRanges(ev);
          const visibleSegments = segRanges.filter(
            (r) => this.isEventVisible(min, evtIdx, curMin, curEvtIdx, curLineIdx, r.endLineIdx + 1)
          );
          ev.visiblePlay = { ...ev, segments: visibleSegments.map((r) => r.seg) };
        });
        visiblePlays[String(min)] = visibleEvents.map((ev) => ev.visiblePlay);
      });
      return visiblePlays;
    },
    deriveMatchData(liveState) {
      liveState.mData.visiblePlays = this.getVisiblePlays(liveState);
      liveState.mData.actions = [];
      const homeId = String(liveState.mData.home.club.id);
      const awayId = String(liveState.mData.away.club.id);
      Object.entries(liveState.mData.visiblePlays || {}).forEach(([minKey, plays]) => {
        const min = Number(minKey);
        plays.forEach((play) => {
          play.segments.forEach((seg) => {
            seg.actions.forEach((act) => {
              var _a, _b, _c, _d;
              let teamId = null;
              const playerInvolved = act.by;
              let playerName = "";
              if (playerInvolved) {
                const inHome = liveState.mData.home.lineup.some((p) => String(p.id) === String(playerInvolved));
                if (inHome) {
                  teamId = homeId;
                  playerName = (_b = (_a = liveState.mData.home.lineup.find((p) => String(p.id) === String(playerInvolved))) == null ? void 0 : _a.name) != null ? _b : null;
                } else {
                  teamId = awayId;
                  playerName = (_d = (_c = liveState.mData.away.lineup.find((p) => String(p.id) === String(playerInvolved))) == null ? void 0 : _c.name) != null ? _d : null;
                }
              }
              const home = teamId !== null && teamId === homeId;
              liveState.mData.actions.push({ ...act, teamId, home, player: playerName, min, evtIdx: play.reportEventIndex });
            });
          });
        });
      });
      liveState.mData.teams = this.generateTeamData(liveState);
      return liveState.mData;
    },
    /**
     * Compute enriched team data.
     * @param {object} liveState
     * @returns {object} team data object
     */
    generateTeamData(liveState) {
      const { mData } = liveState;
      const buildTeam = (side) => {
        var _a, _b, _c, _d, _e, _f;
        const sideData = mData[side];
        const clubId = String(sideData.club.id);
        const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const lineup = this.buildActiveLineup(liveState, side).map((player) => this.getPlayerStats(liveState, player)).sort((a, b) => {
          var _a2, _b2, _c2, _d2;
          const aIsSub = /^sub\d+$/.test(a.position);
          const bIsSub = /^sub\d+$/.test(b.position);
          if (aIsSub !== bIsSub) return aIsSub ? 1 : -1;
          if (aIsSub) {
            return (parseInt(a.position.slice(3)) || 99) - (parseInt(b.position.slice(3)) || 99);
          }
          const aPosKey = (a.position || "").toLowerCase().replace(/[^a-z]/g, "");
          const bPosKey = (b.position || "").toLowerCase().replace(/[^a-z]/g, "");
          const aOrder = (_b2 = (_a2 = POSITION_MAP[aPosKey]) == null ? void 0 : _a2.ordering) != null ? _b2 : 99;
          const bOrder = (_d2 = (_c2 = POSITION_MAP[bPosKey]) == null ? void 0 : _c2.ordering) != null ? _d2 : 99;
          return aOrder - bOrder;
        });
        const onPitch = lineup.filter((p) => !/^sub\d+$/.test(p.position));
        const onBench = lineup.filter((p) => /^sub\d+$/.test(p.position));
        const newMentality = this.buildLiveTeamTactics(liveState, side);
        const mentality = (_a = newMentality !== null ? newMentality : sideData.tactics.mentality) != null ? _a : 4;
        const attackingStyle = (_b = sideData.tactics.style) != null ? _b : null;
        const focusSide = (_c = sideData.tactics.focus) != null ? _c : null;
        const teamData = { id: sideData.club.id };
        const stats = this.extractStats(mData, teamData);
        const goals = liveState.mData.actions.filter((a) => a.goal);
        return {
          id: sideData.club.id,
          name: sideData.club.name,
          color: sideData.color,
          goals: goals.filter((g) => String(g.teamId) === clubId).length,
          goalsAgainst: goals.filter((g) => String(g.teamId) !== clubId).length,
          lineup,
          stats,
          avgAge: avg(onPitch.map((p) => {
            const years = Number(p.age);
            const months = Number(p.month);
            if (!Number.isFinite(years) || years <= 0) return null;
            return Number.isFinite(months) && months >= 0 ? years + months / 12 : years;
          })),
          avgRtn: avg(onPitch.map((p) => p.routine)),
          avgR5: avg(onPitch.map((p) => p.r5)),
          subsR5: avg(onBench.map((p) => p.r5)),
          formation: "4-4-2",
          // TODO: derive from lineup positions
          mentality,
          attackingStyle,
          focusSide,
          mentalityLabel: ((_d = TmConst.MENTALITY_MAP_LONG) == null ? void 0 : _d[mentality]) || "?",
          attackingStyleLabel: ((_e = TmConst.STYLE_MAP) == null ? void 0 : _e[attackingStyle]) || "?",
          focusSideLabel: ((_f = TmConst.FOCUS_MAP) == null ? void 0 : _f[focusSide]) || "?"
        };
      };
      if (!mData.teams) mData.teams = {};
      mData.teams.home = buildTeam("home");
      mData.teams.away = buildTeam("away");
      return mData.teams;
    },
    /**
     * Build a player face image URL from udseende2 appearance data.
     * @param {object} p         — player object (needs .udseende2, .age)
     * @param {string} colorHex  — club color hex (with or without #)
     * @param {number} [w=96]    — image width in pixels
     * @returns {string} full URL
     */
    faceUrl(p, colorHex, w = 96) {
      const u = p && p.udseende2 || {};
      const clr = String(colorHex).replace("#", "");
      return `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p && p.age || 25}&rgb=${clr}&w=${w}`;
    }
  };

  // src/components/stats/tm-stats-match-processor.js
  var {
    STYLE_ORDER: STYLE_ORDER2,
    STYLE_MAP: STYLE_MAP2,
    MENTALITY_MAP: MENTALITY_MAP2,
    PLAYER_STAT_ZERO: PLAYER_STAT_ZERO2
  } = TmConst;
  var getFormation = (lineup) => {
    const positions = Object.values(lineup).map((p) => (p.position || "").toLowerCase()).filter((pos) => pos && !pos.startsWith("sub") && pos !== "gk");
    let def = 0, dm = 0, mid = 0, am = 0, att = 0;
    positions.forEach((p) => {
      if (/^(d[^m]|sw|lb|rb|wb)/.test(p)) def++;
      else if (/^dmc/.test(p)) dm++;
      else if (/^(mc|ml|mr)/.test(p)) mid++;
      else if (/^amc/.test(p)) am++;
      else att++;
    });
    const lines = [def];
    if (dm > 0) lines.push(dm);
    if (mid > 0) lines.push(mid);
    if (am > 0) lines.push(am);
    lines.push(att);
    return lines.join("-");
  };
  var classifyMatchType = (matchtype) => {
    switch (matchtype) {
      case "l":
        return "league";
      case "f":
        return "friendly";
      case "fl":
        return "fl";
      case "c":
      case "cl":
      case "cup":
        return "cup";
      default:
        return "other";
    }
  };
  var summarizePlayerStats = (entries = []) => {
    const stats = { ...PLAYER_STAT_ZERO2 };
    entries.forEach((e) => {
      if (e.shot) {
        stats.shots++;
        if (e.onTarget) stats.shotsOnTarget++;
        else stats.shotsOffTarget++;
        if (e.head) {
          stats.shotsHead++;
          if (e.onTarget) stats.shotsOnTargetHead++;
        }
        if (e.foot) {
          stats.shotsFoot++;
          if (e.onTarget) stats.shotsOnTargetFoot++;
        }
        if (e.goal) {
          stats.goals++;
          if (e.head) stats.goalsHead++;
          else stats.goalsFoot++;
        }
        if (e.penalty) stats.penaltiesTaken++;
        if (e.goal && e.penalty) stats.penaltiesScored++;
        if (e.goal && e.freekick) stats.freekickGoals++;
      }
      if (e.assist) stats.assists++;
      if (e.keyPass) stats.keyPasses++;
      if (e.pass) e.success ? stats.passesCompleted++ : stats.passesFailed++;
      if (e.cross) e.success ? stats.crossesCompleted++ : stats.crossesFailed++;
      if (e.save) stats.saves++;
      if (e.foul) stats.fouls++;
      if (e.duelWon) stats.duelsWon++;
      if (e.duelLost) stats.duelsLost++;
      if (e.tackle) stats.tackles++;
      if (e.interception) stats.interceptions++;
      if (e.headerClear) stats.headerClearances++;
      if (e.tackleFail) stats.tackleFails++;
      if (e.yellow) stats.yellowCards++;
      if (e.yellowRed) stats.yellowRedCards++;
      if (e.red) stats.redCards++;
      if (e.setpiece) stats.setpieceTakes++;
      if (e.subIn) stats.subIn = true;
      if (e.subOut) stats.subOut = true;
      if (e.injury) stats.injured = true;
    });
    return stats;
  };
  var getDisplayPosition = (player) => {
    const originalPosition = player.originalPosition || player.position || "";
    const currentPosition = player.position || "";
    const perMinute = player.perMinute || [];
    const subIn = perMinute.some((e) => e.subIn);
    const subOut = perMinute.some((e) => e.subOut);
    if (subOut && originalPosition && !/^sub\d+$/i.test(originalPosition)) {
      return originalPosition;
    }
    if (subIn) {
      return !/^sub\d+$/i.test(currentPosition) ? currentPosition : (player.fp || "").split(",")[0] || originalPosition || currentPosition;
    }
    if (/^sub\d+$/i.test(currentPosition) && !/^sub\d+$/i.test(originalPosition)) {
      return originalPosition;
    }
    return currentPosition || originalPosition;
  };
  var countSetPieces = (actions = [], teamId) => actions.filter((a) => String(a.teamId) === String(teamId) && a.action === "setpiece").length;
  var countPenalties = (advanced = {}) => {
    var _a;
    return ((_a = advanced.Penalties) == null ? void 0 : _a.a) || 0;
  };
  var mapAdvancedStats = (advanced = {}) => {
    const out = {};
    STYLE_ORDER2.forEach((style) => {
      const entry = advanced[style] || {};
      out[style] = {
        a: entry.a || 0,
        l: entry.l || 0,
        sh: entry.sh || 0,
        g: entry.g || 0
      };
    });
    return out;
  };
  var TmStatsMatchProcessor = {
    process(matchInfo, mData, clubId) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
      void clubId;
      const matchEndMin = TmMatchUtils.getMatchEndMin(mData);
      const derived = TmMatchUtils.deriveMatchData({
        mData,
        min: matchEndMin,
        curEvtIdx: 999,
        curLineIdx: 999
      });
      const isHome = matchInfo.isHome;
      const ourSide = isHome ? "home" : "away";
      const oppSide = isHome ? "away" : "home";
      const homeTeam = ((_a = derived.teams) == null ? void 0 : _a.home) || {};
      const awayTeam = ((_b = derived.teams) == null ? void 0 : _b.away) || {};
      const ourTeam = ((_c = derived.teams) == null ? void 0 : _c[ourSide]) || {};
      const oppTeam = ((_d = derived.teams) == null ? void 0 : _d[oppSide]) || {};
      const ourLineup = ourTeam.lineup || [];
      const oppLineup = oppTeam.lineup || [];
      const matchType = classifyMatchType(matchInfo.matchtype);
      const matchStats = {
        homeYellow: 0,
        awayYellow: 0,
        homeRed: 0,
        awayRed: 0,
        homeShots: 0,
        awayShots: 0,
        homeSoT: 0,
        awaySoT: 0,
        homeSetPieces: 0,
        awaySetPieces: 0,
        homePenalties: 0,
        awayPenalties: 0,
        homePoss: 0,
        awayPoss: 0,
        homeGoalsReport: 0,
        awayGoalsReport: 0
      };
      if (derived.possession) {
        matchStats.homePoss = Number(derived.possession.home) || 0;
        matchStats.awayPoss = Number(derived.possession.away) || 0;
      }
      matchStats.homeYellow = ((_e = homeTeam.stats) == null ? void 0 : _e.yellowCards) || 0;
      matchStats.awayYellow = ((_f = awayTeam.stats) == null ? void 0 : _f.yellowCards) || 0;
      matchStats.homeRed = ((_g = homeTeam.stats) == null ? void 0 : _g.redCards) || 0;
      matchStats.awayRed = ((_h = awayTeam.stats) == null ? void 0 : _h.redCards) || 0;
      matchStats.homeShots = ((_i = homeTeam.stats) == null ? void 0 : _i.shots) || 0;
      matchStats.awayShots = ((_j = awayTeam.stats) == null ? void 0 : _j.shots) || 0;
      matchStats.homeSoT = ((_k = homeTeam.stats) == null ? void 0 : _k.shotsOnTarget) || 0;
      matchStats.awaySoT = ((_l = awayTeam.stats) == null ? void 0 : _l.shotsOnTarget) || 0;
      matchStats.homeSetPieces = countSetPieces(derived.actions, homeTeam.id);
      matchStats.awaySetPieces = countSetPieces(derived.actions, awayTeam.id);
      matchStats.homePenalties = countPenalties((_m = homeTeam.stats) == null ? void 0 : _m.advanced);
      matchStats.awayPenalties = countPenalties((_n = awayTeam.stats) == null ? void 0 : _n.advanced);
      matchStats.homeGoalsReport = homeTeam.goals || 0;
      matchStats.awayGoalsReport = awayTeam.goals || 0;
      const advFor = mapAdvancedStats((_o = ourTeam.stats) == null ? void 0 : _o.advanced);
      const advAgainst = mapAdvancedStats((_p = oppTeam.stats) == null ? void 0 : _p.advanced);
      const playerMatchData = {};
      ourLineup.forEach((player) => {
        const position = getDisplayPosition(player);
        const isBench = /^sub\d+$/i.test(position || "");
        if (isBench && !player.minsPlayed) return;
        const pid = String(player.player_id || player.id);
        playerMatchData[pid] = {
          name: player.name || player.nameLast || pid,
          position,
          isGK: position === "gk",
          minutes: player.minsPlayed || 0,
          rating: player.rating ? Number(player.rating) : 0,
          ...summarizePlayerStats(player.perMinute || [])
        };
      });
      const ourStyle = STYLE_MAP2[ourTeam.attackingStyle] || "Unknown";
      const oppStyle = STYLE_MAP2[oppTeam.attackingStyle] || "Unknown";
      const ourMentality = MENTALITY_MAP2[ourTeam.mentality] || "Unknown";
      const oppMentality = MENTALITY_MAP2[oppTeam.mentality] || "Unknown";
      const ourFormation = getFormation(ourLineup);
      const oppFormation = getFormation(oppLineup);
      return {
        matchInfo,
        matchType,
        matchStats,
        advFor,
        advAgainst,
        playerMatchData,
        isHome,
        unclassifiedGoals: [],
        ourStyle,
        oppStyle,
        ourMentality,
        oppMentality,
        ourFormation,
        oppFormation
      };
    }
  };

  // src/lib/tm-playerdb.js
  var PlayerCacheDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerData";
    const STORE_NAME = "players";
    const DB_VERSION = 1;
    let db = null;
    let openPromise = null;
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
    const ensureOpen = () => {
      if (db) return Promise.resolve(db);
      if (!openPromise) openPromise = open().catch((e) => {
        openPromise = null;
        console.warn("[PlayerCacheDB] open failed:", e);
        return null;
      });
      return openPromise;
    };
    const get = (playerId) => ensureOpen().then((d) => {
      if (!d) return null;
      return new Promise((resolve) => {
        const req = d.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(parseInt(playerId));
        req.onsuccess = () => {
          var _a;
          return resolve((_a = req.result) != null ? _a : null);
        };
        req.onerror = () => resolve(null);
      });
    });
    const set = (playerId, data) => ensureOpen().then((d) => {
      if (!d) return;
      return new Promise((resolve) => {
        const tx = d.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(data, parseInt(playerId));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    });
    return { get, set };
  })();
  var TmPlayerDB = PlayerCacheDB;
  var MatchCacheDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMMatchCache";
    const STORE_NAME = "matches";
    const DB_VERSION = 1;
    let db = null;
    let openPromise = null;
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
    const ensureOpen = () => {
      if (db) return Promise.resolve(db);
      if (!openPromise) openPromise = open().catch((e) => {
        openPromise = null;
        console.warn("[MatchCacheDB] open failed:", e);
        return null;
      });
      return openPromise;
    };
    const get = (matchId) => ensureOpen().then((d) => {
      if (!d) return null;
      return new Promise((resolve) => {
        const req = d.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(parseInt(matchId));
        req.onsuccess = () => {
          var _a;
          return resolve((_a = req.result) != null ? _a : null);
        };
        req.onerror = () => resolve(null);
      });
    });
    const set = (matchId, data) => ensureOpen().then((d) => {
      if (!d) return;
      return new Promise((resolve) => {
        const tx = d.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(data, parseInt(matchId));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    });
    return { get, set };
  })();
  var TmMatchCacheDB = MatchCacheDB;

  // src/lib/club.js
  var Club = {
    "id": null,
    "name": null,
    "nick": null,
    "country": null,
    "division": null,
    "group": null,
    "manager_name": null,
    "fanclub": null,
    "stadium": null,
    "city": null,
    "a_team": null,
    "b_team": null,
    "created": null,
    "is_diamond": null,
    "cash": null,
    "online": null
  };

  // src/lib/match.js
  var createCompetition = () => ({
    name: null,
    // "Super Liga Srbije"
    type: null,
    // "league" | "cup" | "friendly" | "friendly_league"
    //   | "international_cup" | "ntq"
    typeRaw: null,
    // raw API code: "l", "fl", "f", "fq", "p1"–"p9",
    //   "ueg", "ue1", "ue2", "clg", "cl1", "cl2", "ntq"
    division: null,
    // 1, 2, 3 … (for league matches)
    url: null
    // canonical URL for the competition page
  });
  var createVenue = () => ({
    name: null,
    // "Renzo Barbera"
    city: null,
    capacity: null,
    weather: null,
    // "sunny3", "cloudy2", "rainy1", "snow1", "overcast1"
    pitchCondition: null,
    // 0–100
    facilities: {
      sprinklers: null,
      // 0 | 1
      draining: null,
      pitchcover: null,
      heating: null
    },
    picture: null
    // stadium art variant (integer)
  });
  var createTactics = () => ({
    mentality: null,
    // 1 (Very Defensive) → 7 (Very Attacking)
    style: null,
    // "1" Balanced / "2" Direct / "3" Wings /
    //   "4" Short Passing / "5" Long Balls / "6" Through Balls
    focus: null,
    // "1" Balanced / "2" Left / "3" Central / "4" Right
    formation: null
    // "4-4-2" (derived from lineup positions or match_data)
  });
  var createRatings = () => ({
    avg: null,
    // average R5 of the starting XI (= avgR5)
    subs: null,
    // average R5 of bench players
    GK: null,
    // average R5 of goalkeeper line
    DEF: null,
    // average R5 of defensive line
    MID: null,
    // average R5 of midfield line
    ATT: null,
    // average R5 of attacking line
    avgAge: null,
    avgRoutine: null
  });
  var createSide = () => ({
    club: { ...Club },
    // id, name, nick, country, division, stadium, …
    color: null,
    // resolved primary kit color "#3884ff"
    captain: null,
    // player id (Number) of the armband holder
    playerIds: null,
    // Set<string> — computed once from lineup on load
    tactics: createTactics(),
    lineup: [],
    // Player.create() objects + match context fields
    // ── Derived (populated by deriveMatchData / generateTeamData) ──────
    goals: null,
    goalsAgainst: null,
    stats: null,
    // { shots, shotsOnTarget, saves, passes,
    //   passesCompleted, crosses, fouls,
    //   yellowCards, redCards, advanced }
    ratings: createRatings()
  });
  var Match = {
    create() {
      return {
        // ── Identity ─────────────────────────────────────────────────
        id: null,
        // match id (number or string)
        season: null,
        // season number
        // ── When ─────────────────────────────────────────────────────
        date: null,
        // "YYYY-MM-DD"
        kickoff: null,
        // Unix timestamp of scheduled kick-off
        kickoffTime: null,
        // "17:00" time of day
        // ── What competition ──────────────────────────────────────────
        competition: createCompetition(),
        // ── Where ─────────────────────────────────────────────────────
        venue: createVenue(),
        // ── Who ───────────────────────────────────────────────────────
        home: createSide(),
        away: createSide(),
        // ── Outcome ───────────────────────────────────────────────────
        result: {
          home: null,
          // goals scored by home (null = not played yet)
          away: null,
          halftime: { home: null, away: null }
        },
        possession: { home: null, away: null },
        // % at full time
        attendance: null,
        // ── Lifecycle status ──────────────────────────────────────────
        // Explicit — no more inferring from 4 different fields.
        status: null,
        // 'future' | 'live' | 'ended'
        // liveMin: elapsed real-world minutes since kickoff when status='live'.
        // Negative when status='future' (|liveMin| = minutes until kickoff).
        liveMin: null,
        // ── Duration (populated from API, meaningful when ended) ──────
        duration: {
          regular: null,
          // 90 (or last minute of regulation)
          total: null,
          // 94 (including all stoppage time)
          extra: null
          // 4 (added minutes)
        },
        // ── Play engine (immutable after normalizeMatchData) ───────
        // report: raw minute-keyed API events.
        //         normalizeReport() promotes each event's parameters array
        //         to direct properties on the event object (e.g. evt.goal,
        //         evt.yellow, evt.sub) so consumers never touch .parameters.
        // plays:  one Play per attacking chance sequence, built by
        //         buildNormalizedPlays() from the normalized report.
        //         Shape: { [min: string]: Play[] }
        //         Play = { min, team, style, outcome, segments,
        //                  reportEventIndex, severity }
        //         Segment = { clips: Clip[], actions: GameAction[],
        //                     text: string[] }
        //         These two objects never change after normalization.
        report: {},
        plays: {},
        // ── Broadcast state (rebuilt by deriveMatchData each replay step) ──
        // visiblePlays: time-gate of plays — same shape as plays, contains
        //               only the plays at or before the current cursor.
        //               { [min: string]: Play[] }
        visiblePlays: {},
        // events: indexed action log — extracted from the segment.actions of
        //         all visiblePlays.  Rebuilt from visiblePlays each step.
        //
        //         Instead of a generic flat array that every consumer has
        //         to re-filter, the structure pre-indexes by the categories
        //         actually needed at broadcast time:
        //
        //   log          — full chronological list of GameActions (source of truth)
        //                  GameAction = { action, by, player, teamId, home,
        //                                min, evtIdx, …type-specific fields }
        //   score        — current goals.  Maintained as log grows — O(1) read.
        //   mentality    — last recorded mentality for each side — O(1) read.
        //   goals        — subset of log where action='shot' && goal.
        //                  Used for: timeline, goal notifications, scoreline.
        //   cards        — subset of log where action ∈ {yellow,yellowRed,red}.
        //                  Used for: discipline board, player icon overlays.
        //   subs         — subset of log where action ∈ {subIn,subOut}.
        //                  Used for: active lineup reconstruction (much smaller
        //                  than scanning the full log).
        events: {
          log: [],
          score: { home: 0, away: 0 },
          mentality: { home: null, away: null },
          goals: [],
          cards: [],
          subs: []
        },
        // ── Enrichment state ──────────────────────────────────────────
        // profilesReady: false until the tm:match-profiles-ready event fires
        // and lineup players receive their full skill / r5 / asi data.
        // Until then every player has base identity fields only.
        profilesReady: false
      };
    }
  };
  var exampleMatch = Match.create();
  Object.assign(exampleMatch, {
    id: "12345678",
    season: 26,
    date: "2026-03-13",
    kickoff: 1773356400,
    kickoffTime: "17:00",
    competition: { name: "Super Liga Srbije", type: "league", typeRaw: "l", division: 1 },
    venue: {
      name: "Renzo Barbera",
      city: "Beograd",
      capacity: 64e3,
      weather: "sunny3",
      pitchCondition: 72,
      facilities: { sprinklers: 1, draining: 0, pitchcover: 1, heating: 0 },
      picture: 9
    },
    result: { home: 2, away: 1, halftime: { home: 1, away: 0 } },
    possession: { home: 55, away: 45 },
    attendance: 42500,
    status: "ended",
    liveMin: null,
    duration: { regular: 90, total: 94, extra: 4 },
    // At full time, events holds the complete broadcast-state snapshot:
    events: {
      log: [],
      // populated with all GameAction objects by deriveMatchData
      score: { home: 2, away: 1 },
      mentality: { home: 5, away: 4 },
      goals: [],
      // two home goal actions + one away goal action
      cards: [],
      // yellow/red card actions
      subs: []
      // sub actions (used for active lineup reconstruction)
    }
  });
  Object.assign(exampleMatch.home, {
    club: { id: "1001", name: "FK Partizan", nick: "PAR", country: "Serbia", division: 1, group: "1", manager_name: "Marko Kova\u010D", fanclub: 18e3, stadium: "Renzo Barbera" },
    color: "#3884ff",
    captain: 137172448,
    playerIds: /* @__PURE__ */ new Set(),
    // populated with player id strings during normalization
    tactics: { mentality: 5, style: "3", focus: "2", formation: "4-3-3" },
    lineup: [],
    // Player.create() + { position, fp, captain, rec, rating, mom, … }
    goals: 2,
    goalsAgainst: 1,
    stats: { shots: 14, shotsOnTarget: 6, saves: 3, passes: 412, passesCompleted: 327, crosses: 18, fouls: 11, yellowCards: 2, redCards: 0, advanced: {} },
    ratings: { avg: 6.82, subs: 6.45, GK: 7.1, DEF: 6.9, MID: 6.8, ATT: 6.7, avgAge: 25.3, avgRoutine: 58.4 }
  });
  Object.assign(exampleMatch.away, {
    club: { id: "1002", name: "FK Vojvodina", nick: "VOJ", country: "Serbia", division: 1, group: "1", manager_name: "Nikola Petrovi\u0107", fanclub: 9500, stadium: "Kara\u0111or\u0111e stadion" },
    color: "#e63030",
    captain: 139575032,
    playerIds: /* @__PURE__ */ new Set(),
    tactics: { mentality: 3, style: "2", focus: "1", formation: "4-4-2" },
    lineup: [],
    goals: 1,
    goalsAgainst: 2,
    stats: { shots: 8, shotsOnTarget: 3, saves: 5, passes: 298, passesCompleted: 210, crosses: 9, fouls: 14, yellowCards: 3, redCards: 0, advanced: {} },
    ratings: { avg: 6.51, subs: 6.1, GK: 6.8, DEF: 6.5, MID: 6.4, ATT: 6.6, avgAge: 27, avgRoutine: 55.1 }
  });

  // src/constants/countries.js
  var COUNTRIES = {
    // -- Europe ----------------------------------------------------------
    Albania: { suffix: "al", region: "Europe", ueta: [2, 3] },
    Andorra: { suffix: "ad", region: "Europe" },
    Armenia: { suffix: "am", region: "Europe" },
    Austria: { suffix: "at", region: "Europe" },
    Azerbaijan: { suffix: "az", region: "Europe" },
    Belarus: { suffix: "by", region: "Europe" },
    Belgium: { suffix: "be", region: "Europe" },
    "Bosnia-Herzegovina": { suffix: "ba", region: "Europe" },
    Bulgaria: { suffix: "bg", region: "Europe", ueta: [3, 3] },
    Croatia: { suffix: "hr", region: "Europe", ueta: [2, 3] },
    Cyprus: { suffix: "cy", region: "Europe", ueta: [2, 3] },
    "Czech Republic": { suffix: "cz", region: "Europe", ueta: [4, 3] },
    Denmark: { suffix: "dk", region: "Europe", ueta: [2, 3] },
    England: { suffix: "en", region: "Europe", ueta: [3, 3] },
    Estonia: { suffix: "ee", region: "Europe" },
    "Faroe Islands": { suffix: "fo", region: "Europe" },
    Finland: { suffix: "fi", region: "Europe" },
    France: { suffix: "fr", region: "Europe" },
    Georgia: { suffix: "ge", region: "Europe" },
    Germany: { suffix: "de", region: "Europe", ueta: [2, 4] },
    Greece: { suffix: "gr", region: "Europe" },
    Hungary: { suffix: "hu", region: "Europe", ueta: [3, 3] },
    Iceland: { suffix: "is", region: "Europe" },
    Ireland: { suffix: "ie", region: "Europe" },
    Israel: { suffix: "il", region: "Europe" },
    Italy: { suffix: "it", region: "Europe", ueta: [4, 3] },
    Kazakhstan: { suffix: "kz", region: "Europe" },
    Latvia: { suffix: "lv", region: "Europe" },
    Lithuania: { suffix: "lt", region: "Europe" },
    Luxembourg: { suffix: "lu", region: "Europe" },
    Malta: { suffix: "mt", region: "Europe" },
    Moldova: { suffix: "md", region: "Europe" },
    Montenegro: { suffix: "me", region: "Europe" },
    Netherlands: { suffix: "nl", region: "Europe" },
    "North Macedonia": { suffix: "mk", region: "Europe" },
    "Northern Ireland": { suffix: "rt", region: "Europe" },
    Norway: { suffix: "no", region: "Europe", ueta: [2, 4] },
    Poland: { suffix: "pl", region: "Europe", ueta: [2, 3] },
    Portugal: { suffix: "pt", region: "Europe", ueta: [2, 3] },
    Romania: { suffix: "ro", region: "Europe" },
    Russia: { suffix: "ru", region: "Europe" },
    "San Marino": { suffix: "sm", region: "Europe" },
    Scotland: { suffix: "ct", region: "Europe" },
    Serbia: { suffix: "cs", region: "Europe", ueta: [2, 4] },
    Slovakia: { suffix: "sk", region: "Europe" },
    Slovenia: { suffix: "si", region: "Europe" },
    Spain: { suffix: "es", region: "Europe" },
    Sweden: { suffix: "se", region: "Europe" },
    Switzerland: { suffix: "he", region: "Europe" },
    Turkey: { suffix: "tr", region: "Europe", ueta: [4, 3] },
    Ukraine: { suffix: "ua", region: "Europe" },
    Wales: { suffix: "wa", region: "Europe" },
    // -- North America ----------------------------------------------------
    Belize: { suffix: "bz", region: "North America" },
    Canada: { suffix: "ca", region: "North America" },
    "Costa Rica": { suffix: "cr", region: "North America" },
    Cuba: { suffix: "cu", region: "North America" },
    "Dominican Republic": { suffix: "do", region: "North America" },
    "El Salvador": { suffix: "sv", region: "North America" },
    Guatemala: { suffix: "gt", region: "North America" },
    Honduras: { suffix: "hn", region: "North America" },
    Jamaica: { suffix: "jm", region: "North America" },
    Mexico: { suffix: "mx", region: "North America" },
    Panama: { suffix: "pa", region: "North America" },
    "Puerto Rico": { suffix: "pr", region: "North America" },
    "Trinidad & Tobago": { suffix: "tt", region: "North America" },
    USA: { suffix: "us", region: "North America" },
    "West Indian Islands": { suffix: "vc", region: "North America" },
    // -- Asia -------------------------------------------------------------
    Afghanistan: { suffix: "af", region: "Asia" },
    Bahrain: { suffix: "bh", region: "Asia" },
    Bangladesh: { suffix: "bd", region: "Asia" },
    Brunei: { suffix: "bn", region: "Asia" },
    China: { suffix: "cn", region: "Asia" },
    "Hong Kong": { suffix: "hk", region: "Asia" },
    India: { suffix: "in", region: "Asia" },
    Indonesia: { suffix: "id", region: "Asia" },
    Iran: { suffix: "ir", region: "Asia" },
    Iraq: { suffix: "iq", region: "Asia" },
    Japan: { suffix: "jp", region: "Asia" },
    Jordan: { suffix: "jo", region: "Asia" },
    Kuwait: { suffix: "kw", region: "Asia" },
    Lebanon: { suffix: "lb", region: "Asia" },
    Malaysia: { suffix: "my", region: "Asia" },
    Nepal: { suffix: "np", region: "Asia" },
    Oman: { suffix: "om", region: "Asia" },
    Pakistan: { suffix: "pk", region: "Asia" },
    Philippines: { suffix: "ph", region: "Asia" },
    Qatar: { suffix: "qa", region: "Asia" },
    "Saudi Arabia": { suffix: "sa", region: "Asia" },
    Singapore: { suffix: "sg", region: "Asia" },
    "South Korea": { suffix: "kr", region: "Asia" },
    Syria: { suffix: "sy", region: "Asia" },
    Taiwan: { suffix: "tw", region: "Asia" },
    Thailand: { suffix: "th", region: "Asia" },
    "United Emirates": { suffix: "ae", region: "Asia" },
    Vietnam: { suffix: "vn", region: "Asia" },
    // -- Oceania -----------------------------------------------------------
    Australia: { suffix: "au", region: "Oceania" },
    Fiji: { suffix: "fj", region: "Oceania" },
    "New Zealand": { suffix: "nz", region: "Oceania" },
    Oceania: { suffix: "oc", region: "Oceania" },
    // -- South America -----------------------------------------------------
    Argentina: { suffix: "ar", region: "South America" },
    Bolivia: { suffix: "bo", region: "South America" },
    Brazil: { suffix: "br", region: "South America" },
    Chile: { suffix: "cl", region: "South America" },
    Colombia: { suffix: "co", region: "South America" },
    Ecuador: { suffix: "ec", region: "South America" },
    Paraguay: { suffix: "py", region: "South America" },
    Peru: { suffix: "pe", region: "South America" },
    Uruguay: { suffix: "uy", region: "South America" },
    Venezuela: { suffix: "ve", region: "South America" },
    // -- Africa ------------------------------------------------------------
    Algeria: { suffix: "dz", region: "Africa" },
    Angola: { suffix: "ao", region: "Africa" },
    Botswana: { suffix: "bw", region: "Africa" },
    Cameroun: { suffix: "cm", region: "Africa" },
    Chad: { suffix: "td", region: "Africa" },
    Egypt: { suffix: "eg", region: "Africa" },
    Ghana: { suffix: "gh", region: "Africa" },
    "Ivory Coast": { suffix: "ci", region: "Africa" },
    Libya: { suffix: "ly", region: "Africa" },
    Morocco: { suffix: "ma", region: "Africa" },
    Nigeria: { suffix: "ng", region: "Africa" },
    Palestine: { suffix: "so", region: "Africa" },
    Senegal: { suffix: "sn", region: "Africa" },
    "South Africa": { suffix: "za", region: "Africa" },
    Tunisia: { suffix: "tn", region: "Africa" }
  };
  var COUNTRY_BY_SUFFIX = Object.fromEntries(
    Object.entries(COUNTRIES).map(([name, c]) => [c.suffix, name])
  );
  var _REGION_BY_SUFFIX = Object.fromEntries(
    Object.entries(COUNTRIES).map(([, c]) => [c.suffix, c.region])
  );
  var _CUP_GROUP = {
    Europe: { cl: 1, ue: 2 },
    Asia: { cl: 3, ue: 4 },
    Oceania: { cl: 3, ue: 4 },
    Africa: { cl: 3, ue: 4 },
    "North America": { cl: 5, ue: 6 },
    "South America": { cl: 5, ue: 6 }
  };
  var _CUP_NAMES = {
    1: "UETA Champions Cup",
    2: "UETA Cup",
    3: "Champions Cup",
    4: "International Cup",
    5: "Champions Cup",
    6: "International Cup"
  };
  var resolveIntCupUrl = (typeRaw, countrySuffix) => {
    var _a;
    if (!typeRaw || !countrySuffix) return null;
    const tier = typeRaw.startsWith("cl") ? "cl" : typeRaw.startsWith("ue") ? "ue" : null;
    if (!tier) return null;
    const region = _REGION_BY_SUFFIX[countrySuffix];
    if (!region) return null;
    const id = (_a = _CUP_GROUP[region]) == null ? void 0 : _a[tier];
    return id ? `/international-cup/${id}/` : null;
  };
  var resolveCupName = (typeRaw, countrySuffix) => {
    var _a;
    if (!typeRaw || !countrySuffix) return null;
    const tier = typeRaw.startsWith("cl") ? "cl" : typeRaw.startsWith("ue") ? "ue" : null;
    if (!tier) return null;
    const region = _REGION_BY_SUFFIX[countrySuffix];
    if (!region) return null;
    const id = (_a = _CUP_GROUP[region]) == null ? void 0 : _a[tier];
    return id ? _CUP_NAMES[id] || null : null;
  };

  // src/utils/normalize/match.js
  var resolveCompetitionType = (typeRaw) => {
    if (!typeRaw) return null;
    if (typeRaw === "l") return "league";
    if (typeRaw === "fl") return "friendly_league";
    if (typeRaw === "f" || typeRaw === "fq") return "friendly";
    if (typeRaw === "c" || /^p\d+$/.test(typeRaw)) return "cup";
    if (typeRaw === "ntq") return "ntq";
    if (/^(ue|cl)\w*$/.test(typeRaw)) return "international_cup";
    return null;
  };
  var normalizeRawMatchClub = (rawClub, isNt = false) => {
    const id = rawClub.id || null;
    const country = rawClub.country || null;
    const logo = isNt ? country ? `/pics/nt_logos/140px/${country}.png` : "" : id ? rawClub.logo || `/pics/club_logos/${id}_140.png` : "";
    return {
      id: isNt ? null : id,
      name: rawClub.club_name || null,
      nick: rawClub.club_nick || null,
      country,
      logo,
      division: rawClub.division ? Number(rawClub.division) : null,
      group: rawClub.group || null,
      manager_name: rawClub.manager_name || null,
      fanclub: rawClub.fanclub || null,
      stadium: rawClub.stadium || null,
      city: rawClub.city || null
    };
  };
  var applyMatchContext = (player, p, captainId) => {
    var _a;
    player.position = p.position || null;
    if (player.position) {
      player.positions = player.positions || [];
      for (const pos2 of player.positions) pos2.playing = false;
      const key = player.position.toLowerCase();
      let pos = player.positions.find((pos2) => pos2.key === key);
      if (!pos) player.positions.push(pos = { key });
      pos.playing = true;
    }
    player.captain = Number(p.player_id) === captainId;
    player.rating = typeof p.rating === "number" && p.rating > 0 ? p.rating : null;
    player.mom = (_a = p.mom) != null ? _a : 0;
    player.grouped = [];
    player.perMinute = [];
    player.minsPlayed = null;
    return player;
  };
  var normalizeRawMatch = (raw, playersById = /* @__PURE__ */ new Map(), matchId = null) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B;
    const ntMatch = typeof matchId === "string" && matchId.startsWith("nt");
    const match = Match.create();
    const md = raw.match_data || {};
    const venue = md.venue || {};
    match.id = (_b = (_a = raw.match_id) != null ? _a : raw.id) != null ? _b : null;
    match.ntMatch = ntMatch;
    match.season = (_c = raw.season) != null ? _c : null;
    const readable = venue.kickoff_readable || "";
    match.date = readable.split(" ")[0] || null;
    match.kickoff = venue.kickoff ? Number(venue.kickoff) : null;
    match.kickoffTime = md.match_time_of_day || null;
    const typeRaw = venue.matchtype || null;
    match.competition.name = venue.tournament || resolveCupName(typeRaw, (_f = (_e = (_d = raw.club) == null ? void 0 : _d.home) == null ? void 0 : _e.country) != null ? _f : null) || null;
    match.competition.typeRaw = typeRaw;
    match.competition.type = resolveCompetitionType(typeRaw);
    match.competition.url = resolveIntCupUrl(typeRaw, (_i = (_h = (_g = raw.club) == null ? void 0 : _g.home) == null ? void 0 : _h.country) != null ? _i : null);
    const homeDivision = (_k = (_j = raw.club) == null ? void 0 : _j.home) == null ? void 0 : _k.division;
    match.competition.division = homeDivision ? Number(homeDivision) : null;
    match.venue.name = venue.name || null;
    match.venue.city = venue.city || null;
    match.venue.capacity = venue.capacity ? Number(venue.capacity) : null;
    match.venue.weather = venue.weather || null;
    match.venue.pitchCondition = venue.pitch_condition ? Number(venue.pitch_condition) : null;
    match.venue.facilities.sprinklers = (_l = venue.sprinklers) != null ? _l : null;
    match.venue.facilities.draining = (_m = venue.draining) != null ? _m : null;
    match.venue.facilities.pitchcover = (_n = venue.pitchcover) != null ? _n : null;
    match.venue.facilities.heating = (_o = venue.heating) != null ? _o : null;
    match.venue.picture = (_p = venue.picture) != null ? _p : null;
    match.duration.regular = md.regular_last_min ? Number(md.regular_last_min) : null;
    match.duration.total = md.last_min ? Number(md.last_min) : null;
    match.duration.extra = md.extra_time ? Number(md.extra_time) : null;
    match.possession.home = (_r = (_q = md.possession) == null ? void 0 : _q.home) != null ? _r : null;
    match.possession.away = (_t = (_s = md.possession) == null ? void 0 : _s.away) != null ? _t : null;
    match.attendance = md.attendance ? Number(md.attendance) : null;
    const htRaw = (_u = md.halftime) == null ? void 0 : _u.chance;
    if (htRaw) {
      const htText = Array.isArray(htRaw.text) ? htRaw.text[0] : htRaw.text;
      const htLine = Array.isArray(htText) ? htText[0] : htText;
      const htMatch = typeof htLine === "string" ? htLine.match(/(\d+)-(\d+)\.$/) : null;
      if (htMatch) {
        match.result.halftime.home = Number(htMatch[1]);
        match.result.halftime.away = Number(htMatch[2]);
      }
    }
    const rawLiveMin = md.live_min;
    if (typeof rawLiveMin === "number" && rawLiveMin < 0) {
      match.status = "future";
      match.liveMin = rawLiveMin;
    } else if (typeof rawLiveMin === "number" && rawLiveMin > 0) {
      match.status = "live";
      match.liveMin = rawLiveMin;
    } else {
      const kickoffTs = Number(venue.kickoff);
      const now = Math.floor(Date.now() / 1e3);
      match.status = kickoffTs && kickoffTs > now ? "future" : "ended";
      match.liveMin = null;
    }
    for (const side of ["home", "away"]) {
      const rawClub = ((_v = raw.club) == null ? void 0 : _v[side]) || {};
      const rawLineup = ((_w = raw.lineup) == null ? void 0 : _w[side]) || {};
      const captainId = Number(((_x = md.captain) == null ? void 0 : _x[side]) || 0);
      const color = "#" + (((_y = rawClub.colors) == null ? void 0 : _y.club_color1) || (side === "home" ? "4a9030" : "5b9bff"));
      match[side].club = normalizeRawMatchClub(rawClub, ntMatch);
      match[side].color = color;
      match[side].captain = captainId || null;
      match[side].tactics.mentality = ((_z = md.mentality) == null ? void 0 : _z[side]) != null ? Number(md.mentality[side]) : null;
      match[side].tactics.style = ((_A = md.attacking_style) == null ? void 0 : _A[side]) || null;
      match[side].tactics.focus = ((_B = md.focus_side) == null ? void 0 : _B[side]) || null;
      match[side].lineup = Object.values(rawLineup).map((p) => {
        const pid = Number(p.player_id);
        const player = playersById.get(pid) || {
          id: pid,
          name: p.name || p.nameLast || null,
          nameLast: p.nameLast || null,
          age: p.age || null,
          month: null,
          fp: p.fp || null,
          no: p.no || null,
          routine: p.routine ? Number(p.routine) : null,
          rec: p.rec || null,
          udseende2: p.udseende2 || null,
          skills: [],
          positions: [],
          asi: null
        };
        return applyMatchContext(player, p, captainId);
      });
      match[side].playerIds = new Set(Object.keys(rawLineup));
    }
    match.report = raw.report || {};
    TmMatchService.normalizeReport(match.report);
    match.plays = TmMatchService.buildNormalizedPlays(match.report, raw.lineup || {});
    return match;
  };

  // src/services/match.js
  var TmMatchService = {
    /**
     * Fetch the match tooltip (past seasons) from tooltip.ajax.php.
     * @param {string|number} matchId
     * @param {string|number} season
     * @returns {Promise<object|null>}
     */
    fetchMatchTooltip(matchId, season) {
      return _post("/ajax/tooltip.ajax.php", { type: "match", match_id: matchId, season });
    },
    /**
     * Fetch head-to-head match history between two clubs.
     * @param {string|number} homeId
     * @param {string|number} awayId
     * @param {number} date — Unix timestamp of kickoff
     * @returns {Promise<object|null>}
     */
    fetchMatchH2H(homeId, awayId, date) {
      return _get(`/ajax/match_h2h.ajax.php?home_team=${homeId}&away_team=${awayId}&date=${date}`);
    },
    /**
     * Fetch the player tooltip endpoint.
     * Returns the full parsed response (contains .player, .club, etc.) or null.
     * @param {string|number} pid
     * @returns {Promise<{player: object, club: object, [key: string]: any}|null>}
     */
    /**
     * Promote each event's `parameters` array into direct properties on the event object.
     * Mutates in place. After normalization callers read evt.goal, evt.shot, etc. directly.
     * @param {object} report — mData.report keyed by minute string
     */
    normalizeReport(report) {
      for (const evts of Object.values(report || {})) {
        for (const evt of evts) {
          if (!evt.parameters) continue;
          for (const p of evt.parameters) {
            if (p.goal !== void 0) evt.goal = p.goal;
            if (p.shot !== void 0) evt.shot = p.shot;
            if (p.yellow !== void 0) evt.yellow = p.yellow;
            if (p.yellow_red !== void 0) evt.yellow_red = p.yellow_red;
            if (p.red !== void 0) evt.red = p.red;
            if (p.injury !== void 0) evt.injury = p.injury;
            if (p.sub !== void 0) evt.sub = p.sub;
            if (p.penalty !== void 0) evt.penalty = p.penalty;
            if (p.set_piece !== void 0) evt.set_piece = p.set_piece;
            if (p.mentality_change !== void 0) evt.mentality_change = p.mentality_change;
          }
        }
      }
    },
    /**
     * Build the normalized plays structure from a raw match report.
     * Requires normalizeReport() to have been called first.
     * @param {object} report — mData.report (post-normalizeReport)
     * @param {object} lineup — mData.lineup with .home and .away player maps
     * @returns {object} normalized plays keyed by minute string
     */
    buildNormalizedPlays(report, lineup) {
      const { PASS_VIDS: PASS_VIDS2, CROSS_VIDS: CROSS_VIDS2, DEFWIN_VIDS: DEFWIN_VIDS2, FINISH_VIDS: FINISH_VIDS2, RUN_DUEL_VIDS: RUN_DUEL_VIDS2 } = TmConst;
      const nameMap = {};
      ["home", "away"].forEach((side) => {
        Object.values((lineup == null ? void 0 : lineup[side]) || {}).forEach((p) => {
          nameMap[String(p.player_id)] = p.nameLast || p.name || "?";
        });
      });
      const resolveText = (lines) => (lines || []).map((l) => l.replace(/\[player=(\d+)\]/g, (_, pid) => nameMap[pid] || pid));
      const result = {};
      const sortedMins = Object.keys(report || {}).map(Number).sort((a, b) => a - b);
      for (const min of sortedMins) {
        const evts = report[String(min)] || [];
        const plays = [];
        evts.forEach((evt, reportEventIndex) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
          const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, "") : "";
          const vids = (_a = evt.chance) == null ? void 0 : _a.video;
          if (!(vids == null ? void 0 : vids.length)) return;
          const evtHasShot = !!evt.shot;
          const evtShotOnTarget = ((_b = evt.shot) == null ? void 0 : _b.target) === "on";
          const outcome = evt.goal ? "goal" : evt.shot ? "shot" : "lost";
          const clips = [];
          for (let vi = 0; vi < vids.length; vi++) {
            const v = vids[vi];
            const clip = v.video;
            const text = resolveText((_d = (_c = evt.chance) == null ? void 0 : _c.text) == null ? void 0 : _d[vi]);
            const nextClip = vi + 1 < vids.length ? vids[vi + 1].video : null;
            const prevClip = vi > 0 ? vids[vi - 1].video : null;
            const nextIsDefwin = !!(nextClip && DEFWIN_VIDS2.test(nextClip));
            const nextIsFinish = !!(nextClip && FINISH_VIDS2.test(nextClip));
            const prevIsCornerkick = !!(prevClip && /^cornerkick/.test(prevClip));
            const actions = [];
            if (/^penaltyshot$/.test(clip)) {
              const shooter = evt.penalty || ((_e = evt.goal) == null ? void 0 : _e.player) || v.att1;
              if (shooter) {
                const isGoal = !!(evt.goal && String(evt.goal.player) === String(shooter));
                const onTarget = isGoal || /^save/.test(nextClip || "") || /^goal_/.test(nextClip || "");
                actions.push({ action: "shot", by: shooter, onTarget, head: false, foot: true, goal: isGoal, freekick: false, penalty: true });
              }
            } else if (PASS_VIDS2.test(clip)) {
              const isGkDist = /^gk(throw|kick)/.test(clip);
              const by = isGkDist ? v.gk : v.att1;
              if (by) {
                const isPreshort = /^preshort/.test(clip);
                const rawLines = ((_g = (_f = evt.chance) == null ? void 0 : _f.text) == null ? void 0 : _g[vi]) || [];
                const preshortSkip = isPreshort && !rawLines.some((l) => l.includes("[player=" + by + "]"));
                if (!preshortSkip) {
                  const failed = nextIsDefwin;
                  actions.push({ action: "pass", success: !failed, by });
                  if (!failed && evtHasShot) actions.push({ action: "keyPass", by });
                }
              }
            } else if (CROSS_VIDS2.test(clip) && v.att1) {
              if (/^freekick/.test(clip) && evtHasShot) {
                const isGoal = !!(evt.goal && String(evt.goal.player) === String(v.att1));
                const onTarget = isGoal || evtShotOnTarget;
                const penalty = /^p_/.test(gPrefix);
                const freekick = gPrefix === "dire";
                actions.push({ action: "shot", by: v.att1, onTarget, head: false, foot: true, goal: isGoal, freekick, penalty });
                if (isGoal && evt.goal.assist) actions.push({ action: "assist", by: evt.goal.assist });
              } else {
                const failed = nextIsDefwin;
                actions.push({ action: "cross", success: !failed, by: v.att1 });
                if (!failed && evtHasShot) actions.push({ action: "keyPass", by: v.att1 });
              }
            } else if (FINISH_VIDS2.test(clip) && v.att1) {
              if (!nextIsFinish) {
                const isHead = /^header/.test(clip);
                const isGoal = !!(evt.goal && String(evt.goal.player) === String(v.att1));
                const onTarget = isGoal || evtShotOnTarget;
                const penalty = /^p_/.test(gPrefix);
                const freekick = gPrefix === "dire";
                actions.push({ action: "shot", by: v.att1, onTarget, head: isHead, foot: !isHead, goal: isGoal, freekick, penalty });
                if (isGoal && evt.goal.assist) actions.push({ action: "assist", by: evt.goal.assist });
              }
            } else if (DEFWIN_VIDS2.test(clip)) {
              const tAll = (((_h = evt.chance) == null ? void 0 : _h.text) || []).flat();
              const winner = [v.def1, v.def2].find((d) => d && tAll.some((l) => l.includes("[player=" + d + "]")));
              if (winner) {
                if (!prevIsCornerkick) actions.push({ action: "duelWon", by: winner });
                const tSeg = ((_j = (_i = evt.chance) == null ? void 0 : _i.text) == null ? void 0 : _j[vi]) || [];
                const isHeader = /^defwin5$/.test(clip) || tSeg.some((l) => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                const isTackle = /^defwin(3|6)$/.test(clip);
                actions.push({ action: isHeader ? "headerClear" : isTackle ? "tackle" : "interception", by: winner });
              }
            } else if (RUN_DUEL_VIDS2.test(clip)) {
              if (!nextIsDefwin) {
                if (!prevIsCornerkick) {
                  const tAll = (((_k = evt.chance) == null ? void 0 : _k.text) || []).flat();
                  [v.def1, v.def2].forEach((d) => {
                    if (d && tAll.some((l) => l.includes("[player=" + d + "]")))
                      actions.push({ action: "duelLost", by: d });
                  });
                }
                if (nextIsFinish && v.def1) actions.push({ action: "tackleFail", by: v.def1 });
              }
            } else if (/^save/.test(clip) && v.gk) {
              actions.push({ action: "save", by: v.gk });
            } else if (/^foulcall/.test(clip) && v.def1) {
              actions.push({ action: "foul", by: v.def1 });
            } else if (/^yellow/.test(clip)) {
              const pid = evt.yellow || evt.yellow_red || v.def1;
              if (pid) actions.push({ action: evt.yellow_red ? "yellowRed" : "yellow", by: pid });
            } else if (/^red/.test(clip)) {
              const pid = evt.red || v.def1;
              if (pid) actions.push({ action: "red", by: pid });
            } else if (/^sub/.test(clip) && evt.sub) {
              actions.push({ action: "subIn", by: evt.sub.player_in });
              actions.push({ action: "subOut", by: evt.sub.player_out });
              if (evt.sub.player_position) actions.push({ action: "positionChange", by: evt.sub.player_in, position: evt.sub.player_position });
            } else if (/^injury_sub/.test(clip) && evt.sub) {
              actions.push({ action: "subIn", by: evt.sub.player_in });
              actions.push({ action: "subOut", by: evt.sub.player_out });
              if (evt.sub.player_position) actions.push({ action: "positionChange", by: evt.sub.player_in, position: evt.sub.player_position });
            } else if (/^injurystart/.test(clip)) {
            } else if (/^injury/.test(clip) && evt.injury) {
              actions.push({ action: "injury", by: evt.injury });
            }
            clips.push({ video: clip, text, actions });
          }
          if (evt.set_piece && clips.length > 0)
            clips[clips.length - 1].actions.push({ action: "setpiece", by: evt.set_piece, style: gPrefix });
          if (evt.mentality_change && clips.length > 0)
            clips[clips.length - 1].actions.push({ action: "mentality_change", team: String(evt.mentality_change.team), mentality: Number(evt.mentality_change.mentality) });
          plays.push({ team: evt.club, style: gPrefix, outcome, clips, segments: clips, reportEventIndex, severity: evt.severity });
        });
        if (plays.length) result[String(min)] = plays;
      }
      return result;
    },
    fetchMatchRaw(matchId) {
      return _get(`/ajax/match.ajax.php?id=${matchId}`);
    },
    /**
     * Fetch and normalize a match.
     * Returns a canonical Match object (lib/match.js shape).
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    async fetchMatch(matchId) {
      const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
      if (!raw) return null;
      return normalizeRawMatch(raw, /* @__PURE__ */ new Map(), String(matchId));
    },
    /**
     * Fetch a match via the standard match normalization path and return
     * the stats-ready payload consumed by the club statistics page.
     * @param {object} matchInfo
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    async fetchMatchForStats(matchInfo, clubId) {
      const mData = await this.fetchMatch(matchInfo.id);
      if (!mData) return null;
      return TmStatsMatchProcessor.process(matchInfo, mData, clubId);
    },
    /**
     * Strip unnecessary fields from a raw match API response.
     * Removes: udseende2/looks from lineup, text_team from report events,
     * colors/logos/form/meta from club sections.
     * Result is ~30% smaller and fully compatible with all scripts.
     * @param {object} raw — raw response from match.ajax.php
     * @returns {object} compressed raw (still raw shape, not a Match object)
     */
    compressMatch(raw) {
      var _a, _b;
      const cPlayer = (p) => ({
        player_id: Number(p.player_id),
        id: Number(p.player_id),
        name: p.name,
        nameLast: p.nameLast,
        position: p.position,
        fp: p.fp,
        no: p.no,
        rating: p.rating,
        mom: p.mom,
        rec: p.rec,
        routine: p.routine,
        age: p.age,
        udseende2: p.udseende2
      });
      const cLineupSide = (side) => {
        var _a2;
        const out = {};
        for (const [pid, p] of Object.entries(((_a2 = raw.lineup) == null ? void 0 : _a2[side]) || {}))
          out[pid] = cPlayer(p);
        return out;
      };
      const cReport = (report) => {
        const out = {};
        for (const [min, events] of Object.entries(report || {})) {
          out[min] = events.map((evt) => {
            const e = {};
            if (evt.type !== void 0) e.type = evt.type;
            if (evt.club !== void 0) e.club = evt.club;
            if (evt.severity !== void 0) e.severity = evt.severity;
            if (evt.parameters) e.parameters = evt.parameters;
            if (evt.chance) {
              e.chance = {};
              if (evt.chance.video) e.chance.video = evt.chance.video;
              if (evt.chance.text) e.chance.text = evt.chance.text;
            }
            return e;
          });
        }
        return out;
      };
      const cClub = (c) => ({
        id: c.id,
        club_name: c.club_name,
        club_nick: c.club_nick,
        fanclub: c.fanclub,
        stadium: c.stadium,
        manager_name: c.manager_name,
        country: c.country,
        division: c.division,
        group: c.group
      });
      const md = raw.match_data || {};
      return {
        match_data: {
          attacking_style: md.attacking_style,
          mentality: md.mentality,
          focus_side: md.focus_side,
          possession: md.possession,
          attendance: md.attendance,
          regular_last_min: md.regular_last_min,
          extra_time: md.extra_time,
          last_min: md.last_min,
          halftime: md.halftime,
          captain: md.captain,
          venue: md.venue
        },
        lineup: {
          home: cLineupSide("home"),
          away: cLineupSide("away")
        },
        report: cReport(raw.report),
        club: {
          home: ((_a = raw.club) == null ? void 0 : _a.home) ? cClub(raw.club.home) : void 0,
          away: ((_b = raw.club) == null ? void 0 : _b.away) ? cClub(raw.club.away) : void 0
        }
      };
    },
    /**
     * Fetch a match, using TmMatchCacheDB as a cache.
     * First call: fetches from TM API, compresses, stores, returns.
     * Subsequent calls: returns stored compressed record instantly.
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    async fetchMatchCached(matchId) {
      const db = TmMatchCacheDB;
      const cached = await db.get(matchId);
      if (cached) return normalizeRawMatch(cached, /* @__PURE__ */ new Map(), String(matchId));
      const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
      if (!raw) return null;
      const compressed = this.compressMatch(raw);
      db.set(matchId, compressed);
      return normalizeRawMatch(compressed, /* @__PURE__ */ new Map(), String(matchId));
    },
    /**
     * Build a per-minute text schedule from match.plays.
     * Used by the replay loop to know at which second each commentary line appears.
     *
     * @param {object} plays  — match.plays from buildNormalizedPlays
     * @param {number} lineInterval  — seconds between consecutive lines (default 3)
     * @returns {{ schedule: object, eventMins: number[] }}
     */
    buildSchedule(plays, lineInterval = 3) {
      const schedule = {};
      for (const [minStr, minPlays] of Object.entries(plays)) {
        let seconds = 0;
        const entries = [];
        for (const action of minPlays) {
          const lineCount = Math.max(
            1,
            action.clips.reduce((s, clip) => s + clip.text.filter((l) => l.trim()).length, 0)
          );
          for (let actionLineIndex = 0; actionLineIndex < lineCount; actionLineIndex++) {
            entries.push({ actionIndex: action.reportEventIndex, lineIndex: actionLineIndex, seconds });
            seconds += lineInterval;
          }
        }
        if (entries.length) {
          schedule[Number(minStr)] = entries;
        }
      }
      return { schedule };
    }
  };

  // src/lib/player.js
  var createSkills = () => SKILL_DEFS.map((skill) => ({
    ...skill,
    value: null
  }));
  var createPositions = (allPositions = false) => {
    const entries = allPositions ? Object.entries(POSITION_MAP) : Object.entries(POSITION_MAP).filter(([, pos]) => pos.main);
    const positions = entries.map(([key, pos]) => ({ ...pos, key, r5: null, rec: null, preferred: false }));
    if (allPositions) {
      for (const sub of BENCH_SLOTS) positions.push({ key: sub, playing: false });
    }
    return positions;
  };
  var Player = {
    create({ allPositions = false } = {}) {
      return {
        id: null,
        club_id: null,
        club: { ...Club },
        name: null,
        firstname: null,
        lastname: null,
        country: null,
        isGK: null,
        age: null,
        month: null,
        ageMonths: null,
        ageMonthsString: null,
        asi: null,
        routine: null,
        r5: null,
        ti: null,
        wage: null,
        retire: null,
        ban: null,
        injury: null,
        faceUrl: null,
        positions: createPositions(allPositions),
        skills: createSkills(),
        no: null,
        note: null,
        transfer: null,
        training: {
          custom: [null, null, null, null, null, null],
          standard: null
        },
        stats: []
      };
    }
  };

  // src/utils/normalize/club.js
  var normalizeClubFromTooltip = (raw) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    return {
      id: (_a = raw.id) != null ? _a : null,
      name: (_b = raw.club_name) != null ? _b : null,
      nick: (_c = raw.club_nick) != null ? _c : null,
      country: (_d = raw.country) != null ? _d : null,
      division: (_e = raw.division) != null ? _e : null,
      group: (_f = raw.group) != null ? _f : null,
      manager_name: (_g = raw.manager_name) != null ? _g : null,
      fanclub: (_h = raw.fanclub) != null ? _h : null,
      stadium: (_i = raw.stadium) != null ? _i : null,
      city: (_j = raw.city) != null ? _j : null,
      a_team: (_k = raw.a_team) != null ? _k : null,
      b_team: (_l = raw.b_team) != null ? _l : null,
      created: (_m = raw.created) != null ? _m : null,
      is_diamond: (_n = raw.is_diamond) != null ? _n : null,
      cash: (_o = raw.cash) != null ? _o : null,
      online: (_p = raw.online) != null ? _p : null
    };
  };

  // src/utils/normalize/player.js
  var applyPlayerPositionRatings = (player) => {
    player.positions = player.positions.map((position) => ({
      ...position,
      r5: position.id != null && player.asi > 0 ? TmLib.calculatePlayerR5(position, player) : null,
      rec: position.id != null && player.asi > 0 ? TmLib.calculatePlayerREC(position, player) : null
    }));
    const preferredPositions = player.positions.filter((position) => position.preferred);
    const positionsForRatings = preferredPositions.length ? preferredPositions : player.positions;
    player.r5 = positionsForRatings.reduce((best, position) => {
      const value = Number(position == null ? void 0 : position.r5);
      if (!Number.isFinite(value)) return best;
      return best == null || value > best ? value : best;
    }, null);
    player.rec = positionsForRatings.reduce((best, position) => {
      const value = Number(position == null ? void 0 : position.rec);
      if (!Number.isFinite(value)) return best;
      return best == null || value > best ? value : best;
    }, null);
    return player;
  };
  var normalizeTooltipPlayer = (playerData) => {
    var _a, _b;
    const player = Player.create();
    const rawClub = (_a = playerData.club) != null ? _a : {};
    player.club = normalizeClubFromTooltip(rawClub);
    const { player: playerTooltip } = playerData;
    player.club_id = Number(player.club.id);
    player.id = Number(playerTooltip.player_id);
    player.age = Number(playerTooltip.age);
    player.month = Number(playerTooltip.months);
    player.ageMonths = player.age * 12 + player.month;
    player.ageMonthsString = `${player.age}.${player.month}`;
    player.lastname = playerTooltip.lastname;
    player.name = playerTooltip.name;
    player.firstname = playerTooltip.name.split(" ").filter((n) => n !== player.lastname).join(" ");
    player.country = playerTooltip.country;
    player.routine = Number(playerTooltip.routine);
    player.wage = TmUtils.parseNum(playerTooltip.wage, null);
    player.asi = TmUtils.parseNum(playerTooltip.skill_index, null);
    player.rec_sort = (_b = playerTooltip.rec_sort) != null ? _b : null;
    player.no = playerTooltip.no;
    player.retire = playerTooltip.isretirering;
    player.isGK = playerTooltip.fp === "GK";
    player.ti = TmLib.calculateTIPerSession(player);
    player.faceUrl = TmUtils.extractFaceUrl(playerTooltip.appearance, playerTooltip.face_url);
    TmUtils.applyTooltipSkills(player, playerTooltip.skills);
    TmUtils.applyPlayerPositions(player, playerTooltip.favposition);
    player.skills = TmLib.calcSkillDecimalsSimple(player);
    applyPlayerPositionRatings(player);
    player.allPositionRatings = player.positions;
    player.isOwnPlayer = TmUtils.getOwnClubIds().includes(String(player.club_id));
    return player;
  };
  var normalizeSquadPlayer = (postPlayer) => {
    var _a;
    const player = Player.create();
    player.id = Number(postPlayer.player_id || postPlayer.id);
    player.club_id = Number(postPlayer.club_id);
    player.club.id = postPlayer.club_id;
    player.age = Number(postPlayer.age);
    player.month = Number(postPlayer.month);
    player.ageMonths = player.age * 12 + player.month;
    player.ageMonthsString = `${player.age}.${player.month}`;
    player.lastname = postPlayer.lastname;
    player.name = postPlayer.player_name;
    player.firstname = postPlayer.player_name.split(" ").filter((n) => n !== postPlayer.lastname).join(" ");
    player.country = postPlayer.country;
    player.routine = TmUtils.parseNum(Number(postPlayer.rutine), 0);
    player.wage = TmUtils.parseNum(postPlayer.wage, null);
    player.asi = (_a = postPlayer.asi) != null ? _a : null;
    player.no = postPlayer.no;
    player.retire = postPlayer.retire;
    player.ban = postPlayer.ban;
    player.injury = postPlayer.injury;
    player.isGK = postPlayer.fp === "GK";
    player.training.custom = String(postPlayer.training_custom || "").split("").map((v) => parseInt(v) || 0);
    player.training.standard = postPlayer.training;
    player.transfer = postPlayer.transfer;
    TmUtils.applySquadSkills(player, postPlayer);
    TmUtils.applyPlayerPositions(player, postPlayer.favposition);
    applyPlayerPositionRatings(player);
    player.ti = TmLib.calculateTIPerSession(player);
    player.isOwnPlayer = TmUtils.getOwnClubIds().includes(String(player.club_id));
    return player;
  };
  var _extractClub = (html) => {
    var _a, _b;
    if (!html || html === "-") return { name: null, href: null };
    const name = (_a = (html.match(/>([^<]+)<\/a>/) || [])[1]) != null ? _a : null;
    const href = (_b = (html.match(/href="([^"]+)"/) || [])[1]) != null ? _b : null;
    return { name, href };
  };
  var _normalizeStatsRow = (raw, prev) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (raw.season === "transfer") {
      return { type: "transfer", amount: raw.transfer, transferamount: Number(raw.transferamount) || 0 };
    }
    const isTotal = raw.season === "total";
    const games = Number(raw.games) || 0;
    const { name, href } = _extractClub(raw.klubnavn);
    return {
      type: isTotal ? "total" : "season",
      season: isTotal ? "total" : Number(raw.season),
      club_id: isTotal ? null : (_b = (_a = raw.klub_id) != null ? _a : prev == null ? void 0 : prev.club_id) != null ? _b : null,
      club_name: isTotal ? null : (_c = name != null ? name : prev == null ? void 0 : prev.club_name) != null ? _c : null,
      club_href: isTotal ? null : (_d = href != null ? href : prev == null ? void 0 : prev.club_href) != null ? _d : null,
      country: (_e = raw.country) != null ? _e : null,
      division: (_f = raw.division) != null ? _f : null,
      group: (_g = raw.group) != null ? _g : null,
      games,
      goals: Number(raw.goals) || 0,
      conceded: Number(raw.conceded) || 0,
      assists: Number(raw.assists) || 0,
      cards: Number(raw.cards) || 0,
      rating: games > 0 ? (Number(raw.rating) / games * 100 / 100).toFixed(2) : null,
      productivity: Number(raw.productivity) || 0,
      ...isTotal && { mom: Number(raw.mom) || 0 }
    };
  };
  var _normalizeStatsTab = (rows) => {
    if (!Array.isArray(rows)) return [];
    let prev = null;
    return rows.map((raw) => {
      const row = _normalizeStatsRow(raw, prev);
      if (row.type === "season") prev = row;
      return row;
    });
  };
  var normalizePlayerStats = (data) => {
    var _a, _b, _c, _d, _e;
    return {
      nat: _normalizeStatsTab((_a = data == null ? void 0 : data.table) == null ? void 0 : _a.nat),
      cup: _normalizeStatsTab((_b = data == null ? void 0 : data.table) == null ? void 0 : _b.cup),
      int: _normalizeStatsTab((_c = data == null ? void 0 : data.table) == null ? void 0 : _c.int),
      total: _normalizeStatsTab((_d = data == null ? void 0 : data.table) == null ? void 0 : _d.total),
      current_season: (_e = data == null ? void 0 : data.current_season) != null ? _e : null
    };
  };
  var populateSkillIndexFromTI = (tiHistory, currentAsi, isGK = false) => {
    if (!Array.isArray(tiHistory) || !tiHistory.length || !Number.isFinite(Number(currentAsi))) return null;
    tiHistory = tiHistory.slice(1);
    const skillIndex = new Array(tiHistory.length).fill(null);
    let currentSkillSum = TmLib.calcAsiSkillSum({ asi: Number(currentAsi), isGK });
    skillIndex[tiHistory.length - 1] = Number(currentAsi);
    for (let index = tiHistory.length - 2; index >= 0; index -= 1) {
      const nextTI = Number(tiHistory[index + 1]);
      if (!Number.isFinite(nextTI)) return null;
      currentSkillSum -= nextTI / 10;
      skillIndex[index] = TmLib.calcASIFromSkillSum(currentSkillSum, isGK);
    }
    return skillIndex;
  };
  var normalizePlayerGraphs = (graphs, player) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!graphs) return null;
    const TI = (_b = (_a = graphs.TI) != null ? _a : graphs.ti) != null ? _b : null;
    return {
      ...graphs,
      TI,
      skill_index: (_c = graphs.skill_index) != null ? _c : populateSkillIndexFromTI(TI, player == null ? void 0 : player.asi, player == null ? void 0 : player.isGK),
      one_on_ones: (_e = (_d = graphs.one_on_ones) != null ? _d : graphs.oneonones) != null ? _e : null,
      aerial_ability: (_g = (_f = graphs.aerial_ability) != null ? _f : graphs.arialability) != null ? _g : null
    };
  };
  var normalizeSquadPlayerTraining = (data) => {
    var _a;
    if (!data) return null;
    const customRaw = String(data.training_custom || "").trim();
    if (!customRaw) {
      return {
        custom: [null, null, null, null, null, null],
        standard: (_a = data.training) != null ? _a : null
      };
    }
    const customTraining = Array.from({ length: 6 }, (_, i) => {
      const value = customRaw[i];
      return value != null ? Number(value) || 0 : 0;
    });
    return { custom: customTraining, standard: null };
  };
  var normalizePlayerTraining = (data) => {
    var _a;
    const { custom } = data;
    if (!custom.custom_on) {
      return {
        custom: [null, null, null, null, null, null],
        standard: (_a = custom.team) != null ? _a : null
      };
    }
    const customTraining = Array.from({ length: 6 }, (_, i) => {
      var _a2, _b;
      const pts = (_b = (_a2 = custom.custom) == null ? void 0 : _a2[`team${i + 1}`]) == null ? void 0 : _b.points;
      return pts != null ? Number(pts) : null;
    });
    return { custom: customTraining, standard: null };
  };

  // src/services/player.js
  var TmPlayerService = {
    async fetchPlayerTooltip(playerId) {
      const data = await _post("/ajax/tooltip.ajax.php", { player_id: playerId });
      return data ? normalizeTooltipPlayer(data) : null;
    },
    async fetchPlayerInfo(pid, type, extra = {}) {
      return _post("/ajax/players_get_info.ajax.php", {
        player_id: pid,
        type,
        show_non_pro_graphs: true,
        ...extra
      });
    },
    async fetchPlayerGraphs(player) {
      var _a;
      const data = await this.fetchPlayerInfo(player.id, "graphs");
      if (!data) return null;
      return {
        graphs: normalizePlayerGraphs(data == null ? void 0 : data.graphs, player),
        player,
        skillpoints: (_a = data == null ? void 0 : data.skillpoints) != null ? _a : null
      };
    },
    async fetchPlayerHistory(playerId) {
      const data = await this.fetchPlayerInfo(playerId, "history");
      return data ? normalizePlayerStats(data) : null;
    },
    async fetchPlayerTraining(playerId) {
      const data = await this.fetchPlayerInfo(playerId, "training");
      return data ? normalizePlayerTraining(data) : null;
    },
    async fetchPlayerTrainingForSync(player) {
      var _a;
      if (player == null ? void 0 : player.isOwnPlayer) {
        return this.fetchPlayerTraining(player.id);
      }
      const data = await _post("/ajax/players_get_select.ajax.php", {
        type: "change",
        club_id: player == null ? void 0 : player.club_id
      });
      return normalizeSquadPlayerTraining((_a = data == null ? void 0 : data.post) == null ? void 0 : _a[player.id]);
    }
  };

  // src/models/player.js
  var tooltipCache = /* @__PURE__ */ new Map();
  var TmPlayerModel = {
    async fetchPlayerTooltip(playerId) {
      var _a, _b;
      const [player, dbPlayer] = await Promise.all([
        TmPlayerService.fetchPlayerTooltip(playerId),
        TmPlayerDB.get(playerId)
      ]);
      if (!player) return null;
      player.records = (dbPlayer == null ? void 0 : dbPlayer.records) || {};
      const latestRecord = (_a = dbPlayer == null ? void 0 : dbPlayer.records) == null ? void 0 : _a[player.ageMonthsString];
      if (Array.isArray(latestRecord == null ? void 0 : latestRecord.skills) && ((_b = player.skills) == null ? void 0 : _b.length)) {
        player.skills = player.skills.map((skill, index) => ({
          ...skill,
          value: latestRecord.skills[index] != null ? Number(latestRecord.skills[index]) : skill.value
        }));
        applyPlayerPositionRatings(player);
      }
      return player;
    },
    fetchTooltipCached(playerId) {
      if (!tooltipCache.has(playerId)) {
        tooltipCache.set(playerId, this.fetchPlayerTooltip(playerId).finally(() => {
          tooltipCache.delete(playerId);
        }));
      }
      return tooltipCache.get(playerId);
    },
    fetchPlayerInfo(...args) {
      return TmPlayerService.fetchPlayerInfo(...args);
    },
    fetchPlayerGraphs(...args) {
      return TmPlayerService.fetchPlayerGraphs(...args);
    },
    fetchPlayerHistory(...args) {
      return TmPlayerService.fetchPlayerHistory(...args);
    },
    fetchPlayerTraining(...args) {
      return TmPlayerService.fetchPlayerTraining(...args);
    },
    fetchPlayerTrainingForSync(player) {
      return TmPlayerService.fetchPlayerTrainingForSync(player);
    }
  };

  // src/models/match.js
  var TmMatchModel = {
    /**
     * Fetch and normalize a match.
     * Returns a canonical Match object (lib/match.js shape).
     * Derived fields (goals, stats, ratings, visiblePlays, actions) are
     * populated by calling TmMatchUtils.deriveMatchData(liveState) afterwards.
     *
     * @param {string|number} matchId
     * @param {{ dbSync?: boolean }} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatch(matchId) {
      return TmMatchService.fetchMatch(matchId);
    },
    /**
     * Fetch a match from cache (compresses and stores on first load).
     * Returns a canonical Match object.
     *
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    async fetchMatchCached(matchId) {
      return TmMatchService.fetchMatchCached(matchId);
    },
    /**
     * Fetch match data without triggering the async player-profile enrichment.
     * Use when only static match facts are needed (stats page, history, etc.).
     *
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    /**
     * Fetch a match and process it through the stats pipeline.
     *
     * @param {object} matchInfo
     * @param {string|number} clubId
     * @param {{ dbSync?: boolean }} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatchForStats(matchInfo, clubId) {
      return TmMatchService.fetchMatchForStats(matchInfo, clubId);
    },
    /**
     * Build a play-by-play schedule from a raw plays array.
     *
     * @param {Array} plays
     * @param {number} [lineInterval=3]
     * @returns {object}
     */
    buildSchedule(plays, lineInterval = 3) {
      return TmMatchService.buildSchedule(plays, lineInterval);
    },
    /**
     * Fetch the head-to-head history between two clubs.
     *
     * @param {string|number} homeId
     * @param {string|number} awayId
     * @param {number} kickoffTs  Unix timestamp of the reference match kickoff
     * @returns {Promise<object|null>}
     */
    fetchH2H(homeId, awayId, kickoffTs) {
      return TmMatchService.fetchMatchH2H(homeId, awayId, kickoffTs);
    },
    /**
     * Fetch the match tooltip (past season results) from the tooltip endpoint.
     *
     * @param {string|number} matchId
     * @param {string|number} season
     * @returns {Promise<object|null>}
     */
    fetchTooltip(matchId, season) {
      return TmMatchService.fetchMatchTooltip(matchId, season);
    },
    /**
     * Build a canonical Match object directly from a known raw payload.
     * Useful in tests, offline tools, or when a raw response is already in hand.
     *
     * @param {object} raw  match.ajax.php response
     * @returns {object}    Match.create() with static fields populated
     */
    fromRaw(raw) {
      return normalizeRawMatch(raw);
    },
    /**
     * Strip unnecessary display / cache fields from a raw match response.
     * See TmMatchService.compressMatch for the full list of removed fields.
     *
     * @param {object} raw
     * @returns {object}  compressed raw (still raw shape, not a Match object)
     */
    compress(raw) {
      return TmMatchService.compressMatch(raw);
    },
    /**
     * Fetch, normalize and synchronously enrich a match with full player profiles.
     * Unlike fetchMatch (which enriches async/fire-and-forget), this awaits all
     * tooltip fetches before returning — needed by the match player overlay so
     * positions/skills are available on first render.
     *
     * @param {string|number} matchId
     * @returns {Promise<object|null>}  normalized match with plays built
     */
    async fetchMatchWithProfiles(matchId) {
      var _a, _b;
      const raw = await TmMatchService.fetchMatchRaw(matchId);
      if (!raw) return null;
      const allRawPlayers = [
        ...Object.values(((_a = raw.lineup) == null ? void 0 : _a.home) || {}),
        ...Object.values(((_b = raw.lineup) == null ? void 0 : _b.away) || {})
      ];
      const results = await Promise.allSettled(
        allRawPlayers.map((p) => TmPlayerModel.fetchPlayerTooltip(Number(p.player_id)))
      );
      const playersById = /* @__PURE__ */ new Map();
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value)
          playersById.set(r.value.id, r.value);
      });
      return normalizeRawMatch(raw, playersById, String(matchId));
    }
  };

  // src/components/shared/tm-match-tooltip.js
  var STYLE_ID9 = "tmvu-match-tooltip-style";
  var ensureStyles = () => {
    if (document.getElementById(STYLE_ID9)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID9;
    style.textContent = `
        .rnd-h2h-tooltip {
            position: absolute; z-index: 100;
            background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-success);
            border-radius: var(--tmu-space-md); padding: var(--tmu-space-xl) var(--tmu-space-xxl);
            min-width: 520px; max-width: 600px;
            max-height: 75vh; overflow-y: auto;
            box-shadow: 0 8px 32px var(--tmu-shadow-panel);
            pointer-events: auto; opacity: 0; transition: opacity 0.15s;
            left: 50%; top: 100%; transform: translateX(-50%); margin-top: var(--tmu-space-xs);
        }
        .rnd-h2h-tooltip.visible { opacity: 1; }
        .rnd-h2h-tooltip-header {
            display: flex; align-items: center; justify-content: center;
            gap: var(--tmu-space-lg); padding-bottom: var(--tmu-space-md); margin-bottom: var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
        }
        .rnd-h2h-tooltip-logo { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 1px 3px var(--tmu-surface-overlay)); }
        .rnd-h2h-tooltip-team { font-size: var(--tmu-font-md); font-weight: 700; color: var(--tmu-text-main); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rnd-h2h-tooltip-score { font-size: var(--tmu-font-3xl); font-weight: 800; color: var(--tmu-text-inverse); letter-spacing: 3px; text-shadow: 0 0 16px var(--tmu-success-fill-soft); }
        .rnd-h2h-tooltip-meta { display: flex; align-items: center; justify-content: center; gap: var(--tmu-space-xl); font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); margin-bottom: var(--tmu-space-md); }
        .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: var(--tmu-space-xs); }
        .rnd-h2h-tooltip-events { display: flex; flex-direction: column; gap: var(--tmu-space-xs); }
        .rnd-h2h-tooltip-evt { display: flex; align-items: center; gap: var(--tmu-space-md); font-size: var(--tmu-font-sm); color: var(--tmu-text-main); padding: var(--tmu-space-xs) 0; }
        .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
        .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
        .rnd-h2h-tooltip-evt-min { font-weight: 700; color: var(--tmu-text-panel-label); min-width: 32px; font-size: var(--tmu-font-sm); text-align: right; flex-shrink: 0; }
        .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: var(--tmu-font-lg); }
        .rnd-h2h-tooltip-evt-text { color: var(--tmu-text-main); }
        .rnd-h2h-tooltip-evt-assist { font-size: var(--tmu-font-sm); color: var(--tmu-text-faint); font-weight: 500; margin-left: var(--tmu-space-xs); }
        .rnd-h2h-tooltip-mom { margin-top: var(--tmu-space-md); padding-top: var(--tmu-space-md); border-top: 1px solid var(--tmu-border-input-overlay); font-size: var(--tmu-font-sm); color: var(--tmu-text-faint); text-align: center; }
        .rnd-h2h-tooltip-mom span { color: var(--tmu-text-highlight); font-weight: 700; }
        .rnd-h2h-tooltip-divider { height: 1px; background: var(--tmu-border-input-overlay); margin: var(--tmu-space-sm) 0; }
        .rnd-h2h-tooltip-stats { margin: var(--tmu-space-md) 0; }
    `;
    document.head.appendChild(style);
  };
  var buildHeader = ({ homeName = "", awayName = "", homeLogo = "", awayLogo = "", score = "" } = {}) => {
    let html = '<div class="rnd-h2h-tooltip-header">';
    if (homeLogo) html += `<img class="rnd-h2h-tooltip-logo" src="${homeLogo}" onerror="this.style.display='none'">`;
    html += `<span class="rnd-h2h-tooltip-team">${homeName}</span>`;
    html += `<span class="rnd-h2h-tooltip-score">${score}</span>`;
    html += `<span class="rnd-h2h-tooltip-team">${awayName}</span>`;
    if (awayLogo) html += `<img class="rnd-h2h-tooltip-logo" src="${awayLogo}" onerror="this.style.display='none'">`;
    html += "</div>";
    return html;
  };
  var buildMeta = (parts = []) => {
    const visibleParts = parts.filter(Boolean);
    if (!visibleParts.length) return "";
    return `<div class="rnd-h2h-tooltip-meta">${visibleParts.map((part) => `<span>${part}</span>`).join("")}</div>`;
  };
  var buildFinalScore = (matchData) => {
    var _a, _b;
    const md = matchData.match_data || {};
    const report = matchData.report || {};
    let finalScore = "0 - 0";
    const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
    for (let i = allMins.length - 1; i >= 0; i--) {
      const evts = report[allMins[i]];
      if (!Array.isArray(evts)) continue;
      for (let j = evts.length - 1; j >= 0; j--) {
        const params = evts[j].parameters;
        if (!params) continue;
        const goal = Array.isArray(params) ? params.find((item) => item.goal) : params.goal ? params : null;
        if (!goal) continue;
        const goalData = goal.goal || goal;
        if (goalData.score) {
          finalScore = goalData.score.join(" - ");
          break;
        }
      }
      if (finalScore !== "0 - 0") break;
    }
    if (finalScore === "0 - 0" && ((_b = (_a = md.halftime) == null ? void 0 : _a.chance) == null ? void 0 : _b.text)) {
      const halftimeText = md.halftime.chance.text.flat().join(" ");
      const match = halftimeText.match(/(\d+)-(\d+)/);
      if (match) finalScore = `${match[1]} - ${match[2]}`;
    }
    return finalScore;
  };
  var buildRichEvents = (matchData, homeId) => {
    var _a, _b, _c, _d;
    const report = matchData.report || {};
    const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
    const keyEvents = [];
    const byPid = /* @__PURE__ */ new Map();
    const homeArr = Array.isArray((_a = matchData.home) == null ? void 0 : _a.lineup) ? matchData.home.lineup : Object.values(((_b = matchData.lineup) == null ? void 0 : _b.home) || {});
    const awayArr = Array.isArray((_c = matchData.away) == null ? void 0 : _c.lineup) ? matchData.away.lineup : Object.values(((_d = matchData.lineup) == null ? void 0 : _d.away) || {});
    const homeIds = /* @__PURE__ */ new Set();
    homeArr.forEach((p) => {
      var _a2, _b2;
      const pid = String((_b2 = (_a2 = p.id) != null ? _a2 : p.player_id) != null ? _b2 : "");
      byPid.set(pid, p);
      homeIds.add(pid);
    });
    awayArr.forEach((p) => {
      var _a2, _b2;
      const pid = String((_b2 = (_a2 = p.id) != null ? _a2 : p.player_id) != null ? _b2 : "");
      byPid.set(pid, p);
    });
    const pName = (pid) => {
      const p = byPid.get(String(pid != null ? pid : ""));
      return p ? p.lastname || p.nameLast || p.name || "?" : "?";
    };
    const pIsHome = (pid) => homeIds.has(String(pid != null ? pid : ""));
    allMins.forEach((min) => {
      const events = report[min];
      if (!Array.isArray(events)) return;
      events.forEach((event) => {
        if (!event.parameters) return;
        const params = Array.isArray(event.parameters) ? event.parameters : [event.parameters];
        const clubId = String(event.club || "");
        const isHome = clubId === homeId;
        params.forEach((param) => {
          if (param.goal) {
            keyEvents.push({
              min,
              type: "goal",
              isHome,
              name: pName(param.goal.player),
              assist: param.goal.assist ? pName(param.goal.assist) === "?" ? "" : pName(param.goal.assist) : ""
            });
          }
          if (param.yellow) {
            keyEvents.push({ min, type: "yellow", isHome: pIsHome(param.yellow), name: pName(param.yellow) });
          }
          if (param.yellow_red) {
            keyEvents.push({ min, type: "red", isHome: pIsHome(param.yellow_red), name: pName(param.yellow_red) });
          }
          if (param.red) {
            keyEvents.push({ min, type: "red", isHome: pIsHome(param.red), name: pName(param.red) });
          }
        });
      });
    });
    return {
      goals: keyEvents.filter((event) => event.type === "goal"),
      cards: keyEvents.filter((event) => event.type === "yellow" || event.type === "red")
    };
  };
  var buildMom = (label, name, rating = null) => {
    if (!name) return "";
    return `<div class="rnd-h2h-tooltip-mom">\u2B50 ${label}: <span>${name}</span>${rating != null ? ` (${rating})` : ""}</div>`;
  };
  var TmMatchTooltip = {
    ensureStyles,
    buildLegacyTooltipContent(data) {
      const homeName = data.hometeam_name || "";
      const awayName = data.awayteam_name || "";
      const homeLogoId = data.hometeam || "";
      const awayLogoId = data.awayteam || "";
      const homeLogo = homeLogoId ? `/pics/club_logos/${homeLogoId}_140.png` : "";
      const awayLogo = awayLogoId ? `/pics/club_logos/${awayLogoId}_140.png` : "";
      let html = buildHeader({ homeName, awayName, homeLogo, awayLogo, score: data.result || "" });
      html += buildMeta([
        data.date ? `\u{1F4C5} ${data.date}` : "",
        data.attendance_format ? `\u{1F3DF} ${data.attendance_format}` : ""
      ]);
      const report = data.report || {};
      const homeTeamId = String(data.hometeam || homeLogoId);
      const goals = [];
      const cards = [];
      Object.keys(report).forEach((key) => {
        if (key === "mom" || key === "mom_name") return;
        const event = report[key];
        if (!event || !event.minute) return;
        const score = event.score;
        const isHome = String(event.team_scores) === homeTeamId;
        if (score === "yellow" || score === "red" || score === "orange") cards.push({ ...event, isHome });
        else goals.push({ ...event, isHome });
      });
      goals.sort((left, right) => Number(left.minute) - Number(right.minute));
      cards.sort((left, right) => Number(left.minute) - Number(right.minute));
      html += TmMatchUtils.renderLegacyEvents(goals, cards);
      html += buildMom("Man of the Match", report.mom_name || "");
      return html;
    },
    buildRichTooltip(matchData) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
      const md = matchData.match_data || {};
      const homeClub = ((_a = matchData.home) == null ? void 0 : _a.club) || ((_b = matchData.club) == null ? void 0 : _b.home) || {};
      const awayClub = ((_c = matchData.away) == null ? void 0 : _c.club) || ((_d = matchData.club) == null ? void 0 : _d.away) || {};
      const homeName = homeClub.name || homeClub.club_name || "";
      const awayName = awayClub.name || awayClub.club_name || "";
      const homeId = String(homeClub.id || "");
      const awayId = String(awayClub.id || "");
      const homeLogo = homeClub.logo || (homeId ? `/pics/club_logos/${homeId}_140.png` : "");
      const awayLogo = awayClub.logo || (awayId ? `/pics/club_logos/${awayId}_140.png` : "");
      let html = buildHeader({
        homeName,
        awayName,
        homeLogo,
        awayLogo,
        score: buildFinalScore(matchData)
      });
      const venueName = ((_e = matchData.venue) == null ? void 0 : _e.name) || ((_f = md.venue) == null ? void 0 : _f.name) || "";
      const kickoffReadable = ((_g = md.venue) == null ? void 0 : _g.kickoff_readable) || (matchData.date ? `${matchData.date} ${matchData.kickoffTime || ""}` : "");
      const attendance = (_h = matchData.attendance) != null ? _h : md.attendance ? Number(md.attendance) : null;
      html += buildMeta([
        kickoffReadable ? `\u{1F4C5} ${new Date(kickoffReadable.replace(" ", "T")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "",
        venueName ? `\u{1F3DF} ${venueName}` : "",
        attendance ? `\u{1F465} ${Number(attendance).toLocaleString()}` : ""
      ]);
      const events = buildRichEvents(matchData, homeId);
      html += TmMatchUtils.renderRichEvents(events.goals, events.cards);
      const possession = (_i = matchData.possession) != null ? _i : md.possession;
      const stats = md.statistics || {};
      if (possession || stats.home_shots || stats.away_shots || stats.home_on_target || stats.away_on_target) {
        html += TmUI.matchTooltipStats({ possession, statistics: stats, cls: "rnd-h2h-tooltip-stats" });
      }
      const homeArr = Array.isArray((_j = matchData.home) == null ? void 0 : _j.lineup) ? matchData.home.lineup : Object.values(((_k = matchData.lineup) == null ? void 0 : _k.home) || {});
      const awayArr = Array.isArray((_l = matchData.away) == null ? void 0 : _l.lineup) ? matchData.away.lineup : Object.values(((_m = matchData.lineup) == null ? void 0 : _m.away) || {});
      const allPlayers = [...homeArr, ...awayArr];
      const mom = allPlayers.find((player) => player.mom === 1 || player.mom === "1");
      const momName = mom ? mom.lastname || mom.nameLast || mom.name || "" : "";
      html += buildMom("Man of the Match", momName, (mom == null ? void 0 : mom.rating) != null ? parseFloat(mom.rating).toFixed(1) : null);
      return html;
    }
  };

  // src/components/shared/tm-match-hover-card.js
  var state = {
    cache: {},
    tooltipEl: null,
    anchor: null,
    showTimer: null,
    hideTimer: null
  };
  var currentSeason = () => typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
  var injectStyles3 = () => {
    TmMatchTooltip.ensureStyles();
  };
  var buildLegacyTooltipContent = (data) => TmMatchTooltip.buildLegacyTooltipContent(data);
  var buildRichTooltip = (matchData) => TmMatchTooltip.buildRichTooltip(matchData);
  var HOVER_ROW_SELECTOR = '[data-mid][data-match-hover-enabled="1"]';
  var removeTooltip = () => {
    if (state.tooltipEl) {
      state.tooltipEl.remove();
      state.tooltipEl = null;
    }
  };
  var show = (el, matchId, season) => {
    injectStyles3();
    clearTimeout(state.hideTimer);
    removeTooltip();
    state.anchor = el;
    const isCurrentSeason = Number(season) === currentSeason();
    state.tooltipEl = document.createElement("div");
    state.tooltipEl.className = "rnd-h2h-tooltip";
    state.tooltipEl.dataset.forMid = String(matchId);
    state.tooltipEl.style.transform = "none";
    document.body.appendChild(state.tooltipEl);
    TmTooltip.positionTooltip(state.tooltipEl, el);
    state.tooltipEl.addEventListener("mouseenter", () => clearTimeout(state.hideTimer));
    state.tooltipEl.addEventListener("mouseleave", () => {
      state.hideTimer = setTimeout(() => removeTooltip(), 100);
    });
    if (state.cache[matchId]) {
      const cached = state.cache[matchId];
      state.tooltipEl.innerHTML = cached._rich ? buildRichTooltip(cached) : buildLegacyTooltipContent(cached);
      requestAnimationFrame(() => {
        var _a;
        return (_a = state.tooltipEl) == null ? void 0 : _a.classList.add("visible");
      });
      return;
    }
    state.tooltipEl.innerHTML = TmUI.loading("Loading\u2026", true);
    requestAnimationFrame(() => {
      var _a;
      return (_a = state.tooltipEl) == null ? void 0 : _a.classList.add("visible");
    });
    const onFail = () => {
      if (state.tooltipEl) state.tooltipEl.innerHTML = TmUI.error("Failed", true);
    };
    if (isCurrentSeason) {
      TmMatchModel.fetchMatchCached(matchId).then((data) => {
        var _a;
        if (!data) {
          onFail();
          return;
        }
        data._rich = true;
        state.cache[matchId] = data;
        if (((_a = state.tooltipEl) == null ? void 0 : _a.dataset.forMid) === String(matchId)) {
          state.tooltipEl.innerHTML = buildRichTooltip(data);
          TmTooltip.positionTooltip(state.tooltipEl, state.anchor);
        }
      }).catch(onFail);
      return;
    }
    TmMatchModel.fetchTooltip(matchId, season).then((data) => {
      var _a;
      if (!data) {
        onFail();
        return;
      }
      state.cache[matchId] = data;
      if (((_a = state.tooltipEl) == null ? void 0 : _a.dataset.forMid) === String(matchId)) {
        state.tooltipEl.innerHTML = buildLegacyTooltipContent(data);
        TmTooltip.positionTooltip(state.tooltipEl, state.anchor);
      }
    }).catch(onFail);
  };
  var bindContainer = (container) => {
    if (!container || container.__tmMatchHoverBound === "1") return;
    container.__tmMatchHoverBound = "1";
    container.addEventListener("mouseover", (event) => {
      const row = event.target.closest(HOVER_ROW_SELECTOR);
      if (!row || !container.contains(row) || row.contains(event.relatedTarget)) return;
      clearTimeout(state.hideTimer);
      const matchId = row.dataset.mid;
      if (!matchId) return;
      const season = row.dataset.hoverSeason ? Number(row.dataset.hoverSeason) : currentSeason();
      state.showTimer = setTimeout(() => show(row, matchId, season), 300);
    });
    container.addEventListener("mouseout", (event) => {
      const row = event.target.closest(HOVER_ROW_SELECTOR);
      if (!row || !container.contains(row) || row.contains(event.relatedTarget)) return;
      clearTimeout(state.showTimer);
      state.hideTimer = setTimeout(() => removeTooltip(), 100);
    });
  };
  var bind = (rows, { season } = {}) => {
    injectStyles3();
    const resolvedSeason = season != null ? season : currentSeason();
    const containers = /* @__PURE__ */ new Set();
    rows.forEach((row) => {
      var _a;
      if (!((_a = row == null ? void 0 : row.dataset) == null ? void 0 : _a.mid)) return;
      row.dataset.matchHoverEnabled = "1";
      row.dataset.hoverSeason = resolvedSeason == null ? "" : String(resolvedSeason);
      if (row.parentElement) containers.add(row.parentElement);
    });
    containers.forEach(bindContainer);
  };
  var TmMatchHoverCard = {
    injectStyles: injectStyles3,
    bind
  };

  // src/components/shared/tm-page-layout.js
  var STYLE_ID10 = "tmu-page-layout-style";
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
      if (document.getElementById(STYLE_ID10)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID10}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID10;
    style.textContent = TMU_PAGE_LAYOUT_CSS;
    target.appendChild(style);
  }
  injectTmPageLayoutStyles();

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
    }
  };

  // src/models/club.js
  var TmClubModel = {
    fetchClubFixtures(clubId) {
      return TmClubService.fetchClubFixtures(clubId);
    },
    fetchClubMatchHistory(clubId, seasonId) {
      return TmClubService.fetchClubMatchHistory(clubId, seasonId);
    },
    fetchClubLeagueHistory(clubId, seasonId) {
      return TmClubService.fetchClubLeagueHistory(clubId, seasonId);
    },
    fetchClubRecords(clubId) {
      return TmClubService.fetchClubRecords(clubId);
    },
    fetchClubPageHtml(clubId) {
      return TmClubService.fetchClubPageHtml(clubId);
    },
    async fetchSquadRaw(clubId, skillChangesMap = null) {
      const post = await TmClubService.fetchSquadPost(clubId);
      if (!post) return null;
      const players = Object.values(post).map((player) => normalizeSquadPlayer(player));
      return Promise.all(players.map(async (player) => {
        var _a, _b;
        player.weeklyChanges = (skillChangesMap == null ? void 0 : skillChangesMap.get(player.id)) || null;
        const initialDBPlayer = await TmPlayerDB.get(player.id);
        player.records = (initialDBPlayer == null ? void 0 : initialDBPlayer.records) || {};
        const latestRecord = (_a = initialDBPlayer == null ? void 0 : initialDBPlayer.records) == null ? void 0 : _a[player.ageMonthsString];
        if (!Array.isArray(latestRecord == null ? void 0 : latestRecord.skills) || !((_b = player.skills) == null ? void 0 : _b.length)) return player;
        player.skills = player.skills.map((skill, skillIndex) => ({
          ...skill,
          value: latestRecord.skills[skillIndex] != null ? Number(latestRecord.skills[skillIndex]) : skill.value
        }));
        applyPlayerPositionRatings(player);
        const last2Records = Object.values(player.records).reverse().slice(0, 2);
        if (Array.isArray(last2Records) && last2Records.length === 2) {
          player.ti = Number(last2Records[0].TI);
          player.TI_change = Number(last2Records[0].TI) - Number(last2Records[1].TI);
        }
        return player;
      }));
    }
  };

  // src/components/shared/tm-match-ratings.js
  var squadCache = /* @__PURE__ */ new Map();
  var tooltipCache2 = /* @__PURE__ */ new Map();
  var matchCache = /* @__PURE__ */ new Map();
  var fetchSquad = (clubId) => {
    if (!squadCache.has(clubId)) {
      squadCache.set(clubId, TmClubModel.fetchSquadRaw(clubId).then((data) => {
        const post = {};
        (data || []).forEach((player) => {
          post[String(player.id)] = player;
        });
        return { post };
      }).catch(() => ({ post: {} })));
    }
    return squadCache.get(clubId);
  };
  var getPlayerDataFromSquad = async (playerId, squadPost, matchPos) => {
    var _a, _b, _c, _d;
    let player = (_a = squadPost.post) == null ? void 0 : _a[String(playerId)];
    if (!player) {
      if (!tooltipCache2.has(playerId)) {
        tooltipCache2.set(playerId, TmPlayerModel.fetchPlayerTooltip(playerId).then((response) => {
          var _a2;
          return (_a2 = response == null ? void 0 : response.player) != null ? _a2 : null;
        }).catch(() => null));
      }
      player = await tooltipCache2.get(playerId);
    }
    if (!player) return { R5: 0 };
    const posData = (_b = player.positions) == null ? void 0 : _b.find((pos) => {
      var _a2;
      return ((_a2 = pos.position) == null ? void 0 : _a2.toLowerCase()) === matchPos;
    });
    const r5 = Number((_d = (_c = posData == null ? void 0 : posData.r5) != null ? _c : player.r5) != null ? _d : 0);
    return { R5: Number.isFinite(r5) ? r5 : 0 };
  };
  var computeTeamStats = async (playerIds, lineup, squadPost) => {
    const starters = playerIds.filter((id) => {
      var _a;
      return !String(((_a = lineup[id]) == null ? void 0 : _a.position) || "").includes("sub");
    });
    const players = await Promise.all(starters.map(async (id) => {
      const matchPos = lineup[id].position;
      const data = await getPlayerDataFromSquad(id, squadPost, matchPos);
      return { id, ...data };
    }));
    const totals = { R5: 0 };
    players.forEach((player) => {
      totals.R5 += player.R5;
    });
    return { totals, players };
  };
  var fetchMatchR5 = (matchId) => {
    const key = String(matchId);
    if (!matchCache.has(key)) {
      matchCache.set(key, TmMatchModel.fetchMatchCached(key).then(async (data) => {
        var _a, _b, _c, _d;
        if (!((_b = (_a = data == null ? void 0 : data.home) == null ? void 0 : _a.club) == null ? void 0 : _b.id) || !((_d = (_c = data == null ? void 0 : data.away) == null ? void 0 : _c.club) == null ? void 0 : _d.id)) return null;
        const homeId = String(data.home.club.id);
        const awayId = String(data.away.club.id);
        const homeLineupMap = Object.fromEntries(data.home.lineup.map((p) => [String(p.id), p]));
        const awayLineupMap = Object.fromEntries(data.away.lineup.map((p) => [String(p.id), p]));
        const [homeSquad, awaySquad] = await Promise.all([fetchSquad(homeId), fetchSquad(awayId)]);
        const [homeResult, awayResult] = await Promise.all([
          computeTeamStats(Object.keys(homeLineupMap), homeLineupMap, homeSquad),
          computeTeamStats(Object.keys(awayLineupMap), awayLineupMap, awaySquad)
        ]);
        return {
          homeR5: Number((homeResult.totals.R5 / 11).toFixed(2)),
          awayR5: Number((awayResult.totals.R5 / 11).toFixed(2)),
          thresholds: TmConst.R5_THRESHOLDS,
          data
        };
      }).catch(() => null));
    }
    return matchCache.get(key);
  };
  var TmMatchRatings = {
    fetchMatchR5
  };

  // src/components/shared/tm-match-row.js
  var { R5_THRESHOLDS: R5_THRESHOLDS2 } = TmConst;
  var getColor2 = TmUtils.getColor;
  var STYLE_ID11 = "tmvu-match-row-style";
  var escapeHtml3 = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var injectStyles4 = () => {
    if (document.getElementById(STYLE_ID11)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID11;
    style.textContent = `
        .tmvu-match-list {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .tmvu-match-row {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            column-gap: var(--tmu-space-md);
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-faint);
            cursor: pointer;
            transition: background 0.12s;
            font-size: var(--tmu-font-sm);
        }

        .tmvu-match-row:last-child {
            border-bottom: none;
        }

        .tmvu-match-row:hover {
            background: var(--tmu-surface-tab-hover) !important;
        }

        .tmvu-match-highlight {
            outline: 1px solid var(--tmu-border-success);
            outline-offset: -1px;
        }

        .tmvu-match-team {
            min-width: 0;
            display: flex;
            align-items: center;
            color: var(--tmu-text-main);
        }

        .tmvu-match-team-home {
            justify-content: flex-end;
            text-align: right;
        }

        .tmvu-match-team-away {
            justify-content: flex-start;
            text-align: left;
        }

        .tmvu-match-team-inner {
            display: inline-flex;
            align-items: center;
            gap: var(--tmu-space-xs);
            min-width: 0;
            max-width: 100%;
        }

        .tmvu-match-team-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .tmvu-match-team-name a {
            color: var(--tmu-text-main);
            text-decoration: none;
        }

        .tmvu-match-team-name a:hover {
            text-decoration: underline;
        }

        .tmvu-match-flag {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            line-height: 1;
        }

        .tmvu-match-flag img,
        .tmvu-match-flag .flag,
        .tmvu-match-flag [class*="flag-img-"] {
            display: inline-block;
            vertical-align: middle;
        }

        .tmvu-match-score {
            text-align: center;
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            line-height: 1.2;
            padding: var(--tmu-space-xs) var(--tmu-space-sm);
            border-radius: var(--tmu-space-xs);
            display: inline-block;
            color: var(--tmu-text-strong);
            text-decoration: none;
        }

        .tmvu-match-score:hover {
            background: var(--tmu-border-contrast);
        }

        .tmvu-match-score-upcoming {
            color: var(--tmu-text-dim);
            font-weight: 400;
            font-size: var(--tmu-font-xs);
        }

        .tmvu-match-logo {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .tmvu-match-rating {
            width: auto;
            min-width: 0;
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: var(--tmu-text-panel-label);
            line-height: 1;
            white-space: nowrap;
        }

        .tmvu-match-rating-home {
            text-align: right;
        }

        .tmvu-match-rating-away {
            text-align: left;
        }
    `;
    document.head.appendChild(style);
  };
  var renderTeam = (team, side, showLogos) => {
    const safeName = escapeHtml3((team == null ? void 0 : team.name) || "Unknown");
    const rating = `<span class="tmvu-match-rating tmvu-match-rating-${side}" data-role="${side}-rating">\u2014</span>`;
    const logo = showLogos && (team == null ? void 0 : team.id) ? `<img class="tmvu-match-logo" src="/pics/club_logos/${team.id}_25.png" onerror="this.style.visibility='hidden'" alt="">` : rating;
    const flag = (team == null ? void 0 : team.flagHtml) ? `<span class="tmvu-match-flag">${team.flagHtml}</span>` : "";
    const name = `<span class="tmvu-match-team-name"><a href="${(team == null ? void 0 : team.href) || "#"}">${safeName}</a></span>`;
    if (side === "home") return `${name}${flag}${logo}`;
    return `${logo}${flag}${name}`;
  };
  var render = ({
    matchId,
    season,
    isPlayed,
    isHighlight,
    scoreText,
    scoreHref,
    home,
    away
  }, {
    index = 0,
    showLogos = true
  } = {}) => {
    injectStyles4();
    const scoreClass = isPlayed ? "tmvu-match-score" : "tmvu-match-score tmvu-match-score-upcoming";
    const safeScore = escapeHtml3(scoreText || "\u2014");
    const scoreHtml = scoreHref ? `<a class="${scoreClass}" href="${scoreHref}">${safeScore}</a>` : `<span class="${scoreClass}">${safeScore}</span>`;
    return `
        <div class="tmvu-match-row${isHighlight ? " tmvu-match-highlight" : ""}"
            data-mid="${matchId || ""}" data-season="${season || ""}" data-played="${isPlayed ? "1" : "0"}">
            <div class="tmvu-match-team tmvu-match-team-home">
                <span class="tmvu-match-team-inner">${renderTeam(home, "home", showLogos)}</span>
            </div>
            ${scoreHtml}
            <div class="tmvu-match-team tmvu-match-team-away">
                <span class="tmvu-match-team-inner">${renderTeam(away, "away", showLogos)}</span>
            </div>
        </div>
    `;
  };
  var updateRatingCells = (matchId, homeR5, awayR5) => {
    const colorHome = getColor2(homeR5, R5_THRESHOLDS2);
    const colorAway = getColor2(awayR5, R5_THRESHOLDS2);
    document.querySelectorAll(`.tmvu-match-row[data-mid="${matchId}"]`).forEach((row) => {
      const homeEl = row.querySelector('[data-role="home-rating"]');
      const awayEl = row.querySelector('[data-role="away-rating"]');
      if (homeEl) {
        homeEl.textContent = homeR5.toFixed(2);
        homeEl.style.color = colorHome;
      }
      if (awayEl) {
        awayEl.textContent = awayR5.toFixed(2);
        awayEl.style.color = colorAway;
      }
    });
  };
  var bindScopeNavigation = (scope) => {
    if (!scope || scope.__tmMatchRowClickBound === "1") return;
    scope.__tmMatchRowClickBound = "1";
    scope.addEventListener("click", (event) => {
      const row = event.target.closest(".tmvu-match-row[data-mid]");
      if (!row || !scope.contains(row) || event.target.closest("a")) return;
      const mid = row.dataset.mid;
      if (!mid) return;
      const urlPath = /^nt(\d+)$/.test(mid) ? "nt/" + mid.slice(2) : mid;
      window.location.href = `/matches/${urlPath}/`;
    });
  };
  var enhance = (scope, { season } = {}) => {
    injectStyles4();
    bindScopeNavigation(scope);
    const rows = Array.from(scope.querySelectorAll(".tmvu-match-row[data-mid]")).filter((row) => row.dataset.mid);
    rows.forEach((row) => {
      if (row.dataset.played === "1" && row.dataset.r5Requested !== "1") {
        row.dataset.r5Requested = "1";
        TmMatchRatings.fetchMatchR5(row.dataset.mid).then((result) => {
          if (!result) return;
          updateRatingCells(row.dataset.mid, result.homeR5, result.awayR5);
        });
      }
    });
    TmMatchHoverCard.bind(rows.filter((row) => row.dataset.played === "1"), { season });
  };
  var TmMatchRow = {
    render,
    enhance
  };

  // src/components/shared/tm-side-menu.js
  var STYLE_ID12 = "tmvu-side-menu-style";
  function injectStyles5() {
    if (document.getElementById(STYLE_ID12)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID12;
    style.textContent = `
        .tmvu-side-menu {
            flex: 0 0 184px;
            position: sticky;
            top: var(--tmu-space-lg);
            align-self: flex-start;
        }

        .tmvu-side-menu-nav {
            background: var(--tmu-surface-dark-strong);
            border: 1px solid var(--tmu-border-soft);
            border-radius: var(--tmu-space-sm);
            box-shadow: 0 0 9px var(--tmu-shadow-ring);
            overflow: hidden;
        }

        .tmvu-side-menu-nav .tmu-list-item {
            min-height: 40px;
            padding: 0 var(--tmu-space-lg);
            border-bottom: 1px solid var(--tmu-border-faint);
            color: var(--tmu-text-panel-label);
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item:last-of-type {
            border-bottom: none;
        }

        .tmvu-side-menu-nav .tmu-list-item:hover {
            background: var(--tmu-surface-tab-hover);
            color: var(--tmu-text-strong);
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item:focus,
        .tmvu-side-menu-nav .tmu-list-item:active,
        .tmvu-side-menu-nav .tmu-list-item:visited {
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item.is-active {
            color: var(--tmu-text-strong);
            background: linear-gradient(180deg, var(--tmu-success-fill-hover), var(--tmu-success-fill-faint));
            box-shadow: inset 3px 0 0 var(--tmu-accent);
        }

        .tmvu-side-menu-nav .tmu-list-icon {
            width: 18px;
            font-size: var(--tmu-font-md);
        }

        .tmvu-side-menu-separator {
            height: 1px;
            background: var(--tmu-border-soft);
        }

        .tmvu-side-menu-subtitle {
            padding: var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-xs);
            font-size: var(--tmu-font-xs);
            font-weight: 800;
            color: var(--tmu-text-faint);
            text-transform: uppercase;
            letter-spacing: .08em;
        }
    `;
    document.head.appendChild(style);
  }
  function buildMenuHtml(items) {
    return `
        <div class="tmvu-side-menu-nav">
            ${items.map((item) => {
      if (item.type === "separator") return '<div class="tmvu-side-menu-separator"></div>';
      if (item.type === "subtitle") return `<div class="tmvu-side-menu-subtitle">${item.label}</div>`;
      return `<tm-list-item data-href="${item.href}" data-icon="${item.icon || ""}" data-label="${item.label}"></tm-list-item>`;
    }).join("")}
        </div>
    `;
  }
  function applyActiveState(root, currentHref) {
    root.querySelectorAll(".tmu-list-item[href]").forEach((node) => {
      if (node.getAttribute("href") === currentHref) node.classList.add("is-active");
    });
  }
  function mount(mainContainer, { id, className = "", items = [], currentHref = "" } = {}) {
    if (!mainContainer || !items.length || id && document.getElementById(id)) return null;
    injectStyles5();
    const nav = document.createElement("aside");
    if (id) nav.id = id;
    nav.className = `tmvu-side-menu ${className}`.trim();
    TmUI.render(nav, buildMenuHtml(items));
    applyActiveState(nav, currentHref);
    mainContainer.insertBefore(nav, mainContainer.firstChild);
    return nav;
  }
  var TmSideMenu = { mount };

  // src/components/shared/tm-tournament-page.js
  var TmTournamentPage = {
    mount(main, {
      pageClass,
      navId,
      navClass,
      menuItems = [],
      currentHref = "",
      mainClass,
      sideClass,
      mainNodes = [],
      sideNodes = [],
      season = null
    } = {}) {
      if (!main) return;
      main.innerHTML = "";
      if (pageClass) main.classList.add(...String(pageClass).split(/\s+/).filter(Boolean));
      TmSideMenu.mount(main, {
        id: navId,
        className: navClass,
        items: menuItems,
        currentHref
      });
      const mainColumn = document.createElement("section");
      if (mainClass) mainColumn.className = mainClass;
      mainNodes.filter(Boolean).forEach((node) => mainColumn.appendChild(node));
      let sideColumn = null;
      if (sideNodes.filter(Boolean).length) {
        sideColumn = document.createElement("aside");
        if (sideClass) sideColumn.className = sideClass;
        sideNodes.filter(Boolean).forEach((node) => sideColumn.appendChild(node));
      }
      main.append(mainColumn);
      if (sideColumn) main.append(sideColumn);
      TmMatchRow.enhance(main, { season });
      return { mainColumn, sideColumn };
    }
  };

  // src/components/shared/tm-tournament-cards.js
  var STYLE_ID13 = "tmvu-tournament-cards-style";
  var escapeHtml4 = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var injectStyles6 = () => {
    if (document.getElementById(STYLE_ID13)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID13;
    style.textContent = `
        .tmvu-cup-note {
            padding: var(--tmu-space-md) var(--tmu-space-md);
            background: var(--tmu-surface-tab-active);
            border: 1px solid var(--tmu-border-input-overlay);
            border-radius: var(--tmu-space-sm);
            color: var(--tmu-text-main);
            line-height: 1.55;
        }

        .tmvu-cup-note p {
            margin: 0;
        }

        .tmvu-cup-note a {
            color: var(--tmu-text-strong);
            text-decoration: none;
        }

        .tmvu-cup-route-round {
            color: var(--tmu-text-panel-label);
            font-size: var(--tmu-font-xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
        }

        .tmvu-cup-route-round-header {
            padding: var(--tmu-space-sm) var(--tmu-space-md) 0;
            color: var(--tmu-text-panel-label);
            font-size: var(--tmu-font-xs);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
        }

        .tmvu-cup-round-groups {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-md);
        }

        .tmvu-cup-round-group {
            padding: var(--tmu-space-md);
            background: var(--tmu-surface-tab-active);
            border: 1px solid var(--tmu-border-input-overlay);
            border-radius: var(--tmu-space-sm);
        }

        .tmvu-cup-round-group .tmvu-cup-route-round,
        .tmvu-cup-round-group .tmvu-match-list {
            margin-top: var(--tmu-space-sm);
        }

        .tmvu-cup-history-winners {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--tmu-space-md);
        }

        .tmvu-cup-history-item {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-md);
            padding: var(--tmu-space-md);
            background: var(--tmu-surface-tab-active);
            border: 1px solid var(--tmu-border-input-overlay);
            border-radius: var(--tmu-space-sm);
        }

        .tmvu-cup-history-item img {
            width: 42px;
            height: 42px;
            object-fit: contain;
            flex-shrink: 0;
        }

        .tmvu-cup-history-copy {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--tmu-space-xs);
        }

        .tmvu-cup-history-club {
            line-height: 1.2;
        }

        .tmvu-cup-history-item a {
            color: var(--tmu-text-strong);
            text-decoration: none;
            font-weight: 700;
        }

        .tmvu-cup-history-item a:hover {
            text-decoration: underline;
        }

        .tmvu-cup-history-league {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.35;
            text-align: left;
        }

        .tmvu-cup-side-copy {
            color: var(--tmu-text-main);
            line-height: 1.6;
        }

        .tmvu-cup-side-copy p {
            margin: 0 0 var(--tmu-space-md);
        }

        .tmvu-cup-side-copy p:last-child {
            margin-bottom: 0;
        }
    `;
    document.head.appendChild(style);
  };
  var buildFixtureList = (matches, { season = null } = {}) => {
    injectStyles6();
    return `
        <div class="tmvu-match-list">
            ${matches.map((match, index) => TmMatchRow.render({
      matchId: match.matchId,
      season,
      isPlayed: match.isPlayed,
      isHighlight: match.isHighlight,
      scoreText: match.scoreText,
      scoreHref: match.scoreHref,
      home: match.home,
      away: match.away
    }, {
      index,
      showLogos: false
    })).join("")}
        </div>
    `;
  };
  var buildGroupedFixtureList = (groups, { season = null } = {}) => {
    injectStyles6();
    return `
        <div class="tmvu-cup-round-groups">
            ${(groups || []).map((group) => `
                <section class="tmvu-cup-round-group">
                    <div class="tmvu-cup-route-round">${escapeHtml4(group.label || "Round")}</div>
                    ${buildFixtureList(group.matches || [], { season })}
                </section>
            `).join("")}
        </div>
    `;
  };
  var renderDrawCard = (section, { season = null, icon = "\u2694" } = {}) => {
    injectStyles6();
    const wrap = document.createElement("section");
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml4(section.title)}" data-icon="${icon}">
            ${buildFixtureList(section.rows || [], { season })}
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
  };
  var renderGroupedFixturesCard = (section, { season = null, icon = "\u{1F4C5}" } = {}) => {
    injectStyles6();
    const wrap = document.createElement("section");
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml4(section.title)}" data-icon="${icon}">
            ${buildGroupedFixtureList(section.groups || [], { season })}
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
  };
  var renderRouteCard = (routeRows, overview = {}, { season = null, title = "Route", icon = "\u{1F4C8}" } = {}) => {
    injectStyles6();
    const wrap = document.createElement("section");
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml4(title)}" data-icon="${icon}">
            <div class="tmvu-match-list">
                ${routeRows.map((match, index) => `
                    <div class="tmvu-cup-route-round-header">${escapeHtml4(match.roundLabel || "Match")}</div>
                    ${TmMatchRow.render({
      matchId: match.matchId,
      season,
      isPlayed: match.isPlayed,
      isHighlight: match.isHighlight,
      scoreText: match.scoreText,
      scoreHref: match.scoreHref,
      home: match.home,
      away: match.away
    }, {
      index,
      showLogos: false
    })}
                `).join("")}
            </div>
            ${overview.sponsorHtml ? `<div class="tmvu-cup-note">${overview.sponsorHtml}</div>` : ""}
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
  };
  var renderHistoryCard = (history, { title = "History", icon = "\u{1F4DC}" } = {}) => {
    injectStyles6();
    const wrap = document.createElement("section");
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml4(title)}" data-icon="${icon}">
            <div class="tmvu-cup-history-winners">
                ${(history.historyItems || []).map((item) => `
                    <div class="tmvu-cup-history-item">
                        ${item.imageSrc ? `<img src="${item.imageSrc}" alt="Tournament history">` : ""}
                        <div class="tmvu-cup-history-copy">
                            <div class="tmvu-cup-history-club">${item.clubHtml || ""}</div>
                            <div class="tmvu-cup-history-league">${escapeHtml4(item.leagueText)}</div>
                        </div>
                    </div>
                `).join("")}
            </div>
            <div class="tmvu-cup-side-copy">
                ${(history.paragraphs || []).join("")}
            </div>
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
  };
  var TmTournamentCards = {
    injectStyles: injectStyles6,
    buildFixtureList,
    buildGroupedFixtureList,
    renderDrawCard,
    renderGroupedFixturesCard,
    renderRouteCard,
    renderHistoryCard
  };

  // src/pages/cup.js
  function initCupPage(main) {
    if (!main || !main.isConnected) return;
    const sourceRoot = document.querySelector(".main_center") || main;
    const STYLE_ID14 = "tmvu-cup-style";
    const CURRENT_SEASON = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    const injectStyles7 = () => {
      if (document.getElementById(STYLE_ID14)) return;
      injectTmPageLayoutStyles();
      const style = document.createElement("style");
      style.id = STYLE_ID14;
      style.textContent = `
            .tmvu-cup-page {
                --tmu-page-main-track: minmax(0, 0.88fr);
                --tmu-page-rail-width: 360px;
            }

            .tmvu-cup-side {
                align-self: start;
            }

            .tmvu-cup-club {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-xl);
                font-weight: 800;
                line-height: 1.05;
                text-decoration: none;
            }

            .tmvu-cup-club:hover {
                color: var(--tmu-text-strong);
                text-decoration: underline;
            }

            .tmvu-cup-subcopy {
                 margin-top: var(--tmu-space-sm);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-sm);
                line-height: 1.45;
            }

            .tmvu-cup-subcopy a {
                color: var(--tmu-text-main);
                text-decoration: none;
            }

            .tmvu-cup-subcopy a:hover {
                text-decoration: underline;
            }

            .tmvu-cup-sponsor {
                padding: var(--tmu-space-md);
                background: var(--tmu-surface-tab-active);
                border: 1px solid var(--tmu-border-input-overlay);
                border-radius: var(--tmu-space-sm);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.55;
                text-align: right;
            }

            .tmvu-cup-sponsor p {
                margin: 0;
            }

            .tmvu-cup-sponsor a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            @media (max-width: 1320px) {
                .tmvu-cup-page {
                    --tmu-page-main-track: minmax(0, 0.94fr);
                    --tmu-page-rail-width: 320px;
                }
            }
        `;
      document.head.appendChild(style);
    };
    const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const htmlOf2 = (node) => node ? node.outerHTML : "";
    const extractClubId = (node) => {
      if (!node) return "";
      const explicit = node.getAttribute("club_link");
      if (explicit) return String(explicit);
      const href = node.getAttribute("href") || "";
      const match = href.match(/\/club\/(\d+)\//);
      return match ? match[1] : "";
    };
    const extractMatchId = (node) => {
      if (!node) return "";
      const explicit = node.getAttribute("match_link");
      if (explicit) return String(explicit);
      const href = node.getAttribute("href") || "";
      const match = href.match(/\/matches\/(\d+)\//);
      return match ? match[1] : "";
    };
    const parseMatchRow = (row, roundLabel = "") => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 3) return null;
      const progressMode = cells.length >= 4;
      const roundCell = progressMode ? cells[0] : null;
      const homeCell = progressMode ? cells[1] : cells[0];
      const scoreCell = progressMode ? cells[2] : cells[1];
      const awayCell = progressMode ? cells[3] : cells[2];
      const homeAnchor = homeCell == null ? void 0 : homeCell.querySelector('a[club_link], a[href*="/club/"]');
      const awayAnchor = awayCell == null ? void 0 : awayCell.querySelector('a[club_link], a[href*="/club/"]');
      if (!homeAnchor || !awayAnchor) return null;
      const scoreAnchor = scoreCell == null ? void 0 : scoreCell.querySelector('a[match_link], [match_link], a[href*="/matches/"]');
      const scoreText = cleanText((scoreCell == null ? void 0 : scoreCell.textContent) || "");
      const matchId = extractMatchId(scoreAnchor);
      const scoreHref = matchId ? `/matches/${matchId}/` : "";
      return {
        roundLabel: cleanText((roundCell == null ? void 0 : roundCell.textContent) || roundLabel),
        matchId,
        scoreText: scoreText || "\u2014",
        scoreHref,
        scoreHtml: (scoreCell == null ? void 0 : scoreCell.innerHTML) || "",
        isPlayed: /\d+\s*-\s*\d+/.test(scoreText),
        isHighlight: row.classList.contains("highlighted_row_done") || !!row.querySelector(".highlight_td"),
        home: {
          id: extractClubId(homeAnchor),
          name: cleanText(homeAnchor.textContent) || cleanText((homeCell == null ? void 0 : homeCell.textContent) || ""),
          href: homeAnchor.getAttribute("href") || "#"
        },
        away: {
          id: extractClubId(awayAnchor),
          name: cleanText(awayAnchor.textContent) || cleanText((awayCell == null ? void 0 : awayCell.textContent) || ""),
          href: awayAnchor.getAttribute("href") || "#"
        }
      };
    };
    const parseMenu = () => {
      return Array.from(sourceRoot.querySelectorAll(".column1 .content_menu > *")).flatMap((node) => {
        if (node.tagName === "HR") return [{ type: "separator" }];
        if (node.tagName !== "A") return [];
        return [{
          type: "link",
          href: node.getAttribute("href") || "#",
          label: cleanText(node.textContent),
          icon: /cup/i.test(node.textContent) ? "\u{1F3C6}" : /fixture/i.test(node.textContent) ? "\u{1F4C5}" : /stat/i.test(node.textContent) ? "\u{1F4CA}" : /history/i.test(node.textContent) ? "\u{1F4DC}" : "\u{1F4CB}"
        }];
      });
    };
    const parseOverview = () => {
      var _a, _b, _c;
      const box = sourceRoot.querySelector(".column2_a > .box");
      if (!box) return null;
      const clubLink = box.querySelector(".box_sub_header .large a[club_link]");
      const competitionWrap = box.querySelector(".box_sub_header .large");
      const changeLink = box.querySelector(".box_sub_header a.float_right");
      const emblem = box.querySelector(".align_center img");
      const roundLink = box.querySelector('.align_center a[href*="/fixtures/cup/"]');
      const roundText = cleanText(((_a = box.querySelector(".align_center")) == null ? void 0 : _a.textContent) || "");
      const progressHeading = Array.from(box.querySelectorAll("h3")).find((node) => /progress/i.test(node.textContent || ""));
      const progressStd = progressHeading == null ? void 0 : progressHeading.nextElementSibling;
      const progressRows = Array.from((progressStd == null ? void 0 : progressStd.querySelectorAll("table tr")) || []).map((row) => {
        var _a2;
        const cells = row.querySelectorAll("td");
        return {
          round: cleanText(((_a2 = cells[0]) == null ? void 0 : _a2.textContent) || ""),
          homeHtml: cells[1] ? cells[1].innerHTML : "",
          scoreHtml: cells[2] ? cells[2].innerHTML : "",
          awayHtml: cells[3] ? cells[3].innerHTML : "",
          isHighlight: row.classList.contains("highlighted_row_done") || row.querySelector(".highlight_td")
        };
      });
      const sponsorP = (_b = progressStd == null ? void 0 : progressStd.querySelector("p")) == null ? void 0 : _b.cloneNode(true);
      if (sponsorP) {
        const countryLink = sponsorP.querySelector('a[href*="/national-teams/"]');
        if (countryLink && ((_c = countryLink.nextSibling) == null ? void 0 : _c.nodeName) !== "BR") {
          countryLink.insertAdjacentHTML("afterend", "<br>");
        }
      }
      const sponsorHtml = (sponsorP == null ? void 0 : sponsorP.outerHTML) || "";
      let competitionHtml = "";
      if (competitionWrap) {
        const clone = competitionWrap.cloneNode(true);
        clone.querySelectorAll("a[club_link]").forEach((node) => node.remove());
        clone.querySelectorAll("br").forEach((br) => br.replaceWith(document.createTextNode(" ")));
        competitionHtml = clone.innerHTML.trim();
      }
      return {
        clubName: cleanText((clubLink == null ? void 0 : clubLink.textContent) || "Cup"),
        clubHref: (clubLink == null ? void 0 : clubLink.getAttribute("href")) || "#",
        changeHtml: htmlOf2(changeLink),
        competitionHtml,
        emblemSrc: (emblem == null ? void 0 : emblem.getAttribute("src")) || "",
        currentRoundHref: (roundLink == null ? void 0 : roundLink.getAttribute("href")) || "",
        currentRoundLabel: cleanText((roundLink == null ? void 0 : roundLink.textContent) || ""),
        roundText,
        progressRows,
        sponsorHtml
      };
    };
    const parseDrawSections = () => {
      var _a;
      const secondBox = sourceRoot.querySelectorAll(".column2_a > .box")[1];
      if (!secondBox) return [];
      const sections = [];
      let currentTitle = "";
      Array.from(((_a = secondBox.querySelector(".box_body")) == null ? void 0 : _a.children) || []).forEach((node) => {
        if (node.tagName === "H3") {
          currentTitle = cleanText(node.textContent);
          return;
        }
        if (!currentTitle || !node.classList.contains("std")) return;
        const rows = Array.from(node.querySelectorAll("table tr")).map((row) => parseMatchRow(row, currentTitle)).filter(Boolean);
        sections.push({ title: currentTitle, rows });
      });
      return sections;
    };
    const parseRouteRows = () => {
      const box = sourceRoot.querySelector(".column2_a > .box");
      if (!box) return [];
      const heading = Array.from(box.querySelectorAll("h3")).find((node) => /progress/i.test(node.textContent || ""));
      const progressStd = heading == null ? void 0 : heading.nextElementSibling;
      return Array.from((progressStd == null ? void 0 : progressStd.querySelectorAll("table tr")) || []).map((row) => parseMatchRow(row)).filter(Boolean);
    };
    const parseHistoryPanel = () => {
      const box = sourceRoot.querySelector(".column3_a .box");
      if (!box) return null;
      const historyItems = Array.from(box.querySelectorAll('.align_center[style*="display: inline-block"]')).map((node) => {
        var _a;
        const clubAnchor = node.querySelector("a[club_link]");
        const clone = node.cloneNode(true);
        clone.querySelectorAll("img, a[club_link]").forEach((el) => el.remove());
        return {
          imageSrc: ((_a = node.querySelector("img")) == null ? void 0 : _a.getAttribute("src")) || "",
          clubHtml: (clubAnchor == null ? void 0 : clubAnchor.outerHTML) || "",
          leagueText: cleanText(clone.textContent || "")
        };
      });
      const paragraphs = Array.from(box.querySelectorAll(".std p")).map((node) => node.outerHTML);
      return { historyItems, paragraphs };
    };
    const renderOverviewCard = (overview) => {
      const wrap = document.createElement("section");
      TmPageHero.mount(wrap, {
        slots: {
          kicker: "Cup",
          title: `<a class="tmvu-cup-club" href="${overview.clubHref}">${overview.clubName}</a>`,
          main: `<div class="tmvu-cup-subcopy">${overview.competitionHtml}</div>`,
          side: overview.sponsorHtml ? `<div class="tmvu-cup-sponsor">${overview.sponsorHtml}</div>` : ""
        }
      });
      return wrap.firstElementChild || wrap;
    };
    const renderRouteCard2 = (routeRows, overview) => TmTournamentCards.renderRouteCard(routeRows, { ...overview, sponsorHtml: "" }, { season: CURRENT_SEASON });
    const renderDrawCard2 = (section) => TmTournamentCards.renderDrawCard(section, { season: CURRENT_SEASON });
    const renderHistoryCard2 = (history) => TmTournamentCards.renderHistoryCard(history);
    const render2 = () => {
      injectStyles7();
      TmTournamentCards.injectStyles();
      TmMatchHoverCard.injectStyles();
      const menuItems = parseMenu();
      const overview = parseOverview();
      const routeRows = parseRouteRows();
      const drawSections = parseDrawSections();
      const history = parseHistoryPanel();
      if (!overview) return;
      TmTournamentPage.mount(main, {
        pageClass: "tmvu-cup-page tmu-page-layout-3rail tmu-page-density-regular",
        navId: "tmvu-cup-nav",
        navClass: "tmvu-cup-nav tmu-page-sidebar-stack",
        menuItems,
        currentHref: "/cup/",
        mainClass: "tmvu-cup-main tmu-page-section-stack",
        sideClass: "tmvu-cup-side tmu-page-rail-stack",
        mainNodes: [renderOverviewCard(overview), ...drawSections.map(renderDrawCard2)],
        sideNodes: [routeRows.length ? renderRouteCard2(routeRows, overview) : null, history ? renderHistoryCard2(history) : null],
        season: CURRENT_SEASON
      });
    };
    render2();
  }
})();
