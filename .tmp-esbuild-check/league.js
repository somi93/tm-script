(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/components/shared/tm-button.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Button \u2500\u2500 */
.tmu-btn {
    border: none; cursor: pointer;
    font-family: inherit; font-weight: 700; letter-spacing: 0.3px;
    transition: background 0.15s, opacity 0.15s;
}
.tmu-btn-variant-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-variant-icon {
    display: inline-flex; align-items: center; justify-content: center;
    background: none !important; border: none !important; padding: 0 !important; min-width: 0;
}
.tmu-btn-variant-icon:hover:not(:disabled) { background: none !important; }
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
`
  }));
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
     * @param {string}      [opts.size]    — 'xs' | 'sm' | 'md' (default: 'md')
     * @param {string}      [opts.shape]   — 'md' | 'full' (default: 'md')
     * @param {string}      [opts.cls]     — extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {string}      [opts.type]    — button type attribute (default: 'button')
     * @param {object}      [opts.attrs]   — extra attributes to set on the button element
     * @param {Function}    [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    button({ label, slot, id, title = "", variant = "button", color = "lime", size = "md", shape = "md", cls = "", block = false, disabled = false, type = "button", attrs = {}, onClick } = {}) {
      const SIZES = { xs: "py-0 px-2 text-xs", sm: "py-1 px-3 text-sm", md: "py-2 px-3 text-sm" };
      const SHAPES = { md: "rounded-md", full: "rounded-full" };
      const COLORS = /* @__PURE__ */ new Set(["primary", "secondary", "danger", "lime"]);
      const resolvedVariant = COLORS.has(variant) ? "button" : variant;
      const resolvedColor = COLORS.has(variant) ? variant : color;
      const btn = document.createElement("button");
      btn.className = `tmu-btn tmu-btn-variant-${resolvedVariant} tmu-btn-${resolvedColor} ${SHAPES[shape] || SHAPES.md} ${SIZES[size] || SIZES.md}${block ? " tmu-btn-block" : ""}${cls ? " " + cls : ""}`;
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
      if (slot instanceof Node) {
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
    gap: 6px;
    cursor: pointer;
    color: #8aac72;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
}
.tmu-checkbox-wrap:has(.tmu-checkbox:disabled) {
    cursor: not-allowed;
    color: #5a7a48;
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
    border: 1px solid var(--tmu-checkbox-border, rgba(255,255,255,0.25));
    border-radius: 2px;
    background: var(--tmu-checkbox-bg, rgba(255,255,255,0.08));
    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tmu-checkbox::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 3px;
    height: 7px;
    border: solid rgba(10,18,6,0.92);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: 0;
}
.tmu-checkbox:checked {
    background: var(--tmu-checkbox-checked-bg, #4a8a30);
    border-color: var(--tmu-checkbox-checked-border, var(--tmu-checkbox-checked-bg, #4a8a30));
}
.tmu-checkbox:checked::after {
    opacity: 1;
}
.tmu-checkbox:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(128,224,72,0.22);
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
    border-radius: 4px;
    background: rgba(0,0,0,.25);
    border: 1px solid rgba(42,74,28,.6);
    color: #e8f5d8;
    font-weight: 600;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}
.tmu-input:focus { border-color: #6cc040; }
.tmu-input:disabled { color: #6a7f5c; cursor: not-allowed; }
.tmu-input::placeholder { color: #5a7a48; }
.tmu-input[type="number"] { -moz-appearance: textfield; }
.tmu-input[type="number"]::-webkit-inner-spin-button,
.tmu-input[type="number"]::-webkit-outer-spin-button { opacity: 1; filter: invert(0.6); }
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
.tmu-input-density-compact { min-height: 26px; padding: 4px 8px; }
.tmu-input-density-regular { min-height: 30px; padding: 4px 8px; }
.tmu-input-density-comfy { min-height: 34px; padding: 8px 10px; }
.tmu-input-tone-default { }
.tmu-input-tone-overlay {
    background: rgba(0,0,0,.35);
    border-color: rgba(61,104,40,.4);
    color: #c8e0b4;
}
.tmu-input-tone-overlay:focus { border-color: rgba(108,192,64,.6); }
.tmu-input-tone-overlay:disabled { color: #3a5228; }
.tmu-input-tone-overlay::placeholder { color: #4a6a38; }
.tmu-field { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tmu-field-label { font-size: 10px; font-weight: 600; color: #90b878; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
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
      if (value !== void 0 && value !== null) input.value = String(value);
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
    gap: 8px;
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
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    background: #0d1a07;
    border: 1px solid rgba(61,104,40,0.5);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    scrollbar-width: thin;
    scrollbar-color: #3d6828 transparent;
    box-shadow: 0 6px 20px rgba(0,0,0,0.6);
}
.tmu-ac-drop.tmu-ac-drop-open {
    display: block;
}
.tmu-ac-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-size: 11px;
    color: #c8e0b4;
    cursor: pointer;
    border-bottom: 1px solid rgba(61,104,40,0.08);
}
.tmu-ac-item:hover {
    background: rgba(61,104,40,0.22);
    color: #e8f5d8;
}
.tmu-ac-item.tmu-ac-item-active {
    color: #6cc040;
    font-weight: 700;
}
.tmu-ac-item-icon,
.tmu-ac-media {
    width: 20px;
    height: 13px;
    object-fit: cover;
    border-radius: 2px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
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
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Badge \u2500\u2500 */
.tmu-badge{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:0;border:1px solid transparent;box-sizing:border-box;line-height:1.2;text-decoration:none}
.tmu-badge-label{color:inherit;opacity:.92}
.tmu-badge-value{color:#fff;font-weight:inherit}
.tmu-badge-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
.tmu-badge a{color:#fff;text-decoration:none}
.tmu-badge a:hover{text-decoration:underline}
.tmu-badge-size-xs{min-height:16px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.05em}
.tmu-badge-size-sm{min-height:18px;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em}
.tmu-badge-size-md{min-height:22px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.03em}
.tmu-badge-shape-rounded{border-radius:4px}
.tmu-badge-shape-full{border-radius:999px}
.tmu-badge-weight-regular{font-weight:600}
.tmu-badge-weight-bold{font-weight:700}
.tmu-badge-weight-heavy{font-weight:800}
.tmu-badge-uppercase{text-transform:uppercase}
.tmu-badge-tone-muted{background:rgba(200,224,180,.08);border-color:rgba(200,224,180,.12);color:#8aac72}
.tmu-badge-tone-success{background:#1a3a10;border-color:rgba(108,192,64,.3);color:#6cc040}
.tmu-badge-tone-warn{background:#4a2a10;border-color:rgba(240,160,64,.3);color:#f0a040}
.tmu-badge-tone-info{background:#10304a;border-color:rgba(96,176,255,.34);color:#60b0ff}
.tmu-badge-tone-accent{background:#2a1040;border-color:rgba(192,144,255,.34);color:#c090ff}
.tmu-badge-tone-danger{background:#3a1a1a;border-color:rgba(240,64,64,.28);color:#f04040}
.tmu-badge-tone-live{background:#0a2a1a;border-color:#40c080;color:#80ffcc}
.tmu-badge-tone-preview{background:#0a1830;border-color:#2060a0;color:#a0c8ff}
.tmu-badge-tone-highlight{background:#2a1a00;border-color:#a06010;color:#ffe080}
` }));
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
.tmu-chip{display:inline-flex;align-items:center;justify-content:center;gap:4px;border:1px solid transparent;box-sizing:border-box}
.tmu-chip-label{color:inherit;opacity:.9}
.tmu-chip-value{color:#fff;font-weight:inherit}
.tmu-chip a{color:#fff;text-decoration:none}
.tmu-chip a:hover{text-decoration:underline}
.tmu-chip-size-xs{min-height:16px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.05em;line-height:1.2}
.tmu-chip-size-sm{min-height:18px;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1.2}
.tmu-chip-size-md{min-height:22px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.04em;line-height:1.2}
.tmu-chip-shape-rounded{border-radius:4px}
.tmu-chip-shape-full{border-radius:999px}
.tmu-chip-weight-regular{font-weight:600}
.tmu-chip-weight-bold{font-weight:700}
.tmu-chip-weight-heavy{font-weight:800}
.tmu-chip-uppercase{text-transform:uppercase}
.tmu-chip-gk,.tmu-chip-tone-success{background:rgba(108,192,64,.15);border-color:rgba(108,192,64,.24);color:#6cc040}
.tmu-chip-d {background:rgba(110,181,255,.12);border-color:rgba(110,181,255,.2);color:#6eb5ff}
.tmu-chip-m {background:rgba(255,215,64,.1);border-color:rgba(255,215,64,.18);color:#ffd740}
.tmu-chip-f {background:rgba(255,112,67,.12);border-color:rgba(255,112,67,.2);color:#ff7043}
.tmu-chip-default,.tmu-chip-tone-muted{background:rgba(200,224,180,.08);border-color:rgba(200,224,180,.12);color:#8aac72}
.tmu-chip-tone-overlay{background:rgba(42,74,28,.34);border-color:rgba(78,130,54,.22);color:#c8e0b4}
.tmu-chip-tone-warn{background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.24);color:#f59e0b}
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
.tmu-cstat-header{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:5px}
.tmu-cstat-val{font-weight:800;min-width:32px;font-variant-numeric:tabular-nums}
.tmu-cstat-val-left{text-align:left}
.tmu-cstat-val-right{text-align:right}
.tmu-cstat-val-leading{font-weight:900}
.tmu-cstat-label{font-weight:600;color:#8aac72;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.tmu-cstat-bar{display:flex;overflow:hidden;background:rgba(0,0,0,.18);gap:2px}
.tmu-cstat-seg{transition:width .5s cubic-bezier(.4,0,.2,1);min-width:3px}
.tmu-cstat-size-sm{padding:8px 0}
.tmu-cstat-size-sm .tmu-cstat-val{font-size:14px;min-width:30px}
.tmu-cstat-size-sm .tmu-cstat-val-leading{font-size:16px}
.tmu-cstat-size-sm .tmu-cstat-bar{height:6px;border-radius:3px}
.tmu-cstat-size-sm .tmu-cstat-seg{border-radius:3px}
.tmu-cstat-size-md{padding:10px 16px}
.tmu-cstat-size-md .tmu-cstat-val{font-size:15px}
.tmu-cstat-size-md .tmu-cstat-val-leading{font-size:17px}
.tmu-cstat-size-md .tmu-cstat-bar{height:7px;border-radius:4px}
.tmu-cstat-size-md .tmu-cstat-seg{border-radius:3px}
.tmu-cstat-highlight{background:rgba(60,120,40,.06)}
.tmu-cstat-tone-home,.tmu-cstat-tone-for{color:#80e048}
.tmu-cstat-tone-away,.tmu-cstat-tone-against{color:#5ba8f0}
.tmu-cstat-seg.tmu-cstat-tone-home,.tmu-cstat-seg.tmu-cstat-tone-for{background:linear-gradient(90deg,#4a9030,#6cc048)}
.tmu-cstat-seg.tmu-cstat-tone-away,.tmu-cstat-seg.tmu-cstat-tone-against{background:linear-gradient(90deg,#3a7ab8,#5b9bff)}
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
.tmu-metric{min-width:0}
.tmu-metric-copy{min-width:0}
.tmu-metric-label{color:#7fa669;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.tmu-metric-value{margin-top:4px;color:#eef8e8;font-weight:800;line-height:1.25;word-break:break-word;font-variant-numeric:tabular-nums}
.tmu-metric-note{margin-top:4px;color:#8aac72;font-size:11px;line-height:1.45}
.tmu-metric-value a,.tmu-metric-note a{color:inherit;text-decoration:none}
.tmu-metric-value a:hover,.tmu-metric-note a:hover{text-decoration:underline}
.tmu-metric-size-sm .tmu-metric-value{font-size:14px}
.tmu-metric-size-md .tmu-metric-value{font-size:16px}
.tmu-metric-size-lg .tmu-metric-value{font-size:18px;font-weight:900}
.tmu-metric-size-xl .tmu-metric-value{font-size:28px;font-weight:900;line-height:1}
.tmu-metric-align-left{text-align:left}
.tmu-metric-align-center{text-align:center}
.tmu-metric-align-right{text-align:right}
.tmu-metric-layout-card{padding:12px 14px;border-radius:10px;background:rgba(12,24,9,.35);border:1px solid rgba(61,104,40,.18)}
.tmu-metric-layout-split{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 10px;border-radius:4px;background:rgba(42,74,28,.25);border:1px solid rgba(42,74,28,.4)}
.tmu-metric-layout-split .tmu-metric-copy{flex:1 1 auto;min-width:0}
.tmu-metric-layout-split .tmu-metric-value{margin-top:0;text-align:right;font-size:12px}
.tmu-metric-layout-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.tmu-metric-layout-row .tmu-metric-copy{flex:1 1 auto}
.tmu-metric-layout-row .tmu-metric-label{font-size:11px;letter-spacing:.04em;text-transform:none;color:#8aac72}
.tmu-metric-layout-row .tmu-metric-value{margin-top:0;text-align:right}
.tmu-metric-layout-row.tmu-metric-size-sm .tmu-metric-value{font-size:14px}
.tmu-metric-layout-row.tmu-metric-size-md .tmu-metric-value{font-size:16px}
.tmu-metric-layout-row.tmu-metric-size-lg .tmu-metric-value{font-size:18px}
.tmu-metric-label-bottom .tmu-metric-label{margin-top:3px}
.tmu-metric-label-bottom .tmu-metric-value{margin-top:0}
.tmu-metric-size-xl.tmu-metric-label-bottom .tmu-metric-label{font-size:9px;letter-spacing:.05em}
.tmu-metric-tone-muted{background:rgba(12,24,9,.28);border-color:rgba(61,104,40,.14)}
.tmu-metric-tone-overlay{background:rgba(18,33,12,.34);border-color:rgba(61,104,40,.16)}
.tmu-metric-tone-panel{background:linear-gradient(180deg, rgba(0,0,0,.16), rgba(42,74,28,.24));border-color:rgba(74,144,48,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
.tmu-metric-tone-success{background:rgba(21,48,16,.34);border-color:rgba(108,192,64,.18)}
.tmu-metric-tone-warn{background:rgba(48,34,10,.32);border-color:rgba(245,158,11,.2)}
.tmu-metric-tone-danger{background:rgba(52,18,18,.32);border-color:rgba(239,68,68,.18)}
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

  // src/components/shared/tm-stat.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Stat row \u2500\u2500 */
.tmu-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 11px; color: #c8e0b4; }
.tmu-stat-row + .tmu-stat-row { border-top: 1px solid rgba(61,104,40,.15); }
.tmu-stat-lbl { color: #6a9a58; font-weight: 600; font-size: 10px; text-transform: uppercase; }
.tmu-stat-val { font-weight: 700; font-variant-numeric: tabular-nums; }
` }));
  var TmStat = {
    /**
     * Returns an HTML string for a label/value stat row.
     * @param {string} label
     * @param {string} [html]    — value HTML (default: '')
     * @param {string} [variant] — extra CSS class on .tmu-stat-val
     * @returns {string}
     */
    stat: (label, html = "", variant = "") => `<div class="tmu-stat-row"><span class="tmu-stat-lbl">${label}</span><span class="tmu-stat-val${variant ? " " + variant : ""}">${html}</span></div>`
  };

  // src/components/shared/tm-tooltip-stats.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Tooltip stat triplets \u2500\u2500 */
.tmu-tstats{display:grid;grid-template-columns:1fr auto 1fr;gap:4px 12px;margin:10px 0;font-size:14px}
.tmu-tstats-home{text-align:right;font-weight:700;color:#b8d8a0}
.tmu-tstats-label{text-align:center;font-size:10px;color:#5a7a48;text-transform:uppercase;letter-spacing:.08em;font-weight:600;padding:0 6px}
.tmu-tstats-away{text-align:left;font-weight:700;color:#b8d8a0}
.tmu-tstats-home.is-leading,.tmu-tstats-away.is-leading{color:#6adc3a}
` }));
  var escapeHtml = (value) => String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var attrText = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join("");
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
  var TmTooltipStats = {
    tooltipStats({ rows = [], cls = "", attrs = {} } = {}) {
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
        return `<span class="tmu-tstats-home${leftLead}">${escapeHtml(leftValue)}</span><span class="tmu-tstats-label">${escapeHtml(row.label)}</span><span class="tmu-tstats-away${rightLead}">${escapeHtml(rightValue)}</span>`;
      }).join("");
      return `<div class="${classes.join(" ")}"${attrText(attrs)}>${html}</div>`;
    },
    matchTooltipStats({ possession, statistics = {}, cls = "", attrs = {} } = {}) {
      const rows = buildMatchRows({ possession, statistics });
      return this.tooltipStats({ rows, cls, attrs });
    }
  };

  // src/components/shared/tm-render.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Card \u2500\u2500 */
.tmu-card { background: #1c3410; border: 1px solid #28451d; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 8px; box-shadow: 0 0 9px #192a19; }
.tmu-card-head { font-size: 10px; font-weight: 700; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #3d6828; }
.tmu-card-head-btn { background: none; border: none; color: #6a9a58; cursor: pointer; font-size: 13px; padding: 0 2px; line-height: 1; transition: color .15s; }
.tmu-card-head-btn:hover { color: #80e048; }
.tmu-card-body { padding: 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.tmu-card-body-flush { padding: 4px; gap: 2px; }
/* \u2500\u2500 Divider \u2500\u2500 */
.tmu-divider { height: 1px; background: #3d6828; margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: 8px; color: #6a9a58; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 2px; margin-top: 2px; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: rgba(42,74,28,.5); }
/* \u2500\u2500 List item \u2500\u2500 */
.tmu-list-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #90b878; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.tmu-list-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
button.tmu-list-item { background: transparent; border: none; cursor: pointer; font-family: inherit; text-align: left; width: 100%; border-radius: 5px; }
` }));
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
      el.querySelectorAll("tm-card").forEach((tmCard) => {
        const card = document.createElement("div");
        card.className = "tmu-card";
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
            if (handlers[action]) hBtn.addEventListener("click", handlers[action]);
            head.appendChild(hBtn);
            refs[action] = hBtn;
          }
          if (tmCard.dataset.headRef) refs[tmCard.dataset.headRef] = head;
          card.appendChild(head);
        }
        const body = document.createElement("div");
        body.className = "tmu-card-body" + (tmCard.dataset.flush !== void 0 ? " tmu-card-body-flush" : "");
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
          onClick: action ? handlers[action] : void 0
        });
        if (tmBtn.getAttribute("title")) btn.title = tmBtn.getAttribute("title");
        if (tmBtn.getAttribute("style")) btn.setAttribute("style", tmBtn.getAttribute("style"));
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
          if (handlers[action]) node.addEventListener("click", handlers[action]);
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
    MIN_WAGE_FOR_TI: () => MIN_WAGE_FOR_TI,
    POSITION_MAP: () => POSITION_MAP,
    POSITION_ORDER: () => POSITION_ORDER,
    WAGE_RATE: () => WAGE_RATE
  });
  var POSITION_MAP = {
    gk: { id: 9, position: "GK", ordering: 0, color: "#4ade80" },
    dc: { id: 0, position: "DC", ordering: 1, color: "#60a5fa" },
    dcl: { id: 0, position: "DCL", ordering: 1, color: "#60a5fa" },
    dcr: { id: 0, position: "DCR", ordering: 1, color: "#60a5fa" },
    dl: { id: 1, position: "DL", ordering: 2, color: "#60a5fa" },
    dr: { id: 1, position: "DR", ordering: 2, color: "#60a5fa" },
    dmc: { id: 2, position: "DMC", ordering: 3, color: "#fbbf24" },
    dmcl: { id: 2, position: "DMCL", ordering: 3, color: "#fbbf24" },
    dmcr: { id: 2, position: "DMCR", ordering: 3, color: "#fbbf24" },
    dml: { id: 3, position: "DML", ordering: 4, color: "#fbbf24" },
    dmr: { id: 3, position: "DMR", ordering: 4, color: "#fbbf24" },
    mc: { id: 4, position: "MC", ordering: 5, color: "#fbbf24" },
    mcl: { id: 4, position: "MCL", ordering: 5, color: "#fbbf24" },
    mcr: { id: 4, position: "MCR", ordering: 5, color: "#fbbf24" },
    ml: { id: 5, position: "ML", ordering: 6, color: "#fbbf24" },
    mr: { id: 5, position: "MR", ordering: 6, color: "#fbbf24" },
    omc: { id: 6, position: "OMC", ordering: 8, color: "#fbbf24" },
    omcl: { id: 6, position: "OMCL", ordering: 8, color: "#fbbf24" },
    omcr: { id: 6, position: "OMCR", ordering: 8, color: "#fbbf24" },
    oml: { id: 7, position: "OML", ordering: 7, color: "#fbbf24" },
    omr: { id: 7, position: "OMR", ordering: 7, color: "#fbbf24" },
    fc: { id: 8, position: "FC", ordering: 9, color: "#f87171" },
    fcl: { id: 8, position: "FCL", ordering: 9, color: "#f87171" },
    fcr: { id: 8, position: "FCR", ordering: 9, color: "#f87171" }
  };
  var POSITION_ORDER = {
    gk: 0,
    dl: 1,
    dcl: 2,
    dc: 3,
    dcr: 4,
    dr: 5,
    dml: 6,
    dmcl: 7,
    dmc: 8,
    dmcr: 9,
    dmr: 10,
    ml: 11,
    mcl: 12,
    mc: 13,
    mcr: 14,
    mr: 15,
    oml: 16,
    omcl: 17,
    omc: 18,
    omcr: 19,
    omr: 20,
    fcl: 21,
    fc: 22,
    fcr: 23
  };
  var AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];
  var WAGE_RATE = 15.8079;
  var MIN_WAGE_FOR_TI = 3e4;

  // src/constants/match.js
  var match_exports = {};
  __export(match_exports, {
    ACTION_CLS: () => ACTION_CLS,
    ACTION_LABELS: () => ACTION_LABELS,
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
  var ACTION_LABELS = {
    pass_ok: "pass \u2713",
    pass_fail: "pass \u2717",
    cross_ok: "cross \u2713",
    cross_fail: "cross \u2717",
    shot: "shot",
    save: "save",
    goal: "goal",
    assist: "assist",
    duel_won: "duel \u2713",
    duel_lost: "duel \u2717",
    intercept: "INT",
    tackle: "TKL",
    header_clear: "HC",
    tackle_fail: "TF",
    foul: "foul",
    yellow: "\u{1F7E8}",
    red: "\u{1F7E5}"
  };
  var ACTION_CLS = {
    pass_ok: "shot",
    pass_fail: "lost",
    cross_ok: "shot",
    cross_fail: "lost",
    shot: "shot",
    save: "shot",
    goal: "goal",
    assist: "goal",
    duel_won: "shot",
    duel_lost: "lost",
    intercept: "shot",
    tackle: "shot",
    header_clear: "shot",
    tackle_fail: "lost",
    foul: "lost",
    yellow: "lost",
    red: "lost"
  };

  // src/constants/stats.js
  var stats_exports = {};
  __export(stats_exports, {
    PLAYER_STAT_COLS: () => PLAYER_STAT_COLS,
    PLAYER_STAT_TABLE: () => PLAYER_STAT_TABLE,
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
      iconStyle: "color:#ff3c3c;font-size:13px;font-weight:800",
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
  var PLAYER_STAT_TABLE = PLAYER_STAT_COLS.filter((c) => c.matchOrder != null).sort((a, b) => a.matchOrder - b.matchOrder);
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
    SHARE_BONUS: () => SHARE_BONUS,
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
  var SHARE_BONUS = 0.25;
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
    DEFAULT_PAGE_SIZE: () => DEFAULT_PAGE_SIZE,
    GAMEPLAY: () => GAMEPLAY,
    POLL_INTERVAL_MS: () => POLL_INTERVAL_MS
  });
  var POLL_INTERVAL_MS = 6e4;
  var DEFAULT_PAGE_SIZE = 50;
  var GAMEPLAY = {
    HOME_ADVANTAGE: 0.04,
    // ~4% home advantage applied in match prediction
    BLOOM_THRESHOLD: 18
    // skill level at which efficiency drops to lowest bracket
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
      s.textContent = `.tm-pos-chip{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:16px;text-align:center;min-width:28px;text-transform:uppercase;}`;
      document.head.appendChild(s);
    };
  })();
  var MAP = TmConst.POSITION_MAP;
  var FILTER_GROUPS = { 9: "gk", 0: "de", 1: "de", 2: "dm", 3: "dm", 4: "mf", 5: "mf", 6: "om", 7: "om", 8: "fw" };
  var GROUP_COLORS = {
    9: "#4ade80",
    // GK
    0: "#60a5fa",
    1: "#60a5fa",
    // DC, DLR
    2: "#818cf8",
    3: "#818cf8",
    // DMC, DMLR
    4: "#fbbf24",
    5: "#fbbf24",
    // MC, MLR
    6: "#fb923c",
    7: "#fb923c",
    // OMC, OMLR
    8: "#f87171"
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
     * Position color from POSITION_MAP (for chips, badges).
     * e.g. 'gk' → '#4ade80'
     */
    color(pos) {
      var _a, _b;
      return (_b = (_a = MAP[norm(pos)]) == null ? void 0 : _a.color) != null ? _b : "#aaa";
    },
    /**
     * Integer POSITION_MAP id for a position string key.
     * e.g. 'gk' → 9,  'dc' → 0
     */
    idFor(pos) {
      var _a, _b;
      return (_b = (_a = MAP[norm(pos)]) == null ? void 0 : _a.id) != null ? _b : 0;
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
     * CSS class for position pill in the history (tmh-* namespace).
     * e.g. 'gk' → 'tmh-pos-gk', 'dc' → 'tmh-pos-d'
     */
    cssClass(pos) {
      const p = norm(pos);
      if (!p) return "";
      if (p === "gk") return "tmh-pos-gk";
      if (/^dm/.test(p)) return "tmh-pos-m";
      if (/^d/.test(p)) return "tmh-pos-d";
      if (/^f/.test(p) || /^(fc|st|cf)/.test(p)) return "tmh-pos-f";
      return "tmh-pos-m";
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
     * e.g. 9 → '#4ade80', 8 → '#f87171'
     */
    groupColor(id) {
      var _a;
      return (_a = GROUP_COLORS[id]) != null ? _a : "#aaa";
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
    chip(positions, cls = "tm-pos-chip") {
      ensureChipCSS();
      if (!positions || Array.isArray(positions) && !positions.length) return "-";
      const arr = Array.isArray(positions) ? positions : [positions];
      const items = arr.map((pp) => {
        var _a, _b, _c, _d;
        if (typeof pp === "string") {
          const key = norm(pp);
          const entry = (_a = MAP[key]) != null ? _a : MAP[key.replace(/[lrc]$/, "")];
          return { label: (_b = entry == null ? void 0 : entry.position) != null ? _b : key.replace(/sub/i, "").toUpperCase(), color: (_c = entry == null ? void 0 : entry.color) != null ? _c : "#aaa" };
        }
        return { label: pp.position, color: (_d = pp.color) != null ? _d : "#aaa" };
      });
      if (!items.length) return "-";
      const firstColor = items[0].color;
      const inner = items.map((it) => `<span style="color:${it.color}">${it.label}</span>`).join('<span style="color:#6a9a58">, </span>');
      return TmUI.positionChip(firstColor, inner, cls);
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
    if (!r || r === 0) return "#5a7a48";
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
  var formatSkill = (v) => {
    const n = parseInt(v);
    if (n >= 20) return { display: "\u2605", starCls: " star-gold" };
    if (n >= 19) return { display: "\u2605", starCls: " star-silver" };
    return { display: String(isFinite(n) ? n : ""), starCls: "" };
  };
  var skillEff = (lvl) => {
    if (lvl >= 20) return 0;
    const bracket = TmConst.SKILL_EFFICIENCY_BRACKETS.find(([min]) => lvl >= min);
    return bracket ? bracket[1] : 0.15;
  };
  var getTopNThresholds = (rows, cols, getValue) => {
    const tops = {};
    cols.forEach((col) => {
      const vals = rows.map((r) => getValue(r, col)).filter((v) => v > 0);
      const sorted = [...new Set(vals)].sort((a, b) => b - a);
      tops[col] = { v1: sorted[0] || -1, v2: sorted[1] || -1, v3: sorted[2] || -1 };
    });
    return tops;
  };
  var topNClass = (val, col, tops) => {
    if (val <= 0) return "";
    const t = tops[col];
    if (!t) return "";
    if (val >= t.v1) return "top1";
    if (val >= t.v2) return "top2";
    if (val >= t.v3) return "top3";
    return "";
  };
  var getMainContainer = (root = document) => root.querySelector(".tmvu-main, .main_center");
  var getMainContainers = (root = document) => Array.from(root.querySelectorAll(".tmvu-main, .main_center"));
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
      if (!v) return "#5a7a48";
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
  var TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, fmtCoins, ratingColor, r5Color, toggleSort, skillColor, formatSkill, skillEff, getTopNThresholds, topNClass, getMainContainer, getMainContainers };

  // src/components/shared/tm-skill.js
  var TmSkill = {
    /**
     * Returns a sort-direction indicator for table headers.
     * @param {string}  key     — column key being rendered
     * @param {string}  sortKey — currently active sort column
     * @param {boolean} asc     — true = ascending
     * @returns {string}        — ' ▲', ' ▼', or ''
     */
    sortArrow: (key, sortKey, asc) => key === sortKey ? asc ? " \u25B2" : " \u25BC" : "",
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
      if (val == null) return '<span style="color:#4a5a40">\u2014</span>';
      const floor = Math.floor(val);
      const frac = val - floor;
      const fracStr = frac > 5e-3 ? `<sup style="font-size:8px;opacity:.75">.${Math.round(frac * 100).toString().padStart(2, "0")}</sup>` : "";
      if (floor >= 20) return '<span style="color:#d4af37;font-size:13px">\u2605</span>';
      if (floor >= 19) return `<span style="color:#c0c0c0;font-size:13px">\u2605${fracStr}</span>`;
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
      el.style.top = rect.bottom + window.scrollY + 4 + "px";
      el.style.left = rect.left + window.scrollX + "px";
      requestAnimationFrame(() => {
        const tipRect = el.getBoundingClientRect();
        if (tipRect.right > window.innerWidth - 10)
          el.style.left = window.innerWidth - tipRect.width - 10 + "px";
        if (tipRect.bottom > window.innerHeight + window.scrollY - 10)
          el.style.top = rect.top + window.scrollY - tipRect.height - 4 + "px";
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
    positionChip: (primaryColor, innerHTML, cls = "tm-pos-chip") => `<span class="${cls}" style="background:${primaryColor}22;border:1px solid ${primaryColor}44">${innerHTML}</span>`,
    /**
     * Renders a country flag `<ib>` element, or empty string if no country.
     * @param {string} country — country code (e.g. 'gb', 'de')
     * @param {string} [cls]   — extra CSS class to append
     * @returns {string} HTML string
     */
    flag: (country, cls = "") => country ? `<ib class="flag-img-${country}${cls ? " " + cls : ""}"></ib>` : ""
  };

  // src/components/shared/tm-table.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Table \u2500\u2500 */
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
.tmu-tbl .tmu-grp-row th{background:rgba(42,74,28,.35);color:#6a9a58;font-size:9px;text-align:center;letter-spacing:.2px;border-bottom:1px solid #2a4a1c;padding:2px 4px;white-space:nowrap;font-weight:600;text-transform:none;border-right:1px solid #2a4a1c}
`
  }));
  var _tblCounter = 0;
  var TmTable = {
    table({ headers = [], items = [], groupHeaders = [], footer = [], sortKey = null, sortDir = -1, cls = "", prependIndex = false, rowCls = null, onRowClick = null } = {}) {
      const wrap = document.createElement("div");
      const id = "tmu-tbl-" + ++_tblCounter;
      const indexCfg = prependIndex ? {
        label: "#",
        align: "c",
        cls: "",
        thCls: "",
        width: "32px",
        render: null,
        ...typeof prependIndex === "object" ? prependIndex : {}
      } : null;
      let _items = items;
      let _footer = footer;
      let _sk = sortKey != null ? sortKey : (headers.find((h) => h.sortable !== false) || {}).key || null;
      let _sd = sortDir;
      function _render() {
        const sortHdr = _sk ? headers.find((h2) => h2.key === _sk) : null;
        const sorted = _items.slice().sort((a, b) => {
          if (!sortHdr) return 0;
          if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
          const va = a[_sk], vb = b[_sk];
          if (typeof va === "number" && typeof vb === "number") return _sd * (va - vb);
          return _sd * String(va != null ? va : "").localeCompare(String(vb != null ? vb : ""));
        });
        const arrow = _sd > 0 ? " \u25B2" : " \u25BC";
        let h = `<table class="tmu-tbl${cls ? " " + cls : ""}" id="${id}"><thead>`;
        groupHeaders.forEach((row) => {
          const rc = row.cls || "";
          h += `<tr${rc ? ` class="${rc}"` : ""}>`;
          (row.cells || []).forEach((cell) => {
            var _a;
            const cc = cell.cls || "";
            h += `<th${cc ? ` class="${cc}"` : ""}${cell.colspan ? ` colspan="${cell.colspan}"` : ""}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ""}>${(_a = cell.label) != null ? _a : ""}</th>`;
          });
          h += "</tr>";
        });
        h += "<tr>";
        if (indexCfg) {
          const align = indexCfg.align && indexCfg.align !== "l" ? " " + indexCfg.align : "";
          const thCls = [align, indexCfg.thCls || ""].filter(Boolean).join(" ");
          h += `<th${thCls ? ` class="${thCls}"` : ""}${indexCfg.width ? ` style="width:${indexCfg.width}"` : ""}>${indexCfg.label}</th>`;
        }
        headers.forEach((hdr) => {
          const align = hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
          const canSort = hdr.sortable !== false;
          const isActive = canSort && _sk === hdr.key;
          const thCls = [canSort ? "sortable" : "", isActive ? "sort-active" : "", align, hdr.thCls || ""].filter(Boolean).join(" ");
          h += `<th${thCls ? ` class="${thCls}"` : ""}${canSort ? ` data-sk="${hdr.key}"` : ""}${hdr.width ? ` style="width:${hdr.width}"` : ""}${hdr.title ? ` title="${hdr.title}"` : ""}>`;
          h += hdr.label + (isActive ? arrow : "") + "</th>";
        });
        h += "</tr></thead><tbody>";
        sorted.forEach((item, i) => {
          const rc = rowCls ? rowCls(item, i) : "";
          h += `<tr${rc ? ` class="${rc}"` : ""}${onRowClick ? ` data-ri="${i}"` : ""}>`;
          if (indexCfg) {
            const align = indexCfg.align && indexCfg.align !== "l" ? " " + indexCfg.align : "";
            const tdCls = [align, indexCfg.cls || ""].filter(Boolean).join(" ");
            const content = typeof indexCfg.render === "function" ? indexCfg.render(item, i) : i + 1;
            h += `<td${tdCls ? ` class="${tdCls}"` : ""}>${content}</td>`;
          }
          headers.forEach((hdr) => {
            const val = item[hdr.key];
            const align = hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
            const tdCls = [align, hdr.cls || ""].filter(Boolean).join(" ");
            const content = hdr.render ? hdr.render(val, item, i) : val == null ? "" : val;
            h += `<td${tdCls ? ` class="${tdCls}"` : ""}>${content}</td>`;
          });
          h += "</tr>";
        });
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
        tbl.querySelectorAll("thead th[data-sk]").forEach((th) => {
          th.addEventListener("click", () => {
            const key = th.dataset.sk;
            if (_sk === key) {
              _sd *= -1;
            } else {
              _sk = key;
              _sd = -1;
            }
            _render();
          });
        });
        if (onRowClick) {
          tbl.querySelectorAll("tbody tr[data-ri]").forEach((tr) => {
            const i = +tr.dataset.ri;
            tr.addEventListener("click", () => onRowClick(sorted[i], i));
          });
        }
      }
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
.tmu-prompt-field{margin-bottom:14px}
`
  }));
  var htmlOf = (node) => node ? node.outerHTML : "";
  var buttonHtml = ({ style = "secondary", label = "", sub = "", attrs = {} } = {}) => htmlOf(TmButton.button({
    slot: `${label}${sub ? `<span class="tmu-modal-btn-sub">${sub}</span>` : ""}`,
    color: style === "danger" ? "danger" : style === "primary" ? "primary" : "secondary",
    size: "sm",
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
          }
        });
        document.addEventListener("keydown", onKey);
        overlay.querySelectorAll(".tmu-modal-btn").forEach(
          (btn) => btn.addEventListener("click", () => {
            document.removeEventListener("keydown", onKey);
            closeWith(btn.dataset.val);
          })
        );
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
          }
        });
        document.addEventListener("keydown", onKey);
        overlay.querySelector('[data-val="ok"]').addEventListener("click", () => {
          document.removeEventListener("keydown", onKey);
          closeWith(getVal() || null);
        });
        overlay.querySelector('[data-val="cancel"]').addEventListener("click", () => {
          document.removeEventListener("keydown", onKey);
          closeWith(null);
        });
        document.body.appendChild(overlay);
        setTimeout(() => overlay.querySelector("#tmu-prompt-input").focus(), 50);
      });
    }
  };

  // src/components/shared/tm-progress.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Progress bar \u2500\u2500 */
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
            t.style.color = "#6cc040";
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
            t.style.color = "#f87171";
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

  // src/components/shared/tm-tabs.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Tab bar (tmu-tabs / tmu-tab) \u2500\u2500 */
.tmu-tabs{
display:flex;align-items:stretch;
background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg,#274a18));
border:1px solid var(--tmu-tabs-border,var(--tmu-tabs-primary-border,#3d6828));
overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;
scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border,#3d6828)) transparent
}
.tmu-tabs-color-primary{
--tmu-tabs-bg:var(--tmu-tabs-primary-bg,#274a18);
--tmu-tabs-border:var(--tmu-tabs-primary-border,#3d6828);
--tmu-tabs-text:var(--tmu-tabs-primary-text,#90b878);
--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text,#c8e0b4);
--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg,#305820);
--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text,#e8f5d8);
--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg,#305820);
--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border,#6cc040)
}
.tmu-tabs-color-secondary{
--tmu-tabs-bg:var(--tmu-tabs-secondary-bg,#1f2e16);
--tmu-tabs-border:var(--tmu-tabs-secondary-border,#455f34);
--tmu-tabs-text:var(--tmu-tabs-secondary-text,#9eb88a);
--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text,#d2e4c6);
--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg,#314726);
--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text,#f0f7ea);
--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg,#314726);
--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border,#8fb96c)
}
.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}
.tmu-tab{padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text,#90b878));cursor:pointer;border:none;border-bottom:2px solid transparent;transition:all .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-width:max-content}
.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text,#c8e0b4));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg,#305820))}
.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text,#e8f5d8));border-bottom-color:var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border,#6cc040));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg,#305820))}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
.tmu-tab-icon{font-size:14px;line-height:1;flex-shrink:0}
` }));
  var setActive = (wrap, activeKey) => {
    wrap.querySelectorAll(".tmu-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === String(activeKey));
    });
  };
  var TmTabs = {
    tabs({ items, active, onChange, stretch = false, color = "primary", cls = "", itemCls = "" }) {
      const wrap = document.createElement("div");
      wrap.className = ["tmu-tabs", `tmu-tabs-color-${color}`, stretch ? "tmu-tabs-stretch" : "", cls].filter(Boolean).join(" ");
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
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          setActive(wrap, key);
          onChange == null ? void 0 : onChange(key);
        });
        wrap.appendChild(btn);
      });
      return wrap;
    },
    setActive
  };

  // src/components/shared/tm-state.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 State (loading / empty / error) \u2500\u2500 */
.tmu-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;gap:8px;text-align:center}
.tmu-state-text{color:#6a9a58;font-size:12px;font-weight:600;letter-spacing:.5px}
.tmu-state-empty .tmu-state-text{color:#5a7a48;font-style:italic;font-weight:400}
.tmu-state-error .tmu-state-text{color:#f87171}
.tmu-state-sm{padding:8px 12px;gap:5px}
.tmu-state-sm .tmu-state-text{font-size:10px;letter-spacing:.3px}
` }));
  var TmState = {
    loading: (msg = "Loading\u2026", compact = false) => `<div class="tmu-state${compact ? " tmu-state-sm" : ""}"><span class="tmu-spinner tmu-spinner-md"></span><span class="tmu-state-text">${msg}</span></div>`,
    empty: (msg = "No data", compact = false) => `<div class="tmu-state tmu-state-empty${compact ? " tmu-state-sm" : ""}"><span class="tmu-state-text">${msg}</span></div>`,
    error: (msg = "Error", compact = false) => `<div class="tmu-state tmu-state-error${compact ? " tmu-state-sm" : ""}"><span>\u26A0</span><span class="tmu-state-text">${msg}</span></div>`
  };

  // src/components/shared/tm-ui.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* -- Spinner -- */
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: #6a9a58; border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
/* -- Row / Col grid -- */
.tmu-row { display: flex; align-items: center; gap: 8px; }
.tmu-col { min-width: 0; }
.tmu-col-1{flex:0 0 8.333%}  .tmu-col-2{flex:0 0 16.667%} .tmu-col-3{flex:0 0 25%}     .tmu-col-4{flex:0 0 33.333%}
.tmu-col-5{flex:0 0 41.667%} .tmu-col-6{flex:0 0 50%}     .tmu-col-7{flex:0 0 58.333%} .tmu-col-8{flex:0 0 66.667%}
.tmu-col-9{flex:0 0 75%}     .tmu-col-10{flex:0 0 83.333%}.tmu-col-11{flex:0 0 91.667%}.tmu-col-12{flex:0 0 100%}
/* -- Color variants -- */
.yellow { color: #fbbf24; } .red    { color: #f87171; } .green  { color: #4ade80; }
.blue   { color: #60a5fa; } .purple { color: #c084fc; } .lime   { color: #80e048; }
.muted  { color: #8aac72; } .gold   { color: gold;    } .silver { color: silver;  } .orange { color: #ee9900; }
/* -- Typography -- */
.text-xs  { font-size: 10px; } .text-sm  { font-size: 12px; } .text-md  { font-size: 14px; }
.text-lg  { font-size: 16px; } .text-xl  { font-size: 18px; } .text-2xl { font-size: 20px; }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* -- Border-radius -- */
.rounded-sm { border-radius: 4px; } .rounded-md { border-radius: 6px; }
.rounded-lg { border-radius: 8px; } .rounded-xl { border-radius: 12px; } .rounded-full { border-radius: 9999px; }
/* -- Spacing (4px base scale) -- */
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
` }));
  var TmUI = {
    ...TmButton,
    ...TmCheckbox,
    ...TmAutocomplete,
    ...TmBadge,
    ...TmInput,
    ...TmChip,
    ...TmCompareStat,
    ...TmMetric,
    ...TmStat,
    ...TmTooltipStats,
    ...TmRender,
    ...TmSkill,
    ...TmTooltip,
    ...TmTable,
    ...TmModal,
    ...TmProgress,
    ...TmTabs,
    ...TmState
  };

  // src/components/shared/tm-fixture-match-row.js
  var STYLE_ID = "tmvu-fixture-match-row-style";
  var escapeHtml2 = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-fixture-row {
            position: relative;
            display: flex;
            align-items: center;
            padding: 5px 10px;
            border-bottom: 1px solid rgba(42,74,28,0.3);
            cursor: pointer;
            transition: background 0.12s;
            font-size: 12px;
            gap: 4px;
        }
        .tmvu-fixture-row:hover { background: #243d18 !important; }
        .tmvu-fixture-even { background: #1c3410; }
        .tmvu-fixture-odd  { background: #162e0e; }
        .tmvu-fixture-highlight { outline: 1px solid rgba(108,192,64,0.25); }
        .tmvu-fixture-team { flex: 1; display: flex; align-items: center; gap: 5px; color: #c8e0b4; min-width: 0; }
        .tmvu-fixture-team-home { justify-content: flex-end; }
        .tmvu-fixture-team-away { justify-content: flex-start; }
        .tmvu-fixture-team-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tmvu-fixture-my-team .tmvu-fixture-team-name { color: #e8f5d8; font-weight: 600; }
        .tmvu-fixture-score {
            width: 54px; min-width: 54px; text-align: center;
            font-size: 12px; font-weight: 700; padding: 2px 4px;
            border-radius: 3px; display: inline-block; flex-shrink: 0;
        }
        .tmvu-fixture-score-win      { color: #4ade80; }
        .tmvu-fixture-score-loss     { color: #fca5a5; }
        .tmvu-fixture-score-draw     { color: #fde68a; }
        .tmvu-fixture-score-neutral  { color: #e0f0d0; }
        .tmvu-fixture-score-upcoming { color: #4a6a3a; font-weight: 400; font-size: 11px; }
        .tmvu-fixture-tv { width: 16px; display: inline-block; text-align: center; font-size: 11px; flex-shrink: 0; }
        .tmvu-fixture-logo { width: 16px; height: 16px; flex-shrink: 0; }
    `;
    document.head.appendChild(style);
  };
  var normalizeMatch = (match) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    return {
      matchId: (_b = (_a = match == null ? void 0 : match.matchId) != null ? _a : match == null ? void 0 : match.id) != null ? _b : "",
      homeId: String((_d = (_c = match == null ? void 0 : match.homeId) != null ? _c : match == null ? void 0 : match.hometeam) != null ? _d : ""),
      homeName: (_f = (_e = match == null ? void 0 : match.homeName) != null ? _e : match == null ? void 0 : match.hometeam_name) != null ? _f : "",
      awayId: String((_h = (_g = match == null ? void 0 : match.awayId) != null ? _g : match == null ? void 0 : match.awayteam) != null ? _h : ""),
      awayName: (_j = (_i = match == null ? void 0 : match.awayName) != null ? _i : match == null ? void 0 : match.awayteam_name) != null ? _j : "",
      scoreText: (_m = (_l = (_k = match == null ? void 0 : match.scoreText) != null ? _k : match == null ? void 0 : match.result) != null ? _l : match == null ? void 0 : match.score) != null ? _m : "",
      tv: match == null ? void 0 : match.tv
    };
  };
  var getScoreColorClass = ({ scoreText, myClubId, isHomeMe, isAwayMe, isMyMatch }) => {
    let colorClass = "tmvu-fixture-score-neutral";
    if (!scoreText || !myClubId) return colorClass;
    const parts = String(scoreText).split("-").map((part) => Number(String(part).trim()));
    const [homeGoals, awayGoals] = parts;
    if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) return colorClass;
    if (isHomeMe && homeGoals > awayGoals || isAwayMe && awayGoals > homeGoals) return "tmvu-fixture-score-win";
    if (isHomeMe && homeGoals < awayGoals || isAwayMe && awayGoals < homeGoals) return "tmvu-fixture-score-loss";
    if (isMyMatch) return "tmvu-fixture-score-draw";
    return colorClass;
  };
  var render = (match, {
    index = 0,
    myClubId = null,
    season = "",
    extraClass = "",
    showTvBadge = false,
    linkUpcoming = false
  } = {}) => {
    injectStyles();
    const normalized = normalizeMatch(match);
    const matchId = String(normalized.matchId || "");
    const homeId = normalized.homeId;
    const awayId = normalized.awayId;
    const isHomeMe = myClubId && homeId === String(myClubId);
    const isAwayMe = myClubId && awayId === String(myClubId);
    const isMyMatch = isHomeMe || isAwayMe;
    const hasScore = !!normalized.scoreText;
    const scoreColorClass = getScoreColorClass({ scoreText: normalized.scoreText, myClubId, isHomeMe, isAwayMe, isMyMatch });
    const scoreClasses = [
      "tmvu-fixture-score",
      hasScore ? scoreColorClass : "tmvu-fixture-score-upcoming"
    ].join(" ");
    const scoreLabel = escapeHtml2(normalized.scoreText || "\u2014");
    const scoreHref = matchId ? `/matches/${matchId}/` : "";
    const shouldLinkScore = !!scoreHref && (hasScore || linkUpcoming);
    const scoreHtml = shouldLinkScore ? `<a href="${scoreHref}" class="${scoreClasses}" style="text-decoration:none">${scoreLabel}</a>` : `<span class="${scoreClasses}">${scoreLabel}</span>`;
    const tvBadge = showTvBadge ? String(normalized.tv) === "1" ? '<span class="tmvu-fixture-tv" title="TV">\u{1F4FA}</span>' : '<span class="tmvu-fixture-tv"></span>' : "";
    return `<div class="tmvu-fixture-row ${index % 2 === 0 ? "tmvu-fixture-even" : "tmvu-fixture-odd"}${isMyMatch ? " tmvu-fixture-highlight" : ""}${extraClass ? ` ${extraClass}` : ""}"
            data-mid="${escapeHtml2(matchId)}" data-season="${escapeHtml2(season)}"
            data-home-id="${escapeHtml2(homeId)}" data-away-id="${escapeHtml2(awayId)}">
            <div class="tmvu-fixture-team tmvu-fixture-team-home${isHomeMe ? " tmvu-fixture-my-team" : ""}">
                <span class="tmvu-fixture-team-name">${escapeHtml2(normalized.homeName)}</span>
                <img class="tmvu-fixture-logo" src="/pics/club_logos/${escapeHtml2(homeId)}_25.png" onerror="this.style.visibility='hidden'" alt="">
            </div>
            ${scoreHtml}
            <div class="tmvu-fixture-team tmvu-fixture-team-away${isAwayMe ? " tmvu-fixture-my-team" : ""}">
                <img class="tmvu-fixture-logo" src="/pics/club_logos/${escapeHtml2(awayId)}_25.png" onerror="this.style.visibility='hidden'" alt="">
                <span class="tmvu-fixture-team-name">${escapeHtml2(normalized.awayName)}</span>
                ${tvBadge}
            </div>
        </div>`;
  };
  var TmFixtureMatchRow = {
    injectStyles,
    render
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
    return typeof s === "object" && s !== null ? (_a = s.value) != null ? _a : 0 : Number(s);
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
    console.log("[calculatePlayerR5] calculating R5 for position", position, "player", player);
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

  // src/lib/tm-playerdb.js
  var PlayerDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerData";
    const STORE_NAME = "players";
    const DB_VERSION = 1;
    let db = null;
    const cache = {};
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
    const get = (pid) => cache[pid] || null;
    const set = (pid, value) => {
      cache[pid] = value;
      if (!db) return Promise.resolve();
      const idbKey = parseInt(pid);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, isFinite(idbKey) ? idbKey : pid);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[DB] write failed:", e));
    };
    const remove = (pid) => {
      delete cache[pid];
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
    const archive = (pid) => {
      const record = get(pid);
      if (!record) return Promise.resolve();
      return TmPlayerArchiveDB.set(pid, record).then(() => remove(pid));
    };
    const init = async () => {
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
          "font-weight:bold;color:#6cc040"
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
        cache[reqKeys.result[i]] = reqAll.result[i];
      console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then((granted) => {
          console.log(`[DB] Persistent storage: ${granted ? "\u2713 granted" : "\u2717 denied"}`);
        });
      }
    };
    return { init, get, set, remove, allPids, archive };
  })();
  var PlayerArchiveDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerArchive";
    const STORE_NAME = "players";
    const DB_VERSION = 1;
    let db = null;
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
    const init = () => open().catch((e) => console.warn("[ArchiveDB] open failed:", e));
    const set = (pid, value) => {
      if (!db) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, pid);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[ArchiveDB] write failed:", e));
    };
    const get = (pid) => {
      if (!db) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(pid);
        req.onsuccess = () => {
          var _a;
          return resolve((_a = req.result) != null ? _a : null);
        };
        req.onerror = (e) => reject(e.target.error);
      }).catch(() => null);
    };
    return { init, get, set };
  })();
  var TmPlayerDB = PlayerDB;
  var TmPlayerArchiveDB = PlayerArchiveDB;
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
    const pruneExcept = (keepIds) => ensureOpen().then((d) => {
      if (!d) return 0;
      const keepSet = new Set(keepIds.map((id) => parseInt(id)));
      return new Promise((resolve) => {
        const tx = d.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        let deleted = 0;
        store.openCursor().onsuccess = (e) => {
          const cursor = e.target.result;
          if (!cursor) return;
          if (!keepSet.has(cursor.key)) {
            cursor.delete();
            deleted++;
          }
          cursor.continue();
        };
        tx.oncomplete = () => resolve(deleted);
        tx.onerror = () => resolve(0);
      });
    });
    return { get, set, pruneExcept };
  })();
  var TmMatchCacheDB = MatchCacheDB;

  // src/services/player.js
  var _tooltipResolvedCache = /* @__PURE__ */ new Map();
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
      return _dedup(`tooltip:${player_id}`, () => _post("/ajax/tooltip.ajax.php", { player_id })).then((data) => {
        if (!(data == null ? void 0 : data.player)) return data;
        data.retired = data.player.club_id === null || data.club === null;
        const DBPlayer = TmPlayerDB.get(player_id);
        if (data.retired) {
          if (DBPlayer) {
            TmPlayerArchiveDB.set(player_id, DBPlayer).then(() => TmPlayerDB.remove(player_id));
            console.log(`%c[Cleanup] Archived retired/deleted player ${player_id}`, "font-weight:bold;color:#fbbf24");
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
    /**
     * Converts string fields (asi, wage, age, months, routine) to numbers.
     * Safe to call multiple times (idempotent once numeric).
     * @param {object} player — raw player from fetchPlayerTooltip / tooltip.ajax.php
     * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
     * @param {{skipSync?: boolean}} [options]
     * @returns {object} the same player, mutated
     */
    normalizePlayer(player, DBPlayer, { skipSync = false } = {}) {
      var _a;
      const shouldSync = !skipSync;
      this._parseScalars(player);
      if (shouldSync) this._migratePlayerMeta(player, DBPlayer);
      const defs = player.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
      player.skills = this._resolveSkills(player, defs, DBPlayer);
      const applyPositions = () => {
        player.positions = String(player.favposition || "").split(",").map((s) => {
          const pos = s.trim().toLowerCase();
          const positionData = TmConst.POSITION_MAP[pos];
          if (!positionData) return null;
          return {
            ...positionData,
            r5: TmLib.calculatePlayerR5(positionData, player),
            rec: TmLib.calculatePlayerREC(positionData, player)
          };
        }).filter(Boolean).sort((a, b) => a.ordering - b.ordering);
        player.r5 = Math.max(0, ...player.positions.map((p) => parseFloat(p.r5) || 0));
        player.rec = Math.max(0, ...player.positions.map((p) => parseFloat(p.rec) || 0));
        player.ti = TmLib.calculateTIPerSession(player);
      };
      const syncPromise = shouldSync ? (_a = TmSync) == null ? void 0 : _a.syncPlayerStore(player, DBPlayer) : null;
      if (syncPromise instanceof Promise) {
        syncPromise.then((updatedDB) => {
          var _a2;
          const curRec = (_a2 = updatedDB == null ? void 0 : updatedDB.records) == null ? void 0 : _a2[player.ageMonthsString];
          if (!(curRec == null ? void 0 : curRec.skills)) return;
          player.skills = this._resolveSkills(player, defs, updatedDB);
          applyPositions();
          window.dispatchEvent(new CustomEvent("tm:player-synced", { detail: { id: player.id, player } }));
        });
      }
      applyPositions();
      player.name = player.player_name || player.name;
      return player;
    }
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
  function syncPlayerStore(player, DBPlayer) {
    var _a;
    const api = TmPlayerService;
    const isOwnPlayer = player.isOwnPlayer;
    if (!isOwnPlayer) {
      return savePlayerVisit(player, DBPlayer);
    }
    const ageKey = player.ageMonthsString;
    const curRec = (_a = DBPlayer == null ? void 0 : DBPlayer.records) == null ? void 0 : _a[ageKey];
    const allComputed = (DBPlayer == null ? void 0 : DBPlayer.records) && Object.values(DBPlayer.records).every((r) => r.R5 != null && r.REREC != null);
    if ((curRec == null ? void 0 : curRec.R5) != null && (curRec == null ? void 0 : curRec.REREC) != null && allComputed) {
      console.log(`[syncPlayerStore] ${ageKey} already fully computed \u2014 dispatching growthUpdated`);
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return Promise.resolve(DBPlayer);
    }
    const hasOtherRecords = (DBPlayer == null ? void 0 : DBPlayer.records) && Object.keys(DBPlayer.records).length > 0;
    const pastRecordsOk = hasOtherRecords && Object.entries(DBPlayer.records).filter(([k]) => k !== ageKey).every(([, r]) => r.R5 != null && r.REREC != null);
    if (!curRec && pastRecordsOk) {
      console.log(`[syncPlayerStore] ${ageKey} missing, past records OK \u2014 savePlayerVisit`);
      return savePlayerVisit(player, DBPlayer);
    }
    console.log("[syncPlayerStore] \u2192 fetching graphs+training+history");
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
      if (!data) {
        console.warn("[syncPlayerStore] Graphs request failed \u2014 falling back to savePlayerVisit");
        return savePlayerVisit(player, DBPlayer);
      }
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
      const SI = player.asi;
      const K = player.isGK ? ASI_WEIGHT_GK3 : ASI_WEIGHT_OUTFIELD3;
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
      const oldRecords = DBPlayer.records;
      DBPlayer.graphSync = true;
      DBPlayer.lastSeen = Date.now();
      DBPlayer.records = Object.fromEntries(
        Array.from({ length: weekCount }, (_, i) => {
          const ageMonths = player.ageMonths - (weekCount - 1 - i);
          const key = `${Math.floor(ageMonths / 12)}.${ageMonths % 12}`;
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
    console.log(player.skills);
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
      record.R5 = Math.max(...positions.map((p) => Number(calculatePlayerR52(p, fakePlayer))));
      record.skills = skillsC;
      record.routine = (_b = player.routine) != null ? _b : null;
      TmPlayerDB.set(player.id, DBPlayer);
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
    savePlayerVisit,
    analyzeGrowth,
    buildStoreFromGraphs
  };

  // src/services/engine.js
  var _errors = [];
  var _logError = (context, err) => {
    const entry = { context, err, time: Date.now() };
    _errors.push(entry);
    if (typeof (TmApi == null ? void 0 : TmApi.onError) === "function") TmApi.onError(entry);
    console.warn(`[TmApi] ${context}`, err);
  };
  var _post = (url, data) => new Promise((resolve) => {
    const $2 = window.jQuery;
    if (!$2) {
      resolve(null);
      return;
    }
    $2.post(url, data).done((res) => {
      try {
        resolve(typeof res === "object" ? res : JSON.parse(res));
      } catch (e) {
        _logError(`JSON parse: ${url}`, e);
        resolve(null);
      }
    }).fail((xhr, s, e) => {
      _logError(`POST ${url}`, e || s);
      resolve(null);
    });
  });
  var _get = (url) => new Promise((resolve) => {
    const $2 = window.jQuery;
    if (!$2) {
      resolve(null);
      return;
    }
    $2.get(url).done((res) => {
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
    const $2 = window.jQuery;
    if (!$2) {
      resolve(null);
      return;
    }
    $2.ajax({ url, type: "GET", dataType: "html" }).done((res) => resolve(res || null)).fail(() => resolve(null));
  });
  var _inflight = /* @__PURE__ */ new Map();
  var _dedup = (key, promiseFn) => {
    if (_inflight.has(key)) return _inflight.get(key);
    const p = promiseFn().finally(() => _inflight.delete(key));
    _inflight.set(key, p);
    return p;
  };

  // src/utils/match.js
  var TmMatchUtils = {
    cloneMatchData(mData) {
      if (!mData) return mData;
      if (typeof structuredClone === "function") {
        return structuredClone(mData);
      }
      const cloned = JSON.parse(JSON.stringify(mData));
      cloned.homePlayerSet = new Set(Array.from(mData.homePlayerSet || []));
      cloned.awayPlayerSet = new Set(Array.from(mData.awayPlayerSet || []));
      return cloned;
    },
    /**
     * Check if a match has not started yet.
     * Negative live_min means countdown to kickoff.
     * @param {object} mData
     * @returns {boolean}
     */
    isMatchFuture(mData) {
      var _a;
      const md = mData == null ? void 0 : mData.match_data;
      const liveMin = md == null ? void 0 : md.live_min;
      if (typeof liveMin === "number" && liveMin < 0) return true;
      if (typeof liveMin === "number" && liveMin > 0) return false;
      const kickoff = (_a = md == null ? void 0 : md.venue) == null ? void 0 : _a.kickoff;
      if (kickoff) {
        const now = Math.floor(Date.now() / 1e3);
        return Number(kickoff) > now;
      }
      return false;
    },
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
      const teamId = String(teamData.id);
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
          d.events.push({ min: eMin, evt: play, evtIdx: play.reportEvtIdx, result: play.outcome });
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
      const md = (mData == null ? void 0 : mData.match_data) || {};
      const playMins = Object.keys((mData == null ? void 0 : mData.plays) || {}).map(Number).filter(Number.isFinite);
      const reportMins = Object.keys((mData == null ? void 0 : mData.report) || {}).map(Number).filter(Number.isFinite);
      const actionMins = ((mData == null ? void 0 : mData.actions) || []).map((a) => Number(a.min)).filter(Number.isFinite);
      const candidates = [
        Number(md.last_min),
        Number(md.regular_last_min),
        Number(md.live_min),
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
      if (!goals.length && !cards.length) return "";
      let t = '<div class="rnd-h2h-tooltip-events">';
      goals.forEach((e) => {
        const sideClass = e.isHome ? "" : " away-evt";
        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
        t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-icon">\u26BD</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ""}`;
        if (e.assist_id && e.assist_id !== "") {
          t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.score})</span>`;
        } else {
          t += ` <span class="rnd-h2h-tooltip-evt-assist">${e.score}</span>`;
        }
        t += `</span></div>`;
      });
      if (goals.length && cards.length) t += '<div class="rnd-h2h-tooltip-divider"></div>';
      cards.forEach((e) => {
        const icon = e.score === "yellow" ? "\u{1F7E1}" : e.score === "orange" ? "\u{1F7E1}\u{1F7E1}\u2192\u{1F534}" : "\u{1F534}";
        const sideClass = e.isHome ? "" : " away-evt";
        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
        t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ""}</span>`;
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
      if (!goals.length && !cards.length) return "";
      let t = '<div class="rnd-h2h-tooltip-events">';
      goals.forEach((e) => {
        const sideClass = e.isHome ? "" : " away-evt";
        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
        t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-icon">\u26BD</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}`;
        if (e.assist) t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.assist})</span>`;
        t += `</span></div>`;
      });
      if (goals.length && cards.length) t += '<div class="rnd-h2h-tooltip-divider"></div>';
      cards.forEach((e) => {
        const icon = e.type === "yellow" ? "\u{1F7E1}" : "\u{1F534}";
        const sideClass = e.isHome ? "" : " away-evt";
        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
        t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
        t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}</span>`;
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
     * Flatten all actions from a play into a single array.
     * @param {object} play
     * @returns {Array<object>}
     */
    getPlayActions(play) {
      return ((play == null ? void 0 : play.segments) || []).flatMap((seg) => seg.actions || []);
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
     * Build a playerId → displayName lookup from match lineup data.
     * @param {object} mData — match data with .lineup.home and .lineup.away
     * @returns {{ [playerId: string]: string }}
     */
    buildPlayerNames(mData) {
      const names = {};
      ["home", "away"].forEach((side) => {
        var _a, _b, _c;
        const lineup = ((_a = mData.lineup) == null ? void 0 : _a[side]) || ((_c = (_b = mData.teams) == null ? void 0 : _b[side]) == null ? void 0 : _c.lineup) || {};
        Object.values(lineup).forEach((p) => {
          names[p.player_id] = p.nameLast || p.name;
        });
      });
      return names;
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
      var _a, _b, _c;
      const { mData } = liveState;
      const sourceLineup = ((_a = mData.lineup) == null ? void 0 : _a[side]) || ((_c = (_b = mData.teams) == null ? void 0 : _b[side]) == null ? void 0 : _c.lineup) || {};
      const players = Object.values(sourceLineup).map((p) => ({ ...p, originalPosition: p.position }));
      const teamId = String(mData.teams[side].id);
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
        const p = players.find((x) => String(x.player_id) === String(act.by));
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
      const { mData } = liveState || {};
      const mentalityActions = mData.actions.filter((a) => {
        var _a, _b;
        return a.action === "mentality_change" && String(a.team) === String((_b = (_a = mData.teams) == null ? void 0 : _a[side]) == null ? void 0 : _b.id);
      });
      if (!mentalityActions.length) return null;
      return mentalityActions[mentalityActions.length - 1].mentality;
    },
    /**
     * Resolve the live score at the current match step.
     * @param {object} mData
     * @param {number} [curMin]
     * @param {number} [curEvtIdx]
     * @param {number} [curLineIdx]
     * @returns {{ homeGoals: number, awayGoals: number }}
     */
    buildLiveScore(liveState) {
      const { mData } = liveState;
      const homeId = String(mData.teams.home.id);
      const awayId = String(mData.teams.away.id);
      const goals = (mData.actions || []).filter((a) => a.action === "shot" && a.goal);
      return {
        homeGoals: goals.filter((g) => String(g.teamId) === homeId).length,
        awayGoals: goals.filter((g) => String(g.teamId) === awayId).length
      };
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
          const evtIdx = (_a2 = play.reportEvtIdx) != null ? _a2 : null;
          return this.isEventVisible(min, evtIdx, curMin, curEvtIdx, curLineIdx);
        });
        visibleEvents.forEach((ev) => {
          var _a2;
          const evtIdx = (_a2 = ev.reportEvtIdx) != null ? _a2 : null;
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
                if (liveState.mData.teams.home.lineup.some((p) => Number(p.id) === Number(playerInvolved))) {
                  teamId = liveState.mData.teams.home.id;
                  playerName = (_b = (_a = liveState.mData.teams.home.lineup.find((p) => Number(p.id) === Number(playerInvolved))) == null ? void 0 : _a.name) != null ? _b : null;
                } else {
                  teamId = liveState.mData.teams.away.id;
                  playerName = (_d = (_c = liveState.mData.teams.away.lineup.find((p) => Number(p.id) === Number(playerInvolved))) == null ? void 0 : _c.name) != null ? _d : null;
                }
              }
              const home = teamId !== null && String(teamId) === String(liveState.mData.teams.home.id);
              liveState.mData.actions.push({ ...act, teamId, home, player: playerName, min, evtIdx: play.reportEvtIdx });
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
        const teamData = mData.teams[side];
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
        if (newMentality !== null) {
          liveState.mData.teams[side].mentality = newMentality;
        }
        const goals = liveState.mData.actions.filter((a) => a.goal);
        const mentality = (_a = liveState.mData.teams[side].mentality) != null ? _a : 4;
        const attackingStyle = (_b = teamData.attackingStyle) != null ? _b : null;
        const focusSide = (_c = teamData.focusSide) != null ? _c : null;
        const stats = this.extractStats(mData, teamData);
        const team = {
          id: teamData.id,
          name: teamData.club_name || teamData.name,
          color: teamData.color,
          goals: goals.filter((g) => String(g.teamId) === String(teamData.id)).length,
          goalsAgainst: goals.filter((g) => String(g.teamId) !== String(teamData.id)).length,
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
          form: teamData.form || [],
          mentality,
          attackingStyle,
          focusSide,
          mentalityLabel: ((_d = TmConst.MENTALITY_MAP_LONG) == null ? void 0 : _d[mentality]) || "?",
          attackingStyleLabel: ((_e = TmConst.STYLE_MAP) == null ? void 0 : _e[attackingStyle]) || "?",
          focusSideLabel: ((_f = TmConst.FOCUS_MAP) == null ? void 0 : _f[focusSide]) || "?"
        };
        return team;
      };
      liveState.mData.teams.home = buildTeam("home");
      liveState.mData.teams.away = buildTeam("away");
      return liveState.mData.teams;
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
      const md = derived.match_data || {};
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
      if (md.possession) {
        matchStats.homePoss = Number(md.possession.home) || 0;
        matchStats.awayPoss = Number(md.possession.away) || 0;
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
        evts.forEach((evt, reportEvtIdx) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
          const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, "") : "";
          const vids = (_a = evt.chance) == null ? void 0 : _a.video;
          if (!(vids == null ? void 0 : vids.length)) return;
          const evtHasShot = !!evt.shot;
          const evtShotOnTarget = ((_b = evt.shot) == null ? void 0 : _b.target) === "on";
          const outcome = evt.goal ? "goal" : evt.shot ? "shot" : "lost";
          const segments = [];
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
            segments.push({ clip, text, actions });
          }
          if (evt.set_piece && segments.length > 0)
            segments[segments.length - 1].actions.push({ action: "setpiece", by: evt.set_piece, style: gPrefix });
          if (evt.mentality_change && segments.length > 0)
            segments[segments.length - 1].actions.push({ action: "mentality_change", team: String(evt.mentality_change.team), mentality: Number(evt.mentality_change.mentality) });
          plays.push({ team: evt.club, style: gPrefix, outcome, segments, reportEvtIdx, severity: evt.severity });
        });
        if (plays.length) result[String(min)] = plays;
      }
      return result;
    },
    /**
     * Enrich a raw mData object with derived fields. Mutates in place.
     * Adds: club colors, plays.
     * @param {object} mData — raw or compressed match API response
     * @returns {object} mData (mutated)
     */
    normalizeMatchData(mData, { dbSync = true } = {}) {
      const { club, lineup } = mData;
      mData.teams = { home: {}, away: {} };
      ["home", "away"].forEach((side) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
        const color = "#" + (((_a = club[side].colors) == null ? void 0 : _a.club_color1) || (side === "home" ? "4a9030" : "5b9bff"));
        const captainId = Number((_c = (_b = mData.match_data) == null ? void 0 : _b.captain) == null ? void 0 : _c[side]);
        Object.values(lineup[side]).forEach((p) => {
          p.id = Number(p.player_id);
          p.faceUrl = TmMatchUtils.faceUrl(p, color);
          p.captain = Number(p.player_id) === captainId;
          p.skills = p.skills || [];
          p.routine = p.routine ? Number(p.routine) : null;
        });
        mData.teams[side] = {
          ...club[side],
          color,
          lineup: Object.values(lineup[side]),
          mentality: Number((_f = (_e = (_d = mData.match_data) == null ? void 0 : _d.mentality) == null ? void 0 : _e[side]) != null ? _f : 4),
          attackingStyle: (_i = (_h = (_g = mData.match_data) == null ? void 0 : _g.attacking_style) == null ? void 0 : _h[side]) != null ? _i : null,
          focusSide: (_l = (_k = (_j = mData.match_data) == null ? void 0 : _j.focus_side) == null ? void 0 : _k[side]) != null ? _l : null
        };
      });
      mData.homePlayerSet = new Set(Object.keys(lineup.home));
      mData.awayPlayerSet = new Set(Object.keys(lineup.away));
      mData.allPlayers = [...Object.values(lineup.home), ...Object.values(lineup.away)];
      this.normalizeReport(mData.report);
      mData.plays = this.buildNormalizedPlays(mData.report, lineup);
      const allPids = new Set(mData.allPlayers.map((p) => String(p.id)));
      const homeClubId = mData.teams.home.id;
      const awayClubId = mData.teams.away.id;
      if (dbSync) {
        (async () => {
          const [homeData, awayData] = await Promise.all([
            TmClubService.fetchSquadRaw(homeClubId).catch(() => null),
            TmClubService.fetchSquadRaw(awayClubId).catch(() => null)
          ]);
          console.log("Squad data fetched", { homeData, awayData });
          const squadMap = {};
          [homeData, awayData].forEach((data) => {
            if (!(data == null ? void 0 : data.post)) return;
            data.post.forEach((p) => {
              squadMap[String(p.id)] = p;
            });
          });
          const players = [];
          const missingPids = [];
          for (const pid of allPids) {
            const p = squadMap[pid];
            if (p) players.push({ player: p });
            else missingPids.push(pid);
          }
          if (missingPids.length > 0) {
            await Promise.all(missingPids.map(
              (pid) => TmPlayerService.fetchPlayerTooltip(pid).then((data) => {
                if (data) players.push(data);
              }).catch(() => {
              })
            ));
          }
          window.dispatchEvent(new CustomEvent("tm:match-profiles-ready", { detail: { players } }));
        })();
      }
      return mData;
    },
    /**
     * Fetch the full match data object for a given match ID.
     * Automatically normalizes the response (report promotion, plays, colors, player sets).
     * @param {string|number} matchId
     * @param {{dbSync?: boolean}} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatch(matchId, options = {}) {
      const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
      if (!raw) return null;
      return this.normalizeMatchData(raw, options);
    },
    /**
     * Fetch match data without cache usage or async player profile enrichment.
     * Intended for pages that only need the raw match payload and lineup/report data.
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    async fetchMatchLite(matchId) {
      return this.fetchMatch(matchId, { dbSync: false });
    },
    /**
     * Fetch a match via the standard match normalization path and return
     * the stats-ready payload consumed by the club statistics page.
     * @param {object} matchInfo
     * @param {string|number} clubId
     * @param {{dbSync?: boolean}} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatchForStats(matchInfo, clubId, options = {}) {
      const mData = await this.fetchMatch(matchInfo.id, options);
      if (!mData) return null;
      return TmStatsMatchProcessor.process(matchInfo, mData, clubId);
    },
    /**
     * Strip unnecessary fields from a raw match API response.
     * Removes: udseende2/looks from lineup, text_team from report events,
     * colors/logos/form/meta from club sections.
     * Result is ~30% smaller and fully compatible with all scripts.
     * @param {object} raw — raw response from match.ajax.php
     * @returns {object} compressed match object
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
     * @param {{dbSync?: boolean}} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatchCached(matchId, options = {}) {
      const db = TmMatchCacheDB;
      const cached = await db.get(matchId);
      if (cached) return this.normalizeMatchData(cached, options);
      const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
      if (!raw) return null;
      const compressed = this.compressMatch(raw);
      db.set(matchId, compressed);
      return this.normalizeMatchData(compressed, options);
    }
  };

  // src/components/shared/tm-match-tooltip.js
  var STYLE_ID2 = "tmvu-match-tooltip-style";
  var ensureStyles = () => {
    if (document.getElementById(STYLE_ID2)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID2;
    style.textContent = `
        .rnd-h2h-tooltip {
            position: absolute; z-index: 100;
            background: #111f0a; border: 1px solid rgba(80,160,48,.25);
            border-radius: 10px; padding: 18px 24px;
            min-width: 520px; max-width: 600px;
            box-shadow: 0 8px 32px rgba(0,0,0,.6);
            pointer-events: none; opacity: 0; transition: opacity 0.15s;
            left: 50%; top: 100%; transform: translateX(-50%); margin-top: 4px;
        }
        .rnd-h2h-tooltip.visible { opacity: 1; }
        .rnd-h2h-tooltip-header {
            display: flex; align-items: center; justify-content: center;
            gap: 14px; padding-bottom: 12px; margin-bottom: 10px;
            border-bottom: 1px solid rgba(80,160,48,.12);
        }
        .rnd-h2h-tooltip-logo { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
        .rnd-h2h-tooltip-team { font-size: 15px; font-weight: 700; color: #c8e4b0; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rnd-h2h-tooltip-score { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: 3px; text-shadow: 0 0 16px rgba(128,224,64,.15); }
        .rnd-h2h-tooltip-meta { display: flex; align-items: center; justify-content: center; gap: 18px; font-size: 11px; color: #5a7a48; margin-bottom: 10px; }
        .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: 3px; }
        .rnd-h2h-tooltip-events { display: flex; flex-direction: column; gap: 5px; }
        .rnd-h2h-tooltip-evt { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #a0c890; padding: 3px 0; }
        .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
        .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
        .rnd-h2h-tooltip-evt-min { font-weight: 700; color: #80b868; min-width: 32px; font-size: 13px; text-align: right; flex-shrink: 0; }
        .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
        .rnd-h2h-tooltip-evt-text { color: #b8d8a0; }
        .rnd-h2h-tooltip-evt-assist { font-size: 12px; color: #5a8a48; font-weight: 500; margin-left: 2px; }
        .rnd-h2h-tooltip-mom { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(80,160,48,.1); font-size: 13px; color: #6a9a58; text-align: center; }
        .rnd-h2h-tooltip-mom span { color: #e8d44a; font-weight: 700; }
        .rnd-h2h-tooltip-divider { height: 1px; background: rgba(80,160,48,.1); margin: 8px 0; }
        .rnd-h2h-tooltip-stats { margin: 10px 0; }
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
    const report = matchData.report || {};
    const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
    const keyEvents = [];
    allMins.forEach((min) => {
      const events = report[min];
      if (!Array.isArray(events)) return;
      events.forEach((event) => {
        if (!event.parameters) return;
        const params = Array.isArray(event.parameters) ? event.parameters : [event.parameters];
        const clubId = String(event.club || "");
        const isHome = clubId === homeId;
        params.forEach((param) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
          if (param.goal) {
            const scorer = ((_b = (_a = matchData.lineup) == null ? void 0 : _a.home) == null ? void 0 : _b[param.goal.player]) || ((_d = (_c = matchData.lineup) == null ? void 0 : _c.away) == null ? void 0 : _d[param.goal.player]);
            const assistPlayer = ((_f = (_e = matchData.lineup) == null ? void 0 : _e.home) == null ? void 0 : _f[param.goal.assist]) || ((_h = (_g = matchData.lineup) == null ? void 0 : _g.away) == null ? void 0 : _h[param.goal.assist]);
            keyEvents.push({
              min,
              type: "goal",
              isHome,
              name: (scorer == null ? void 0 : scorer.nameLast) || (scorer == null ? void 0 : scorer.name) || "?",
              assist: (assistPlayer == null ? void 0 : assistPlayer.nameLast) || (assistPlayer == null ? void 0 : assistPlayer.name) || ""
            });
          }
          if (param.yellow) {
            const player = ((_j = (_i = matchData.lineup) == null ? void 0 : _i.home) == null ? void 0 : _j[param.yellow]) || ((_l = (_k = matchData.lineup) == null ? void 0 : _k.away) == null ? void 0 : _l[param.yellow]);
            const cardIsHome = param.yellow in (((_m = matchData.lineup) == null ? void 0 : _m.home) || {});
            keyEvents.push({ min, type: "yellow", isHome: cardIsHome, name: (player == null ? void 0 : player.nameLast) || (player == null ? void 0 : player.name) || "?" });
          }
          if (param.yellow_red) {
            const player = ((_o = (_n = matchData.lineup) == null ? void 0 : _n.home) == null ? void 0 : _o[param.yellow_red]) || ((_q = (_p = matchData.lineup) == null ? void 0 : _p.away) == null ? void 0 : _q[param.yellow_red]);
            const cardIsHome = param.yellow_red in (((_r = matchData.lineup) == null ? void 0 : _r.home) || {});
            keyEvents.push({ min, type: "red", isHome: cardIsHome, name: (player == null ? void 0 : player.nameLast) || (player == null ? void 0 : player.name) || "?" });
          }
          if (param.red) {
            const player = ((_t = (_s = matchData.lineup) == null ? void 0 : _s.home) == null ? void 0 : _t[param.red]) || ((_v = (_u = matchData.lineup) == null ? void 0 : _u.away) == null ? void 0 : _v[param.red]);
            const cardIsHome = param.red in (((_w = matchData.lineup) == null ? void 0 : _w.home) || {});
            keyEvents.push({ min, type: "red", isHome: cardIsHome, name: (player == null ? void 0 : player.nameLast) || (player == null ? void 0 : player.name) || "?" });
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
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const md = matchData.match_data || {};
      const club = matchData.club || {};
      const homeName = ((_a = club.home) == null ? void 0 : _a.club_name) || "";
      const awayName = ((_b = club.away) == null ? void 0 : _b.club_name) || "";
      const homeId = String(((_c = club.home) == null ? void 0 : _c.id) || "");
      const awayId = String(((_d = club.away) == null ? void 0 : _d.id) || "");
      const homeLogo = ((_e = club.home) == null ? void 0 : _e.logo) || `/pics/club_logos/${homeId}_140.png`;
      const awayLogo = ((_f = club.away) == null ? void 0 : _f.logo) || `/pics/club_logos/${awayId}_140.png`;
      let html = buildHeader({
        homeName,
        awayName,
        homeLogo,
        awayLogo,
        score: buildFinalScore(matchData)
      });
      const kickoff = ((_g = md.venue) == null ? void 0 : _g.kickoff_readable) || "";
      html += buildMeta([
        kickoff ? `\u{1F4C5} ${new Date(kickoff.replace(" ", "T")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "",
        ((_h = md.venue) == null ? void 0 : _h.name) ? `\u{1F3DF} ${md.venue.name}` : "",
        md.attendance ? `\u{1F465} ${Number(md.attendance).toLocaleString()}` : ""
      ]);
      const events = buildRichEvents(matchData, homeId);
      html += TmMatchUtils.renderRichEvents(events.goals, events.cards);
      const possession = md.possession;
      const stats = md.statistics || {};
      if (possession || stats.home_shots || stats.away_shots || stats.home_on_target || stats.away_on_target) {
        html += TmUI.matchTooltipStats({ possession, statistics: stats, cls: "rnd-h2h-tooltip-stats" });
      }
      const allPlayers = [...Object.values(((_i = matchData.lineup) == null ? void 0 : _i.home) || {}), ...Object.values(((_j = matchData.lineup) == null ? void 0 : _j.away) || {})];
      const mom = allPlayers.find((player) => player.mom === 1 || player.mom === "1");
      html += buildMom("Man of the Match", (mom == null ? void 0 : mom.nameLast) || (mom == null ? void 0 : mom.name) || "", mom ? parseFloat(mom.rating).toFixed(1) : null);
      return html;
    }
  };

  // src/components/match/tm-match-h2h-tooltip.js
  var dataCache = /* @__PURE__ */ new Map();
  var requestCache = /* @__PURE__ */ new Map();
  var cacheKeyFor = (matchId, rich) => `${rich ? "rich" : "legacy"}:${matchId}`;
  var currentSeason = () => typeof SESSION !== "undefined" && SESSION.season ? String(SESSION.season) : null;
  var resolveLegacySeason = (anchorEl) => {
    var _a, _b, _c, _d;
    return ((_a = anchorEl == null ? void 0 : anchorEl.dataset) == null ? void 0 : _a.season) || ((_d = (_c = (_b = anchorEl == null ? void 0 : anchorEl.closest) == null ? void 0 : _b.call(anchorEl, "[data-season]")) == null ? void 0 : _c.dataset) == null ? void 0 : _d.season) || currentSeason();
  };
  var fetchTooltipData = (matchId, rich, anchorEl) => {
    const key = cacheKeyFor(matchId, rich);
    if (dataCache.has(key)) return Promise.resolve(dataCache.get(key));
    if (requestCache.has(key)) return requestCache.get(key);
    const request = (rich ? TmMatchService.fetchMatchCached(matchId, { dbSync: false }).then((data) => {
      if (!data) return null;
      data._rich = true;
      return data;
    }) : (() => {
      const season = resolveLegacySeason(anchorEl);
      if (!season) return Promise.resolve(null);
      return TmMatchService.fetchMatchTooltip(matchId, season);
    })()).then((data) => {
      if (data) dataCache.set(key, data);
      requestCache.delete(key);
      return data;
    }).catch((error) => {
      requestCache.delete(key);
      throw error;
    });
    requestCache.set(key, request);
    return request;
  };
  var TmMatchH2HTooltip = {
    ensureStyles() {
      TmMatchTooltip.ensureStyles();
    },
    show(anchorEl, matchId, rich = false) {
      if (!anchorEl || !matchId) return null;
      this.ensureStyles();
      const tooltipEl = document.createElement("div");
      tooltipEl.className = "rnd-h2h-tooltip";
      tooltipEl.dataset.matchId = String(matchId);
      anchorEl.appendChild(tooltipEl);
      const render3 = (html) => {
        if (!tooltipEl.isConnected || tooltipEl.dataset.matchId !== String(matchId)) return;
        tooltipEl.innerHTML = html;
      };
      render3(TmUI.loading("Loading\u2026", true));
      requestAnimationFrame(() => tooltipEl.classList.add("visible"));
      fetchTooltipData(matchId, !!rich, anchorEl).then((data) => {
        if (!data) {
          render3(TmUI.error("Failed", true));
          return;
        }
        render3(data._rich ? this.buildRichTooltip(data) : this.buildTooltipContent(data));
      }).catch(() => render3(TmUI.error("Failed", true)));
      return tooltipEl;
    },
    // ── Tooltip from tooltip.ajax.php (older seasons) ──
    buildTooltipContent(d) {
      return TmMatchTooltip.buildLegacyTooltipContent(d);
    },
    // ── Rich tooltip from match.ajax.php (current season) ──
    buildRichTooltip(mData) {
      return TmMatchTooltip.buildRichTooltip(mData);
    }
  };

  // src/components/shared/tm-standings-table.js
  var STYLE_ID3 = "tmvu-standings-table-style";
  var htmlOf2 = (node) => node ? node.outerHTML : "";
  var buttonHtml2 = (opts) => htmlOf2(TmButton.button(opts));
  function injectStyles2() {
    if (document.getElementById(STYLE_ID3)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID3;
    style.textContent = `
        .tmvu-standings-wrap {
            border: 1px solid rgba(61,104,40,0.22);
            border-radius: 10px;
            overflow: hidden;
            background: rgba(12,24,9,0.28);
        }

        .tmvu-standings-group + .tmvu-standings-group {
            border-top: 1px solid rgba(61,104,40,0.22);
        }

        .tmvu-standings-group-title {
            padding: 10px 12px;
            background: rgba(19,40,10,0.92);
            border-bottom: 1px solid rgba(61,104,40,0.22);
            color: #e8f5d8;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .tsa-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            table-layout: auto;
        }

        .tsa-table thead tr {
            background: rgba(0,0,0,0.18);
            border-bottom: 1px solid rgba(61,104,40,0.34);
        }

        .tsa-table th {
            padding: 7px 10px;
            text-align: right;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #7faa62;
            background: #13280a;
            border-bottom: 1px solid rgba(61,104,40,0.34);
            user-select: none;
            transition: color 0.15s;
            white-space: nowrap;
        }

        .tsa-table th.tsa-left {
            text-align: left;
        }

        .tsa-table th:not(.tsa-left),
        .tsa-table td:not(.tsa-left) {
            text-align: right;
        }

        .tsa-table td {
            padding: 6px 10px;
            text-align: right;
            border-bottom: 1px solid rgba(42,74,28,0.4);
            font-variant-numeric: tabular-nums;
            color: #c8e0b4;
        }

        .tsa-table td.tsa-left {
            text-align: left;
        }

        .tsa-table tr.tsa-even {
            background: #19310e;
        }

        .tsa-table tr.tsa-odd {
            background: #14280a;
        }

        .tsa-table tbody tr:hover {
            background: #244114 !important;
        }

        .tsa-rank {
            color: #6a9a58;
            font-size: 12px;
        }

        .std-me {
            background: rgba(108,192,64,0.10) !important;
            box-shadow: inset 3px 0 0 rgba(108,192,64,0.55);
        }

        .std-sep-green td {
            border-bottom: 2px solid #4ade80 !important;
        }

        .std-sep-orange td {
            border-bottom: 2px solid #fb923c !important;
        }

        .std-sep-red td {
            border-bottom: 2px solid #ef4444 !important;
        }

        .tsa-club-cell {
            color: #f4f8f0;
            font-weight: 500;
            white-space: nowrap;
            padding-top: 8px;
            padding-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .tsa-club-link {
            color: inherit;
            text-decoration: none;
        }

        .tsa-club-link:hover {
            text-decoration: underline;
        }

        .tsa-club-logo {
            width: 18px;
            height: 18px;
            vertical-align: middle;
            margin-right: 4px;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
  }
  function zoneColor(zone) {
    if (zone === "promo") return "#4ade80";
    if (zone === "promo-po") return "#fbbf24";
    if (zone === "rel-po") return "#fb923c";
    if (zone === "rel") return "#ef4444";
    return null;
  }
  function zoneBg(zone) {
    if (zone === "promo") return "rgba(74,222,128,0.18)";
    if (zone === "promo-po") return "rgba(251,191,36,0.18)";
    if (zone === "rel-po") return "rgba(251,146,60,0.18)";
    if (zone === "rel") return "rgba(239,68,68,0.18)";
    return "transparent";
  }
  function escapeHtml3(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function buildHtml({ rows = [], liveZoneMap = {}, isFiltered = false, showForm = false, formHtml = () => "", canOlder = false, canNewer = false } = {}) {
    injectStyles2();
    const headerForm = showForm ? `<th class="tsa-right" style="padding-left:6px;white-space:nowrap">
                ${buttonHtml2({ id: "std-form-older", label: "\u2039", color: "secondary", size: "xs", disabled: !canOlder, attrs: { style: "padding:0 5px;font-size:14px;line-height:16px;margin-right:4px" } })}
                Form
                ${buttonHtml2({ id: "std-form-newer", label: "\u203A", color: "secondary", size: "xs", disabled: !canNewer, attrs: { style: "padding:0 5px;font-size:14px;line-height:16px;margin-left:4px" } })}
           </th>` : "";
    let html = `<table class="tsa-table">
        <colgroup>
            <col style="width:44px">
            <col style="width:auto">
            <col style="width:50px">
            <col style="width:50px">
            <col style="width:50px">
            <col style="width:50px">
            <col style="width:54px">
            <col style="width:54px">
            <col style="width:54px">
            ${showForm ? '<col style="width:140px">' : ""}
        </colgroup>
        <thead>
            <tr>
                <th class="tsa-left" style="width:24px">#</th>
                <th class="tsa-left">Club</th>
                <th title="Games played">Gp</th>
                <th title="Won">W</th>
                <th title="Drawn">D</th>
                <th title="Lost">L</th>
                <th title="Goals for">GF</th>
                <th title="Goals against">GA</th>
                <th title="Points">Pts</th>
                ${headerForm}
            </tr>
        </thead>
        <tbody>`;
    rows.forEach((row, index) => {
      var _a, _b, _c, _d;
      const effectiveZone = isFiltered ? liveZoneMap[row.rank] || "" : row.zone;
      const nextZone = isFiltered ? liveZoneMap[(_a = rows[index + 1]) == null ? void 0 : _a.rank] || null : (_c = (_b = rows[index + 1]) == null ? void 0 : _b.zone) != null ? _c : null;
      const sepClass = isFiltered ? "" : (() => {
        if (row.zone === nextZone || nextZone === null) return "";
        if (nextZone === "rel") return " std-sep-red";
        if (nextZone === "rel-po") return " std-sep-orange";
        if (row.zone === "promo" || row.zone === "promo-po") return " std-sep-green";
        return "";
      })();
      const rowClass = `${index % 2 === 0 ? "tsa-even" : "tsa-odd"}${row.isMe ? " std-me" : ""}${sepClass}`;
      const clubHref = row.clubId ? `/club/${row.clubId}/` : "";
      const clubLogo = row.clubId ? `<img class="tsa-club-logo" src="/pics/club_logos/${escapeHtml3(row.clubId)}_25.png" onerror="this.style.visibility='hidden'">` : "";
      html += `<tr class="${rowClass}" data-club="${escapeHtml3((_d = row.clubId) != null ? _d : "")}">
            <td class="tsa-left tsa-rank" style="background:${zoneBg(effectiveZone)};color:${zoneColor(effectiveZone) || "#6a9a58"};font-weight:700;padding-top:8px;padding-bottom:8px">${escapeHtml3(row.rank)}</td>
            <td class="tsa-left tsa-club-cell">${clubLogo}${clubHref ? `<a class="tsa-club-link" href="${clubHref}">${escapeHtml3(row.clubName)}</a>` : escapeHtml3(row.clubName)}</td>
            <td>${escapeHtml3(row.gp)}</td>
            <td style="color:#4ade80;font-weight:700">${escapeHtml3(row.w)}</td>
            <td style="color:#fde68a">${escapeHtml3(row.d)}</td>
            <td style="color:#fca5a5">${escapeHtml3(row.l)}</td>
            <td>${escapeHtml3(row.gf)}</td>
            <td>${escapeHtml3(row.ga)}</td>
            <td style="font-weight:700;color:#e8f5d8">${escapeHtml3(row.pts)}</td>
            ${showForm ? `<td class="tsa-right" style="padding-left:6px">${formHtml(row.form || [], row.playedCount || 0)}</td>` : ""}
        </tr>`;
    });
    html += "</tbody></table>";
    return html;
  }
  function buildGroupedHtml({ groups = [] } = {}) {
    injectStyles2();
    const validGroups = groups.filter((group) => Array.isArray(group == null ? void 0 : group.rows) && group.rows.length);
    if (!validGroups.length) return "";
    return `
        <div class="tmvu-standings-wrap">
            ${validGroups.map((group) => `
                <section class="tmvu-standings-group">
                    ${group.title ? `<div class="tmvu-standings-group-title">${escapeHtml3(group.title)}</div>` : ""}
                    ${buildHtml({ rows: group.rows })}
                </section>
            `).join("")}
        </div>
    `;
  }
  var TmStandingsTable = { injectStyles: injectStyles2, buildHtml, buildGroupedHtml };

  // src/components/league/tm-league-standings.js
  if (!document.getElementById("tsa-league-standings-style")) {
    const _s = document.createElement("style");
    _s.id = "tsa-league-standings-style";
    _s.textContent = `
            .std-hover-opp td { background: #2e5c1a !important; outline: 1px solid #6cc040; }
            .std-hover-opp td:first-child { border-left: 3px solid #6cc040 !important; }
            #std-form-tooltip {
                position: fixed; z-index: 9999; pointer-events: none;
                background: #162e0e; border: 1px solid #3d6828;
                border-radius: 5px; padding: 6px 10px;
                font-size: 12px; color: #e8f5d8;
                box-shadow: 0 3px 10px rgba(0,0,0,0.5);
                white-space: nowrap; display: none;
            }
            #std-form-tooltip .sft-score { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
            #std-form-tooltip .sft-opp   { color: #90b878; font-size: 11px; }
            .tsa-standings-wrap { overflow: hidden; }
            .tsa-standings-page-ctrl {
                display: flex; align-items: center; justify-content: flex-end;
                gap: 6px; padding: 5px 10px 0;
            }
            .tsa-standings-page-ctrl span { font-size: 11px; color: #90b878; }
            .std-promo    { }
            .std-promo-po { }
            .std-rel-po   { }
            .std-rel      { }
            .form-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 18px; height: 18px; border-radius: 3px;
                font-size: 10px; font-weight: 700; cursor: pointer;
                transition: opacity 0.15s; text-decoration: none;
            }
            .form-badge:hover { opacity: 0.75; }
            .form-w { background: #1d6b29; color: #fff; }
            .form-d { background: #b48127; color: #fff; }
            .form-l { background: #7f1d1d; color: #fff; }
            .form-u { background: #1e3a4c; color: #fff; }
            .tsa-std-controls {
                display: flex; align-items: center; justify-content: space-between;
                padding: 5px 10px; background: rgba(0,0,0,0.25);
                border-bottom: 1px solid rgba(61,104,40,0.3); flex-wrap: wrap; gap: 6px;
            }
            .tsa-std-ctrl-group { display: flex; align-items: center; gap: 3px; }
            .tsa-std-ctrl-label {
                font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
                color: #3d6828; margin-right: 4px; user-select: none;
            }
            .tsa-std-controls [data-std-venue], .tsa-std-controls [data-std-n] { line-height: 1.2; }
            .tsa-std-ctrl-active {
                background: rgba(108,192,64,0.25) !important; color: #c8e0b4 !important;
                border-color: rgba(108,192,64,0.55) !important; font-weight: 600;
            }
        `;
    document.head.appendChild(_s);
  }
  var buttonHtml3 = ({ attrs = {}, cls = "", active = false, ...opts } = {}) => {
    const btn = TmButton.button({
      color: "secondary",
      size: "xs",
      cls: `${cls}${active ? " tsa-std-ctrl-active" : ""}`,
      attrs,
      ...opts
    });
    return btn.outerHTML;
  };
  var buildStandingsFromDOM = () => {
    const s = window.TmLeagueCtx;
    s.standingsRows = [];
    const myClubId = (() => {
      const hi = document.querySelector("#overall_table tr.highlighted_row_done td a[club_link]");
      return hi ? hi.getAttribute("club_link") : null;
    })();
    const formMap = {};
    const playedCountMap = {};
    if (s.fixturesCache) {
      const played = [], upcoming = [];
      Object.values(s.fixturesCache).forEach((month) => {
        if (month == null ? void 0 : month.matches) month.matches.forEach((m) => {
          if (m.result) played.push(m);
          else upcoming.push(m);
        });
      });
      played.sort((a, b) => new Date(a.date) - new Date(b.date));
      played.forEach((m) => {
        const res = m.result;
        if (!res) return;
        const parts = res.split("-").map(Number);
        if (parts.length !== 2) return;
        const [hg, ag] = parts;
        const hid = String(m.hometeam), aid = String(m.awayteam);
        if (!formMap[hid]) {
          formMap[hid] = [];
          playedCountMap[hid] = 0;
        }
        if (!formMap[aid]) {
          formMap[aid] = [];
          playedCountMap[aid] = 0;
        }
        formMap[hid].push({ r: hg > ag ? "W" : hg < ag ? "L" : "D", id: m.id, oppId: aid, score: `${hg}\u2013${ag}`, home: true });
        formMap[aid].push({ r: ag > hg ? "W" : ag < hg ? "L" : "D", id: m.id, oppId: hid, score: `${ag}\u2013${hg}`, home: false });
        playedCountMap[hid]++;
        playedCountMap[aid]++;
      });
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      upcoming.forEach((m) => {
        const hid = String(m.hometeam), aid = String(m.awayteam);
        if (!formMap[hid]) {
          formMap[hid] = [];
          playedCountMap[hid] = 0;
        }
        if (!formMap[aid]) {
          formMap[aid] = [];
          playedCountMap[aid] = 0;
        }
        formMap[hid].push({ r: "?", id: m.id, oppId: aid, score: "", home: true });
        formMap[aid].push({ r: "?", id: m.id, oppId: hid, score: "", home: false });
      });
    }
    $("#overall_table tbody tr").each(function() {
      const $tr = $(this);
      const cls = ($tr.attr("class") || "").trim();
      const $a = $tr.find("td a[club_link]").first();
      if (!$a.length) return;
      const clubId = $a.attr("club_link");
      const clubName = $a.text().trim();
      const tds = $tr.find("td");
      const rank = parseInt($(tds[0]).text().trim()) || 0;
      const gp = parseInt($(tds[2]).text().trim()) || 0;
      const w = parseInt($(tds[3]).text().trim()) || 0;
      const d = parseInt($(tds[4]).text().trim()) || 0;
      const l = parseInt($(tds[5]).text().trim()) || 0;
      const gf = parseInt($(tds[6]).text().trim()) || 0;
      const ga = parseInt($(tds[7]).text().trim()) || 0;
      const pts = parseInt($(tds[8]).text().trim()) || 0;
      const isMe = cls.includes("highlighted_row_done") || clubId === myClubId;
      let zone = "";
      if (cls.includes("promotion_playoff")) zone = "promo-po";
      else if (cls.includes("promotion")) zone = "promo";
      else if (cls.includes("relegation_playoff")) zone = "rel-po";
      else if (cls.includes("relegation")) zone = "rel";
      s.standingsRows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe, form: formMap[clubId] || [], playedCount: playedCountMap[clubId] || 0 });
      if (rank && zone) s.liveZoneMap[rank] = zone;
    });
  };
  var parseHistoryStandings = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const table = doc.querySelector("table.border_bottom");
    if (!table) return [];
    const myClubId = typeof SESSION !== "undefined" && SESSION.main_id ? String(SESSION.main_id) : null;
    const rows = [];
    table.querySelectorAll("tr").forEach((tr) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const a = tr.querySelector("td a[club_link]");
      if (!a) return;
      const tds = tr.querySelectorAll("td");
      const cls = tr.className || "";
      const rank = parseInt((_a = tds[0]) == null ? void 0 : _a.textContent.trim()) || 0;
      const clubId = a.getAttribute("club_link");
      const clubName = a.textContent.trim();
      const gp = parseInt((_b = tds[2]) == null ? void 0 : _b.textContent.trim()) || 0;
      const w = parseInt((_c = tds[3]) == null ? void 0 : _c.textContent.trim()) || 0;
      const d = parseInt((_d = tds[4]) == null ? void 0 : _d.textContent.trim()) || 0;
      const l = parseInt((_e = tds[5]) == null ? void 0 : _e.textContent.trim()) || 0;
      const goalParts = (((_f = tds[6]) == null ? void 0 : _f.textContent.trim()) || "0-0").split("-");
      const gf = parseInt(goalParts[0]) || 0;
      const ga = parseInt(goalParts[1]) || 0;
      const pts = parseInt((_g = tds[7]) == null ? void 0 : _g.textContent.trim()) || 0;
      let zone = "";
      if (cls.includes("promotion_playoff")) zone = "promo-po";
      else if (cls.includes("promotion")) zone = "promo";
      else if (cls.includes("relegation_playoff")) zone = "rel-po";
      else if (cls.includes("relegation")) zone = "rel";
      const isMe = cls.includes("highlighted_row_done") || myClubId && clubId === myClubId;
      rows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe: !!isMe, form: [], playedCount: 0 });
    });
    return rows;
  };
  var fetchHistoryStandings = (season) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-standings-content");
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading Season ${season}\u2026</div>`;
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/standings/${season}/`).then((r) => r.text()).then((html) => {
      const rows = parseHistoryStandings(html);
      if (!rows.length) {
        container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data for Season ${season}</div>`;
        return;
      }
      rows.forEach((r) => {
        if (!r.zone && s.liveZoneMap[r.rank]) r.zone = s.liveZoneMap[r.rank];
      });
      s.displayedSeason = season;
      s.standingsRows = rows;
      s.formOffset = 0;
      TmLeagueStandings.renderLeagueTable();
    }).catch(() => {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load Season ${season}</div>`;
    });
  };
  var renderLeagueTable = () => {
    var _a, _b, _c;
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-standings-content");
    if (!container || !s.standingsRows.length) return;
    const liveSeasonVal = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    const isHistory = s.displayedSeason !== null && s.displayedSeason !== liveSeasonVal;
    const historyBanner = isHistory ? `<div class="tsa-history-banner">\u{1F4C5} Season ${s.displayedSeason} ${buttonHtml3({ id: "tsa-history-live-btn", label: "\u21A9 Back to live" })}</div>` : "";
    const isFiltered = !isHistory && (s.stdVenue !== "total" || s.stdFormN > 0);
    const rows = isFiltered ? (() => {
      const mapped = s.standingsRows.map((r) => {
        const played = r.form.filter((f) => f.r !== "?");
        const veued = s.stdVenue === "home" ? played.filter((f) => f.home) : s.stdVenue === "away" ? played.filter((f) => !f.home) : played;
        const sliced = s.stdFormN > 0 ? veued.slice(-s.stdFormN) : veued;
        let w = 0, d = 0, l = 0, gf = 0, ga = 0;
        sliced.forEach((f) => {
          if (f.r === "W") w++;
          else if (f.r === "D") d++;
          else if (f.r === "L") l++;
          if (f.score) {
            const p = f.score.split(/[\u2013\-]/);
            if (p.length === 2) {
              gf += parseInt(p[0], 10) || 0;
              ga += parseInt(p[1], 10) || 0;
            }
          }
        });
        return { ...r, gp: sliced.length, w, d, l, gf, ga, pts: w * 3 + d };
      });
      mapped.sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
      mapped.forEach((r, i) => {
        r.rank = i + 1;
      });
      return mapped;
    })() : s.standingsRows;
    const venueBtns = ["total", "home", "away"].map(
      (v) => buttonHtml3({
        label: v.charAt(0).toUpperCase() + v.slice(1),
        active: s.stdVenue === v,
        attrs: { "data-std-venue": v }
      })
    ).join("");
    const nBtns = [0, 5, 10, 15, 20, 25, 30].map(
      (n) => buttonHtml3({
        label: n === 0 ? "All" : String(n),
        active: s.stdFormN === n,
        attrs: { "data-std-n": String(n) }
      })
    ).join("");
    const controlsHtml = isHistory ? "" : `
            <div class="tsa-std-controls">
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">View</span>${venueBtns}</div>
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">Form</span>${nBtns}</div>
            </div>`;
    const maxPlayedLen = Math.max(0, ...rows.map((r) => r.playedCount));
    const maxUpcomingLen = Math.max(0, ...rows.map((r) => r.form.length - r.playedCount));
    const canOlder = maxPlayedLen + 1 - s.formOffset > 6;
    const canNewer = s.formOffset > 1 - maxUpcomingLen;
    const formHtml = (form, playedCount) => {
      let slice;
      if (s.stdVenue !== "total") {
        const isHome = s.stdVenue === "home";
        const filtered = form.filter((f) => f.r !== "?" && (isHome ? f.home : !f.home));
        slice = filtered.slice(-6);
      } else {
        const windowEnd = Math.min(form.length, Math.max(0, playedCount + 1 - s.formOffset));
        const windowStart = Math.max(0, windowEnd - 6);
        slice = form.slice(windowStart, windowEnd);
      }
      if (!slice.length) return '<span style="color:#5a7a48;font-size:10px;">\u2014</span>';
      return slice.map((f) => {
        const cls = f.r === "W" ? "form-w" : f.r === "D" ? "form-d" : f.r === "L" ? "form-l" : "form-u";
        const oppName = (s.standingsRows.find((sr) => sr.clubId === f.oppId) || {}).clubName || f.oppId;
        return `<a class="form-badge ${cls}" href="/matches/${f.id}/" target="_blank"
                    data-opp="${f.oppId}" data-score="${f.score || ""}" data-opp-name="${oppName}"
                    data-venue="${f.home ? "H" : "A"}">${f.r}</a>`;
      }).join(" ");
    };
    const tableHtml2 = TmStandingsTable.buildHtml({
      rows,
      liveZoneMap: s.liveZoneMap,
      isFiltered,
      showForm: !isHistory,
      formHtml,
      canOlder,
      canNewer
    });
    container.innerHTML = `${historyBanner}${controlsHtml}${tableHtml2}`;
    container.querySelectorAll("[data-std-venue]").forEach((btn) => {
      btn.addEventListener("click", () => {
        s.stdVenue = btn.dataset.stdVenue;
        renderLeagueTable();
      });
    });
    container.querySelectorAll("[data-std-n]").forEach((btn) => {
      btn.addEventListener("click", () => {
        s.stdFormN = parseInt(btn.dataset.stdN, 10);
        renderLeagueTable();
      });
    });
    (_a = document.getElementById("tsa-history-live-btn")) == null ? void 0 : _a.addEventListener("click", () => {
      s.displayedSeason = null;
      s.historyFixturesData = null;
      const chip = document.getElementById("tsa-ssnpick-chip");
      if (chip) chip.textContent = `Season ${liveSeasonVal}`;
      s.standingsRows = [];
      s.formOffset = 0;
      buildStandingsFromDOM();
      renderLeagueTable();
      const fixCont = document.getElementById("tsa-fixtures-content");
      if (fixCont && fixCont.style.display !== "none" && s.fixturesCache)
        TmLeagueFixtures.renderFixturesTab(s.fixturesCache);
    });
    let tooltip = document.getElementById("std-form-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "std-form-tooltip";
      document.body.appendChild(tooltip);
    }
    container.querySelectorAll(".form-badge[data-opp]").forEach((badge) => {
      badge.addEventListener("mouseenter", (e) => {
        const oppId = badge.dataset.opp;
        container.querySelectorAll("tr[data-club]").forEach((tr) => {
          tr.classList.toggle("std-hover-opp", tr.dataset.club === oppId);
        });
        const score = badge.dataset.score;
        const oppName = badge.dataset.oppName;
        const venue = badge.dataset.venue;
        const venueLabel = venue === "H" ? '<span style="color:#90b878">(H)</span>' : '<span style="color:#90b878">(A)</span>';
        tooltip.innerHTML = `<div class="sft-score">${score} ${venueLabel}</div><div class="sft-opp">vs ${oppName}</div>`;
        tooltip.style.left = e.clientX + 14 + "px";
        tooltip.style.top = e.clientY - 10 + "px";
        tooltip.style.display = "block";
      });
      badge.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.clientX + 14 + "px";
        tooltip.style.top = e.clientY - 10 + "px";
      });
      badge.addEventListener("mouseleave", () => {
        container.querySelectorAll("tr[data-club].std-hover-opp").forEach((tr) => tr.classList.remove("std-hover-opp"));
        tooltip.style.display = "none";
      });
    });
    (_b = document.getElementById("std-form-older")) == null ? void 0 : _b.addEventListener("click", () => {
      s.formOffset += 6;
      renderLeagueTable();
    });
    (_c = document.getElementById("std-form-newer")) == null ? void 0 : _c.addEventListener("click", () => {
      s.formOffset -= 6;
      renderLeagueTable();
    });
  };
  var TmLeagueStandings = { buildStandingsFromDOM, parseHistoryStandings, fetchHistoryStandings, renderLeagueTable };

  // src/components/league/tm-league-fixtures.js
  if (!document.getElementById("tsa-league-fixtures-style")) {
    const _s = document.createElement("style");
    _s.id = "tsa-league-fixtures-style";
    _s.textContent = `
            .fix-date-header {
                padding: 4px 12px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                background: rgba(0,0,0,0.15); border-top: 1px solid rgba(61,104,40,0.2);
            }
        `;
    document.head.appendChild(_s);
  }
  var createMonthTabs = ({ items, active, currentKeys = [], onChange }) => {
    const tabs = TmUI.tabs({ items, active, onChange });
    tabs.classList.add("fix-month-tabs");
    tabs.querySelectorAll(".tmu-tab").forEach((btn) => {
      if (currentKeys.includes(btn.dataset.tab)) btn.classList.add("fix-month-current");
    });
    return tabs;
  };
  var parseHistoryMatches = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const h3s = [...doc.querySelectorAll("h3.slide_toggle_open")];
    const groups = [];
    h3s.forEach((h3) => {
      const monthLabel = h3.textContent.trim();
      let ul = h3.nextElementSibling;
      while (ul && !(ul.tagName === "UL" && ul.classList.contains("match_list"))) ul = ul.nextElementSibling;
      if (!ul) return;
      let currentDay = 1;
      const matches = [];
      ul.querySelectorAll("li").forEach((li) => {
        const dateSpan = li.querySelector(".match_date");
        if (dateSpan) {
          const img = dateSpan.querySelector("img[src]");
          if (img) {
            const m = img.getAttribute("src").match(/calendar_numeral_(\d+)/);
            if (m) currentDay = parseInt(m[1]);
          }
        }
        const homeA = li.querySelector(".hometeam a[club_link]");
        const awayA = li.querySelector(".awayteam a[club_link]");
        const matchSpan = li.querySelector("[match_link]");
        const scoreA = li.querySelector("a.match_link");
        if (!homeA || !awayA || !matchSpan) return;
        matches.push({
          day: currentDay,
          homeId: homeA.getAttribute("club_link"),
          homeName: homeA.textContent.trim(),
          awayId: awayA.getAttribute("club_link"),
          awayName: awayA.textContent.trim(),
          matchId: matchSpan.getAttribute("match_link"),
          score: scoreA ? scoreA.textContent.trim() : ""
        });
      });
      if (matches.length) groups.push({ monthLabel, matches });
    });
    return groups;
  };
  var fetchHistoryFixtures = (season) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-fixtures-content");
    if (container && container.style.display !== "none") {
      container.innerHTML = TmUI.loading(`Loading Season ${season} fixtures\u2026`);
    }
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/matches/${season}/`).then((r) => r.text()).then((html) => {
      const groups = parseHistoryMatches(html);
      s.historyFixturesData = { season, groups };
      const cont = document.getElementById("tsa-fixtures-content");
      if (cont && cont.style.display !== "none") {
        renderHistoryFixturesTab(s.historyFixturesData);
      }
    }).catch(() => {
      const cont = document.getElementById("tsa-fixtures-content");
      if (cont && cont.style.display !== "none") {
        cont.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load Season ${season} fixtures</div>`;
      }
    });
  };
  var renderFixturesTab = (fixtures) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-fixtures-content");
    if (!container || !fixtures) return;
    const myClubId = (s.standingsRows.find((r) => r.isMe) || {}).clubId || null;
    const months = Object.entries(fixtures).sort(([a], [b]) => a.localeCompare(b));
    const currentMonthKey = (months.find(([, v]) => v.current_month) || months[0] || [])[0];
    let activeKey = container.dataset.activeMonth || currentMonthKey;
    if (!fixtures[activeKey]) activeKey = currentMonthKey;
    let html = "";
    const monthData = fixtures[activeKey];
    if (monthData && monthData.matches) {
      const byDate = {};
      monthData.matches.forEach((m) => {
        (byDate[m.date] = byDate[m.date] || []).push(m);
      });
      const sortedDates = Object.keys(byDate).sort();
      let matchIdx = 0;
      html += '<div class="fix-month-body">';
      sortedDates.forEach((date) => {
        const d = /* @__PURE__ */ new Date(date + "T12:00:00");
        const dayLabel = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
        const round = s.allRounds.find((r) => r.date === date);
        const roundLabel = round ? `<span style="color:#4a6a3a;font-size:10px;float:right">Round ${round.roundNum}</span>` : "";
        html += `<div class="fix-date-header">${dayLabel}${roundLabel}</div>`;
        byDate[date].forEach((m) => {
          html += TmFixtureMatchRow.render(m, {
            index: matchIdx,
            myClubId,
            showTvBadge: true,
            linkUpcoming: true
          });
          matchIdx += 1;
        });
      });
      html += "</div>";
    } else {
      html += '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">No fixtures available</div>';
    }
    container.innerHTML = html;
    if (months.length) {
      const tabs = createMonthTabs({
        items: months.map(([key, data]) => ({ key, label: data.month })),
        active: activeKey,
        currentKeys: months.filter(([, data]) => !!data.current_month).map(([key]) => key),
        onChange: (key) => {
          container.dataset.activeMonth = key;
          renderFixturesTab(s.fixturesCache);
        }
      });
      container.prepend(tabs);
    }
    container.querySelectorAll(".tmvu-fixture-row[data-mid]").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        window.location.href = `/matches/${row.dataset.mid}/`;
      });
    });
  };
  var showHistFixTooltip = (el, mid, season) => {
    const s = window.TmLeagueCtx;
    clearTimeout(s.histFixTooltipHideTimer);
    if (s.histFixTooltipEl) s.histFixTooltipEl.remove();
    const currentSeasonNum = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    s.histFixTooltipEl = TmMatchH2HTooltip.show(el, mid, Number(season) === currentSeasonNum);
  };
  var renderHistoryFixturesTab = (data) => {
    var _a, _b;
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-fixtures-content");
    if (!container || !data) return;
    const myClubId = (s.standingsRows.find((r) => r.isMe) || {}).clubId || (typeof SESSION !== "undefined" && SESSION.main_id ? String(SESSION.main_id) : null);
    const { season, groups } = data;
    const activeIdxRaw = parseInt(container.dataset.historyActiveMonth || "0");
    const activeIdx = isNaN(activeIdxRaw) ? 0 : Math.min(activeIdxRaw, groups.length - 1);
    let html = `<div class="tsa-history-banner">\u{1F4C5} Season ${season} ${TmUI.button({
      id: "tsa-fix-history-live-btn",
      label: "\u21A9 Back to live",
      color: "secondary",
      size: "xs"
    }).outerHTML}</div>`;
    const group = groups[activeIdx];
    if (group && group.matches.length) {
      let lastDay = -1;
      let matchIdx = 0;
      html += '<div class="fix-month-body">';
      group.matches.forEach((m) => {
        if (m.day !== lastDay) {
          const shortMonth = group.monthLabel.split(" ")[0].slice(0, 3);
          html += `<div class="fix-date-header">${m.day} ${shortMonth}</div>`;
          lastDay = m.day;
        }
        html += TmFixtureMatchRow.render(m, {
          index: matchIdx,
          myClubId,
          season,
          extraClass: "hfix-match"
        });
        matchIdx += 1;
      });
      html += "</div>";
    } else {
      html += '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">No fixtures available</div>';
    }
    container.innerHTML = html;
    if (groups.length > 1) {
      const tabs = createMonthTabs({
        items: groups.map((groupItem, idx) => ({ key: String(idx), label: groupItem.monthLabel })),
        active: String(activeIdx),
        onChange: (key) => {
          container.dataset.historyActiveMonth = key;
          renderHistoryFixturesTab(s.historyFixturesData);
        }
      });
      (_a = container.querySelector(".tsa-history-banner")) == null ? void 0 : _a.after(tabs);
    }
    (_b = document.getElementById("tsa-fix-history-live-btn")) == null ? void 0 : _b.addEventListener("click", () => {
      const lv = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
      s.historyFixturesData = null;
      s.displayedSeason = null;
      container.dataset.historyActiveMonth = "0";
      const chip = document.getElementById("tsa-ssnpick-chip");
      if (chip && lv) chip.textContent = `Season ${lv}`;
      s.standingsRows = [];
      s.formOffset = 0;
      TmLeagueStandings.buildStandingsFromDOM();
      TmLeagueStandings.renderLeagueTable();
      if (s.fixturesCache) renderFixturesTab(s.fixturesCache);
    });
    container.querySelectorAll(".tmvu-fixture-row.hfix-match[data-mid]").forEach((row) => {
      if (!row.dataset.mid) return;
      row.addEventListener("mouseenter", () => {
        clearTimeout(s.histFixTooltipHideTimer);
        const mid = row.dataset.mid;
        const rowSeason = row.dataset.season;
        s.histFixTooltipTimer = setTimeout(() => showHistFixTooltip(row, mid, rowSeason), 300);
      });
      row.addEventListener("mouseleave", () => {
        clearTimeout(s.histFixTooltipTimer);
        s.histFixTooltipHideTimer = setTimeout(() => {
          if (s.histFixTooltipEl) {
            s.histFixTooltipEl.remove();
            s.histFixTooltipEl = null;
          }
        }, 100);
      });
    });
  };
  var TmLeagueFixtures = {
    parseHistoryMatches,
    fetchHistoryFixtures,
    renderFixturesTab,
    renderHistoryFixturesTab
  };

  // src/services/league.js
  var TMLeagueService = {
    /**
     * Fetch fixtures via fixtures.ajax.php.
     * @param {string} type
     * @param {object} params
     * @returns {Promise<object|null>}
     */
    fetchLeagueFixtures(type, params = {}) {
      return _post("/ajax/fixtures.ajax.php", { type, ...params });
    },
    /**
     * Fetch available league divisions for a given country.
     * @param {string} country — country suffix (e.g. 'cs', 'de')
     * @returns {Promise<object|null>}
     */
    fetchLeagueDivisions(country) {
      return _post("https://trophymanager.com/ajax/league_get_divisions.ajax.php", { get: "new", country });
    }
  };

  // src/components/league/tm-league-picker.js
  if (!document.getElementById("tsa-league-picker-style")) {
    const _s = document.createElement("style");
    _s.id = "tsa-league-picker-style";
    _s.textContent = `
            #tsa-league-dialog-overlay {
                position: fixed; inset: 0; z-index: 99999;
                background: rgba(0,0,0,0.72);
                display: flex; align-items: center; justify-content: center;
            }
            .tsa-ld-box {
                background: #111f0a; border: 1px solid rgba(61,104,40,0.6);
                border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);
                width: 780px; max-width: 96vw;
                display: flex; flex-direction: column; overflow: visible;
            }
            .tsa-ld-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 14px; background: rgba(0,0,0,0.35);
                border-bottom: 1px solid rgba(61,104,40,0.35);
                border-radius: 8px 8px 0 0;
            }
            .tsa-ld-title { font-size: 12px; font-weight: 700; color: #6cc040; text-transform: uppercase; letter-spacing: 0.6px; }
            #tsa-ld-close {
                background: none; border: none; color: #4a7038; font-size: 18px; line-height: 1;
                padding: 0 2px; transition: color 0.12s, opacity 0.15s; min-width: 0;
            }
            #tsa-ld-close:hover { color: #c8e0b4; }
            .tsa-ld-body { padding: 0; }
            .tsa-ld-loading { padding: 20px; text-align: center; font-size: 11px; color: #5a7a48; }
            .tsa-ld-picker { display: flex; flex-direction: row; align-items: flex-end; gap: 10px; padding: 14px; }
            .tsa-ld-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
            .tsa-ld-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #5a7a48; }
            .tsa-ld-footer { display: flex; flex-shrink: 0; }
            #tsa-ld-go { text-transform: uppercase; letter-spacing: 0.5px; }
            #tsa-ld-go:disabled { background: #1e3014; color: #3a5228; cursor: not-allowed; }
        `;
    document.head.appendChild(_s);
  }
  var buttonHtml4 = (opts) => TmUI.button(opts).outerHTML;
  var createAutocomplete = (opts) => TmUI.autocomplete({ tone: "overlay", density: "comfy", size: "full", grow: true, ...opts });
  var createFlag = (suffix) => {
    if (!suffix) return null;
    const img = document.createElement("img");
    img.className = "tmu-ac-media";
    img.src = `/pics/flags/gradient/${suffix}.png`;
    img.alt = "";
    img.onerror = () => {
      img.style.display = "none";
    };
    return img;
  };
  var openLeagueDialog = () => {
    const s = window.TmLeagueCtx;
    const existing = document.getElementById("tsa-league-dialog-overlay");
    if (existing) {
      existing.remove();
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "tsa-league-dialog-overlay";
    overlay.innerHTML = `
            <div class="tsa-ld-box" id="tsa-ld-box">
                <div class="tsa-ld-header">
                    <span class="tsa-ld-title">Change League</span>
                    ${buttonHtml4({ id: "tsa-ld-close", label: "\xD7", variant: "icon", color: "secondary", size: "xs" })}
                </div>
                <div class="tsa-ld-body" id="tsa-ld-body">
                    <div class="tsa-ld-loading">Loading\u2026</div>
                </div>
            </div>`;
    document.body.appendChild(overlay);
    document.getElementById("tsa-ld-close").addEventListener("click", () => overlay.remove());
    TMLeagueService.fetchLeagueDivisions(s.leagueCountry || "cs").then((data) => {
      if (!data) {
        document.getElementById("tsa-ld-body").innerHTML = '<div class="tsa-ld-loading" style="color:#ef4444">Failed to load.</div>';
        return;
      }
      renderLeaguePicker(data, document.getElementById("tsa-ld-body"));
    });
  };
  var renderLeaguePicker = (data, body) => {
    var _a, _b, _c;
    const s = window.TmLeagueCtx;
    const allCountries = Object.values(data.countries).flat().sort((a, b) => a.country.localeCompare(b.country));
    const currentSuffix = (s.leagueCountry || "cs").toLowerCase();
    body.innerHTML = `
            <div class="tsa-ld-picker">
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Country</label>
                    <div id="tsa-ld-country-ac"></div>
                </div>
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Division</label>
                    <div id="tsa-ld-div-ac"></div>
                </div>
                <div class="tsa-ld-field" id="tsa-ld-group-field" hidden>
                    <label class="tsa-ld-label">Group</label>
                    <div id="tsa-ld-group-ac"></div>
                </div>
                <div class="tsa-ld-footer">
                    ${buttonHtml4({ id: "tsa-ld-go", label: "Go", color: "primary", disabled: true })}
                </div>
            </div>`;
    let selCountry = null, selDivision = null, selGroup = null, divisionData = null;
    const groupField = document.getElementById("tsa-ld-group-field");
    const goBtn = document.getElementById("tsa-ld-go");
    const countryAc = createAutocomplete({ id: "tsa-ld-country-input", placeholder: "Type to search\u2026", autocomplete: "off" });
    const divAc = createAutocomplete({ id: "tsa-ld-div-input", placeholder: "Select country first\u2026", autocomplete: "off", disabled: true });
    const groupAc = createAutocomplete({ id: "tsa-ld-group-input", placeholder: "Select group\u2026", autocomplete: "off", disabled: true });
    (_a = document.getElementById("tsa-ld-country-ac")) == null ? void 0 : _a.replaceWith(countryAc);
    (_b = document.getElementById("tsa-ld-div-ac")) == null ? void 0 : _b.replaceWith(divAc);
    (_c = document.getElementById("tsa-ld-group-ac")) == null ? void 0 : _c.replaceWith(groupAc);
    const countryInput = countryAc.inputEl;
    const divInput = divAc.inputEl;
    const groupInput = groupAc.inputEl;
    const updateGo = () => {
      const nGroups = selDivision ? parseInt(selDivision.groups) || 1 : 0;
      goBtn.disabled = !(selCountry && selDivision && (nGroups <= 1 || selGroup));
    };
    const makeItem = (label, flagSuffix, onClick) => {
      return TmUI.autocompleteItem({ label, icon: createFlag(flagSuffix), onSelect: onClick });
    };
    const applyDivisions = (divs) => {
      divisionData = divs;
      divInput.placeholder = divs.length ? "Select division\u2026" : "No divisions found";
      divAc.setDisabled(!divs.length);
    };
    const selectGroup = (g) => {
      selGroup = g;
      groupAc.setValue(`Group ${g}`);
      groupAc.hideDrop();
      updateGo();
    };
    const selectDivision = (d) => {
      selDivision = d;
      selGroup = null;
      divAc.setValue(d.name);
      divAc.hideDrop();
      const nGroups = parseInt(d.groups) || 1;
      if (nGroups > 1) {
        groupField.hidden = false;
        groupAc.setDisabled(false);
        groupAc.setValue("");
        groupInput.placeholder = `Select group (1\u2013${nGroups})\u2026`;
        groupAc.hideDrop();
      } else {
        groupField.hidden = true;
        selGroup = 1;
      }
      updateGo();
    };
    const selectCountry = (c, prefetchedDivisions) => {
      selCountry = c;
      selDivision = null;
      selGroup = null;
      countryAc.setValue(c.country);
      countryAc.setLeading(createFlag(c.suffix));
      countryAc.hideDrop();
      divAc.setValue("");
      groupField.hidden = true;
      groupAc.setValue("");
      groupAc.setDisabled(true);
      updateGo();
      if (prefetchedDivisions) {
        applyDivisions(prefetchedDivisions);
      } else {
        divInput.placeholder = "Loading divisions\u2026";
        divAc.setDisabled(true);
        TMLeagueService.fetchLeagueDivisions(c.suffix).then((d) => {
          if (d) applyDivisions(d.divisions || []);
        });
      }
    };
    const countryDivs = (c) => c.suffix === currentSuffix ? data.divisions || [] : null;
    countryInput.addEventListener("focus", () => {
      const q = countryInput.value;
      const items = allCountries.filter((c) => !q || c.country.toLowerCase().includes(q.toLowerCase())).map((c) => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
      countryAc.setItems(items);
    });
    countryInput.addEventListener("input", () => {
      const q = countryInput.value.toLowerCase();
      const items = allCountries.filter((c) => c.country.toLowerCase().includes(q)).map((c) => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
      countryAc.setItems(items);
    });
    countryInput.addEventListener("blur", () => setTimeout(() => countryAc.hideDrop(), 150));
    divInput.addEventListener("focus", () => {
      if (!divisionData) return;
      divAc.setItems(divisionData.map((d) => makeItem(d.name, null, () => selectDivision(d))));
    });
    divInput.addEventListener("input", () => {
      if (!divisionData) return;
      const q = divInput.value.toLowerCase();
      divAc.setItems(divisionData.filter((d) => d.name.toLowerCase().includes(q)).map((d) => makeItem(d.name, null, () => selectDivision(d))));
    });
    divInput.addEventListener("blur", () => setTimeout(() => divAc.hideDrop(), 150));
    groupInput.addEventListener("focus", () => {
      if (!selDivision) return;
      const nGroups = parseInt(selDivision.groups) || 1;
      groupAc.setItems(Array.from({ length: nGroups }, (_, i) => i + 1).map((g) => makeItem(`Group ${g}`, null, () => selectGroup(g))));
    });
    groupInput.addEventListener("blur", () => setTimeout(() => groupAc.hideDrop(), 150));
    goBtn.addEventListener("click", () => {
      var _a2;
      if (!selCountry || !selDivision) return;
      (_a2 = document.getElementById("tsa-league-dialog-overlay")) == null ? void 0 : _a2.remove();
      window.location.href = `/league/${selCountry.suffix}/${selDivision.division}/${selGroup || 1}/`;
    });
    const cur = allCountries.find((c) => c.suffix === currentSuffix);
    if (cur) {
      selectCountry(cur, data.divisions || []);
      if (s.leagueDivision) {
        const curDiv = (data.divisions || []).find((d) => String(d.division) === String(s.leagueDivision));
        if (curDiv) {
          selectDivision(curDiv);
          const g = parseInt(s.leagueGroup) || 1;
          const nGroups = parseInt(curDiv.groups) || 1;
          if (nGroups > 1) selectGroup(g);
        }
      }
    }
  };
  var TmLeaguePicker = { openLeagueDialog, renderLeaguePicker };

  // src/components/league/tm-league-table.js
  var headerCellHtml = (cell) => {
    const attrs = [];
    const classNames = [];
    if (cell.className) classNames.push(cell.className);
    if (cell.sortIndex !== void 0) {
      attrs.push(`data-si="${cell.sortIndex}"`);
      attrs.push(`data-label="${cell.label}"`);
    }
    if (cell.style) attrs.push(`style="${cell.style}"`);
    if (cell.title) attrs.push(`title="${cell.title}"`);
    if (cell.rowspan) attrs.push(`rowspan="${cell.rowspan}"`);
    if (cell.colspan) attrs.push(`colspan="${cell.colspan}"`);
    return `<th${classNames.length ? ` class="${classNames.join(" ")}"` : ""}${attrs.length ? ` ${attrs.join(" ")}` : ""}>${cell.label}</th>`;
  };
  var tableHtml = ({ headerRows = [], bodyHtml = "" }) => `<div class="tsa-stats-scroll"><table class="tsa-stats-table"><thead>${headerRows.map((row) => `<tr>${row.map(headerCellHtml).join("")}</tr>`).join("")}</thead><tbody>${bodyHtml}</tbody></table></div>`;
  var sortableValue = (row, sortIndex) => {
    var _a;
    return (_a = row == null ? void 0 : row._sortVals) == null ? void 0 : _a[sortIndex];
  };
  var TmLeagueTable = {
    mountSortable(wrap, { headerRows = [], getRows, renderRows, defaultAsc = (sortIndex) => sortIndex === 1 || sortIndex === 2 } = {}) {
      if (!wrap) return;
      let sortCol = -1;
      let sortAsc = true;
      const render3 = () => {
        const sorted = [...getRows()];
        if (sortCol >= 0) {
          sorted.sort((leftRow, rightRow) => {
            const leftValue = sortableValue(leftRow, sortCol);
            const rightValue = sortableValue(rightRow, sortCol);
            const leftNumber = Number.parseFloat(leftValue);
            const rightNumber = Number.parseFloat(rightValue);
            if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
              return sortAsc ? leftNumber - rightNumber : rightNumber - leftNumber;
            }
            return sortAsc ? String(leftValue != null ? leftValue : "").localeCompare(String(rightValue != null ? rightValue : "")) : String(rightValue != null ? rightValue : "").localeCompare(String(leftValue != null ? leftValue : ""));
          });
        }
        wrap.innerHTML = tableHtml({ headerRows, bodyHtml: renderRows(sorted) });
        wrap.querySelectorAll("thead th[data-si]").forEach((th) => {
          th.style.cursor = "pointer";
          const si = Number.parseInt(th.dataset.si, 10);
          th.textContent = th.dataset.label + (si === sortCol ? sortAsc ? " \u25B2" : " \u25BC" : "");
          th.addEventListener("click", () => {
            if (sortCol === si) {
              sortAsc = !sortAsc;
            } else {
              sortCol = si;
              sortAsc = defaultAsc(si);
            }
            render3();
          });
        });
      };
      render3();
    }
  };

  // src/components/league/tm-league-stats.js
  if (!document.getElementById("tsa-league-stats-style")) {
    const _s = document.createElement("style");
    _s.id = "tsa-league-stats-style";
    _s.textContent = `
            .tsa-stats-bar {
                display: flex; align-items: center; justify-content: space-between;
                flex-wrap: wrap; gap: 6px; padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,0.3);
            }
            .tsa-stats-bar-mode { background: rgba(0,0,0,0.15); padding: 6px 10px; }
            .tsa-stat-mode-btns { display: flex; gap: 4px; }
            .tsa-stat-btns { display: flex; flex-wrap: wrap; gap: 4px; }
            .tsa-stat-team-btns { display: flex; gap: 4px; }
            .tsa-stat-btn-active { background: #3d6828 !important; color: #e8f5d8 !important; }
            .tsa-stats-scroll { overflow-y: auto; }
            .tsa-stats-table { width: 100%; border-collapse: collapse; font-size: 11px; color: #c8e0b4; }
            .tsa-stats-table thead tr { background: rgba(0,0,0,0.25); position: sticky; top: 0; }
            .tsa-stats-table th {
                padding: 5px 8px; color: #6a9a58; font-size: 10px;
                text-transform: uppercase; letter-spacing: 0.5px;
                font-weight: 700; text-align: left;
                border-bottom: 1px solid rgba(61,104,40,0.4); user-select: none;
            }
            .tsa-stats-table th[data-si]:hover { color: #c8e0b4; }
            .tsa-stats-table th.tsa-stats-val { text-align: right; }
            .tsa-stats-table td { padding: 4px 8px; border-bottom: 1px solid rgba(61,104,40,0.15); }
            .tsa-stats-table tbody tr:nth-child(even) { background: rgba(0,0,0,0.15); }
            .tsa-stats-table tbody tr:hover { background: rgba(61,104,40,0.2); }
            .tsa-stats-rank { color: #5a7a48; width: 28px; text-align: right; padding-right: 6px !important; }
            .tsa-stats-name a { color: #c8e0b4; text-decoration: none; }
            .tsa-stats-name a:hover { color: #6cc040; }
            .tsa-stats-club { color: #6a9a58; font-size: 10px; }
            .tsa-stats-val { text-align: right; font-weight: 700; color: #e8f5d8; }
            .tsa-stats-me { background: rgba(108,192,64,0.10) !important; box-shadow: inset 3px 0 0 rgba(108,192,64,0.55); }
            .tsa-stats-me .tsa-stats-name a { color: #8fdc60; }
            .tsa-stats-me .tsa-stats-val { color: #6cc040; }
            .tsa-tr-rec { text-align: center; font-weight: 700; font-size: 11px; }
            .tsa-tr-section { margin-bottom: 2px; }
            .tsa-tr-head {
                padding: 6px 10px; font-size: 11px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                background: rgba(0,0,0,0.2); border-top: 1px solid rgba(61,104,40,0.3);
            }
            .tsa-tr-count { display: inline-block; margin-left: 6px; background: rgba(61,104,40,0.35); color: #c8e0b4; border-radius: 8px; padding: 0 6px; font-size: 10px; }
            .tsa-tr-totals {
                display: flex; gap: 16px; justify-content: flex-end;
                padding: 8px 12px; font-size: 11px; color: #6a9a58;
                border-top: 2px solid rgba(61,104,40,0.4); background: rgba(0,0,0,0.15);
            }
        `;
    document.head.appendChild(_s);
  }
  var buttonHtml5 = ({ label, slot, cls = "", active = false, ...opts }) => TmButton.button({
    color: "secondary",
    size: "xs",
    label,
    slot,
    cls: `${cls}${active ? " tsa-stat-btn-active" : ""}`,
    ...opts
  }).outerHTML;
  var CLUB_STAT_COLS = {
    goals: ["Avg GF", "Avg GA", "Clean Sheets", "No Goals Scored"],
    attendance: ["Home Avg", "Away Avg", "Total Avg"],
    injuries: ["Injuries", "Total Days", "Avg Days"],
    possession: ["Home %", "Away %", "Avg %"],
    cards: ["Yellow", "Red", "Total"]
  };
  var parsePlayerStats = (html, teamIdx) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const tab = doc.getElementById(teamIdx === 0 ? "tab0" : "tab1");
    if (!tab) return [];
    const rows = [];
    tab.querySelectorAll("tbody tr").forEach((tr, i) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 3) return;
      const playerA = tds[0].querySelector("a[player_link]");
      const clubA = tds[1].querySelector("a[club_link]");
      const valText = tds[tds.length - 1].textContent.trim();
      rows.push({
        rank: i + 1,
        name: playerA ? playerA.textContent.trim() : tds[0].textContent.trim(),
        playerId: playerA ? playerA.getAttribute("player_link") : "",
        clubName: clubA ? clubA.textContent.trim() : "",
        clubId: clubA ? clubA.getAttribute("club_link") : "",
        val: parseFloat(valText) || 0,
        isMe: tr.classList.contains("highlighted_row")
      });
    });
    return rows;
  };
  var fetchPlayerStats = (stat, season, teamIdx, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `${stat}|${season}|${teamIdx}`;
    if (s.statsCache[key]) {
      onDone(s.statsCache[key]);
      return;
    }
    const seasonStr = season ? `${season}/` : "";
    window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/players/${stat}/${seasonStr}`).then((r) => r.text()).then((html) => {
      const rows = parsePlayerStats(html, teamIdx);
      s.statsCache[key] = rows;
      onDone(rows);
    }).catch(() => onDone(null));
  };
  var parseClubStats = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const tab = doc.getElementById("tab0") || doc.querySelector(".tab_container");
    if (!tab) return [];
    const rows = [];
    tab.querySelectorAll("tbody tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      let clubTdIdx = -1, clubA = null;
      for (let i = 0; i < tds.length; i++) {
        const a = tds[i].querySelector("a[club_link]");
        if (a) {
          clubA = a;
          clubTdIdx = i;
          break;
        }
      }
      if (!clubA) return;
      const vals = [];
      for (let i = clubTdIdx + 1; i < tds.length; i++) vals.push(tds[i].textContent.trim());
      rows.push({
        clubName: clubA.textContent.trim(),
        clubId: clubA.getAttribute("club_link"),
        vals,
        isMe: tr.classList.contains("highlighted_row")
      });
    });
    return rows;
  };
  var fetchClubStats = (stat, season, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `club|${stat}|${season}`;
    if (s.statsCache[key]) {
      onDone(s.statsCache[key]);
      return;
    }
    const seasonStr = season ? `${season}/` : "";
    window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/clubs/${stat}/${seasonStr}`).then((r) => r.text()).then((html) => {
      const rows = parseClubStats(html);
      s.statsCache[key] = rows;
      onDone(rows);
    }).catch(() => onDone(null));
  };
  var parseTransfers = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const myId = typeof SESSION !== "undefined" ? String(SESSION.id) : null;
    const result = { bought: [], sold: [], totals: {} };
    let boughtTable = null, soldTable = null;
    doc.querySelectorAll("h3").forEach((h3) => {
      const text = h3.textContent.trim().toLowerCase();
      let next = h3.nextElementSibling;
      while (next && next.tagName !== "TABLE") next = next.nextElementSibling;
      if (!next) return;
      if (text.includes("bought")) boughtTable = next;
      else if (text.includes("sold")) soldTable = next;
    });
    const parseRows = (table) => {
      if (!table) return [];
      const rows = [];
      table.querySelectorAll("tr").forEach((tr) => {
        const tds = tr.querySelectorAll("td");
        if (tds.length < 4) return;
        const playerA = tds[0].querySelector("a[player_link]");
        if (!playerA) return;
        const recTd = tds[1];
        const clubA = tds[2].querySelector("a[club_link]");
        if (!clubA) return;
        const recVal = parseFloat(recTd.getAttribute("sortvalue")) || 0;
        const isRetired = recTd.textContent.trim() === "Retired";
        const price = parseFloat(tds[3].textContent.trim().replace(/,/g, "")) || 0;
        const clubId = clubA.getAttribute("club_link");
        rows.push({
          name: playerA.textContent.trim(),
          playerId: playerA.getAttribute("player_link"),
          rec: recVal,
          isRetired,
          clubName: clubA.textContent.trim(),
          clubId,
          price,
          isMe: myId && clubId === myId
        });
      });
      return rows;
    };
    result.bought = parseRows(boughtTable);
    result.sold = parseRows(soldTable);
    doc.querySelectorAll("td").forEach((td) => {
      const strong = td.querySelector("strong");
      if (!strong) return;
      const text = td.textContent;
      if (text.includes("Total Bought:")) result.totals.bought = strong.textContent.trim();
      else if (text.includes("Total Sold:")) result.totals.sold = strong.textContent.trim();
      else if (text.includes("Balance:")) result.totals.balance = strong.textContent.trim();
    });
    return result;
  };
  var fetchTransfers = (season, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `transfers|${season}`;
    if (s.statsCache[key]) {
      onDone(s.statsCache[key]);
      return;
    }
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/transfers/${season}/`).then((r) => r.text()).then((html) => {
      const data = parseTransfers(html);
      s.statsCache[key] = data;
      onDone(data);
    }).catch(() => onDone(null));
  };
  var renderPlayerStatsTab = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-stats-content");
    if (!container) return;
    const season = s.displayedSeason !== null ? s.displayedSeason : typeof SESSION !== "undefined" ? SESSION.season : null;
    const playerStatDefs = [
      ["goals", "Goals"],
      ["assists", "Assists"],
      ["productivity", "Productivity"],
      ["rating", "Rating"],
      ["cards", "Cards"],
      ["man-of-the-match", "MoM"]
    ];
    const clubStatDefs = [
      ["goals", "Goals"],
      ["attendance", "Attendance"],
      ["injuries", "Injuries"],
      ["possession", "Possession"],
      ["cards", "Cards"]
    ];
    const playerColLabels = {
      goals: "Goals",
      assists: "Assists",
      productivity: "Pts",
      rating: "Rating",
      cards: "Cards",
      "man-of-the-match": "MoM"
    };
    const isPlayers = s.statsMode === "players";
    const statDefs = isPlayers ? playerStatDefs : clubStatDefs;
    const curStat = isPlayers ? s.statsStatType : s.statsClubStat;
    const modeBtns = `
            <div class="tsa-stat-mode-btns">
                ${buttonHtml5({ cls: "tsa-stat-mode-btn", label: "Players", active: isPlayers })}
                ${buttonHtml5({ cls: "tsa-stat-mode-btn", label: "Clubs", active: !isPlayers })}
            </div>`;
    const statBtns = statDefs.map(([k, v]) => buttonHtml5({ cls: "tsa-stat-btn", label: v, active: curStat === k })).join("");
    const teamToggle = isPlayers ? `
            <div class="tsa-stat-team-btns">
                ${buttonHtml5({ cls: "tsa-stat-team-btn", label: "Main", active: s.statsTeamType === 0 })}
                ${buttonHtml5({ cls: "tsa-stat-team-btn", label: "U21", active: s.statsTeamType === 1 })}
            </div>` : "";
    container.innerHTML = `
            <div class="tsa-stats-bar tsa-stats-bar-mode">${modeBtns}</div>
            <div class="tsa-stats-bar">
                <div class="tsa-stat-btns">${statBtns}</div>
                ${teamToggle}
            </div>
            <div id="tsa-stats-table-wrap"><div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading\u2026</div></div>
        `;
    const modeButtons = container.querySelectorAll(".tsa-stat-mode-btn");
    if (modeButtons[0]) modeButtons[0].dataset.mode = "players";
    if (modeButtons[1]) modeButtons[1].dataset.mode = "clubs";
    container.querySelectorAll(".tsa-stat-btn").forEach((btn, index) => {
      var _a;
      btn.dataset.stat = ((_a = statDefs[index]) == null ? void 0 : _a[0]) || "";
    });
    container.querySelectorAll(".tsa-stat-team-btn").forEach((btn, index) => {
      btn.dataset.team = String(index);
    });
    container.querySelectorAll(".tsa-stat-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        s.statsMode = btn.dataset.mode;
        renderPlayerStatsTab();
      });
    });
    container.querySelectorAll(".tsa-stat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isPlayers) s.statsStatType = btn.dataset.stat;
        else s.statsClubStat = btn.dataset.stat;
        renderPlayerStatsTab();
      });
    });
    container.querySelectorAll(".tsa-stat-team-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        s.statsTeamType = parseInt(btn.dataset.team);
        renderPlayerStatsTab();
      });
    });
    if (isPlayers) {
      fetchPlayerStats(s.statsStatType, season, s.statsTeamType, (rows) => {
        const wrap = document.getElementById("tsa-stats-table-wrap");
        if (!wrap) return;
        if (!rows || !rows.length) {
          wrap.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data.</div>`;
          return;
        }
        const colLabel = playerColLabels[s.statsStatType] || "Value";
        const enriched = rows.map((r) => ({ ...r, _sortVals: [r.rank, r.name, r.clubName, r.val] }));
        const buildRowsHtml = (data) => data.map((r) => `
                    <tr class="${r.isMe ? "tsa-stats-me" : ""}">
                        <td class="tsa-stats-rank">${r.rank}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        <td class="tsa-stats-club">${r.clubName}</td>
                        <td class="tsa-stats-val">${r.val}</td>
                    </tr>`).join("");
        TmLeagueTable.mountSortable(wrap, {
          headerRows: [[
            { label: "#", sortIndex: 0 },
            { label: "Player", sortIndex: 1, style: "text-align:left" },
            { label: "Club", sortIndex: 2, style: "text-align:left" },
            { label: colLabel, sortIndex: 3, className: "tsa-stats-val" }
          ]],
          getRows: () => enriched,
          renderRows: buildRowsHtml
        });
      });
    } else {
      fetchClubStats(s.statsClubStat, season, (rows) => {
        const wrap = document.getElementById("tsa-stats-table-wrap");
        if (!wrap) return;
        if (!rows || !rows.length) {
          wrap.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data.</div>`;
          return;
        }
        const cols = CLUB_STAT_COLS[s.statsClubStat] || [];
        const enriched = rows.map((r) => ({ ...r, _sortVals: [0, r.clubName, ...r.vals] }));
        enriched.sort((a, b) => (parseFloat(b._sortVals[2]) || 0) - (parseFloat(a._sortVals[2]) || 0));
        enriched.forEach((r, i) => {
          r._rank = i + 1;
          r._sortVals[0] = i + 1;
        });
        const buildRowsHtml = (data) => data.map((r, i) => {
          const valCells = r.vals.map((v) => `<td class="tsa-stats-val">${v}</td>`).join("");
          return `<tr class="${r.isMe ? "tsa-stats-me" : ""}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/club/${r.clubId}/" target="_blank">${r.clubName}</a></td>
                        ${valCells}
                    </tr>`;
        }).join("");
        TmLeagueTable.mountSortable(wrap, {
          headerRows: [[
            { label: "#", sortIndex: 0 },
            { label: "Club", sortIndex: 1, style: "text-align:left" },
            ...cols.map((label, index) => ({ label, sortIndex: index + 2, className: "tsa-stats-val" }))
          ]],
          getRows: () => enriched,
          renderRows: buildRowsHtml
        });
      });
    }
  };
  var renderTransfersTab = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-transfers-content");
    if (!container) return;
    const season = s.displayedSeason !== null ? s.displayedSeason : typeof SESSION !== "undefined" ? SESSION.season : null;
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading Season ${season} transfers\u2026</div>`;
    fetchTransfers(season, (data) => {
      if (!data) {
        container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load transfers.</div>`;
        return;
      }
      const recColor = (v) => {
        if (v >= 18) return "#6cc040";
        if (v >= 15) return "#c8e0b4";
        if (v >= 12) return "#fbbf24";
        return "#9ca3af";
      };
      const recDisplay = (v) => (v / 3.38).toFixed(2);
      const buildSection = (rows, clubLabel) => {
        const enriched = rows.map((r, i) => ({
          ...r,
          _sortVals: [i + 1, r.name, r.clubName, r.rec, r.price]
        }));
        const buildRowsHtml = (data2) => data2.map((r, i) => {
          const recCell = r.isRetired ? `<td class="tsa-tr-rec" style="color:#5a7a48;font-style:italic">Ret</td>` : `<td class="tsa-tr-rec" style="color:${recColor(r.rec)}">${recDisplay(r.rec)}</td>`;
          return `<tr class="${r.isMe ? "tsa-stats-me" : ""}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        ${recCell}
                        <td class="tsa-stats-club"><a href="/club/${r.clubId}/" target="_blank" style="color:${r.isMe ? "#8fdc60" : "#6a9a58"};text-decoration:none">${r.clubName}</a></td>
                        <td class="tsa-stats-val">${r.price.toFixed(1)}</td>
                    </tr>`;
        }).join("");
        return { enriched, buildRowsHtml, headerRows: [[
          { label: "#", sortIndex: 0 },
          { label: "Player", sortIndex: 1, style: "text-align:left" },
          { label: "Rec", sortIndex: 3, style: "text-align:center" },
          { label: clubLabel, sortIndex: 2, style: "text-align:left" },
          { label: "Price (M)", sortIndex: 4, className: "tsa-stats-val", dataLabel: "Price" }
        ]] };
      };
      const bought = buildSection(data.bought, "Buyer");
      const sold = buildSection(data.sold, "Seller");
      const teamMap = {};
      const ensureClub = (r) => {
        if (!teamMap[r.clubId]) teamMap[r.clubId] = {
          clubId: r.clubId,
          clubName: r.clubName,
          isMe: r.isMe,
          bCount: 0,
          bTotal: 0,
          sCount: 0,
          sTotal: 0
        };
      };
      data.bought.forEach((r) => {
        ensureClub(r);
        teamMap[r.clubId].bCount++;
        teamMap[r.clubId].bTotal += r.price;
      });
      data.sold.forEach((r) => {
        ensureClub(r);
        teamMap[r.clubId].sCount++;
        teamMap[r.clubId].sTotal += r.price;
      });
      const teamGroups = Object.values(teamMap).sort((a, b) => b.sTotal - b.bTotal - (a.sTotal - a.bTotal));
      const teamEnriched = teamGroups.map((g, i) => ({
        ...g,
        _sortVals: [i + 1, g.clubName, g.bCount, g.bTotal, g.sCount, g.sTotal, g.sTotal - g.bTotal]
      }));
      const buildTeamRowsHtml = (rows) => rows.map((g, i) => {
        const bal2 = g.sTotal - g.bTotal;
        const balCol = bal2 > 0 ? "#6cc040" : bal2 < 0 ? "#ef4444" : "#c8e0b4";
        return `<tr class="${g.isMe ? "tsa-stats-me" : ""}">
                    <td class="tsa-stats-rank">${i + 1}</td>
                    <td class="tsa-stats-name"><a href="/club/${g.clubId}/" target="_blank" style="color:${g.isMe ? "#8fdc60" : "#6a9a58"};text-decoration:none">${g.clubName}</a></td>
                    <td class="tsa-stats-val">${g.bCount}</td>
                    <td class="tsa-stats-val">${g.bTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val">${g.sCount}</td>
                    <td class="tsa-stats-val">${g.sTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val" style="color:${balCol};font-weight:700">${bal2 >= 0 ? "+" : ""}${bal2.toFixed(1)}</td>
                </tr>`;
      }).join("");
      const teamData = {
        enriched: teamEnriched,
        buildRowsHtml: buildTeamRowsHtml,
        headerRows: [
          [
            { label: "#", sortIndex: 0, rowspan: 2 },
            { label: "Club", sortIndex: 1, style: "text-align:left", rowspan: 2 },
            { label: "\u{1F4B0} Bought", colspan: 2, style: "text-align:center;border-bottom:1px solid rgba(108,192,64,0.2);color:#6cc040" },
            { label: "\u{1F4B8} Sold", colspan: 2, style: "text-align:center;border-bottom:1px solid rgba(108,192,64,0.2);color:#6cc040" },
            { label: "Bal", sortIndex: 6, className: "tsa-stats-val", rowspan: 2 }
          ],
          [
            { label: "Pl", sortIndex: 2, className: "tsa-stats-val" },
            { label: "Total", sortIndex: 3, className: "tsa-stats-val" },
            { label: "Pl", sortIndex: 4, className: "tsa-stats-val" },
            { label: "Total", sortIndex: 5, className: "tsa-stats-val" }
          ]
        ]
      };
      const bal = parseFloat((data.totals.balance || "").replace(/,/g, ""));
      const balColor = isNaN(bal) ? "#c8e0b4" : bal >= 0 ? "#6cc040" : "#ef4444";
      const totalsHtml = data.totals.bought ? `
                <div class="tsa-tr-totals">
                    <span>Bought: <strong style="color:#c8e0b4">${data.totals.bought}M</strong></span>
                    <span>Sold: <strong style="color:#c8e0b4">${data.totals.sold}M</strong></span>
                    <span>Balance: <strong style="color:${balColor}">${data.totals.balance}M</strong></span>
                </div>` : "";
      container.innerHTML = `
                <div class="tsa-stats-bar tsa-stats-bar-mode">
                    <div class="tsa-stat-mode-btns">
                        ${buttonHtml5({ cls: "tsa-stat-mode-btn", active: s.transfersView === "bought", slot: `\u{1F4B0} Bought <span class="tsa-tr-count">${data.bought.length}</span>` })}
                        ${buttonHtml5({ cls: "tsa-stat-mode-btn", active: s.transfersView === "sold", slot: `\u{1F4B8} Sold <span class="tsa-tr-count">${data.sold.length}</span>` })}
                        ${buttonHtml5({ cls: "tsa-stat-mode-btn", active: s.transfersView === "teams", slot: "\u{1F3DF} Teams" })}
                    </div>
                </div>
                <div id="tsa-tr-bought-wrap" style="display:${s.transfersView === "bought" ? "" : "none"}"></div>
                <div id="tsa-tr-sold-wrap" style="display:${s.transfersView === "sold" ? "" : "none"}"></div>
                <div id="tsa-tr-teams-wrap" style="display:${s.transfersView === "teams" ? "" : "none"}">
                    <div id="tsa-tr-teams-inner"></div>
                </div>
                ${totalsHtml}
            `;
      const transferViewButtons = container.querySelectorAll(".tsa-stat-mode-btn");
      if (transferViewButtons[0]) transferViewButtons[0].dataset.tv = "bought";
      if (transferViewButtons[1]) transferViewButtons[1].dataset.tv = "sold";
      if (transferViewButtons[2]) transferViewButtons[2].dataset.tv = "teams";
      const allWraps = {
        bought: document.getElementById("tsa-tr-bought-wrap"),
        sold: document.getElementById("tsa-tr-sold-wrap"),
        teams: document.getElementById("tsa-tr-teams-wrap")
      };
      container.querySelectorAll(".tsa-stat-mode-btn[data-tv]").forEach((btn) => {
        btn.addEventListener("click", () => {
          s.transfersView = btn.dataset.tv;
          container.querySelectorAll(".tsa-stat-mode-btn[data-tv]").forEach((b) => b.classList.toggle("tsa-stat-btn-active", b.dataset.tv === s.transfersView));
          Object.entries(allWraps).forEach(([k, el]) => {
            if (el) el.style.display = k === s.transfersView ? "" : "none";
          });
        });
      });
      TmLeagueTable.mountSortable(allWraps.bought, {
        headerRows: bought.headerRows,
        getRows: () => bought.enriched,
        renderRows: bought.buildRowsHtml
      });
      TmLeagueTable.mountSortable(allWraps.sold, {
        headerRows: sold.headerRows,
        getRows: () => sold.enriched,
        renderRows: sold.buildRowsHtml
      });
      TmLeagueTable.mountSortable(document.getElementById("tsa-tr-teams-inner"), {
        headerRows: teamData.headerRows,
        getRows: () => teamData.enriched,
        renderRows: teamData.buildRowsHtml
      });
    });
  };
  var TmLeagueStats = {
    CLUB_STAT_COLS,
    parsePlayerStats,
    fetchPlayerStats,
    parseClubStats,
    fetchClubStats,
    parseTransfers,
    fetchTransfers,
    renderPlayerStatsTab,
    renderTransfersTab
  };

  // src/components/league/tm-league-totr.js
  if (!document.getElementById("tsa-league-totr-style")) {
    const _s = document.createElement("style");
    _s.id = "tsa-league-totr-style";
    _s.textContent = `
            .totr-nav {
                display: flex; align-items: center; justify-content: space-between;
                padding: 6px 12px; border-bottom: 1px solid rgba(61,104,40,0.3);
            }
            .totr-round-label { font-size: 12px; font-weight: 700; color: #c8e0b4; letter-spacing: 0.3px; }
            .totr-pitch {
                position: relative;
                background: linear-gradient(180deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid #4a9030; overflow: hidden;
            }
            .totr-pitch-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
            .totr-pitch-grid {
                position: relative; z-index: 1; display: grid;
                grid-template-columns: repeat(5, 20%);
                grid-template-rows: repeat(9, 11.11%);
                width: 100%; aspect-ratio: 68 / 75;
            }
            .totr-gk-row { position: absolute; bottom: 3%; left: 0; width: 100%; z-index: 2; }
            .totr-gk-cell { position: absolute; transform: translateX(-50%); bottom: 0; display: flex; flex-direction: column; align-items: center; }
            .totr-gk-info { display: flex; flex-direction: column; align-items: center; margin-bottom: 4px; pointer-events: auto; }
            .totr-gk-face {
                width: 95%; max-width: 68px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                border: 2px solid rgba(255,255,255,0.65);
                box-shadow: 0 2px 8px rgba(0,0,0,0.6); background: #1c3410;
            }
            .totr-gk-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .totr-pitch-cell { position: relative; overflow: visible; }
            .totr-pitch-face {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 95%; max-width: 68px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                border: 2px solid rgba(255,255,255,0.65);
                box-shadow: 0 2px 8px rgba(0,0,0,0.6); z-index: 2; background: #1c3410;
            }
            .totr-pitch-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .totr-pitch-info {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, 0); margin-top: 42%;
                display: flex; flex-direction: column; align-items: center;
                z-index: 3; pointer-events: none;
            }
            .totr-pitch-label {
                font-size: 9px; color: #fff; pointer-events: auto;
                text-shadow: 0 1px 3px rgba(0,0,0,0.95);
                white-space: nowrap; text-align: center;
                font-weight: 700; line-height: 1.2; text-decoration: none;
            }
            .totr-pitch-label:hover { color: #c8ffa0; }
            .totr-pitch-club {
                font-size: 8px; color: rgba(200,255,160,0.65); pointer-events: auto;
                text-shadow: 0 1px 2px rgba(0,0,0,0.9);
                white-space: nowrap; text-align: center;
                font-weight: 500; line-height: 1.2; text-decoration: none;
            }
            .totr-pitch-club:hover { color: #c8ffa0; }
            .totr-pitch-rating { font-size: 9px; font-weight: 700; padding: 0 3px; border-radius: 3px; background: rgba(0,0,0,0.45); line-height: 1.3; }
            .totr-pitch-events { display: flex; gap: 1px; font-size: 8px; justify-content: center; }
        `;
    document.head.appendChild(_s);
  }
  var TOTR_THRESHOLDS = [5.5, 6, 6.5, 7, 7.5, 8, 8.5];
  var parseTOTRHtml = (htmlText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const rounds = [...doc.querySelectorAll("#date_sel option")].map((opt) => ({
      value: opt.value,
      text: opt.textContent.trim(),
      selected: opt.selected
    }));
    const lines = [...doc.querySelectorAll(".field_line")].map((line) => {
      const lineName = [...line.classList].find((c) => c !== "field_line") || "";
      const players = [...line.querySelectorAll(".player")].map((p) => {
        const playerLink = p.querySelector("a[player_link]");
        const ratingEl = p.querySelector('span[tooltip="Rating"]');
        const goals = p.querySelectorAll('img[src*="ball.gif"]').length;
        const clubLink = p.querySelector("a[club_link]");
        const photoImg = p.querySelector('div[style*="100px"] img');
        return {
          playerId: (playerLink == null ? void 0 : playerLink.getAttribute("player_link")) || "",
          name: (playerLink == null ? void 0 : playerLink.textContent.trim()) || "",
          playerHref: (playerLink == null ? void 0 : playerLink.getAttribute("href")) || "",
          photo: (photoImg == null ? void 0 : photoImg.getAttribute("src")) || "",
          rating: parseFloat(ratingEl == null ? void 0 : ratingEl.textContent) || 0,
          goals,
          clubName: (clubLink == null ? void 0 : clubLink.textContent.trim()) || "",
          clubId: (clubLink == null ? void 0 : clubLink.getAttribute("club_link")) || ""
        };
      });
      return { lineName, players };
    });
    return { rounds, lines };
  };
  var renderTOTR = (data) => {
    var _a, _b;
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-totr-content");
    if (!container) return;
    const currentIdx = data.rounds.findIndex((r) => r.value === s.totrCurrentDate);
    const canPrev = currentIdx > 0;
    const canNext = currentIdx < data.rounds.length - 1;
    const currentRound = data.rounds[currentIdx] || {};
    const navHtml = `<div class="totr-nav">
            ${TmButton.button({ id: "totr-prev", cls: "text-lg px-3 py-0", label: "\u2190", color: "secondary", size: "xs", type: "button", disabled: !canPrev }).outerHTML}
            <span class="totr-round-label">${currentRound.text || "\u2014"}</span>
            ${TmButton.button({ id: "totr-next", cls: "text-lg px-3 py-0", label: "\u2192", color: "secondary", size: "xs", type: "button", disabled: !canNext }).outerHTML}
        </div>`;
    const lw = 0.4, clr = "rgba(255,255,255,0.22)", clr2 = "rgba(255,255,255,0.3)";
    const pitchSVG = `<svg class="totr-pitch-lines" viewBox="0 0 100 110" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="110" fill="none" stroke="${clr}" stroke-width="0.5"/>
            <line x1="0" y1="55" x2="100" y2="55" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="55" r="9.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="55" r="1.2" fill="${clr2}"/>
            <rect x="20.5" y="0" width="59" height="17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="36.5" y="0" width="27" height="6" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="11.7" r="1.2" fill="${clr2}"/>
            <path d="M 40 17.5 A 9.5 9.5 0 0 0 60 17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="20.5" y="92.5" width="59" height="17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="36.5" y="104" width="27" height="6" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="98.3" r="1.2" fill="${clr2}"/>
            <path d="M 40 92.5 A 9.5 9.5 0 0 1 60 92.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 1.5 A 1.5 1.5 0 0 1 1.5 0" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 98.5 0 A 1.5 1.5 0 0 1 100 1.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 108.5 A 1.5 1.5 0 0 0 1.5 110" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 98.5 110 A 1.5 1.5 0 0 0 100 108.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
        </svg>`;
    const lineRowMap = { forwards: 2, midfield: 5, defense: 8 };
    const spreadCols = (n) => {
      if (n === 1) return [3];
      if (n === 2) return [2, 4];
      if (n === 3) return [1, 3, 5];
      if (n === 4) return [1, 2, 4, 5];
      return [1, 2, 3, 4, 5];
    };
    const byLine = {};
    data.lines.forEach((l) => {
      byLine[l.lineName] = l.players;
    });
    const cellMap = {};
    Object.entries(lineRowMap).forEach(([lineName, row]) => {
      const players = byLine[lineName] || [];
      const cols = spreadCols(players.length);
      players.forEach((p, i) => {
        const ratingColor2 = s.getColor(p.rating, TOTR_THRESHOLDS);
        const goalsHtml = p.goals > 0 ? `<div class="totr-pitch-events">${"\u26BD".repeat(Math.min(p.goals, 4))}${p.goals > 4 ? `\xD7${p.goals}` : ""}</div>` : "";
        cellMap[`${row}-${cols[i]}`] = `<div class="totr-pitch-face"><img src="${p.photo}" alt="" onerror="this.style.opacity=0"></div><div class="totr-pitch-info"><a href="${p.playerHref}" class="totr-pitch-label">${p.name.split(" ").slice(-1)[0]}</a><div class="totr-pitch-rating" style="color:${ratingColor2}">${p.rating.toFixed(1)}</div>` + (p.clubName ? `<a href="/club/${p.clubId}/" class="totr-pitch-club">${p.clubName}</a>` : "") + goalsHtml + `</div>`;
      });
    });
    let gridHTML = "";
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 5; c++) {
        gridHTML += `<div class="totr-pitch-cell">${cellMap[`${r}-${c}`] || ""}</div>`;
      }
    }
    const gkPlayers = byLine["goalkeeper"] || [];
    const gkCols = spreadCols(gkPlayers.length);
    let gkOverlay = "";
    gkPlayers.forEach((p, i) => {
      const ratingColor2 = s.getColor(p.rating, TOTR_THRESHOLDS);
      const goalsHtml = p.goals > 0 ? `<div class="totr-pitch-events">${"\u26BD".repeat(Math.min(p.goals, 4))}${p.goals > 4 ? `\xD7${p.goals}` : ""}</div>` : "";
      const colPct = (gkCols[i] - 1) * 20 + 10;
      gkOverlay += `<div class="totr-gk-cell" style="left:${colPct}%"><div class="totr-gk-info"><a href="${p.playerHref}" class="totr-pitch-label">${p.name.split(" ").slice(-1)[0]}</a><div class="totr-pitch-rating" style="color:${ratingColor2}">${p.rating.toFixed(1)}</div>` + (p.clubName ? `<a href="/club/${p.clubId}/" class="totr-pitch-club">${p.clubName}</a>` : "") + goalsHtml + `</div><div class="totr-gk-face"><img src="${p.photo}" alt="" onerror="this.style.opacity=0"></div></div>`;
    });
    container.innerHTML = navHtml + `<div class="totr-pitch">${pitchSVG}<div class="totr-pitch-grid">${gridHTML}</div>` + (gkOverlay ? `<div class="totr-gk-row">${gkOverlay}</div>` : "") + `</div>`;
    (_a = document.getElementById("totr-prev")) == null ? void 0 : _a.addEventListener("click", () => {
      if (currentIdx > 0) fetchAndRenderTOTR(data.rounds[currentIdx - 1].value);
    });
    (_b = document.getElementById("totr-next")) == null ? void 0 : _b.addEventListener("click", () => {
      if (currentIdx < data.rounds.length - 1) fetchAndRenderTOTR(data.rounds[currentIdx + 1].value);
    });
  };
  var fetchAndRenderTOTR = (date) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById("tsa-totr-content");
    if (!container) return;
    if (s.totrCache[date]) {
      s.totrCurrentDate = date;
      renderTOTR(s.totrCache[date]);
      return;
    }
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading...</div>';
    const url = `/league/team-of-the-round/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/${date}/`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) return;
      if (this.status !== 200) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#f87171;">Failed to load</div>';
        return;
      }
      const data = parseTOTRHtml(this.responseText);
      s.totrCache[date] = data;
      s.totrCurrentDate = date;
      renderTOTR(data);
    };
    xhr.send();
  };
  var TmLeagueTOTR = { parseTOTRHtml, renderTOTR, fetchAndRenderTOTR };

  // src/components/league/tm-league-panel.js
  if (!document.getElementById("tsa-league-panel-style")) {
    const _s = document.createElement("style");
    _s.id = "tsa-league-panel-style";
    _s.textContent = `
            /* \u2500\u2500 Panel header league name + season \u2500\u2500 */
            .tsa-panel-league-name {
                font-size: 12px; font-weight: 700; color: #d2e8bf;
                letter-spacing: 0.3px; text-transform: none;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 260px;
            }
            .tsa-season-label {
                font-size: 11px; color: #7faa62; font-weight: 700;
                white-space: nowrap; flex-shrink: 0;
            }
            /* \u2500\u2500 Season autocomplete picker \u2500\u2500 */
            .tsa-ssnpick { position: relative; flex-shrink: 0; }
            .tsa-ssnpick-ac {
                position: absolute;
                left: 0;
                top: calc(100% + 5px);
                width: 110px;
                z-index: 9999;
            }
            .tsa-ssnpick-ac[hidden] { display: none !important; }
            #tsa-ssn-prev,
            #tsa-ssn-next {
                width: 20px; height: 20px; padding: 0 !important;
                min-width: 20px; line-height: 1; font-size: 14px;
                flex-shrink: 0;
            }
        `;
    document.head.appendChild(_s);
  }
  var createAutocomplete2 = (opts) => TmUI.autocomplete({
    tone: "overlay",
    density: "compact",
    size: "md",
    grow: false,
    ...opts
  });
  var injectStandingsPanel = () => {
    var _a, _b, _c, _d;
    if (document.getElementById("tsa-standings-panel")) return;
    const ctx = window.TmLeagueCtx;
    const nativeTable = document.getElementById("overall_table");
    if (nativeTable) {
      const wrapper = nativeTable.closest(".box") || nativeTable.parentElement;
      if (wrapper) wrapper.style.display = "none";
    }
    let lCountry = ctx.panelCountry || ctx.leagueCountry;
    let lDivision = ctx.panelDivision || ctx.leagueDivision;
    let lGroup = ctx.panelGroup || ctx.leagueGroup || "1";
    const navLink = document.querySelector('.column1 .content_menu a[href*="/league/"], .column1_a .content_menu a[href*="/league/"]');
    if (navLink) {
      const parts = navLink.getAttribute("href").split("/").filter(Boolean);
      if (parts.length >= 3) {
        lCountry = parts[1];
        lDivision = parts[2];
        lGroup = parts[3] || "1";
      }
    }
    const leagueAnchor = document.querySelector('a[league_link][href*="/league/"].normal.large, a[league_link][href*="/league/"]');
    ctx.setPanelLeague(lCountry, lDivision, lGroup, (leagueAnchor == null ? void 0 : leagueAnchor.textContent.trim()) || null);
    const currentSeason3 = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    const panel = document.createElement("div");
    panel.className = "tmu-card";
    panel.id = "tsa-standings-panel";
    const prevSeasonBtn = TmUI.button({
      id: "tsa-ssn-prev",
      label: "\u2039",
      color: "secondary",
      size: "xs",
      disabled: currentSeason3 <= 1
    }).outerHTML;
    const seasonChipBtn = TmUI.button({
      id: "tsa-ssnpick-chip",
      label: `Season ${currentSeason3}`,
      color: "secondary",
      size: "xs",
      shape: "full"
    }).outerHTML;
    const nextSeasonBtn = TmUI.button({
      id: "tsa-ssn-next",
      label: "\u203A",
      color: "secondary",
      size: "xs",
      disabled: true
    }).outerHTML;
    const changeLeagueBtn = TmUI.button({
      id: "tsa-change-league-btn",
      label: "Change League",
      color: "secondary",
      size: "xs"
    }).outerHTML;
    panel.innerHTML = `
            <div class="tmu-card-head">
                <div style="display:flex;align-items:center;gap:6px;min-width:0">
                    <span id="tsa-panel-league-name" class="tsa-panel-league-name">${ctx.panelLeagueName || "League"}</span>
                    ${lDivision ? `<span class="tsa-season-label">(${lDivision}.${lGroup})</span>` : ""}
                    ${currentSeason3 ? `<div class="tsa-ssnpick" id="tsa-ssnpick">
                        <div style="display:flex;align-items:center;gap:2px">
                            ${prevSeasonBtn}
                            ${seasonChipBtn}
                            ${nextSeasonBtn}
                        </div>
                        <div class="tsa-ssnpick-ac" id="tsa-ssnpick-ac" hidden></div>
                    </div>` : ""}
                </div>
                ${changeLeagueBtn}
            </div>
            <div id="tsa-panel-tabs"></div>
            <div id="tsa-standings-content" class="tsa-standings-wrap"></div>
            <div id="tsa-fixtures-content" style="display:none"></div>
            <div id="tsa-totr-content" style="display:none"></div>
            <div id="tsa-stats-content" style="display:none"></div>
            <div id="tsa-transfers-content" style="display:none"></div>
        `;
    (_a = panel.querySelector("#tsa-change-league-btn")) == null ? void 0 : _a.addEventListener("click", TmLeaguePicker.openLeagueDialog);
    const switchPanel = (which) => {
      document.getElementById("tsa-standings-content").style.display = which === "standings" ? "" : "none";
      document.getElementById("tsa-fixtures-content").style.display = which === "fixtures" ? "" : "none";
      document.getElementById("tsa-totr-content").style.display = which === "totr" ? "" : "none";
      document.getElementById("tsa-stats-content").style.display = which === "stats" ? "" : "none";
      document.getElementById("tsa-transfers-content").style.display = which === "transfers" ? "" : "none";
      if (which === "fixtures") {
        if (ctx.displayedSeason !== null && ctx.historyFixturesData) TmLeagueFixtures.renderHistoryFixturesTab(ctx.historyFixturesData);
        else if (ctx.displayedSeason !== null && !ctx.historyFixturesData) {
        } else if (ctx.fixturesCache) TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
      }
      if (which === "totr") {
        const date = ctx.totrCurrentDate || ctx.allRounds[ctx.currentRoundIdx] && ctx.allRounds[ctx.currentRoundIdx].date;
        if (date) TmLeagueTOTR.fetchAndRenderTOTR(date);
        else document.getElementById("tsa-totr-content").innerHTML = '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Waiting for fixtures data...</div>';
      }
      if (which === "stats") TmLeagueStats.renderPlayerStatsTab();
      if (which === "transfers") TmLeagueStats.renderTransfersTab();
    };
    (_b = panel.querySelector("#tsa-panel-tabs")) == null ? void 0 : _b.appendChild(TmUI.tabs({
      items: [
        { key: "standings", label: "Standings", icon: "\u{1F3C6}" },
        { key: "fixtures", label: "Fixtures", icon: "\u{1F4C5}" },
        { key: "totr", label: "Team of Round", icon: "\u2B50" },
        { key: "stats", label: "Statistics", icon: "\u{1F4CA}" },
        { key: "transfers", label: "Transfers", icon: "\u{1F504}" }
      ],
      active: "standings",
      color: "primary",
      stretch: true,
      cls: "tsa-panel-tabs",
      itemCls: "tsa-panel-tab",
      onChange: switchPanel
    }));
    const col2 = document.querySelector(".tmvu-league-main, .column2_a");
    if (col2) col2.insertBefore(panel, col2.firstChild);
    const nativeFeedEl = document.getElementById("feed");
    if (nativeFeedEl && col2) {
      const feedBox = nativeFeedEl.closest(".box") || nativeFeedEl.parentElement;
      const nodeToMove = feedBox && feedBox !== col2 ? feedBox : nativeFeedEl;
      col2.insertBefore(nodeToMove, panel.nextSibling);
    }
    const ssnChip = document.getElementById("tsa-ssnpick-chip");
    const ssnMount = document.getElementById("tsa-ssnpick-ac");
    if (ssnChip && ssnMount) {
      const seasons = Array.from({ length: currentSeason3 }, (_, i) => currentSeason3 - i);
      const ssnAc = createAutocomplete2({
        id: "tsa-ssnpick-input",
        placeholder: "Season #\u2026",
        autocomplete: "off",
        attrs: {
          inputmode: "numeric",
          "aria-label": "Season picker"
        }
      });
      ssnAc.id = "tsa-ssnpick-ac";
      ssnAc.classList.add("tsa-ssnpick-ac");
      ssnAc.hidden = true;
      ssnMount.replaceWith(ssnAc);
      const ssnInput = ssnAc.inputEl;
      const renderSeasonItems = (query = "") => {
        var _a2;
        const shown = (_a2 = ctx.displayedSeason) != null ? _a2 : currentSeason3;
        const q = String(query).trim();
        ssnAc.setItems(seasons.filter((s) => !q || String(s).includes(q)).map((s) => {
          const item = TmUI.autocompleteItem({
            label: `Season ${s}`,
            active: s === shown,
            onSelect: () => {
              closePop();
              navigate(s);
            }
          });
          item.dataset.season = String(s);
          return item;
        }));
      };
      const openPop = () => {
        ssnAc.hidden = false;
        ssnAc.setValue("");
        renderSeasonItems();
        ssnInput.focus();
        const active = ssnAc.dropEl.querySelector(".tmu-ac-item-active");
        if (active) active.scrollIntoView({ block: "nearest" });
      };
      const closePop = () => {
        ssnAc.hidden = true;
        ssnAc.hideDrop();
      };
      ssnChip.addEventListener("click", (e) => {
        e.stopPropagation();
        ssnAc.hidden ? openPop() : closePop();
      });
      ssnInput.addEventListener("focus", () => renderSeasonItems(ssnInput.value));
      ssnInput.addEventListener("input", () => renderSeasonItems(ssnInput.value));
      ssnInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const visible = [...ssnAc.dropEl.querySelectorAll(".tmu-ac-item")];
          if (visible.length === 1) navigate(parseInt(visible[0].dataset.season, 10));
        }
        if (e.key === "Escape") closePop();
      });
      ssnInput.addEventListener("blur", () => setTimeout(() => closePop(), 150));
      const updateChevrons = () => {
        var _a2;
        const shown = (_a2 = ctx.displayedSeason) != null ? _a2 : currentSeason3;
        const prevBtn = document.getElementById("tsa-ssn-prev");
        const nextBtn = document.getElementById("tsa-ssn-next");
        if (prevBtn) prevBtn.disabled = shown <= 1;
        if (nextBtn) nextBtn.disabled = shown >= currentSeason3;
      };
      const navigate = (s) => {
        const chip = document.getElementById("tsa-ssnpick-chip");
        if (chip) chip.textContent = `Season ${s}`;
        if (s === currentSeason3) {
          ctx.resetToLive();
          TmLeagueStandings.buildStandingsFromDOM();
          TmLeagueStandings.renderLeagueTable();
          const fixCont = document.getElementById("tsa-fixtures-content");
          if (fixCont && fixCont.style.display !== "none" && ctx.fixturesCache) TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
          const statsCont = document.getElementById("tsa-stats-content");
          if (statsCont && statsCont.style.display !== "none") TmLeagueStats.renderPlayerStatsTab();
          const trCont = document.getElementById("tsa-transfers-content");
          if (trCont && trCont.style.display !== "none") TmLeagueStats.renderTransfersTab();
        } else {
          ctx.setDisplayedSeason(s);
          TmLeagueStandings.fetchHistoryStandings(s);
          TmLeagueFixtures.fetchHistoryFixtures(s);
          const statsCont = document.getElementById("tsa-stats-content");
          if (statsCont && statsCont.style.display !== "none") TmLeagueStats.renderPlayerStatsTab();
          const trCont = document.getElementById("tsa-transfers-content");
          if (trCont && trCont.style.display !== "none") TmLeagueStats.renderTransfersTab();
        }
        updateChevrons();
        if (!ssnAc.hidden) renderSeasonItems(ssnInput.value);
      };
      (_c = document.getElementById("tsa-ssn-prev")) == null ? void 0 : _c.addEventListener("click", (e) => {
        var _a2;
        e.stopPropagation();
        const shown = (_a2 = ctx.displayedSeason) != null ? _a2 : currentSeason3;
        if (shown > 1) navigate(shown - 1);
      });
      (_d = document.getElementById("tsa-ssn-next")) == null ? void 0 : _d.addEventListener("click", (e) => {
        var _a2;
        e.stopPropagation();
        const shown = (_a2 = ctx.displayedSeason) != null ? _a2 : currentSeason3;
        if (shown < currentSeason3) navigate(shown + 1);
      });
      document.addEventListener("click", (e) => {
        if (!document.getElementById("tsa-ssnpick").contains(e.target)) closePop();
      });
    }
  };
  var TmLeaguePanel = { injectStandingsPanel };

  // src/components/shared/tm-match-hover-card.js
  var state = {
    cache: {},
    tooltipEl: null,
    showTimer: null,
    hideTimer: null
  };
  var currentSeason2 = () => typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
  var injectStyles3 = () => {
    TmMatchTooltip.ensureStyles();
  };
  var buildLegacyTooltipContent = (data) => TmMatchTooltip.buildLegacyTooltipContent(data);
  var buildRichTooltip = (matchData) => TmMatchTooltip.buildRichTooltip(matchData);
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
    const isCurrentSeason = Number(season) === currentSeason2();
    state.tooltipEl = document.createElement("div");
    state.tooltipEl.className = "rnd-h2h-tooltip";
    el.appendChild(state.tooltipEl);
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
      TmMatchService.fetchMatchCached(matchId, { dbSync: false }).then((data) => {
        var _a;
        if (!data) {
          onFail();
          return;
        }
        data._rich = true;
        state.cache[matchId] = data;
        if (state.tooltipEl && ((_a = state.tooltipEl.closest("[data-mid]")) == null ? void 0 : _a.dataset.mid) === String(matchId)) {
          state.tooltipEl.innerHTML = buildRichTooltip(data);
        }
      }).catch(onFail);
      return;
    }
    TmMatchService.fetchMatchTooltip(matchId, season).then((data) => {
      var _a;
      if (!data) {
        onFail();
        return;
      }
      state.cache[matchId] = data;
      if (state.tooltipEl && ((_a = state.tooltipEl.closest("[data-mid]")) == null ? void 0 : _a.dataset.mid) === String(matchId)) {
        state.tooltipEl.innerHTML = buildLegacyTooltipContent(data);
      }
    }).catch(onFail);
  };
  var bind = (rows, { season } = {}) => {
    injectStyles3();
    rows.forEach((row) => {
      if (row.dataset.hoverBound === "1") return;
      row.dataset.hoverBound = "1";
      row.addEventListener("mouseenter", () => {
        clearTimeout(state.hideTimer);
        const matchId = row.dataset.mid;
        if (!matchId) return;
        state.showTimer = setTimeout(() => show(row, matchId, season != null ? season : currentSeason2()), 300);
      });
      row.addEventListener("mouseleave", () => {
        clearTimeout(state.showTimer);
        state.hideTimer = setTimeout(() => removeTooltip(), 100);
      });
    });
  };
  var TmMatchHoverCard = {
    injectStyles: injectStyles3,
    show,
    bind,
    removeTooltip,
    buildLegacyTooltipContent,
    buildRichTooltip
  };

  // src/components/shared/tm-match-ratings.js
  var squadCache = /* @__PURE__ */ new Map();
  var tooltipCache = /* @__PURE__ */ new Map();
  var matchCache = /* @__PURE__ */ new Map();
  var fetchSquad = (clubId) => {
    if (!squadCache.has(clubId)) {
      squadCache.set(clubId, TmClubService.fetchSquadRaw(clubId).then((data) => {
        if (!(data == null ? void 0 : data.post)) return { post: {} };
        if (Array.isArray(data.post)) {
          const postObj = {};
          data.post.forEach((player) => {
            postObj[String(player.id)] = player;
          });
          data.post = postObj;
        }
        return data;
      }).catch(() => ({ post: {} })));
    }
    return squadCache.get(clubId);
  };
  var getPlayerDataFromSquad = async (playerId, squadPost, matchPos) => {
    var _a, _b, _c, _d;
    let player = (_a = squadPost.post) == null ? void 0 : _a[String(playerId)];
    if (!player) {
      if (!tooltipCache.has(playerId)) {
        tooltipCache.set(playerId, TmPlayerService.fetchPlayerTooltip(playerId).then((response) => {
          var _a2;
          return (_a2 = response == null ? void 0 : response.player) != null ? _a2 : null;
        }).catch(() => null));
      }
      player = await tooltipCache.get(playerId);
    }
    if (!player) return { R5: 0 };
    const posData = (_b = player.positions) == null ? void 0 : _b.find((pos) => {
      var _a2;
      return ((_a2 = pos.position) == null ? void 0 : _a2.toLowerCase()) === matchPos;
    });
    const r5 = Number((_d = (_c = posData == null ? void 0 : posData.r5) != null ? _c : player.r5) != null ? _d : 0);
    return { R5: r5 };
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
      matchCache.set(key, TmMatchService.fetchMatchCached(key, { dbSync: false }).then(async (data) => {
        var _a, _b, _c, _d;
        if (!((_b = (_a = data == null ? void 0 : data.club) == null ? void 0 : _a.home) == null ? void 0 : _b.id) || !((_d = (_c = data == null ? void 0 : data.club) == null ? void 0 : _c.away) == null ? void 0 : _d.id)) return null;
        const homeId = String(data.club.home.id);
        const awayId = String(data.club.away.id);
        const [homeSquad, awaySquad] = await Promise.all([fetchSquad(homeId), fetchSquad(awayId)]);
        const [homeResult, awayResult] = await Promise.all([
          computeTeamStats(Object.keys(data.lineup.home || {}), data.lineup.home || {}, homeSquad),
          computeTeamStats(Object.keys(data.lineup.away || {}), data.lineup.away || {}, awaySquad)
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
  var STYLE_ID4 = "tmvu-match-row-style";
  var escapeHtml4 = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var injectStyles4 = () => {
    if (document.getElementById(STYLE_ID4)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID4;
    style.textContent = `
        .tmvu-match-list {
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(61,104,40,0.18);
            border-radius: 10px;
            overflow: hidden;
        }

        .tmvu-match-row {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            column-gap: 10px;
            padding: 9px 10px;
            border-bottom: 1px solid rgba(42,74,28,0.3);
            cursor: pointer;
            transition: background 0.12s;
            font-size: 12px;
        }

        .tmvu-match-row:last-child {
            border-bottom: none;
        }

        .tmvu-match-row:hover {
            background: #243d18 !important;
        }

        .tmvu-match-even {
            background: #1c3410;
        }

        .tmvu-match-odd {
            background: #162e0e;
        }

        .tmvu-match-highlight {
            outline: 1px solid rgba(108,192,64,0.25);
            outline-offset: -1px;
        }

        .tmvu-match-team {
            min-width: 0;
            display: flex;
            align-items: center;
            color: #c8e0b4;
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
            gap: 5px;
            min-width: 0;
            max-width: 100%;
        }

        .tmvu-match-team-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .tmvu-match-team-name a {
            color: #c8e0b4;
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
            font-size: 13px;
            font-weight: 700;
            line-height: 1.2;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
            color: #e0f0d0;
            text-decoration: none;
        }

        .tmvu-match-score:hover {
            background: rgba(255,255,255,0.06);
        }

        .tmvu-match-score-upcoming {
            color: #4a6a3a;
            font-weight: 400;
            font-size: 11px;
        }

        .tmvu-match-logo {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .tmvu-match-rating {
            width: auto;
            min-width: 0;
            font-size: 12px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: #90b878;
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
    const safeName = escapeHtml4((team == null ? void 0 : team.name) || "Unknown");
    const rating = `<span class="tmvu-match-rating tmvu-match-rating-${side}" data-role="${side}-rating">\u2014</span>`;
    const logo = showLogos && (team == null ? void 0 : team.id) ? `<img class="tmvu-match-logo" src="/pics/club_logos/${team.id}_25.png" onerror="this.style.visibility='hidden'" alt="">` : rating;
    const flag = (team == null ? void 0 : team.flagHtml) ? `<span class="tmvu-match-flag">${team.flagHtml}</span>` : "";
    const name = `<span class="tmvu-match-team-name"><a href="${(team == null ? void 0 : team.href) || "#"}">${safeName}</a></span>`;
    if (side === "home") return `${name}${flag}${logo}`;
    return `${logo}${flag}${name}`;
  };
  var render2 = ({
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
    const safeScore = escapeHtml4(scoreText || "\u2014");
    const scoreHtml = scoreHref ? `<a class="${scoreClass}" href="${scoreHref}">${safeScore}</a>` : `<span class="${scoreClass}">${safeScore}</span>`;
    return `
        <div class="tmvu-match-row ${index % 2 === 0 ? "tmvu-match-even" : "tmvu-match-odd"}${isHighlight ? " tmvu-match-highlight" : ""}"
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
  var enhance = (scope, { season } = {}) => {
    injectStyles4();
    const rows = Array.from(scope.querySelectorAll(".tmvu-match-row[data-mid]")).filter((row) => row.dataset.mid);
    rows.forEach((row) => {
      if (row.dataset.clickBound !== "1") {
        row.dataset.clickBound = "1";
        row.addEventListener("click", (event) => {
          if (event.target.closest("a")) return;
          const matchId = row.dataset.mid;
          if (matchId) window.location.href = `/matches/${matchId}/`;
        });
      }
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
    injectStyles: injectStyles4,
    render: render2,
    enhance
  };

  // src/components/shared/tm-fixture-round-cards.js
  var STYLE_ID5 = "tmvu-round-navigator-style";
  var htmlOf3 = (node) => node ? node.outerHTML : "";
  var navButtonHtml = ({ action = "", title = "", disabled = false, path }) => {
    const button = TmUI.button({
      slot: `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`,
      variant: "icon",
      color: "secondary",
      disabled,
      title,
      attrs: action ? { "data-action": action } : {}
    });
    return htmlOf3(button);
  };
  function injectStyles5() {
    if (document.getElementById(STYLE_ID5)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID5;
    style.textContent = `
        .tmvu-round-panel .tmu-card-head.rnd-nav {
            padding: 8px 14px;
        }

        .tmvu-round-panel {
            overflow: visible !important;
        }

        .tmvu-round-panel .tmvu-round-body,
        .tmvu-round-panel .tmvu-match-list {
            overflow: visible;
        }

        .tmvu-round-panel .tmvu-match-row {
            z-index: 0;
        }

        .tmvu-round-panel .tmvu-match-row:hover {
            z-index: 3;
        }

        .tmvu-round-panel .rnd-title {
            flex: 1;
            text-align: center;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn {
            width: 26px;
            height: 26px;
            min-width: 26px;
            font-size: 0;
            line-height: 0;
            border-radius: 4px;
            padding: 0;
            color: #a0c888;
            transition: color 0.15s;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn:disabled {
            opacity: 0.3;
            cursor: default;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn:not(:disabled):hover {
            color: #fff;
        }

        .tmvu-round-panel .tmvu-round-empty {
            text-align: center;
            padding: 12px;
            color: #5a7a48;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);
  }
  function buildRounds(fixtures) {
    const matches = [];
    Object.values(fixtures || {}).forEach((month) => {
      if (!(month == null ? void 0 : month.matches)) return;
      month.matches.forEach((match) => matches.push(match));
    });
    const byDate = {};
    matches.forEach((match) => {
      if (!(match == null ? void 0 : match.date)) return;
      (byDate[match.date] = byDate[match.date] || []).push(match);
    });
    return Object.keys(byDate).sort((left, right) => new Date(left) - new Date(right)).map((date, index) => ({
      roundNum: index + 1,
      date,
      matches: byDate[date]
    }));
  }
  function getCurrentIndex(rounds) {
    if (!rounds.length) return 0;
    let currentIndex = 0;
    for (let index = rounds.length - 1; index >= 0; index -= 1) {
      if (rounds[index].matches.some((match) => match.result)) {
        currentIndex = index;
        break;
      }
    }
    return currentIndex;
  }
  function renderNavigator(container, state2) {
    var _a, _b;
    const { rounds, currentIndex, titlePrefix, season, highlightClubId, upcomingLabel, onRoundChange } = state2;
    if (!rounds.length) {
      TmUI.render(container, `
            <div class="tmu-card tmvu-round-panel">
                <div class="tmu-card-head rnd-nav">
                    ${navButtonHtml({ disabled: true, path: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })}
                    <span class="rnd-title">${titlePrefix} \u2014</span>
                    ${navButtonHtml({ disabled: true, path: "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" })}
                </div>
                <div class="tmvu-round-empty">No rounds available</div>
            </div>
        `);
      return;
    }
    const round = rounds[currentIndex];
    const rowsHtml = `<div class="tmvu-match-list">${round.matches.map((match, index) => TmMatchRow.render({
      matchId: match.id,
      season,
      isPlayed: !!match.result,
      isHighlight: highlightClubId ? String(match.hometeam) === String(highlightClubId) || String(match.awayteam) === String(highlightClubId) : false,
      scoreText: match.result || upcomingLabel,
      scoreHref: match.id ? `/matches/${match.id}/` : "",
      home: {
        id: match.hometeam,
        name: match.hometeam_name,
        href: match.hometeam ? `/club/${match.hometeam}/` : "#"
      },
      away: {
        id: match.awayteam,
        name: match.awayteam_name,
        href: match.awayteam ? `/club/${match.awayteam}/` : "#"
      }
    }, { index, showLogos: false })).join("")}</div>`;
    TmUI.render(container, `
        <div class="tmu-card tmvu-round-panel">
            <div class="tmu-card-head rnd-nav">
                ${navButtonHtml({ action: "prev", disabled: currentIndex <= 0, title: "Previous round", path: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })}
                <span class="rnd-title">${titlePrefix} ${round.roundNum}</span>
                ${navButtonHtml({ action: "next", disabled: currentIndex >= rounds.length - 1, title: "Next round", path: "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" })}
            </div>
            <div class="tmvu-round-body">${rowsHtml}</div>
        </div>
    `);
    (_a = container.querySelector('[data-action="prev"]')) == null ? void 0 : _a.addEventListener("click", () => {
      if (state2.currentIndex <= 0) return;
      state2.currentIndex -= 1;
      renderNavigator(container, state2);
      onRoundChange == null ? void 0 : onRoundChange({ rounds: state2.rounds, currentIndex: state2.currentIndex, currentRound: state2.rounds[state2.currentIndex] });
    });
    (_b = container.querySelector('[data-action="next"]')) == null ? void 0 : _b.addEventListener("click", () => {
      if (state2.currentIndex >= state2.rounds.length - 1) return;
      state2.currentIndex += 1;
      renderNavigator(container, state2);
      onRoundChange == null ? void 0 : onRoundChange({ rounds: state2.rounds, currentIndex: state2.currentIndex, currentRound: state2.rounds[state2.currentIndex] });
    });
    TmMatchRow.enhance(container, { season });
  }
  function mount(container, { fixtures, season = null, highlightClubId = "", titlePrefix = "Round", upcomingLabel = "\u2014", initialIndex, onRoundChange } = {}) {
    if (!container) return null;
    injectStyles5();
    const rounds = buildRounds(fixtures);
    const currentIndex = Number.isInteger(initialIndex) ? Math.max(0, Math.min(initialIndex, Math.max(0, rounds.length - 1))) : getCurrentIndex(rounds);
    const state2 = {
      rounds,
      currentIndex,
      season,
      highlightClubId,
      titlePrefix,
      upcomingLabel,
      onRoundChange
    };
    container.__tmvuRoundNavigatorState = state2;
    renderNavigator(container, state2);
    onRoundChange == null ? void 0 : onRoundChange({ rounds: state2.rounds, currentIndex: state2.currentIndex, currentRound: state2.rounds[state2.currentIndex] || null });
    return container;
  }
  var TmFixtureRoundCards = { mount };

  // src/components/league/tm-league-skill-table.js
  var renderSkillTable = () => {
    const s = window.TmLeagueCtx;
    const { skillData, skillSortCol, skillSortAsc, REC_THRESHOLDS: REC_THRESHOLDS2, R5_THRESHOLDS: R5_THRESHOLDS3, AGE_THRESHOLDS: AGE_THRESHOLDS2, getColor: getColor3 } = s;
    const arrow = (col) => col !== skillSortCol ? "" : skillSortAsc ? " \u25B2" : " \u25BC";
    const active = (col) => col === skillSortCol ? " tsa-active" : "";
    let html = `<table class="tsa-table">
            <tr>
                <th class="tsa-left${active("#")}">#</th>
                <th class="tsa-left${active("name")}" data-sort-skill="name">Club${arrow("name")}</th>
                <th class="${active("REC")}" data-sort-skill="REC">REC${arrow("REC")}</th>
                <th class="${active("R5")}" data-sort-skill="R5">R5${arrow("R5")}</th>
                <th class="${active("Age")}" data-sort-skill="Age">Age${arrow("Age")}</th>
            </tr>`;
    skillData.forEach((row, idx) => {
      html += `<tr class="${idx % 2 === 0 ? "tsa-even" : "tsa-odd"}">
                <td class="tsa-left tsa-rank">${idx + 1}</td>
                <td class="tsa-left tsa-club">${row.name}</td>
                <td style="color:${getColor3(row.REC, REC_THRESHOLDS2)};font-weight:700">${row.REC.toFixed(2)}</td>
                <td style="color:${getColor3(row.R5, R5_THRESHOLDS3)};font-weight:700">${row.R5.toFixed(2)}</td>
                <td style="color:${getColor3(row.Age, AGE_THRESHOLDS2)};font-weight:700">${row.Age.toFixed(1)}</td>
            </tr>`;
    });
    html += "</table>";
    $("#tsa-content").html(html);
    $("[data-sort-skill]").on("click", function() {
      const col = $(this).attr("data-sort-skill");
      if (col === s.skillSortCol) s.skillSortAsc = !s.skillSortAsc;
      else {
        s.skillSortCol = col;
        s.skillSortAsc = col === "name";
      }
      s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
      renderSkillTable();
    });
  };
  var showSkill = () => {
    const s = window.TmLeagueCtx;
    s.skillData = [];
    console.log("%c[Squad Analysis] \u2550\u2550\u2550 Per-Club Player Ratings \u2550\u2550\u2550", "font-weight:bold;color:#6cc040");
    s.clubMap.forEach((name, id) => {
      if (!s.clubDatas.has(id)) {
        s.skillData.push({ name, REC: 0, R5: 0, Age: 0 });
        return;
      }
      const entries = s.clubDatas.get(id);
      let avgREC = 0, avgR5 = 0, avgAge = 0;
      entries.forEach((cd) => {
        avgREC += cd.REC / 11;
        avgR5 += cd.R5 / 11;
        avgAge += cd.Age / 11 / 12;
      });
      const n = entries.length;
      const teamREC = avgREC / n;
      const teamR5 = avgR5 / n;
      const teamAge = avgAge / n;
      s.skillData.push({ name, REC: teamREC, R5: teamR5, Age: teamAge });
    });
    s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
    renderSkillTable();
  };
  var TmLeagueSkillTable = { renderSkillTable, showSkill };

  // src/components/league/tm-league-rounds.js
  var roundMatchCache = /* @__PURE__ */ new Map();
  var roundFetchInFlight = /* @__PURE__ */ new Set();
  var buildRounds2 = (fixtures) => {
    const s = window.TmLeagueCtx;
    const currentSeason3 = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    const highlightClubId = typeof SESSION !== "undefined" && SESSION.main_id ? String(SESSION.main_id) : "";
    const roundPanel = document.getElementById("rnd-panel");
    if (roundPanel) {
      TmFixtureRoundCards.mount(roundPanel, {
        fixtures,
        season: currentSeason3,
        highlightClubId,
        titlePrefix: "Round",
        onRoundChange: ({ rounds, currentIndex }) => {
          s.setRoundsData(rounds, currentIndex);
        }
      });
    }
    TmLeagueStandings.buildStandingsFromDOM();
    TmLeagueStandings.renderLeagueTable();
    if (document.getElementById("tsa-fixtures-content")) {
      TmLeagueFixtures.renderFixturesTab(fixtures);
    }
  };
  var renderRound = () => {
    const s = window.TmLeagueCtx;
    if (!s.fixturesCache) return;
    const currentSeason3 = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    const highlightClubId = typeof SESSION !== "undefined" && SESSION.main_id ? String(SESSION.main_id) : "";
    TmFixtureRoundCards.mount(document.getElementById("rnd-panel"), {
      fixtures: s.fixturesCache,
      season: currentSeason3,
      highlightClubId,
      titlePrefix: "Round",
      initialIndex: s.currentRoundIdx,
      onRoundChange: ({ rounds, currentIndex }) => {
        s.setRoundsData(rounds, currentIndex);
      }
    });
  };
  var fetchRoundRatings = (round) => {
    round.matches.forEach((m) => {
      if (!m.result) return;
      const mid = String(m.id);
      if (roundMatchCache.has(mid) || roundFetchInFlight.has(mid)) return;
      roundFetchInFlight.add(mid);
      TmMatchService.fetchMatchCached(mid).then((data) => {
        roundFetchInFlight.delete(mid);
        if (data) processRoundMatchData(mid, data);
      }).catch((e) => {
        roundFetchInFlight.delete(mid);
        console.warn("[League] fetchRoundRatings error", mid, e);
      });
    });
  };
  var fillRatingCells = (matchId, homeR5, awayR5) => {
    const s = window.TmLeagueCtx;
    const hEl = document.getElementById(`rnd-r-h-${matchId}`);
    const aEl = document.getElementById(`rnd-r-a-${matchId}`);
    if (hEl) {
      hEl.textContent = homeR5.toFixed(2);
      hEl.style.color = s.getColor(homeR5, s.R5_THRESHOLDS);
    }
    if (aEl) {
      aEl.textContent = awayR5.toFixed(2);
      aEl.style.color = s.getColor(awayR5, s.R5_THRESHOLDS);
    }
  };
  var processRoundMatchData = (matchId, data) => {
    const s = window.TmLeagueCtx;
    const homeId = String(data.club.home.id);
    const awayId = String(data.club.away.id);
    Promise.all([s.fetchSquad(homeId), s.fetchSquad(awayId)]).then(([homeSquad, awaySquad]) => {
      return Promise.all([
        s.computeTeamStats(Object.keys(data.lineup.home), data.lineup.home, homeSquad),
        s.computeTeamStats(Object.keys(data.lineup.away), data.lineup.away, awaySquad)
      ]);
    }).then(([homeResult, awayResult]) => {
      const homeR5 = Number((homeResult.totals.R5 / 11).toFixed(2));
      const awayR5 = Number((awayResult.totals.R5 / 11).toFixed(2));
      roundMatchCache.set(String(matchId), { homeR5, awayR5, data });
      fillRatingCells(String(matchId), homeR5, awayR5);
    }).catch((e) => console.warn("[League] processRoundMatchData error", matchId, e));
  };
  var showLoading = () => {
    $("#tsa-content").html(`
            <div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">
                <div style="margin-bottom:6px;">\u23F3</div>Analyzing...
            </div>
        `);
  };
  var processMatchData = (matchId, data) => {
    var _a, _b;
    const s = window.TmLeagueCtx;
    const homeId = String(data.club.home.id);
    const awayId = String(data.club.away.id);
    if (!s.panelLeagueName && ((_b = (_a = data.match_data) == null ? void 0 : _a.venue) == null ? void 0 : _b.tournament)) {
      s.panelLeagueName = data.match_data.venue.tournament;
      const el = document.getElementById("tsa-panel-league-name");
      if (el) el.textContent = s.panelLeagueName;
    }
    const homeLineup = data.lineup.home;
    const awayLineup = data.lineup.away;
    Promise.all([s.fetchSquad(homeId), s.fetchSquad(awayId)]).then(([homeSquad, awaySquad]) => {
      return Promise.all([
        s.computeTeamStats(Object.keys(homeLineup), homeLineup, homeSquad),
        s.computeTeamStats(Object.keys(awayLineup), awayLineup, awaySquad)
      ]);
    }).then(([homeResult, awayResult]) => {
      if (!s.clubDatas.has(homeId)) s.clubDatas.set(homeId, []);
      if (!s.clubDatas.has(awayId)) s.clubDatas.set(awayId, []);
      s.clubDatas.get(homeId).push(homeResult.totals);
      s.clubDatas.get(awayId).push(awayResult.totals);
      if (!s.clubPlayersMap.has(homeId)) s.clubPlayersMap.set(homeId, /* @__PURE__ */ new Map());
      if (!s.clubPlayersMap.has(awayId)) s.clubPlayersMap.set(awayId, /* @__PURE__ */ new Map());
      homeResult.players.forEach((p) => s.clubPlayersMap.get(homeId).set(p.id, {
        name: p.name,
        pos: p.pos,
        R5: p.R5,
        REC: p.REC,
        Age: p.Age,
        skills: p.skills,
        isGK: p.isGK,
        routine: p.routine
      }));
      awayResult.players.forEach((p) => s.clubPlayersMap.get(awayId).set(p.id, {
        name: p.name,
        pos: p.pos,
        R5: p.R5,
        REC: p.REC,
        Age: p.Age,
        skills: p.skills,
        isGK: p.isGK,
        routine: p.routine
      }));
      const homeR5 = Number((homeResult.totals.R5 / 11).toFixed(2));
      const awayR5 = Number((awayResult.totals.R5 / 11).toFixed(2));
      roundMatchCache.set(String(matchId), { homeR5, awayR5, data });
      fillRatingCells(String(matchId), homeR5, awayR5);
      s.totalProcessed += 2;
      s.updateProgress(`Processed ${s.totalProcessed}/${s.totalExpected}`);
    }).catch((e) => {
      console.warn("[League] processMatchData error:", e);
      s.totalProcessed += 2;
    });
  };
  var startAnalysis = (n) => {
    const s = window.TmLeagueCtx;
    s.numLastRounds = n;
    s.beginAnalysis();
    s.updateProgress("Fetching fixtures...");
    showLoading();
    const doAnalysis = (fixtures) => {
      const allPlayed = [];
      Object.values(fixtures).forEach((month) => {
        if (month == null ? void 0 : month.matches) month.matches.forEach((m) => {
          if (m.result) allPlayed.push(m);
        });
      });
      const byDate = {};
      allPlayed.forEach((m) => {
        (byDate[m.date] = byDate[m.date] || []).push(m);
      });
      const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a)).slice(0, s.numLastRounds);
      const matchIds = dates.flatMap((d) => byDate[d].map((m) => String(m.id)));
      s.totalExpected = matchIds.length * 2;
      s.updateProgress(`Loading ${matchIds.length} matches (${dates.length} rounds)...`);
      matchIds.forEach((id) => {
        TmMatchService.fetchMatchCached(id).then((data) => {
          if (data) processMatchData(id, data);
          else s.totalProcessed += 2;
        }).catch(() => {
          s.totalProcessed += 2;
        });
      });
      if (s.analysisInterval) clearInterval(s.analysisInterval);
      s.analysisInterval = setInterval(() => {
        if (s.totalExpected > 0 && s.totalProcessed >= s.totalExpected) {
          clearInterval(s.analysisInterval);
          s.analysisInterval = null;
          s.updateProgress("");
          TmLeagueSkillTable.showSkill();
        }
      }, 500);
    };
    if (s.fixturesCache) {
      doAnalysis(s.fixturesCache);
    } else {
      TMLeagueService.fetchLeagueFixtures("league", { var1: s.leagueCountry, var2: s.leagueDivision, var3: s.leagueGroup }).then((data) => {
        if (!data) return;
        s.fixturesCache = data;
        buildRounds2(s.fixturesCache);
        doAnalysis(s.fixturesCache);
      });
    }
  };
  var TmLeagueRounds = {
    buildRounds: buildRounds2,
    renderRound,
    fetchRoundRatings,
    fillRatingCells,
    processRoundMatchData,
    showLoading,
    processMatchData,
    startAnalysis,
    roundMatchCache,
    roundFetchInFlight
  };

  // src/components/league/tm-league-styles.js
  var inject = () => {
    if (document.getElementById("tsa-league-style")) return;
    const style = document.createElement("style");
    style.id = "tsa-league-style";
    style.textContent = `
            .tmvu-main.tmvu-league-layout {
                --tsa-surface-main: #18310d;
                --tsa-surface-main-2: #13280a;
                --tsa-surface-side: #1d3911;
                --tsa-surface-side-2: #17300d;
                --tsa-border-strong: rgba(103, 156, 63, 0.34);
                --tsa-border-soft: rgba(61,104,40,0.34);
                --tsa-shadow: 0 12px 28px rgba(0,0,0,0.24);
            }

            .tsa-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 14px;
                border-bottom: 1px solid var(--tsa-border-soft);
                font-size: 13px;
                color: #c8e0b4;
            }
            .tsa-progress {
                font-size: 12px;
                color: #6a9a58;
                margin-left: auto;
            }
            .tmvu-main.tmvu-league-layout {
                display: flex;
                gap: 16px;
                align-items: flex-start;
            }
            .tmvu-league-main {
                flex: 1 1 auto;
                min-width: 0;
            }
            .tmvu-league-sidebar {
                flex: 0 0 390px;
                min-width: 0;
            }

            /* \u2500\u2500 Sidebar restyling \u2500\u2500 */
            .tmvu-league-sidebar .box {
                background: var(--tsa-surface-side) !important;
                border: 1px solid rgba(111,168,67,0.26) !important;
                border-radius: 8px !important;
                box-shadow: 0 12px 24px rgba(0,0,0,0.24) !important;
                overflow: hidden !important;
                margin-bottom: 10px !important;
            }
            .tmvu-league-sidebar .box h2 {
                background: transparent !important;
                color: #86b367 !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
                padding: 10px 14px 8px !important;
                border-bottom: 1px solid rgba(111,168,67,0.2) !important;
                margin: 0 !important;
            }
            .tmvu-league-sidebar .box table {
                background: transparent !important;
            }
            .tmvu-league-sidebar .box td, .tmvu-league-sidebar .box th {
                color: #c8e0b4 !important;
                border-color: rgba(42,74,28,0.4) !important;
                font-size: 13px !important;
            }
            .tmvu-league-sidebar .box tr:nth-child(even) td { background: #1c3510 !important; }
            .tmvu-league-sidebar .box tr:nth-child(odd) td  { background: #172d0d !important; }
            .tmvu-league-sidebar .box a { color: #c8e0b4 !important; }
            .tmvu-league-sidebar .box a:hover { color: #e8f5d8 !important; }
            /* Hide the native overall_table container */
            #overall_table_wrapper, #tsa-standings-native-wrap { display: none !important; }
            .tmvu-league-sidebar .box{display: none !important;}
           
            /* \u2500\u2500 History mode banner \u2500\u2500 */
            .tsa-history-banner {
                display: flex; align-items: center; gap: 8px;
                padding: 5px 10px; font-size: 10px; font-weight: 700;
                color: #fbbf24; background: rgba(251,191,36,0.08);
                border-bottom: 1px solid rgba(251,191,36,0.25);
            }
            /* \u2500\u2500 Feed \u2500\u2500 */
            .tsa-feed-list { display: flex; flex-direction: column; }
            .tsa-feed-entry {
                display: flex; gap: 8px; padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,0.2);
            }
            .tsa-feed-entry:last-child { border-bottom: none; }
            .tsa-feed-sub {
                padding: 5px 8px; background: rgba(0,0,0,0.15);
                border-left: 2px solid rgba(61,104,40,0.3);
                margin: 2px 0;
            }
            .tsa-feed-logo { flex-shrink: 0; width: 25px; }
            .tsa-feed-icon { width: 25px; height: 25px; object-fit: contain; border-radius: 3px; }
            .tsa-feed-body { flex: 1; min-width: 0; }
            .tsa-feed-text { font-size: 11px; color: #c8e0b4; line-height: 1.5; }
            .tsa-feed-club { color: #6cc040; text-decoration: none; font-weight: 600; }
            .tsa-feed-club:hover { color: #e8f8d8; }
            .tsa-feed-player { color: #a0d878; text-decoration: none; }
            .tsa-feed-player:hover { color: #e8f8d8; }
            .tsa-feed-link { color: #6a9a58; text-decoration: none; }
            .tsa-feed-link:hover { color: #c8e0b4; }
            .tsa-feed-money { color: #fbbf24; font-weight: 700; }
            .tsa-feed-stars { color: #6cc040; letter-spacing: 1px; }
            .tsa-feed-time { color: #3d6828; font-size: 10px; margin-left: 6px; white-space: nowrap; }
            .tsa-feed-actions { display: flex; gap: 10px; margin-top: 3px; }
            .tsa-feed-like-btn {
                font-size: 11px; color: #4a7038; cursor: pointer;
                display: flex; align-items: center; gap: 2px;
                transition: color 0.12s; user-select: none;
            }
            .tsa-feed-like-btn:hover { color: #6cc040; }
            .tsa-feed-like-btn[data-liked="1"] { color: #ef4444; }
            .tsa-feed-subs { margin-top: 3px; }
            .tsa-feed-more {
                font-size: 10px; color: #4a7038; cursor: pointer;
                margin-top: 4px; padding: 2px 0; user-select: none;
            }
            .tsa-feed-more:hover { color: #6cc040; }

            /* \u2500\u2500 Native #feed reskin \u2500\u2500 */
            #feed {
                background: rgba(8,18,4,0.88) !important;
                color: #c8e0b4 !important; 
            }
            #feed .tsa-feed-top {
                background: rgba(0,0,0,0.35) !important;
                border-bottom: 1px solid rgba(61,104,40,0.3) !important;
                padding: 5px 10px !important; color: #3d6828 !important; font-size: 11px !important;
            }
            #feed .tsa-feed-post { background: transparent !important; padding: 8px 10px !important; border-bottom: 1px solid rgba(61,104,40,0.18) !important; }
            #feed .tsa-feed-post:hover { background: rgba(61,104,40,0.05) !important; }
            #feed .tsa-feed-post-text { font-size: 13px !important; line-height: 1.5 !important; color: #fff !important; }
            #feed .tsa-feed-post-text a, #feed .tsa-feed-post-text .tsa-feed-nowrap a { color: #6cc040 !important; text-decoration: none !important; }
            #feed .tsa-feed-post-text a:hover { color: #d0f0b0 !important; }
            #feed .tsa-feed-post-text .tsa-feed-subtle { color: #ddd !important; font-size: 10px !important; }
            #feed .tsa-feed-like { font-size: 11px !important; font-weight: 700 !important; color: #fff !important; }
            #feed .tsa-feed-like-hidden { visibility: hidden !important; }
            #feed .tsa-feed-hover-options { font-size: 10px !important; }
            #feed .tsa-feed-hover-options .tsa-feed-link { color: #4a7038 !important; }
            #feed .tsa-feed-hover-options .tsa-feed-link:hover { color: #6cc040 !important; }
            #feed .tsa-feed-hover-options .tsa-feed-like-icon { opacity: 0.55 !important; cursor: pointer !important; filter: sepia(1) saturate(2) hue-rotate(60deg) !important; }
            #feed .tsa-feed-hover-options .tsa-feed-like-icon:hover { opacity: 1 !important; }
            #feed .tsa-feed-comments { margin-top: 5px !important; }
            #feed .tsa-feed-comment-text { font-size: 12px !important; color: #fff !important; }
            #feed .tsa-feed-comment-text a { color: #5a9040 !important; text-decoration: none !important; }
            #feed .tsa-feed-comment-text a:hover { color: #c8e0b4 !important; }
            #feed .tsa-feed-comment-like.tsa-feed-positive { background-color: #070 !important; font-size: 10px !important; }
            #feed .tsa-feed-comment-time { color: #ccc !important; font-size: 10px !important; }
            #feed .tsa-feed-comment-like.tsa-feed-like-icon { opacity: 0.4 !important; cursor: pointer !important; }
            #feed .tsa-feed-comment-like.tsa-feed-like-icon:hover { opacity: 0.9 !important; }
            #feed .tsa-feed-hidden-comments-link .tsa-feed-link { color: #ccc !important; font-size: 10px !important; }
            #feed .tsa-feed-hidden-comments-link .tsa-feed-link:hover { color: #6cc040 !important; }
            #feed .tsa-feed-similar-show, #feed .tsa-feed-similar-hide {
                color: #a5aca1 !important;font-size: 12px !important;
            }
            #feed .tsa-feed-similar-show:hover, #feed .tsa-feed-similar-hide:hover { color: #6a9a58 !important; }
            #feed .tsa-feed-textarea-placeholder {
                color: #3d6828 !important; font-size: 11px !important; cursor: text !important;
                background: rgba(0,0,0,0.25) !important; border: 1px solid rgba(61,104,40,0.3) !important;
                border-radius: 3px !important; padding: 3px 7px !important;
            }
            #feed .tsa-feed-comment-box textarea {
                background: rgba(0,0,0,0.35) !important; color: #c8e0b4 !important;
                border: 1px solid rgba(61,104,40,0.45) !important; border-radius: 3px !important;
                font-size: 11px !important;
            }
            #feed .tsa-feed-comment-button .tsa-feed-button-border {
                background: rgba(61,104,40,0.35) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; font-size: 11px !important;
                padding: 3px 10px !important; border-radius: 3px !important; cursor: pointer !important;
            }
            #feed .tsa-feed-comment-button .tsa-feed-button-border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }
            #feed .tsa-feed-post-menu > div { color: #2d4820 !important; font-size: 16px !important; }
            #feed .tsa-feed-post-menu-list {
                background: #0c1a07 !important; border: 1px solid rgba(61,104,40,0.5) !important;
                border-radius: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
            }
            #feed .tsa-feed-post-menu-item { color: #5a8a48 !important; font-size: 11px !important; padding: 5px 12px !important; }
            #feed .tsa-feed-post-menu-item:hover { background: rgba(61,104,40,0.3) !important; color: #c8e0b4 !important; }

            /* \u2500\u2500 Feed box outer shell \u2500\u2500 */
            .box:has(#feed) {
                background: rgba(8,18,4,0.92) !important;
                border: 1px solid rgba(61,104,40,0.45) !important;
                border-radius: 6px !important; overflow: hidden !important;
            }
            .box:has(#feed) .box_shadow { display: none !important; }
            .tsa-feed-head {
                background: rgba(0,0,0,0.5);
                border-bottom: 1px solid rgba(61,104,40,0.3);
                padding: 7px 12px;
            }
            .tsa-feed-head h2 {
                color: #6cc040; font-size: 13px; margin: 0;
            }
            .box:has(#feed) .box_footer {
            display: none !important;
            }
            .box:has(#feed) .tabs_outer,
            .tsa-feed-tabs-outer {
                display: block !important;
                background: transparent;
                margin: 0;
                padding: 0;
            }
            .box:has(#feed) .tabs_content,
            .tsa-feed-content {
                display: block !important;
                background: transparent;
            }
            .box:has(#feed) .tabs_new,
            .tsa-feed-tabs {
                display: flex;
                border-bottom: 1px solid rgba(61,104,40,0.4);
                background: rgba(0,0,0,0.12);
                margin: 0; padding: 0;
            }
            .box:has(#feed) .tabs_new > div,
            .tsa-feed-tabs > div {
                flex: 1;
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: #6a9a58;
                border: none;
                border-bottom: 2px solid transparent;
                background: transparent;
                cursor: pointer;
                transition: all 0.15s;
                text-align: center;
                background: rgba(8,18,4,0.88) !important;
            }
            .box:has(#feed) .tabs_new > div > div,
            .tsa-feed-tabs > div > div { pointer-events: none; }
            .box:has(#feed) .tabs_new > div:hover,
            .tsa-feed-tabs > div:hover { color: #c8e0b4; background: rgba(255,255,255,0.04); }
            .box:has(#feed) .tabs_new > div.active_tab,
            .tsa-feed-tabs > div.active_tab {
                color: #e8f5d8; border-bottom-color: #6cc040;
                background: rgba(108,192,64,0.07);
            }

            /* \u2500\u2500 Press Announcements panel \u2500\u2500 */
            #league_pa, #feed_div { background: transparent !important; }
            #feed_div .feed { list-style: none !important; margin: 0 !important; padding: 0 !important; }
            #feed_div .feed > li {
                padding: 6px 10px !important; font-size: 11px !important;
                border-bottom: 1px solid rgba(61,104,40,0.15) !important;
                background: #1c3410 !important;
            }
            #feed_div .feed > li:hover { background: rgba(61,104,40,0.05) !important; }
            #feed_div .icon_box {
                color: #b8d0a0 !important; font-size: 11px !important;
                line-height: 1.5 !important; background-color: transparent !important;
            }
            #feed_div .icon_box a { color: #6cc040 !important; text-decoration: none !important; }
            #feed_div .icon_box a:hover { color: #d0f0b0 !important; }
            #feed_div .icon_box span { color: #3d6828 !important; font-size: 10px !important; }
            #feed_div .icon_box img {
                filter: sepia(1) saturate(2) hue-rotate(60deg) brightness(0.9) !important;
                width: 14px !important; vertical-align: middle !important;
            }
            #feed_div .add_comment a {
                color: #3d5828 !important; font-size: 10px !important; text-decoration: none !important;
                background: rgba(61,104,40,0.2) !important; border-radius: 3px !important;
                padding: 1px 6px !important;
            }
            #feed_div .add_comment a:hover { color: #6cc040 !important; background: rgba(61,104,40,0.35) !important; }
            #feed_div .feed > li.view_more {
                text-align: center !important; color: #4a7038 !important;
                cursor: pointer !important; border-bottom: none !important; padding: 8px !important;
            }
            #feed_div .feed > li.view_more:hover { color: #6cc040 !important; }
            #press_link .button_border {
                background: rgba(61,104,40,0.3) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; border-radius: 3px !important;
                font-size: 11px !important; padding: 4px 12px !important; cursor: pointer !important;
            }
            #press_link .button_border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }

            /* \u2500\u2500 League feed extras \u2500\u2500 */
            #feed {margin-top: 0 !important;margin: 0 !important;}
            #feed .feed_top{display: none !important;}
            #feed .tsa-feed-logo-wrap .tsa-feed-logo { border-radius: 3px !important; opacity: 0.85 !important; }
            #feed .tsa-feed-post-text .coin { color: #fff !important; font-weight: 600 !important; }
            #feed .tsa-feed-post-text img[src*="star"] { filter: sepia(1) saturate(3) hue-rotate(60deg) !important; }
            #feed .tsa-feed-more-button {
                background: rgba(61,104,40,0.35) !important; color: #90b878 !important;
                border-top: 1px solid rgba(61,104,40,0.3) !important; cursor: pointer !important;
                font-size: 11px !important; padding: 8px !important;
            }
            #feed .tsa-feed-more-button:hover { background: rgba(61,104,40,0.55) !important; color: #c8e0b4 !important; }
        `;
    document.head.appendChild(style);
  };
  var TmLeagueStyles = { inject };

  // src/components/shared/tm-native-feed.js
  var STYLE_ID6 = "tmvu-native-feed-style";
  function injectStyles6() {
    if (document.getElementById(STYLE_ID6)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID6;
    style.textContent = `
        .tmvu-native-feed-box {
            background: rgba(8, 18, 4, 0.92) !important;
            border: 1px solid rgba(61, 104, 40, 0.45) !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        }

        .tmvu-native-feed-box .box_shadow,
        .tmvu-native-feed-box .box_footer {
            display: none !important;
        }

        .tmvu-native-feed-head {
            background: rgba(0, 0, 0, 0.5) !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.3) !important;
            padding: 7px 12px !important;
        }

        .tmvu-native-feed-head h2 {
            color: #6cc040 !important;
            font-size: 13px !important;
            margin: 0 !important;
        }

        .tmvu-native-feed-tabs-outer {
            display: block !important;
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-content {
            display: block !important;
            background: transparent !important;
        }

        .tmvu-native-feed-tabs {
            display: flex !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.4) !important;
            background: rgba(0, 0, 0, 0.12) !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-tabs > div {
            flex: 1;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #6a9a58;
            border: none;
            border-bottom: 2px solid transparent;
            background: rgba(8, 18, 4, 0.88) !important;
            cursor: pointer;
            transition: all 0.15s;
            text-align: center;
        }

        .tmvu-native-feed-tabs > div > div {
            pointer-events: none;
        }

        .tmvu-native-feed-tabs > div:hover {
            color: #c8e0b4;
            background: rgba(255, 255, 255, 0.04) !important;
        }

        .tmvu-native-feed-tabs > div.active_tab {
            color: #e8f5d8;
            border-bottom-color: #6cc040;
            background: rgba(108, 192, 64, 0.07) !important;
        }

        .tmvu-native-feed-root {
            margin: 0 !important;
            background: rgba(8, 18, 4, 0.88) !important;
            color: #c8e0b4 !important;
        }

        .tmvu-native-feed-root .feed_top {
            display: none !important;
        }

        .tmvu-native-feed-root .feed_post {
            background: transparent !important;
            padding: 8px 10px !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.18) !important;
        }

        .tmvu-native-feed-root .feed_post:hover {
            background: rgba(61, 104, 40, 0.05) !important;
        }

        .tmvu-native-feed-root .post_text,
        .tmvu-native-feed-root .post_full_text {
            font-size: 13px !important;
            line-height: 1.5 !important;
            color: #fff !important;
        }

        .tmvu-native-feed-root .post_text a,
        .tmvu-native-feed-root .post_full_text a,
        .tmvu-native-feed-root .comment_text a {
            color: #6cc040 !important;
            text-decoration: none !important;
        }

        .tmvu-native-feed-root .post_text a:hover,
        .tmvu-native-feed-root .post_full_text a:hover,
        .tmvu-native-feed-root .comment_text a:hover {
            color: #d0f0b0 !important;
        }

        .tmvu-native-feed-root .post_time,
        .tmvu-native-feed-root .comment_time,
        .tmvu-native-feed-root .subtle {
            color: #ccc !important;
            font-size: 10px !important;
        }

        .tmvu-native-feed-root .feed_like,
        .tmvu-native-feed-root .comment_like {
            font-size: 11px !important;
            font-weight: 700 !important;
            color: #fff !important;
        }

        .tmvu-native-feed-root .like_hidden {
            visibility: hidden !important;
        }

        .tmvu-native-feed-root .hover_options,
        .tmvu-native-feed-root .hidden_comments_link {
            font-size: 10px !important;
        }

        .tmvu-native-feed-root .hover_options .faux_link,
        .tmvu-native-feed-root .hidden_comments_link .faux_link,
        .tmvu-native-feed-root .post_text .faux_link,
        .tmvu-native-feed-root .post_full_text .faux_link {
            color: #4a7038 !important;
        }

        .tmvu-native-feed-root .hover_options .faux_link:hover,
        .tmvu-native-feed-root .hidden_comments_link .faux_link:hover,
        .tmvu-native-feed-root .post_text .faux_link:hover,
        .tmvu-native-feed-root .post_full_text .faux_link:hover {
            color: #6cc040 !important;
        }

        .tmvu-native-feed-root .like_icon {
            opacity: 0.55 !important;
            cursor: pointer !important;
            filter: sepia(1) saturate(2) hue-rotate(60deg) !important;
        }

        .tmvu-native-feed-root .like_icon:hover {
            opacity: 1 !important;
        }

        .tmvu-native-feed-root .comments {
            margin-top: 5px !important;
        }

        .tmvu-native-feed-root .comment_text {
            font-size: 12px !important;
            color: #fff !important;
        }

        .tmvu-native-feed-root .textarea_placehold {
            color: #3d6828 !important;
            font-size: 11px !important;
            cursor: text !important;
            background: rgba(0, 0, 0, 0.25) !important;
            border: 1px solid rgba(61, 104, 40, 0.3) !important;
            border-radius: 3px !important;
            padding: 3px 7px !important;
        }

        .tmvu-native-feed-root textarea {
            background: rgba(0, 0, 0, 0.35) !important;
            color: #c8e0b4 !important;
            border: 1px solid rgba(61, 104, 40, 0.45) !important;
            border-radius: 3px !important;
            font-size: 11px !important;
        }

        .tmvu-native-feed-root .button_border {
            background: rgba(61, 104, 40, 0.35) !important;
            color: #90b878 !important;
            border: 1px solid rgba(61, 104, 40, 0.5) !important;
            font-size: 11px !important;
            padding: 3px 10px !important;
            border-radius: 3px !important;
            cursor: pointer !important;
        }

        .tmvu-native-feed-root .button_border:hover {
            background: rgba(108, 192, 64, 0.3) !important;
            color: #c8e0b4 !important;
        }

        .tmvu-native-feed-root .post_options > div:first-child {
            color: #2d4820 !important;
            font-size: 16px !important;
        }

        .tmvu-native-feed-root .post_options {
            background: #0c1a07 !important;
            border: 1px solid rgba(61, 104, 40, 0.5) !important;
            border-radius: 4px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
        }

        .tmvu-native-feed-root .post_option {
            color: #5a8a48 !important;
            font-size: 11px !important;
            padding: 5px 12px !important;
        }

        .tmvu-native-feed-root .post_option:hover {
            background: rgba(61, 104, 40, 0.3) !important;
            color: #c8e0b4 !important;
        }

        .tmvu-native-feed-root .coin {
            color: #fff !important;
            font-weight: 600 !important;
        }

        .tmvu-native-feed-root img[src*="star"] {
            filter: sepia(1) saturate(3) hue-rotate(60deg) !important;
        }

        .tmvu-native-feed-box #league_pa,
        .tmvu-native-feed-box #feed_div {
            background: transparent !important;
        }

        .tmvu-native-feed-box #feed_div .feed {
            list-style: none !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li {
            padding: 6px 10px !important;
            font-size: 11px !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.15) !important;
            background: #1c3410 !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li:hover {
            background: rgba(61, 104, 40, 0.05) !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box {
            color: #b8d0a0 !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
            background-color: transparent !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box a {
            color: #6cc040 !important;
            text-decoration: none !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box a:hover {
            color: #d0f0b0 !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box span {
            color: #3d6828 !important;
            font-size: 10px !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box img {
            filter: sepia(1) saturate(2) hue-rotate(60deg) brightness(0.9) !important;
            width: 14px !important;
            vertical-align: middle !important;
        }

        .tmvu-native-feed-box #feed_div .add_comment a {
            color: #3d5828 !important;
            font-size: 10px !important;
            text-decoration: none !important;
            background: rgba(61, 104, 40, 0.2) !important;
            border-radius: 3px !important;
            padding: 1px 6px !important;
        }

        .tmvu-native-feed-box #feed_div .add_comment a:hover {
            color: #6cc040 !important;
            background: rgba(61, 104, 40, 0.35) !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li.view_more {
            text-align: center !important;
            color: #4a7038 !important;
            cursor: pointer !important;
            border-bottom: none !important;
            padding: 8px !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li.view_more:hover {
            color: #6cc040 !important;
        }
    `;
    document.head.appendChild(style);
  }
  function sanitizeFeedRoot(feedRoot) {
    if (!feedRoot) return;
    feedRoot.classList.remove("w480", "std");
    feedRoot.classList.add("tmvu-native-feed-root");
  }
  function installFeedSanitizer(feedRoot) {
    if (!feedRoot) return null;
    sanitizeFeedRoot(feedRoot);
    const observer = new MutationObserver(() => {
      sanitizeFeedRoot(feedRoot);
    });
    observer.observe(feedRoot, { attributes: true, attributeFilter: ["class"] });
    return observer;
  }
  function patchFeedBox(feedBox, { resolveMode = null, requestMode = null } = {}) {
    var _a;
    if (!feedBox) return { observer: null, feedRoot: null };
    injectStyles6();
    feedBox.classList.add("tmvu-native-feed-box");
    const head = feedBox.querySelector(".box_head");
    if (head) {
      head.classList.add("tmvu-native-feed-head");
      (_a = head.querySelector("h2")) == null ? void 0 : _a.classList.remove("std");
    }
    const tabsOuter = feedBox.querySelector(".tabs_outer, .tmvu-native-feed-tabs-outer");
    const tabs = feedBox.querySelector(".tabs_new, .tmvu-native-feed-tabs");
    const content = feedBox.querySelector(".tabs_content, .tmvu-native-feed-content");
    if (tabsOuter && tabs && content) {
      tabsOuter.classList.add("tmvu-native-feed-tabs-outer");
      tabs.classList.remove("tabs_new");
      tabs.classList.add("tmvu-native-feed-tabs");
      content.classList.add("tmvu-native-feed-content");
      if (resolveMode && requestMode) {
        const tabButtons = Array.from(tabs.children);
        const panes = Array.from(content.children);
        const activateTab = (index) => {
          tabButtons.forEach((btn) => btn.classList.remove("active_tab"));
          panes.forEach((pane) => {
            pane.style.display = "none";
          });
          if (!tabButtons[index] || !panes[index]) return;
          tabButtons[index].classList.add("active_tab");
          panes[index].style.display = "";
          requestMode(resolveMode(tabButtons[index], panes[index]));
        };
        tabButtons.forEach((button, index) => {
          button.onclick = (event) => {
            event.preventDefault();
            activateTab(index);
          };
        });
        let activeIdx = tabButtons.findIndex((button) => button.classList.contains("active_tab"));
        if (activeIdx < 0) activeIdx = panes.findIndex((pane) => pane.style.display !== "none");
        activateTab(activeIdx >= 0 ? activeIdx : 0);
      }
    }
    const feedRoot = feedBox.querySelector("#feed");
    const observer = installFeedSanitizer(feedRoot);
    return { observer, feedRoot };
  }
  function mountStandaloneFeed(container, feedRoot, { title = "Feed" } = {}) {
    var _a;
    if (!container || !feedRoot) return { observer: null, feedRoot: null, shell: null };
    injectStyles6();
    const shell = document.createElement("section");
    shell.className = "tmvu-native-feed-box";
    shell.innerHTML = `
        <div class="box_head tmvu-native-feed-head"><h2>${title}</h2></div>
        <div class="box_body"><div class="box_shadow"></div><div class="tmvu-native-feed-slot"></div></div>
    `;
    (_a = shell.querySelector(".tmvu-native-feed-slot")) == null ? void 0 : _a.appendChild(feedRoot);
    container.appendChild(shell);
    const observer = installFeedSanitizer(feedRoot);
    return { observer, feedRoot, shell };
  }
  var TmNativeFeed = {
    injectStyles: injectStyles6,
    sanitizeFeedRoot,
    installFeedSanitizer,
    patchFeedBox,
    mountStandaloneFeed
  };

  // src/pages/league.js
  (function() {
    "use strict";
    if (!/^\/league\//.test(location.pathname)) return;
    const STORAGE_KEY = "TM_LEAGUE_LINEUP_NUM_ROUNDS";
    const SKILL_NAMES_FIELD = TmConst.SKILL_DEFS_OUT.map((d) => d.label || d.key);
    const SKILL_NAMES_GK2 = TmConst.SKILL_DEFS_GK.map((d) => d.label || d.key);
    const { REC_THRESHOLDS: REC_THRESHOLDS2, R5_THRESHOLDS: R5_THRESHOLDS3, AGE_THRESHOLDS: AGE_THRESHOLDS2 } = TmConst;
    const htmlOf4 = (node) => (node == null ? void 0 : node.outerHTML) || "";
    const inputHtml2 = (opts) => htmlOf4(TmUI.input({ tone: "overlay", density: "regular", ...opts }));
    const squadCache2 = /* @__PURE__ */ new Map();
    const fetchSquad2 = (clubId) => {
      if (!squadCache2.has(clubId)) {
        squadCache2.set(clubId, TmClubService.fetchSquadRaw(clubId).then((data) => {
          if (!(data == null ? void 0 : data.post)) return { post: {} };
          if (Array.isArray(data.post)) {
            const postObj = {};
            data.post.forEach((p) => {
              postObj[String(p.id)] = p;
            });
            data.post = postObj;
          }
          return data;
        }).catch(() => ({ post: {} })));
      }
      return squadCache2.get(clubId);
    };
    const tooltipCache2 = /* @__PURE__ */ new Map();
    const getPlayerDataFromSquad2 = async (pid, squadPost, matchPos) => {
      var _a, _b, _c, _d, _e, _f;
      let player = (_a = squadPost.post) == null ? void 0 : _a[String(pid)];
      if (!player) {
        if (!tooltipCache2.has(pid)) {
          tooltipCache2.set(pid, TmPlayerService.fetchPlayerTooltip(pid).then((r) => {
            var _a2;
            return (_a2 = r == null ? void 0 : r.player) != null ? _a2 : null;
          }).catch(() => null));
        }
        player = await tooltipCache2.get(pid);
      }
      if (!player) return { Age: 0, R5: 0, REC: 0, isGK: false, skills: [], routine: 0 };
      const posData = (_b = player.positions) == null ? void 0 : _b.find((p) => {
        var _a2;
        return ((_a2 = p.position) == null ? void 0 : _a2.toLowerCase()) === matchPos;
      });
      const r5 = Number((_d = (_c = posData == null ? void 0 : posData.r5) != null ? _c : player.r5) != null ? _d : 0);
      const rec = Number((_f = (_e = posData == null ? void 0 : posData.rec) != null ? _e : player.rec) != null ? _f : 0);
      return { Age: player.ageMonths, R5: r5, REC: rec, isGK: player.isGK, skills: player.skills, routine: player.routine };
    };
    const computeTeamStats2 = async (playerIds, lineup, squadPost) => {
      const starters = playerIds.filter((id) => !lineup[id].position.includes("sub"));
      const players = await Promise.all(starters.map(async (id) => {
        const matchPos = lineup[id].position;
        const p = await getPlayerDataFromSquad2(id, squadPost, matchPos);
        return { id, name: lineup[id].name || String(id), pos: matchPos, ...p };
      }));
      const totals = { Age: 0, REC: 0, R5: 0 };
      players.forEach((p) => {
        totals.Age += p.Age;
        totals.REC += p.REC;
        totals.R5 += p.R5;
      });
      return { totals, players };
    };
    let pagePath = window.location.pathname;
    let isLeaguePage = /^\/league\//.test(pagePath);
    let lastInitPath = "";
    let leaguePollInterval = null;
    let feedClassObserver = null;
    let lastFeedMode = null;
    let urlParts = pagePath.split("/").filter(Boolean);
    let leagueCountry = isLeaguePage ? urlParts[1] : null;
    let leagueDivision = isLeaguePage ? urlParts[2] : null;
    let leagueGroup = isLeaguePage ? urlParts[3] || "1" : null;
    let numLastRounds = parseInt(localStorage.getItem(STORAGE_KEY)) || 5;
    let clubDatas = /* @__PURE__ */ new Map();
    let clubMap = /* @__PURE__ */ new Map();
    let clubPlayersMap = /* @__PURE__ */ new Map();
    let totalExpected = 0;
    let totalProcessed = 0;
    let analysisInterval = null;
    let skillData = [];
    let skillSortCol = "R5";
    let skillSortAsc = false;
    let allRounds = [];
    let currentRoundIdx = 0;
    let fixturesCache = null;
    const totrCache = {};
    let totrCurrentDate = null;
    let panelCountry = null, panelDivision = null, panelGroup = null;
    let panelLeagueName = "";
    let standingsRows = [];
    let liveZoneMap = {};
    let formOffset = 0;
    let stdVenue = "total";
    let stdFormN = 0;
    let displayedSeason = null;
    let historyFixturesData = null;
    let histFixTooltipCache = {};
    let histFixTooltipEl = null;
    let histFixTooltipTimer = null;
    let histFixTooltipHideTimer = null;
    let statsStatType = "goals";
    let statsTeamType = 0;
    let statsMode = "players";
    let statsClubStat = "goals";
    let transfersView = "bought";
    let statsCache = {};
    const ctx = window.TmLeagueCtx = {
      // eslint-disable-line no-unused-vars
      // ── League identity (set by tm-league.user.js; reset on navigation) ──
      get leagueCountry() {
        return leagueCountry;
      },
      set leagueCountry(v) {
        leagueCountry = v;
      },
      get leagueDivision() {
        return leagueDivision;
      },
      set leagueDivision(v) {
        leagueDivision = v;
      },
      get leagueGroup() {
        return leagueGroup;
      },
      set leagueGroup(v) {
        leagueGroup = v;
      },
      // ── Panel state (set by tm-league-panel.js and shared components) ──
      get panelCountry() {
        return panelCountry;
      },
      set panelCountry(v) {
        panelCountry = v;
      },
      get panelDivision() {
        return panelDivision;
      },
      set panelDivision(v) {
        panelDivision = v;
      },
      get panelGroup() {
        return panelGroup;
      },
      set panelGroup(v) {
        panelGroup = v;
      },
      get panelLeagueName() {
        return panelLeagueName;
      },
      set panelLeagueName(v) {
        panelLeagueName = v;
      },
      // ── Rounds analysis (set by tm-league-rounds.js) ──
      get numLastRounds() {
        return numLastRounds;
      },
      set numLastRounds(v) {
        numLastRounds = v;
      },
      get clubDatas() {
        return clubDatas;
      },
      set clubDatas(v) {
        clubDatas = v;
      },
      get clubMap() {
        return clubMap;
      },
      set clubMap(v) {
        clubMap = v;
      },
      get clubPlayersMap() {
        return clubPlayersMap;
      },
      set clubPlayersMap(v) {
        clubPlayersMap = v;
      },
      get totalExpected() {
        return totalExpected;
      },
      set totalExpected(v) {
        totalExpected = v;
      },
      get totalProcessed() {
        return totalProcessed;
      },
      set totalProcessed(v) {
        totalProcessed = v;
      },
      get analysisInterval() {
        return analysisInterval;
      },
      set analysisInterval(v) {
        analysisInterval = v;
      },
      // ── Skill table (set by tm-league-skill-table.js) ──
      get skillData() {
        return skillData;
      },
      set skillData(v) {
        skillData = v;
      },
      get skillSortCol() {
        return skillSortCol;
      },
      set skillSortCol(v) {
        skillSortCol = v;
      },
      get skillSortAsc() {
        return skillSortAsc;
      },
      set skillSortAsc(v) {
        skillSortAsc = v;
      },
      // ── Rounds list (set by tm-league-rounds.js) ──
      get allRounds() {
        return allRounds;
      },
      set allRounds(v) {
        allRounds = v;
      },
      get currentRoundIdx() {
        return currentRoundIdx;
      },
      set currentRoundIdx(v) {
        currentRoundIdx = v;
      },
      get fixturesCache() {
        return fixturesCache;
      },
      set fixturesCache(v) {
        fixturesCache = v;
      },
      // ── Team of the Round (set by tm-league-totr.js) ──
      get totrCache() {
        return totrCache;
      },
      // only mutated, not reassigned
      get totrCurrentDate() {
        return totrCurrentDate;
      },
      set totrCurrentDate(v) {
        totrCurrentDate = v;
      },
      // ── Standings (set by tm-league-standings.js) ──
      get standingsRows() {
        return standingsRows;
      },
      set standingsRows(v) {
        standingsRows = v;
      },
      get liveZoneMap() {
        return liveZoneMap;
      },
      set liveZoneMap(v) {
        liveZoneMap = v;
      },
      get formOffset() {
        return formOffset;
      },
      set formOffset(v) {
        formOffset = v;
      },
      get stdVenue() {
        return stdVenue;
      },
      set stdVenue(v) {
        stdVenue = v;
      },
      get stdFormN() {
        return stdFormN;
      },
      set stdFormN(v) {
        stdFormN = v;
      },
      // ── History fixtures (set by tm-league-fixtures.js; displayedSeason also by tm-league-panel.js) ──
      get displayedSeason() {
        return displayedSeason;
      },
      set displayedSeason(v) {
        displayedSeason = v;
      },
      get historyFixturesData() {
        return historyFixturesData;
      },
      set historyFixturesData(v) {
        historyFixturesData = v;
      },
      get histFixTooltipCache() {
        return histFixTooltipCache;
      },
      // only mutated
      get histFixTooltipEl() {
        return histFixTooltipEl;
      },
      set histFixTooltipEl(v) {
        histFixTooltipEl = v;
      },
      get histFixTooltipTimer() {
        return histFixTooltipTimer;
      },
      set histFixTooltipTimer(v) {
        histFixTooltipTimer = v;
      },
      get histFixTooltipHideTimer() {
        return histFixTooltipHideTimer;
      },
      set histFixTooltipHideTimer(v) {
        histFixTooltipHideTimer = v;
      },
      // ── Stats & transfers (set by tm-league-stats.js) ──
      get statsStatType() {
        return statsStatType;
      },
      set statsStatType(v) {
        statsStatType = v;
      },
      get statsTeamType() {
        return statsTeamType;
      },
      set statsTeamType(v) {
        statsTeamType = v;
      },
      get statsMode() {
        return statsMode;
      },
      set statsMode(v) {
        statsMode = v;
      },
      get statsClubStat() {
        return statsClubStat;
      },
      set statsClubStat(v) {
        statsClubStat = v;
      },
      get transfersView() {
        return transfersView;
      },
      set transfersView(v) {
        transfersView = v;
      },
      get statsCache() {
        return statsCache;
      },
      // only mutated
      // Functions — lazy getters (defined later in IIFE; called only from events/timers)
      get fetchSquad() {
        return fetchSquad2;
      },
      get computeTeamStats() {
        return computeTeamStats2;
      },
      get updateProgress() {
        return updateProgress;
      },
      get sortData() {
        return sortData;
      },
      // Constants — shared display config, injected from main scope
      getColor: TmUtils.getColor,
      STORAGE_KEY,
      SKILL_NAMES_FIELD,
      SKILL_NAMES_GK: SKILL_NAMES_GK2,
      REC_THRESHOLDS: REC_THRESHOLDS2,
      R5_THRESHOLDS: R5_THRESHOLDS3,
      AGE_THRESHOLDS: AGE_THRESHOLDS2,
      // ── Coordinated state transitions ─────────────────────────────────────────────────────
      // Use these instead of direct property writes when multiple fields must change together.
      // They prevent the partial-update bugs that arise when callers forget a related field.
      // ───────────────────────────────────────────────────────────────────────
      /** Set the three panel league params (+ optional name) atomically. */
      setPanelLeague(country, division, group, name) {
        panelCountry = country;
        panelDivision = division;
        panelGroup = group;
        if (name != null) panelLeagueName = name;
      },
      /** Switch back to live (current-season) standings view. Clears history-mode state. */
      resetToLive() {
        displayedSeason = null;
        historyFixturesData = null;
        standingsRows = [];
        formOffset = 0;
      },
      /** Switch to a history season. Clears stale fixtures data so fetchers refill it. */
      setDisplayedSeason(s) {
        displayedSeason = s;
        historyFixturesData = null;
      },
      /** Set the rounds list and active index atomically (avoids indexing stale allRounds). */
      setRoundsData(rounds, idx) {
        allRounds = rounds;
        currentRoundIdx = idx;
      },
      /** Reset analysis accumulation state. Call before kicking off a new analysis pass. */
      beginAnalysis() {
        clubDatas.clear();
        clubPlayersMap.clear();
        totalExpected = 0;
        totalProcessed = 0;
      }
    };
    const updateProgress = (text) => {
      const el = document.getElementById("tm_script_progress");
      if (el) el.textContent = text;
    };
    const sortData = (data, col, asc) => {
      data.sort((a, b) => {
        if (col === "name") return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        return asc ? a[col] - b[col] : b[col] - a[col];
      });
    };
    const resolveFeedMode = (tabButton, pane) => {
      var _a, _b, _c;
      const buttonId = (tabButton == null ? void 0 : tabButton.id) || "";
      if (buttonId.startsWith("tab-")) return buttonId.slice(4);
      const paneEl = pane instanceof Element ? pane : null;
      if ((paneEl == null ? void 0 : paneEl.id) === "feed_div" || ((_a = paneEl == null ? void 0 : paneEl.querySelector) == null ? void 0 : _a.call(paneEl, "#feed_div"))) return "league";
      if ((paneEl == null ? void 0 : paneEl.id) === "league_pa" || ((_b = paneEl == null ? void 0 : paneEl.querySelector) == null ? void 0 : _b.call(paneEl, "#league_pa"))) return "pa";
      if ((paneEl == null ? void 0 : paneEl.id) === "tabfeed" || ((_c = paneEl == null ? void 0 : paneEl.querySelector) == null ? void 0 : _c.call(paneEl, "#tabfeed"))) return "league";
      return null;
    };
    const primeLeaguePanelContext = () => {
      var _a;
      const ctx2 = window.TmLeagueCtx;
      if (!(ctx2 == null ? void 0 : ctx2.setPanelLeague)) return;
      const navLink = document.querySelector('.column1 .content_menu a[href*="/league/"], .column1_a .content_menu a[href*="/league/"]');
      if (!navLink) return;
      const parts = ((_a = navLink.getAttribute("href")) == null ? void 0 : _a.split("/").filter(Boolean)) || [];
      if (parts.length >= 3) ctx2.setPanelLeague(parts[1], parts[2], parts[3] || "1");
    };
    const prepareLeagueLayout = () => {
      const main = document.querySelector(".tmvu-main, .main_center");
      if (main) main.classList.add("tmvu-league-layout");
      const mainColumn = document.querySelector(".tmvu-league-main, .column2_a");
      if (mainColumn) {
        mainColumn.classList.remove("column2_a");
        mainColumn.classList.add("tmvu-league-main");
      }
      const sidebarColumn = document.querySelector(".tmvu-league-sidebar, .column3_a, .column3");
      if (sidebarColumn) {
        sidebarColumn.classList.remove("column3_a", "column3");
        sidebarColumn.classList.add("tmvu-league-sidebar");
      }
      document.querySelectorAll(".column1, .column1_a").forEach((node) => node.remove());
    };
    const requestFeedMode = (mode) => {
      if (!mode || lastFeedMode === mode) return;
      lastFeedMode = mode;
      if (typeof window.set_hash === "function") {
        window.set_hash(mode);
        return;
      }
      if (typeof window.send_and_load === "function") {
        window.send_and_load(mode);
      }
    };
    const patchFeedBox2 = () => {
      var _a;
      try {
        const feedBox = (_a = document.querySelector("#tabfeed")) == null ? void 0 : _a.closest(".box");
        if (!feedBox) return;
        if (feedClassObserver) {
          feedClassObserver.disconnect();
          feedClassObserver = null;
        }
        const result = TmNativeFeed.patchFeedBox(feedBox, { resolveMode: resolveFeedMode, requestMode: requestFeedMode });
        feedClassObserver = result.observer;
      } catch (e) {
      }
    };
    const injectStyles7 = () => TmLeagueStyles.inject();
    const cleanupPage = () => {
      if (leaguePollInterval) {
        clearInterval(leaguePollInterval);
        leaguePollInterval = null;
      }
      if (analysisInterval) {
        clearInterval(analysisInterval);
        analysisInterval = null;
      }
      if (feedClassObserver) {
        feedClassObserver.disconnect();
        feedClassObserver = null;
      }
      allRounds = [];
      currentRoundIdx = 0;
      fixturesCache = null;
      totrCurrentDate = null;
      Object.keys(totrCache).forEach((k) => delete totrCache[k]);
      panelLeagueName = "";
      clubDatas = /* @__PURE__ */ new Map();
      clubMap = /* @__PURE__ */ new Map();
      clubPlayersMap = /* @__PURE__ */ new Map();
      squadCache2.clear();
      tooltipCache2.clear();
      totalExpected = 0;
      totalProcessed = 0;
      skillData = [];
      standingsRows = [];
      formOffset = 0;
      const navTabs = document.getElementById("tsa-nav-tabs");
      if (navTabs) navTabs.remove();
      const sp = document.getElementById("tsa-standings-panel");
      if (sp) sp.remove();
      const nativeTable = document.getElementById("overall_table");
      if (nativeTable) {
        const wrapper = nativeTable.closest(".box") || nativeTable.parentElement;
        if (wrapper) wrapper.style.display = "";
      }
    };
    const initForCurrentPage = () => {
      const path = window.location.pathname;
      if (path === lastInitPath) return;
      lastInitPath = path;
      pagePath = path;
      isLeaguePage = /^\/league\//.test(path);
      const urlParts2 = path.split("/").filter(Boolean);
      leagueCountry = isLeaguePage ? urlParts2[1] : null;
      leagueDivision = isLeaguePage ? urlParts2[2] : null;
      leagueGroup = isLeaguePage ? urlParts2[3] || "1" : null;
      cleanupPage();
      injectStyles7();
      patchFeedBox2();
      primeLeaguePanelContext();
      prepareLeagueLayout();
      try {
        $(".banner_placeholder.rectangle")[0].parentNode.removeChild($(".banner_placeholder.rectangle")[0]);
      } catch (e) {
      }
      try {
        $(".tmvu-league-sidebar .box").has("h2").filter(function() {
          return $(this).find("h2").text().trim().toUpperCase() === "ROUNDS";
        }).remove();
      } catch (e) {
      }
      const initUI = () => {
        const clubLinks = $("#overall_table td a[club_link]");
        if (!clubLinks.length) return;
        clearInterval(leaguePollInterval);
        leaguePollInterval = null;
        $("#overall_table td").each(function() {
          const id = $(this).children("a").attr("club_link");
          if (id) clubMap.set(id, $(this).children("a")[0].innerHTML);
        });
        TmLeaguePanel.injectStandingsPanel();
        TmLeagueStandings.buildStandingsFromDOM();
        TmLeagueStandings.renderLeagueTable();
        $(".tmvu-league-sidebar").append('<div id="rnd-panel"></div>');
        $(".tmvu-league-sidebar").append(`
                <div class="tmu-card mt-2">
                    <div class="tmu-card-head">Squad Analysis</div>
                    <div class="tsa-controls">
                        <span>Last</span>
                        ${inputHtml2({
          id: "tm_script_num_matches",
          type: "number",
          size: "xs",
          align: "center",
          value: numLastRounds,
          min: 1,
          max: 34
        })}
                        <span>rounds</span>
                        <span id="tm_script_analyze_mount"></span>
                        <span id="tm_script_progress" class="tsa-progress"></span>
                    </div>
                    <div id="tsa-content"></div>
                </div>
            `);
        const analyzeMount = document.getElementById("tm_script_analyze_mount");
        if (analyzeMount) {
          analyzeMount.appendChild(TmButton.button({
            id: "tm_script_analyze_btn",
            label: "Analyze",
            color: "primary",
            size: "sm"
          }));
        }
        document.getElementById("tm_script_analyze_btn").addEventListener("click", () => {
          const n = parseInt($("#tm_script_num_matches").val()) || 5;
          localStorage.setItem(STORAGE_KEY, n);
          TmLeagueRounds.startAnalysis(n);
        });
        TmLeagueRounds.startAnalysis(numLastRounds);
      };
      leaguePollInterval = setInterval(initUI, 500);
      initUI();
    };
    TmPlayerDB.init().catch((e) => console.warn("[League] TmPlayerDB init failed:", e));
    setInterval(initForCurrentPage, 500);
    initForCurrentPage();
  })();
})();
