// ==UserScript==
// @name         TM National Teams Standalone
// @namespace    https://trophymanager.com
// @version      1.0.1
// @description  Standalone National Teams page with layout and NT Save tools
// @match        https://trophymanager.com/national-teams/
// @match        https://trophymanager.com/national-teams/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// Generated from src/pages/app-shell.js + src/pages/national-teams.js.
// This file is self-contained and does not use @require.
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
     * @param {string}      [opts.label]   â€” plain text label (use OR slot, not both)
     * @param {Node|string} [opts.slot]    â€” DOM node or HTML string for rich content
     * @param {string}      [opts.id]
     * @param {string}      [opts.title]
    * @param {string}      [opts.variant] â€” 'button' | 'icon' (default: 'button')
    * @param {string}      [opts.color]   â€” 'primary' | 'secondary' | 'danger' | 'lime' (default: 'lime')
     * @param {string}      [opts.size]    â€” 'xs' | 'sm' | 'md' (default: 'md')
     * @param {string}      [opts.shape]   â€” 'md' | 'full' (default: 'md')
     * @param {string}      [opts.cls]     â€” extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {string}      [opts.type]    â€” button type attribute (default: 'button')
     * @param {object}      [opts.attrs]   â€” extra attributes to set on the button element
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

  // src/components/shared/tm-app-shell-header.js
  var TOP_MENU_LABELS = {
    "0": "Home",
    "1": "Tactics",
    "2": "Quick Match",
    "3": "League",
    "4": "Transfer",
    "5": "Forum",
    "6": "Buy Pro"
  };
  var ICON_BY_GROUP = {
    "0": "\u{1F3E0}",
    "1": "\u{1F3AF}",
    "2": "\u26A1",
    "3": "\u{1F3C6}",
    "4": "\u{1F4B8}",
    "5": "\u{1F4AC}",
    "6": "\u{1F451}"
  };
  var DEFAULT_GROUPS = [
    {
      id: "0",
      href: "/home/",
      label: "Home",
      icon: "\u{1F3E0}",
      children: [
        { href: "/home/", label: "Home" },
        { href: "/club/", label: "Club" },
        { href: "/finances/", label: "Finances" },
        { href: "/stadium/", label: "Stadium" },
        { href: "/account/", label: "Account" }
      ]
    },
    {
      id: "1",
      href: "/tactics/",
      label: "Tactics",
      icon: "\u{1F3AF}",
      children: [
        { href: "/tactics/", label: "Tactics" },
        { href: "/players/", label: "Players" },
        { href: "/youth-development/", label: "Youth Development" },
        { href: "/training/", label: "Training" }
      ]
    },
    {
      id: "2",
      href: "/quickmatch/",
      label: "Quick Match",
      icon: "\u26A1",
      children: [
        { href: "/quickmatch/", label: "Quick Match" },
        { href: "/friendly-league/", label: "Friendly League" }
      ]
    },
    {
      id: "3",
      href: "/league/",
      label: "League",
      icon: "\u{1F3C6}",
      children: [
        { href: "/league/", label: "League" },
        { href: "/cup/", label: "Cup" },
        { href: "/international-cup/", label: "International Cup" },
        { href: "/national-teams/", label: "National Teams" }
      ]
    },
    {
      id: "4",
      href: "/transfer/",
      label: "Transfer",
      icon: "\u{1F4B8}",
      children: [
        { href: "/transfer/", label: "Transfer" },
        { href: "/shortlist/", label: "Shortlist" },
        { href: "/bids/", label: "Bids" },
        { href: "/scouts/", label: "Scouts" }
      ]
    },
    {
      id: "5",
      href: "/forum/",
      label: "Forum",
      icon: "\u{1F4AC}",
      children: [
        { href: "/forum/", label: "Forum" },
        { href: "/user-guide/", label: "User Guide" },
        { href: "/about-tm/", label: "About TM" },
        { href: "/teamsters/", label: "Teamsters" }
      ]
    },
    {
      id: "6",
      href: "/buy-pro/",
      label: "Buy Pro",
      icon: "\u{1F451}",
      children: [
        { href: "/buy-pro/", label: "Buy Pro" },
        { href: "/about-pro/", label: "About Pro" },
        { href: "/donations/", label: "Donations" },
        { href: "/support-pro/", label: "Support" }
      ]
    }
  ];
  var htmlOf = (node) => node ? node.outerHTML : "";
  var buttonHtml = (opts) => htmlOf(TmButton.button(opts));
  function escapeHtml(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function getHeaderGroupMeta(id, fallbackLabel) {
    return {
      label: TOP_MENU_LABELS[id] || fallbackLabel,
      icon: ICON_BY_GROUP[id] || "\u2022"
    };
  }
  function getDefaultHeaderGroups() {
    return DEFAULT_GROUPS.map((group) => ({
      ...group,
      children: group.children.map((child) => ({ ...child }))
    }));
  }
  var TmAppShellHeader = {
    render({ clubName, logo, proDays, cash, pmCount = 0, groups, currentPath, openGroupId, headerFab = null }) {
      return `
            <header id="tmvu-header">
                <div class="tmvu-header-shell">
                    ${headerFab ? this.renderHeaderFab(headerFab) : ""}
                    <div class="tmvu-header-top">
                        <div class="tmvu-brand">
                            ${logo ? `<img class="tmvu-brand-logo" src="${logo}" alt="${clubName}">` : '<div class="tmvu-brand-mark">TM</div>'}
                            <div class="tmvu-brand-copy">
                                <strong title="${clubName}">${clubName}</strong>
                            </div>
                        </div>
                        <div class="tmvu-header-meta">
                            <div class="tmvu-brand-metrics">
                                <div class="tmvu-metric">
                                    <span class="tmvu-metric-icon tmvu-metric-icon-pro"></span>
                                    <span class="tmvu-metric-label">Pro</span>
                                    <strong class="tmvu-metric-value">${proDays}d</strong>
                                </div>
                                <a class="tmvu-metric tmvu-metric-link" href="/finances/" title="Open finances">
                                    <span class="tmvu-metric-icon tmvu-metric-icon-cash"></span>
                                    <span class="tmvu-metric-label">Cash</span>
                                    <strong class="tmvu-metric-value">$${cash}</strong>
                                </a>
                                ${this.renderPmMenu(pmCount)}
                            </div>
                        </div>
                    </div>
                    <div class="tmvu-nav-wrap">
                        <nav class="tmvu-nav-primary" aria-label="Primary navigation">
                            ${groups.map((group) => this.renderPrimaryGroup(group, currentPath, openGroupId)).join("")}
                        </nav>
                        <div class="tmvu-nav-secondary${openGroupId ? " has-open" : ""}" aria-label="Secondary navigation">
                            ${groups.map((group) => this.renderSecondaryGroup(group, currentPath, openGroupId)).join("")}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },
    renderPmMenu(pmCount) {
      const count = Number.isFinite(Number(pmCount)) ? Math.max(0, Number(pmCount)) : 0;
      return `
            <div class="tmvu-pm-wrap" data-pm-root>
                <button
                    class="tmvu-metric tmvu-metric-button"
                    type="button"
                    data-pm-trigger
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-controls="tmvu-pm-menu"
                >
                    <span class="tmvu-metric-icon tmvu-metric-icon-mail"></span>
                    <span class="tmvu-metric-label">PM</span>
                    <strong class="tmvu-metric-value" data-pm-count>${count}</strong>
                </button>
                <div class="tmvu-pm-menu" id="tmvu-pm-menu" data-pm-menu hidden>
                    <div class="tmvu-pm-menu-head">
                        <div>
                            <strong>Private Messages</strong>
                            <span data-pm-summary>${count} new</span>
                        </div>
                        ${buttonHtml({
        label: "New Message",
        color: "secondary",
        size: "xs",
        cls: "tmvu-pm-compose",
        attrs: {
          "data-pm-compose": "1"
        }
      })}
                    </div>
                    <div class="tmvu-pm-list" data-pm-list>
                        ${this.renderPmPlaceholder("Open PM to load the latest conversations.")}
                    </div>
                    <div class="tmvu-pm-menu-foot">
                        ${buttonHtml({
        label: "View All Messages",
        color: "secondary",
        size: "xs",
        cls: "tmvu-pm-view-all",
        attrs: {
          "data-pm-view-all": "1"
        }
      })}
                    </div>
                </div>
            </div>
        `;
    },
    renderPmPlaceholder(copy) {
      return `<div class="tmvu-pm-placeholder">${escapeHtml(copy)}</div>`;
    },
    renderPmItems(items = []) {
      if (!Array.isArray(items) || !items.length) {
        return this.renderPmPlaceholder("No recent conversations found.");
      }
      return items.map((item) => {
        const sender = escapeHtml(item.senderName || "Unknown sender");
        const subject = escapeHtml(item.subject || "(No subject)");
        const time = escapeHtml(item.time || "");
        const longTime = escapeHtml(item.longTime || item.time || "");
        const unreadClass = item.unread ? " is-unread" : "";
        const id = escapeHtml(item.id || "");
        const conversationId = escapeHtml(item.conversationId || "0");
        return `
                <button
                    class="tmvu-pm-item${unreadClass}"
                    type="button"
                    data-pm-item
                    data-pm-id="${id}"
                    data-pm-conversation-id="${conversationId}"
                >
                    <div class="tmvu-pm-item-head">
                        <strong class="tmvu-pm-item-sender">${sender}</strong>
                        <span class="tmvu-pm-item-time" title="${longTime}">${time}</span>
                    </div>
                    <div class="tmvu-pm-item-subject" title="${subject}">${subject}</div>
                </button>
            `;
      }).join("");
    },
    renderHeaderFab(fab) {
      return `
            <a class="tmvu-header-fab${fab.isActive ? " is-active" : ""}" href="${fab.href || "#"}">
                <span class="tmvu-icon" aria-hidden="true">${fab.icon || "\u2022"}</span>
                <span class="tmvu-header-fab-label">${fab.label}</span>
            </a>
        `;
    },
    renderPrimaryGroup(group, currentPath, openGroupId) {
      const isOpen = openGroupId === group.id;
      const isCurrent = group.children.some((child) => child.href === currentPath);
      return `
            <section class="tmvu-menu-group${isOpen ? " is-open" : ""}${isCurrent ? " is-current" : ""}" data-group-id="${group.id}">
                ${buttonHtml({
        slot: `<span class="tmvu-icon" aria-hidden="true">${group.icon || "\u2022"}</span><span class="tmvu-group-label">${group.label}</span>`,
        color: "secondary",
        size: "sm",
        cls: "tmvu-menu-trigger",
        attrs: {
          "data-group-trigger": group.id,
          "data-group-href": group.href || "",
          "aria-expanded": isOpen ? "true" : "false"
        }
      })}
            </section>
        `;
    },
    renderSecondaryGroup(group, currentPath, openGroupId) {
      const isOpen = openGroupId === group.id;
      return `
            <div class="tmvu-secondary-group${isOpen ? " is-open" : ""}" data-group-id="${group.id}">
                ${group.children.map((child) => `
                    <a class="tmvu-subitem${child.href === currentPath ? " is-active" : ""}" href="${child.href}">
                        <span class="tmvu-subitem-dot"></span>
                        <span class="tmvu-subitem-label">${child.label}</span>
                    </a>
                `).join("")}
            </div>
        `;
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

  // src/components/shared/tm-notice.js
  var STYLE_ID = "tm-notice-style";
  var CSS_TEXT = `
.tmu-notice {
    color: #d6e8ca;
    font-size: 12px;
    line-height: 1.55;
}

.tmu-notice-surface {
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(78,130,54,.18);
    background: rgba(128,224,72,.06);
}

.tmu-notice-footnote {
    color: #789565;
    font-size: 11px;
}

.tmu-notice-tone-warm.tmu-notice-surface {
    border-color: rgba(90,126,42,.18);
}

.tmu-notice-tone-muted.tmu-notice-surface {
    background: rgba(42,74,28,.24);
    border: 1px solid rgba(61,104,40,.26);
    border-radius: 8px;
    color: #a8cb95;
}
`;
  function ensureStyle(target = document.head) {
    if (!target) return;
    if (target === document.head) {
      if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    target.appendChild(style);
  }
  function escapeHtml2(value) {
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
    return escapeHtml2(opts.text);
  }
  var TmNotice = {
    cssText: CSS_TEXT,
    injectCSS(target = document.head) {
      ensureStyle(target);
    },
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
     * @param {string} [html]    â€” value HTML (default: '')
     * @param {string} [variant] â€” extra CSS class on .tmu-stat-val
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
  var escapeHtml3 = (value) => String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var attrText = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null).map(([key, value]) => ` ${key}="${escapeHtml3(value)}"`).join("");
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
        return `<span class="tmu-tstats-home${leftLead}">${escapeHtml3(leftValue)}</span><span class="tmu-tstats-label">${escapeHtml3(row.label)}</span><span class="tmu-tstats-away${rightLead}">${escapeHtml3(rightValue)}</span>`;
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
.tmu-card.tmu-card-variant-soft { background: #16270f; border: 1px solid #28451d; border-radius: 12px; box-shadow: 0 0 9px #192a19; }
.tmu-card.tmu-card-variant-sidebar { margin-bottom: 14px; }
.tmu-card.tmu-card-variant-sidebar .tmu-card-head { padding: 12px 14px 9px; }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body { padding: 14px 14px; gap: 11px; }
.tmu-card.tmu-card-variant-sidebar .tmu-card-body.tmu-card-body-flush { padding: 7px; gap: 5px; }
.tmu-card.tmu-card-variant-embedded { margin-bottom: 0; border-color: #3d6828; box-shadow: none; color: #c8e0b4; }
.tmu-card.tmu-card-variant-embedded .tmu-card-body,
.tmu-card.tmu-card-variant-embedded .tmu-card-body.tmu-card-body-flush { padding: 0; gap: 0; }
.tmu-card-head { font-size: 10px; font-weight: 700; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #3d6828; }
.tmu-card-head-btn { background: none; border: none; color: #6a9a58; cursor: pointer; font-size: 13px; padding: 0 2px; line-height: 1; transition: color .15s; }
.tmu-card-head-btn:hover { color: #80e048; }
.tmu-card-body { padding: 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.tmu-card-body-flush { padding: 4px; gap: 2px; }
/* \u2500\u2500 Panel \u2500\u2500 */
.tmu-panel { background: #1c3410; border: 1px solid #2a4a1c; border-radius: 10px; color: #c8e0b4; box-shadow: 0 4px 24px rgba(0,0,0,.5); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tmu-panel-page { margin: 10px auto 16px; max-width: 1200px; padding: 14px; }
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
     * @param {Element} el       â€” target element (innerHTML replaced)
     * @param {string}  html     â€” template string
     * @param {object}  handlers â€” { actionName: Function } matched to data-action
     * @returns {object}         â€” { [action|ref]: Element }
     */
    render(el, html, handlers = {}) {
      if (html !== void 0) el.innerHTML = html;
      const refs = {};
      el.querySelectorAll("tm-card").forEach((tmCard) => {
        const card = document.createElement("div");
        card.className = "tmu-card";
        if (tmCard.dataset.variant) {
          tmCard.dataset.variant.split(/\s+/).filter(Boolean).forEach((variant) => {
            card.classList.add("tmu-card-variant-" + variant);
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
    // shared (isGK + isOutfield) â€” must stay at the top; indices 0-2 match both weight matrices
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
    // â”€â”€ Goals & Shooting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // â”€â”€ Passing (computed card entries) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // â”€â”€ Passing (table columns) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // â”€â”€ Defending & Duels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // â”€â”€ Lineup-only status flags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
     * e.g. "subdc" â†’ "DC",  "dl" â†’ "DL",  null â†’ "?"
     */
    label(pos) {
      if (!pos) return "?";
      const cleaned = pos.replace(/sub/i, "").trim().toUpperCase().split(/[\/,]/)[0];
      return cleaned || "SUB";
    },
    /**
     * Position color from POSITION_MAP (for chips, badges).
     * e.g. 'gk' â†’ '#4ade80'
     */
    color(pos) {
      var _a, _b;
      return (_b = (_a = MAP[norm(pos)]) == null ? void 0 : _a.color) != null ? _b : "#aaa";
    },
    /**
     * Integer POSITION_MAP id for a position string key.
     * e.g. 'gk' â†’ 9,  'dc' â†’ 0
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
     * e.g. 'gk' â†’ 'tmh-pos-gk', 'dc' â†’ 'tmh-pos-d'
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
     * e.g. 9 â†’ 'gk', 4 â†’ 'mf', 8 â†’ 'fw'
     */
    filterGroup(id) {
      var _a;
      return (_a = FILTER_GROUPS[id]) != null ? _a : "mf";
    },
    /**
     * Group color for a POSITION_MAP id number (charts, legends).
     * e.g. 9 â†’ '#4ade80', 8 â†’ '#f87171'
     */
    groupColor(id) {
      var _a;
      return (_a = GROUP_COLORS[id]) != null ? _a : "#aaa";
    },
    /**
     * Short group label for a POSITION_MAP id number.
     * e.g. 9 â†’ 'GK', 1 â†’ 'DLR', 8 â†’ 'F'
     */
    groupLabel(id) {
      var _a;
      return (_a = GROUP_LABELS[id]) != null ? _a : "?";
    },
    /**
     * Render a position chip â€” identical layout to the squad table.
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
     * @param {string}  key     â€” column key being rendered
     * @param {string}  sortKey â€” currently active sort column
     * @param {boolean} asc     â€” true = ascending
     * @returns {string}        â€” ' â–²', ' â–¼', or ''
     */
    sortArrow: (key, sortKey, asc) => key === sortKey ? asc ? " \u25B2" : " \u25BC" : "",
    /**
     * Returns an HTML string for a colored skill value with optional decimal superscript.
     *   â€” null/undefined â†’ muted dash
     *   â€” floor â‰¥ 20    â†’ gold â˜…
     *   â€” floor â‰¥ 19    â†’ silver â˜… + decimal superscript
     *   â€” otherwise     â†’ colored integer + decimal superscript
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
     * @param {HTMLElement} el     â€” tooltip element (already in DOM)
     * @param {Element}     anchor â€” element to anchor against
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
     * @param {string} primaryColor â€” hex color of the primary position
     * @param {string} innerHTML    â€” pre-built inner HTML
     * @param {string} [cls]        â€” CSS class (default: 'tm-pos-chip')
     * @returns {string} HTML string
     */
    positionChip: (primaryColor, innerHTML, cls = "tm-pos-chip") => `<span class="${cls}" style="background:${primaryColor}22;border:1px solid ${primaryColor}44">${innerHTML}</span>`,
    /**
     * Renders a country flag `<ib>` element, or empty string if no country.
     * @param {string} country â€” country code (e.g. 'gb', 'de')
     * @param {string} [cls]   â€” extra CSS class to append
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
    table({ headers = [], items = [], groupHeaders = [], footer = [], sortDefs = {}, sortKey = null, sortDir = -1, cls = "", prependIndex = false, rowCls = null, rowAttrs = null, onRowClick = null, renderRowsHtml = null, afterRender = null } = {}) {
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
      const getSortDef = (key) => {
        if (!key) return null;
        return headers.find((h) => h.key === key) || sortDefs[key] || null;
      };
      let _items = items;
      let _footer = footer;
      let _sk = sortKey != null ? sortKey : (headers.find((h) => h.sortable !== false) || {}).key || null;
      let _sd = sortDir;
      const attrText2 = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null && value !== false).map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      function _render() {
        const sortHdr = getSortDef(_sk);
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
            const canSort = !!cell.key;
            const isActive = canSort && _sk === cell.key;
            const cc = [cell.cls || "", canSort ? "sortable" : "", isActive ? "sort-active" : ""].filter(Boolean).join(" ");
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
            const canSort = hdr.sortable !== false;
            const isActive = canSort && _sk === hdr.key;
            const thCls = [canSort ? "sortable" : "", isActive ? "sort-active" : "", align, hdr.thCls || ""].filter(Boolean).join(" ");
            h += `<th${thCls ? ` class="${thCls}"` : ""}${canSort ? ` data-sk="${hdr.key}"` : ""}${hdr.width ? ` style="width:${hdr.width}"` : ""}${hdr.title ? ` title="${hdr.title}"` : ""}>`;
            h += hdr.label + (isActive ? arrow : "") + "</th>";
          });
          h += "</tr>";
        }
        h += "</thead><tbody>";
        if (typeof renderRowsHtml === "function") {
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
              const tdCls = [align, hdr.cls || ""].filter(Boolean).join(" ");
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
        tbl.querySelectorAll("thead th[data-sk]").forEach((th) => {
          th.addEventListener("click", () => {
            const key = th.dataset.sk;
            if (_sk === key) {
              _sd *= -1;
            } else {
              _sk = key;
              const nextHdr = getSortDef(key);
              _sd = Number(nextHdr == null ? void 0 : nextHdr.defaultSortDir) || -1;
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
        if (afterRender) {
          afterRender({ wrap, table: tbl, sortedItems: sorted, sortKey: _sk, sortDir: _sd });
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
  var htmlOf2 = (node) => node ? node.outerHTML : "";
  var buttonHtml2 = ({ style = "secondary", label = "", sub = "", attrs = {} } = {}) => htmlOf2(TmButton.button({
    slot: `${label}${sub ? `<span class="tmu-modal-btn-sub">${sub}</span>` : ""}`,
    color: style === "danger" ? "danger" : style === "primary" ? "primary" : "secondary",
    size: "sm",
    cls: `tmu-modal-btn tmu-modal-btn-${style}`,
    attrs
  }));
  var inputHtml = (opts = {}) => htmlOf2(TmInput.input({
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
          (b) => buttonHtml2({
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
        overlay.innerHTML = `<div class="tmu-modal"><div class="tmu-modal-icon">${icon || ""}</div><div class="tmu-modal-title">${title}</div><div class="tmu-prompt-field">${inputHtml({ id: "tmu-prompt-input", type: "text", placeholder: esc(placeholder), value: esc(defaultValue) })}</div><div class="tmu-modal-btns">` + buttonHtml2({ style: "primary", label: "\u{1F4BE} Save", attrs: { "data-val": "ok" } }) + buttonHtml2({ style: "danger", label: "Cancel", attrs: { "data-val": "cancel" } }) + `</div></div>`;
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
    ...TmState
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
        cache[cacheKey(reqKeys.result[i])] = reqAll.result[i];
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
     * Subsequent calls return the same promise immediately â€” no re-fetch, no re-dedup.
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
     * @param {string} type â€” 'history' | 'training' | 'graphs' | 'scout' | etc.
     * @param {object} [extra={}] â€” optional extra params (e.g. { scout_id: '123' })
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
     * that were saved before the meta field existed. Safe to call on every tooltip fetch â€”
     * no-ops once the record already has meta.pos populated.
     * @param {object} player â€” normalized player object
     * @param {object|null} DBPlayer â€” existing DB record for this player, or null if not found
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
     * @param {object} player â€” raw player from fetchPlayerTooltip / tooltip.ajax.php
     * @param {object|null} DBPlayer â€” existing DB record for this player, or null if not found
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
    const $ = window.jQuery;
    if (!$) {
      resolve(null);
      return;
    }
    $.post(url, data).done((res) => {
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
  var TmApiEngine = {
    errors: _errors,
    onError: null
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
     * @param {Set<string>} homeIds â€” Set of home player ids as strings
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
     * (tooltip.ajax.php format â€” events have .minute, .scorer_name, .score, .assist_id)
     * @param {Array} goals  â€” sorted goal event objects with .isHome flag
     * @param {Array} cards  â€” sorted card event objects with .isHome flag
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
     * (match.ajax.php format â€” events have .min, .name, .assist, .type)
     * @param {Array} goals  â€” goal event objects with .isHome flag
     * @param {Array} cards  â€” card event objects with .isHome flag
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
     * @param {number} evtMin    â€” minute of the event
     * @param {number} evtIdx    â€” event index within that minute
     * @param {number} curMin    â€” current live minute
     * @param {number} curEvtIdx â€” current live event index
     * @param {number} [curLineIdx=999] â€” current visible line index within the event
     * @param {number} [evtLineIdx=-1]  â€” tested line index within the event
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
     * Build a playerId â†’ displayName lookup from match lineup data.
     * @param {object} mData â€” match data with .lineup.home and .lineup.away
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
     * @param {string} side        â€” 'home' | 'away'
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
    * @param {string} side        â€” 'home' | 'away'
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
     * @param {object} p         â€” player object (needs .udseende2, .age)
     * @param {string} colorHex  â€” club color hex (with or without #)
     * @param {number} [w=96]    â€” image width in pixels
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
     * @param {number} date â€” Unix timestamp of kickoff
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
     * @param {object} report â€” mData.report keyed by minute string
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
     * @param {object} report â€” mData.report (post-normalizeReport)
     * @param {object} lineup â€” mData.lineup with .home and .away player maps
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
     * @param {object} mData â€” raw or compressed match API response
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
     * @param {object} raw â€” raw response from match.ajax.php
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

  // src/services/transfer.js
  var _SKILL_NAME_TO_KEY = {
    "Strength": "str",
    "Stamina": "sta",
    "Pace": "pac",
    "Marking": "mar",
    "Tackling": "tac",
    "Workrate": "wor",
    "Positioning": "pos",
    "Passing": "pas",
    "Crossing": "cro",
    "Technique": "tec",
    "Heading": "hea",
    "Finishing": "fin",
    "Longshots": "lon",
    "Set Pieces": "set",
    "Handling": "han",
    "One on ones": "one",
    "Reflexes": "ref",
    "Aerial Ability": "ari",
    "Jumping": "jum",
    "Communication": "com",
    "Kicking": "kic",
    "Throwing": "thr"
  };
  var _GK_WEIGHT_ORDER = TmConst.SKILL_KEYS_GK_WEIGHT;
  var _OUTFIELD_SKILLS = TmConst.SKILL_KEYS_OUT;
  function _skillsToArray(skillsObj, posIdx) {
    const order = posIdx === 9 ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
    return order.map((k) => skillsObj[k] || 0);
  }
  var TmTransferService = {
    /**
     * Fetch the current transfer status for a listed player.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTransfer(playerId) {
      return _post("/ajax/transfer_get.ajax.php", { type: "transfer_reload", player_id: playerId });
    },
    /**
     * Search the transfer market by a pre-built hash string.
     * Returns the raw API response { list: [], refresh: bool } or null on error.
     * The `list` array contains raw TM transfer player objects â€” call
     * normalizeTransferPlayer() on each entry before use.
     * @param {string} hash   â€” path-style hash built by buildHash() / buildHashRaw()
     * @param {string|number} clubId â€” SESSION.id (used by TM to exclude own players)
     * @returns {Promise<{list: object[], refresh: boolean}|null>}
     */
    fetchTransferSearch(hash, clubId) {
      return _post("/ajax/transfer.ajax.php", { search: hash, club_id: clubId });
    },
    /**
     * Normalise a raw transfer-list player object in place.
     * Adds computed helper fields:
     *   _gk    {boolean}  â€” true for goalkeepers
     *   _ageP  {object}   â€” { years, months, totalMonths, decimal }
     *   _ss    {object}   â€” { sum, count, total, max } star-sum of scouted skills
     * @param {object} p â€” raw player from transfer list
     * @returns {object} the same object (mutated), for chaining
     */
    normalizeTransferPlayer(p) {
      const OUTFIELD = ["str", "sta", "pac", "mar", "tac", "wor", "pos", "pas", "cro", "tec", "hea", "fin", "lon", "set"];
      const GK = ["str", "sta", "pac", "han", "one", "ref", "ari", "jum", "com", "kic", "thr"];
      const positions = Array.isArray(p.fp) ? p.fp : String(p.fp || "").split(",");
      p.fp = positions.map((pos) => String(pos || "").trim().toLowerCase()).filter(Boolean);
      const gk = p.fp[0] === "gk";
      const skills = gk ? GK : OUTFIELD;
      let sum = 0, count = 0;
      for (const s of skills) {
        if (p[s] > 0) {
          sum += p[s];
          count++;
        }
      }
      const age = parseFloat(p.age) || 0;
      const years = Math.floor(age);
      const months = Math.round((age - years) * 100);
      p._gk = gk;
      p._ss = { sum, count, total: skills.length, max: skills.length * 20 };
      p._ageP = { years, months, totalMonths: years * 12 + months, decimal: years + months / 12 };
      return p;
    },
    /**
     * Compute R5 range estimate from transfer-list skills (no tooltip needed).
     * Uses assumed routine range [0 â€¦ 4.2*(age-15)].
     * Requires player to be pre-normalized via normalizeTransferPlayer().
     * @param {object} p â€” normalized transfer player
     * @returns {{ r5Lo, r5Hi, recCalc, routineMax }|null}
     */
    estimateTransferPlayer(p) {
      const asi = p.asi || 0;
      if (!asi) return null;
      const skillKeys = p._gk ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
      const skills = skillKeys.map((k) => p[k] || 0);
      if (skills.every((s) => s === 0)) return null;
      const positions = [...p.fp || []].sort((a, b) => TmLib.getPositionIndex(a) - TmLib.getPositionIndex(b));
      if (!positions.length) return null;
      const ageYears = p._ageP ? p._ageP.years : Math.floor(parseFloat(p.age) || 20);
      const routineMax = Math.max(0, TmConst.ROUTINE_SCALE * (ageYears - TmConst.ROUTINE_AGE_MIN));
      let r5Lo = null, r5Hi = null, recCalc = null;
      for (const pos of positions) {
        const pi = TmLib.getPositionIndex(pos);
        const lo = TmLib.calcR5(pi, skills, asi, 0);
        const hi = TmLib.calcR5(pi, skills, asi, routineMax);
        const rec = TmLib.calcRec(pi, skills, asi);
        if (r5Lo === null || lo > r5Lo) r5Lo = lo;
        if (r5Hi === null || hi > r5Hi) r5Hi = hi;
        if (recCalc === null || rec > recCalc) recCalc = rec;
      }
      return { r5Lo, r5Hi, recCalc, routineMax };
    },
    /**
     * Enrich a transfer player with tooltip-derived values: recSort, recCalc,
     * r5 (exact if routine known), r5Lo, r5Hi, ti, skills.
     * Does NOT do any DB access â€” pure calculation.
     * Requires player to be pre-normalized via normalizeTransferPlayer().
     * @param {object} player        â€” normalized transfer player (has _gk, _ageP)
     * @param {object} tooltipData   â€” raw response from tooltip.ajax.php
     * @param {number} currentSession â€” TmLib.getCurrentSession() result
     * @returns {{ recSort, recCalc, r5, r5Lo, r5Hi, ti, skills }|null}
     */
    enrichTransferFromTooltip(player, tooltipData, currentSession) {
      if (!(tooltipData == null ? void 0 : tooltipData.player)) return null;
      const tp = tooltipData.player;
      const recSort = tp.rec_sort !== void 0 ? parseFloat(tp.rec_sort) : null;
      const wageNum = TmUtils.parseNum(tp.wage);
      const asiNum = player.asi || TmUtils.parseNum(tp.asi || tp.skill_index);
      const favpos = tp.favposition || "";
      const isGK = favpos.split(",")[0].toLowerCase() === "gk";
      let ti = null;
      if (asiNum && wageNum) {
        const tiRaw = TmLib.calculateTI({ asi: asiNum, wage: wageNum, isGK });
        if (tiRaw !== null && currentSession > 0)
          ti = Number((tiRaw / currentSession).toFixed(1));
      }
      let skills = null;
      if (tp.skills && Array.isArray(tp.skills)) {
        skills = {};
        for (const sk of tp.skills) {
          const key = _SKILL_NAME_TO_KEY[sk.name];
          if (!key) continue;
          const v = sk.value;
          if (typeof v === "string") {
            if (v.includes("star_silver")) skills[key] = 19;
            else if (v.includes("star")) skills[key] = 20;
            else skills[key] = parseInt(v) || 0;
          } else {
            skills[key] = parseInt(v) || 0;
          }
        }
      }
      const tooltipRoutine = tp.routine != null ? parseFloat(tp.routine) : null;
      let recCalc = null, r5 = null, r5Lo = null, r5Hi = null;
      if (skills && asiNum) {
        const positions = favpos.split(",").map((s) => s.trim()).filter(Boolean);
        if (positions.length) {
          const ageYears = player._ageP ? player._ageP.years : Math.floor(parseFloat(player.age) || 20);
          const routineMax = Math.max(0, TmConst.ROUTINE_SCALE * (ageYears - TmConst.ROUTINE_AGE_MIN));
          for (const pos of positions) {
            const pix = TmLib.getPositionIndex(pos);
            const sax = _skillsToArray(skills, pix);
            const rec = TmLib.calcRec(pix, sax, asiNum);
            const lo = TmLib.calcR5(pix, sax, asiNum, 0);
            const hi = TmLib.calcR5(pix, sax, asiNum, routineMax);
            if (recCalc === null || rec > recCalc) recCalc = rec;
            if (r5Lo === null || lo > r5Lo) r5Lo = lo;
            if (r5Hi === null || hi > r5Hi) r5Hi = hi;
            if (tooltipRoutine !== null) {
              const exact = TmLib.calcR5(pix, sax, asiNum, tooltipRoutine);
              if (r5 === null || exact > r5) r5 = exact;
            }
          }
        }
      }
      return { recSort, recCalc, r5, r5Lo, r5Hi, ti, skills };
    }
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
     * @param {string} country â€” country suffix (e.g. 'cs', 'de')
     * @returns {Promise<object|null>}
     */
    fetchLeagueDivisions(country) {
      return _post("https://trophymanager.com/ajax/league_get_divisions.ajax.php", { get: "new", country });
    },
    /**
     * Fetch the raw league page HTML for a division/group.
     * @param {string} country
     * @param {string|number} division
     * @param {string|number} group
     * @returns {Promise<string|null>}
     */
    fetchLeaguePageHtml(country, division, group) {
      return _getHtml(`/league/${country}/${division}/${group}/`);
    },
    /**
     * Fetch the raw league transfer history HTML page for a given season.
     * @param {string} country
     * @param {string|number} division
     * @param {string|number} group
     * @param {string|number} season
     * @returns {Promise<string|null>}
     */
    fetchLeagueTransferHistory(country, division, group, season) {
      return _getHtml(`/history/league/${country}/${division}/${group}/transfers/${season}/`);
    }
  };

  // src/services/quickmatch.js
  var TmQuickmatchService = {
    fetchRankings(show2 = "national") {
      return _post("/ajax/quickmatch_get_content.ajax.php", { show: show2 });
    },
    queue(type, opponent = null) {
      const payload = { type };
      if (opponent !== null && opponent !== void 0 && opponent !== "") payload.opponent = opponent;
      return _post("/ajax/quickmatch_queue.ajax.php", payload);
    },
    waitForMatch() {
      return _post("/ajax/quickmatch_queue.ajax.php", { type: "wait" });
    },
    sendChallenge(clubId, clubName) {
      return _post("/ajax/quickmatch_challenge.ajax.php", {
        type: "challenge",
        club_id: clubId,
        club_name: clubName
      });
    },
    acceptChallenge(id) {
      return _post("/ajax/quickmatch_challenge.ajax.php", { type: "accept", id });
    },
    cancelChallenge(id) {
      return _post("/ajax/quickmatch_challenge.ajax.php", { type: "cancel", id });
    },
    rejectChallenge(id) {
      return _post("/ajax/quickmatch_challenge.ajax.php", { type: "reject", id });
    }
  };

  // src/services/scouts.js
  var TmScoutsService = {
    fetchReports() {
      return _post("/ajax/scouts_get_reports.ajax.php", {});
    }
  };

  // src/services/shortlist.js
  var TmShortlistService = {
    /**
     * Fetch a shortlist page and return the parsed players_ar array.
     * @param {number} [start] â€” page offset (omit for first/random page)
     * @returns {Promise<Array>}
     */
    async fetchShortlistPage(start) {
      const url = start != null ? `/shortlist/?start=${start}` : "/shortlist/";
      const html = await _getHtml(url);
      if (!html) return [];
      const m = html.match(/var\s+players_ar\s*=\s*(\[[\s\S]*?\]);/);
      if (!m) return [];
      try {
        return JSON.parse(m[1]);
      } catch (e) {
        return [];
      }
    }
  };

  // src/services/training.js
  var TRAINING_SKILL_NAMES = {
    strength: "Strength",
    stamina: "Stamina",
    pace: "Pace",
    marking: "Marking",
    tackling: "Tackling",
    workrate: "Workrate",
    positioning: "Positioning",
    passing: "Passing",
    crossing: "Crossing",
    technique: "Technique",
    heading: "Heading",
    finishing: "Finishing",
    longshots: "Longshots",
    set_pieces: "Set Pieces"
  };
  var TmTrainingService = {
    fetchPlayerTraining(playerId) {
      return _post("/ajax/players_get_info.ajax.php", {
        player_id: playerId,
        type: "training",
        show_non_pro_graphs: true
      });
    },
    adaptSquadTraining(player) {
      const isGK = String((player == null ? void 0 : player.favposition) || "").split(",")[0].trim().toLowerCase() === "gk";
      if (isGK) return { custom: { gk: true } };
      const customStr = String((player == null ? void 0 : player.training_custom) || "");
      const isCustom = customStr.length === 6;
      const custom = {};
      for (let index = 0; index < 6; index++) {
        custom[`team${index + 1}`] = {
          points: isCustom ? parseInt(customStr[index], 10) || 0 : 0,
          skills: [],
          label: TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`
        };
      }
      custom.points_spend = 0;
      return {
        custom: {
          gk: false,
          custom_on: isCustom ? 1 : 0,
          team: String((player == null ? void 0 : player.training) || "3"),
          custom
        }
      };
    },
    normalizeTrainingState(data) {
      const custom = data == null ? void 0 : data.custom;
      if (!custom || custom.gk) {
        return {
          isGK: true,
          customOn: false,
          currentType: "",
          maxPool: 0,
          totalAllocated: 0,
          remaining: 0,
          teams: [],
          modeLabel: "Goalkeeper",
          typeLabel: "Automatic",
          dots: ""
        };
      }
      const customData = custom.custom || {};
      const teams = Array.from({ length: 6 }, (_, index) => {
        const team = customData[`team${index + 1}`] || {};
        return {
          num: index + 1,
          label: team.label || TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`,
          points: parseInt(team.points, 10) || 0,
          skills: Array.isArray(team.skills) ? team.skills : [],
          skillLabels: Array.isArray(team.skills) ? team.skills.map((skill) => TRAINING_SKILL_NAMES[skill] || skill) : []
        };
      });
      const totalAllocated = teams.reduce((sum, team) => sum + team.points, 0);
      const pointsSpend = parseInt(customData.points_spend, 10) || 0;
      const maxPool = Math.max(totalAllocated + pointsSpend, totalAllocated, 10);
      const currentType = String(custom.team || "3");
      const customOn = Boolean(custom.custom_on);
      return {
        isGK: false,
        customOn,
        currentType,
        maxPool,
        totalAllocated,
        remaining: Math.max(0, maxPool - totalAllocated),
        teams,
        modeLabel: customOn ? "Custom" : "Standard",
        typeLabel: TmConst.TRAINING_NAMES[currentType] || "Unknown",
        dots: teams.map((team) => team.points).join("")
      };
    },
    buildCustomTrainingPayload(playerId, trainingState) {
      const payload = {
        type: "custom",
        on: 1,
        player_id: playerId,
        "custom[points_spend]": 0,
        "custom[player_id]": playerId,
        "custom[saved]": ""
      };
      ((trainingState == null ? void 0 : trainingState.teams) || []).forEach((team, index) => {
        const key = `custom[team${index + 1}]`;
        payload[`${key}[num]`] = index + 1;
        payload[`${key}[label]`] = team.label || TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`;
        payload[`${key}[points]`] = parseInt(team.points, 10) || 0;
        payload[`${key}[skills][]`] = team.skills || [];
      });
      return payload;
    },
    /**
     * Save a custom training plan.
     * The caller is responsible for building the full training_post payload.
     * @param {object} data â€” fully-formed training_post payload
     * @returns {Promise<void>}
     */
    async saveTraining(data) {
      await _post("/ajax/training_post.ajax.php", data);
    },
    /**
     * Save the training type / position group for a player.
     * @param {string|number} playerId
     * @param {string|number} teamId
     * @returns {Promise<void>}
     */
    async saveTrainingType(playerId, teamId) {
      await _post("/ajax/training_post.ajax.php", {
        type: "player_pos",
        player_id: playerId,
        team_id: teamId
      });
    }
  };

  // src/services/messages.js
  var TmMessagesService = {
    async fetchTopUserInfo() {
      return _post("/ajax/top_user_info.ajax.php", { type: "get" });
    },
    async fetchPmMessages(place = "inbox") {
      return _post("/ajax/pm_get_messages.ajax.php", { place });
    },
    async fetchPmMessageText(id, conversationId = "0") {
      return _post("/ajax/pm_get_message_text.ajax.php", {
        id,
        conversation_id: conversationId
      });
    },
    async sendPmMessage({ recipient, subject, message, conversationId = "0", clubId = "" } = {}) {
      return _post("/ajax/pm_send_message.ajax.php", {
        recipient,
        subject,
        message,
        conversation_id: conversationId,
        club_id: clubId
      });
    }
  };

  // src/services/youth.js
  var YOUTH_OUTFIELD_FIELDS = {
    strength: "strength",
    stamina: "stamina",
    pace: "pace",
    marking: "marking",
    tackling: "tackling",
    workrate: "workrate",
    positioning: "positioning",
    passing: "passing",
    crossing: "crossing",
    technique: "technique",
    heading: "heading",
    finishing: "finishing",
    longshots: "longshots",
    setpieces: "set_pieces"
  };
  var YOUTH_GK_FIELDS = {
    strength: "strength",
    pace: "pace",
    jumping: "jumping",
    stamina: "stamina",
    oneonones: "one_on_ones",
    reflexes: "reflexes",
    aerial: "aerial_ability",
    communication: "communication",
    kicking: "kicking",
    throwing: "throwing",
    handling: "handling"
  };
  var cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();
  var TmYouthService = {
    parseSkillValue(value) {
      if (Number.isFinite(value)) return Number(value);
      const text = String(value || "");
      const attrMatch = text.match(/(?:title|alt)=['"]?(\d{1,2})/i);
      if (attrMatch) return Number(attrMatch[1]);
      const plainMatch = cleanText(text).match(/\d+/);
      return plainMatch ? Number(plainMatch[0]) : null;
    },
    estimateASI(skillValues, isGK) {
      const values = skillValues.filter(Number.isFinite);
      if (!values.length) return 0;
      const weight = isGK ? TmConst.ASI_WEIGHT_GK : TmConst.ASI_WEIGHT_OUTFIELD;
      const integerSum = values.reduce((sum, value) => sum + value, 0);
      const nonMax = values.filter((value) => value < 20).length;
      const assumedRemainder = Math.min(nonMax * 0.35, isGK ? 4.2 : 5.4);
      const totalPoints = integerSum + assumedRemainder;
      return totalPoints > 0 ? Math.round(Math.pow(totalPoints, 7) / weight) : 0;
    },
    buildRawYouthPlayer(player, index) {
      var _a;
      if (!player || typeof player !== "object") return null;
      const id = Number.parseInt(player.id || player.player_id, 10);
      const favposition = String(player.favposition || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).join(",");
      const primaryPos = favposition.split(",")[0] || "";
      const isGK = primaryPos === "gk";
      const fieldMap = isGK ? YOUTH_GK_FIELDS : YOUTH_OUTFIELD_FIELDS;
      const rawPlayer = {
        id,
        player_id: id,
        name: cleanText(player.player_name || player.name || `Youth Player ${index + 1}`),
        player_name: cleanText(player.player_name || player.name || `Youth Player ${index + 1}`),
        favposition,
        age: Number(player.age) || 0,
        month: 0,
        months: 0,
        wage: Number(player.wage) || 0,
        routine: 0,
        rutine: 0,
        club_id: ((_a = window.SESSION) == null ? void 0 : _a.main_id) || null,
        youthRecommendationHtml: String(player.rec_stars || ""),
        youthPotential: Number(player.potential) || null,
        youthFee: Number(player.fee) || 0
      };
      const skillValues = [];
      Object.entries(fieldMap).forEach(([sourceKey, targetKey]) => {
        const value = this.parseSkillValue(player[sourceKey]);
        if (!Number.isFinite(value)) return;
        rawPlayer[targetKey] = value;
        skillValues.push(value);
      });
      if (!skillValues.length) return null;
      const estimatedASI = this.estimateASI(skillValues, isGK);
      rawPlayer.asi = estimatedASI;
      rawPlayer.skill_index = estimatedASI;
      return rawPlayer;
    },
    normalizeYouthPlayer(player, index, { skipSync = true } = {}) {
      const rawPlayer = this.buildRawYouthPlayer(player, index);
      if (!rawPlayer) return null;
      const DBPlayer = skipSync ? null : TmPlayerDB.get(rawPlayer.id);
      const normalized = TmPlayerService.normalizePlayer(rawPlayer, DBPlayer, { skipSync });
      normalized.youthRecommendationHtml = rawPlayer.youthRecommendationHtml;
      normalized.youthPotential = rawPlayer.youthPotential;
      normalized.youthFee = rawPlayer.youthFee;
      return normalized;
    },
    normalizeYouthPlayers(players, { skipSync = true, reverse = true } = {}) {
      const normalized = (Array.isArray(players) ? players : []).map((player, index) => this.normalizeYouthPlayer(player, index, { skipSync })).filter(Boolean);
      return reverse ? normalized.reverse() : normalized;
    },
    async fetchYouthPlayers(options = {}) {
      const { skipSync = true } = options;
      return _dedup(`youth:players:${skipSync ? "nosync" : "sync"}`, async () => {
        const data = await _post("/ajax/youth.ajax.php", { type: "get" });
        if (!data || !Array.isArray(data.players)) return null;
        return {
          ...data,
          cash: Number(data.cash) || 0,
          squad_size: Number(data.squad_size) || data.players.length,
          players: this.normalizeYouthPlayers(data.players, { skipSync, reverse: true })
        };
      });
    },
    async fetchNewYouthPlayers({ age, position, skipSync = true } = {}) {
      const data = await _post("/ajax/youth.ajax.php", { type: "new", age, position });
      if (!data) return null;
      if (data.error) {
        return { error: String(data.error) };
      }
      const players = Object.values(data).filter((player) => player && typeof player === "object" && (player.id || player.player_id));
      return {
        players: this.normalizeYouthPlayers(players, { skipSync, reverse: true })
      };
    },
    actOnYouthPlayer({ playerId, action }) {
      return _post("/ajax/youth.ajax.php", {
        type: "act",
        player_id: playerId,
        action
      });
    }
  };

  // src/services/index.js
  var TmApi2 = {
    ...TmApiEngine,
    ...TmClubService,
    ...TmMatchService,
    ...TmPlayerService,
    ...TmTransferService,
    ...TMLeagueService,
    ...TmQuickmatchService,
    ...TmScoutsService,
    ...TmShortlistService,
    ...TmTrainingService,
    ...TmMessagesService,
    ...TmYouthService
  };

  // src/components/shared/tm-app-shell-pm.js
  var STYLE_ID2 = "tmvu-shell-pm-styles";
  function cleanText2(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function escapeHtml4(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  var buttonHtml3 = (opts) => TmUI.button(opts).outerHTML;
  function injectStyles() {
    if (document.getElementById(STYLE_ID2)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID2;
    style.textContent = `
        .tmvu-pm-wrap {
            position: relative;
        }

        .tmvu-metric-icon-mail::before {
            left: 1px;
            top: 2px;
            width: 10px;
            height: 7px;
            background: transparent;
            border: 1px solid currentColor;
            border-radius: 1px;
        }

        .tmvu-metric-icon-mail::after {
            left: 2px;
            top: 3px;
            width: 8px;
            height: 4px;
            background: transparent;
            border-left: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            transform: skewY(-28deg) rotate(-45deg);
            transform-origin: left top;
        }

        .tmvu-metric-button {
            cursor: pointer;
            position: relative;
        }

        .tmvu-metric-button:hover,
        .tmvu-pm-wrap.is-open .tmvu-metric-button {
            background: rgba(108, 192, 64, 0.14);
            border-color: rgba(157, 188, 113, 0.52);
        }

        .tmvu-pm-menu[hidden] {
            display: none !important;
        }

        .tmvu-pm-menu {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: min(360px, calc(100vw - 24px));
            max-height: 420px;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(61, 104, 40, 0.6);
            background: linear-gradient(180deg, rgba(24, 47, 14, 0.98), rgba(17, 34, 10, 0.98));
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.34);
            z-index: 10020;
        }

        .tmvu-pm-menu-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 12px 10px;
            border-bottom: 1px solid rgba(61, 104, 40, 0.34);
        }

        .tmvu-pm-menu-head strong {
            display: block;
            font-size: 13px;
            color: #f1f7ed;
        }

        .tmvu-pm-menu-head span {
            display: block;
            margin-top: 3px;
            font-size: 11px;
            color: rgba(231, 238, 230, 0.66);
        }

        .tmvu-pm-compose {
            white-space: nowrap;
        }

        .tmvu-pm-list {
            overflow-y: auto;
            padding: 6px;
        }

        .tmvu-pm-menu-foot {
            padding: 0 12px 12px;
            border-top: 1px solid rgba(61, 104, 40, 0.18);
        }

        .tmvu-pm-view-all {
            width: 100%;
            justify-content: center;
            margin-top: 10px;
        }

        .tmvu-pm-placeholder {
            padding: 14px 10px;
            color: rgba(231, 238, 230, 0.68);
            font-size: 12px;
        }

        .tmvu-pm-item {
            width: 100%;
            display: block;
            text-align: left;
            padding: 10px;
            border: 1px solid transparent;
            border-bottom-color: rgba(61, 104, 40, 0.2);
            background: rgba(8, 16, 6, 0.14);
            cursor: pointer;
        }

        .tmvu-pm-item + .tmvu-pm-item {
            margin-top: 6px;
        }

        .tmvu-pm-item:hover {
            border-color: rgba(157, 188, 113, 0.24);
            background: rgba(108, 192, 64, 0.1);
        }

        .tmvu-pm-item.is-unread {
            border-color: rgba(157, 188, 113, 0.24);
            background: rgba(108, 192, 64, 0.08);
        }

        .tmvu-pm-item-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
        }

        .tmvu-pm-item-sender {
            font-size: 12px;
            color: #eef5e9;
        }

        .tmvu-pm-item-time {
            font-size: 10px;
            color: rgba(231, 238, 230, 0.56);
            white-space: nowrap;
        }

        .tmvu-pm-item-subject {
            margin-top: 4px;
            font-size: 12px;
            color: rgba(231, 238, 230, 0.8);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        body.tmvu-pm-dialog-open {
            overflow: hidden;
        }

        .tmvu-pm-dialog-overlay {
            position: fixed;
            inset: 0;
            z-index: 10060;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(5, 12, 4, 0.72);
            backdrop-filter: blur(4px);
        }

        .tmvu-pm-dialog {
            width: min(1120px, calc(100vw - 24px));
            max-height: calc(100vh - 24px);
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, #17300f, #0f2209 70%);
            border: 1px solid rgba(74, 144, 48, 0.72);
            box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
            color: #d9e7d1;
            overflow: hidden;
        }

        .tmvu-pm-dialog-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 18px 18px 12px;
            border-bottom: 1px solid rgba(61, 104, 40, 0.34);
        }

        .tmvu-pm-dialog-kicker {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(157, 188, 113, 0.72);
        }

        .tmvu-pm-dialog-title {
            margin: 4px 0 0;
            font-size: 20px;
            line-height: 1.15;
            color: #f0f6ec;
        }

        .tmvu-pm-dialog-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tmvu-pm-dialog-tabs {
            padding: 0 18px 0;
        }

        .tmvu-pm-dialog-tabs-bar {
            border-radius: 8px 8px 0 0;
        }

        .tmvu-pm-dialog-body {
            min-height: 0;
            flex: 1 1 auto;
            display: grid;
            grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
            gap: 0;
            border-top: 1px solid rgba(61, 104, 40, 0.3);
        }

        .tmvu-pm-dialog-list,
        .tmvu-pm-dialog-detail {
            min-height: 0;
            overflow-y: auto;
            padding: 14px;
        }

        .tmvu-pm-dialog-list {
            border-right: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(13, 26, 8, 0.32);
        }

        .tmvu-pm-dialog-row {
            width: 100%;
            display: block;
            text-align: left;
            padding: 11px 12px;
            margin-bottom: 8px;
            background: rgba(8, 16, 6, 0.18);
            border: 1px solid rgba(61, 104, 40, 0.2);
            color: inherit;
            cursor: pointer;
        }

        .tmvu-pm-dialog-row:hover,
        .tmvu-pm-dialog-row.is-active {
            border-color: rgba(157, 188, 113, 0.36);
            background: rgba(108, 192, 64, 0.12);
        }

        .tmvu-pm-dialog-row.is-unread {
            border-left: 3px solid #8ebc64;
            padding-left: 10px;
        }

        .tmvu-pm-dialog-row-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
        }

        .tmvu-pm-dialog-row-sender {
            color: #edf5e8;
            font-size: 12px;
        }

        .tmvu-pm-dialog-row-time {
            color: rgba(231, 238, 230, 0.56);
            font-size: 10px;
            white-space: nowrap;
        }

        .tmvu-pm-dialog-row-subject {
            margin-top: 5px;
            color: rgba(231, 238, 230, 0.82);
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-pm-thread-item {
            padding: 14px 16px;
            background: rgba(8, 16, 6, 0.18);
            border: 1px solid rgba(61, 104, 40, 0.22);
        }

        .tmvu-pm-thread-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
        }

        .tmvu-pm-thread-action {
            flex: 0 0 auto;
        }

        .tmvu-pm-thread-list {
            display: flex;
            flex-direction: column;
        }

        .tmvu-pm-reply-box {
            margin-top: 14px;
            padding: 14px;
            background: rgba(8, 16, 6, 0.2);
            border: 1px solid rgba(61, 104, 40, 0.22);
        }

        .tmvu-pm-reply-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
        }

        .tmvu-pm-reply-head strong {
            color: #eef5e9;
            font-size: 12px;
        }

        .tmvu-pm-reply-head span {
            color: rgba(231, 238, 230, 0.58);
            font-size: 11px;
        }

        .tmvu-pm-reply-textarea {
            width: 100%;
            min-height: 118px;
            resize: vertical;
            padding: 10px 12px;
            border: 1px solid rgba(61, 104, 40, 0.34);
            background: rgba(12, 25, 8, 0.92);
            color: #edf5e8;
            font: inherit;
            line-height: 1.55;
        }

        .tmvu-pm-reply-textarea:focus {
            outline: none;
            border-color: rgba(142, 188, 100, 0.62);
            box-shadow: 0 0 0 1px rgba(142, 188, 100, 0.16);
        }

        .tmvu-pm-reply-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 10px;
        }

        .tmvu-pm-reply-status {
            min-height: 18px;
            color: rgba(231, 238, 230, 0.58);
            font-size: 11px;
        }

        .tmvu-pm-reply-status.is-error {
            color: #f29a9a;
        }

        .tmvu-pm-reply-status.is-success {
            color: #a8d68c;
        }

        .tmvu-pm-reply-status.is-muted {
            color: rgba(231, 238, 230, 0.58);
        }

        .tmvu-pm-thread-item + .tmvu-pm-thread-item {
            margin-top: 12px;
        }

        .tmvu-pm-thread-item.is-own {
            background: rgba(108, 192, 64, 0.1);
            border-color: rgba(142, 188, 100, 0.32);
        }

        .tmvu-pm-thread-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 10px;
        }

        .tmvu-pm-thread-sender {
            color: #f2f7ef;
            font-size: 13px;
        }

        .tmvu-pm-thread-time {
            color: rgba(231, 238, 230, 0.58);
            font-size: 11px;
        }

        .tmvu-pm-thread-body {
            color: rgba(231, 238, 230, 0.88);
            font-size: 13px;
            line-height: 1.6;
            word-break: break-word;
        }

        .tmvu-pm-thread-body a {
            color: #cde8a6;
        }

        .tmvu-pm-thread-body img {
            vertical-align: middle;
        }

        @media (max-width: 760px) {
            .tmvu-pm-menu {
                right: -6px;
                width: min(320px, calc(100vw - 16px));
            }

            .tmvu-pm-dialog-overlay {
                padding: 10px;
            }

            .tmvu-pm-dialog {
                width: calc(100vw - 12px);
                max-height: calc(100vh - 12px);
            }

            .tmvu-pm-dialog-head {
                flex-direction: column;
                align-items: stretch;
            }

            .tmvu-pm-dialog-actions {
                justify-content: flex-end;
            }

            .tmvu-pm-dialog-body {
                grid-template-columns: 1fr;
            }

            .tmvu-pm-dialog-list {
                max-height: 38vh;
                border-right: none;
                border-bottom: 1px solid rgba(61, 104, 40, 0.26);
            }

            .tmvu-pm-reply-head,
            .tmvu-pm-reply-foot {
                flex-direction: column;
                align-items: stretch;
            }
        }
    `;
    document.head.appendChild(style);
  }
  function getTopUserInfoPmCount(topUserInfo, fallback = 0) {
    const count = Number(topUserInfo == null ? void 0 : topUserInfo.new_pms);
    return Number.isFinite(count) && count >= 0 ? count : fallback;
  }
  function getConversationKey(message) {
    const conversationId = cleanText2(message == null ? void 0 : message.conversation_id);
    if (conversationId && conversationId !== "0") return conversationId;
    return cleanText2(message == null ? void 0 : message.id);
  }
  function isUnreadMessage(message) {
    const status = cleanText2(message == null ? void 0 : message.status).toLowerCase();
    const messageStatus = cleanText2(message == null ? void 0 : message.m_status);
    if (status) return status !== "read";
    return messageStatus === "0";
  }
  function normalizePmConversationItems(payload) {
    const messages = Array.isArray(payload == null ? void 0 : payload.messages) ? payload.messages : [];
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    for (const message of messages) {
      const key = getConversationKey(message);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: cleanText2(message == null ? void 0 : message.id),
        conversationId: key,
        senderName: cleanText2(message == null ? void 0 : message.sender_name) || "Unknown sender",
        subject: cleanText2(message == null ? void 0 : message.subject) || "(No subject)",
        time: cleanText2(message == null ? void 0 : message.time),
        longTime: cleanText2((message == null ? void 0 : message.long_time) || (message == null ? void 0 : message.time)),
        unread: isUnreadMessage(message)
      });
      if (items.length >= 5) break;
    }
    return items;
  }
  function normalizePmFolderItems(payload, place = "inbox") {
    const messages = Array.isArray(payload == null ? void 0 : payload.messages) ? payload.messages : [];
    return messages.map((message) => ({
      id: cleanText2(message == null ? void 0 : message.id),
      conversationId: getConversationKey(message) || "0",
      senderName: cleanText2(message == null ? void 0 : message.sender_name) || "Unknown sender",
      recipientName: cleanText2(message == null ? void 0 : message.recipient_name) || "",
      subject: cleanText2(message == null ? void 0 : message.subject) || "(No subject)",
      time: cleanText2(message == null ? void 0 : message.time),
      longTime: cleanText2((message == null ? void 0 : message.long_time) || (message == null ? void 0 : message.time)),
      unread: isUnreadMessage(message),
      place: cleanText2(message == null ? void 0 : message.place) || place
    }));
  }
  function normalizePmThreadItems(payload) {
    const conversation = Array.isArray(payload == null ? void 0 : payload.conversation) ? payload.conversation : [];
    return [...conversation].reverse().map((message) => ({
      id: cleanText2(message == null ? void 0 : message.id),
      conversationId: cleanText2(message == null ? void 0 : message.conversation_id) || "0",
      senderName: cleanText2(message == null ? void 0 : message.sender_name) || "Unknown sender",
      senderId: cleanText2(message == null ? void 0 : message.sender_id),
      recipientName: cleanText2(message == null ? void 0 : message.recipient_name),
      recipientId: cleanText2(message == null ? void 0 : message.recipient_id),
      subject: cleanText2((message == null ? void 0 : message.subject_text) || (message == null ? void 0 : message.subject)) || "(No subject)",
      time: cleanText2(message == null ? void 0 : message.time),
      longTime: cleanText2((message == null ? void 0 : message.long_time) || (message == null ? void 0 : message.time)),
      messageHtml: String((message == null ? void 0 : message.message) || "").trim(),
      messageText: cleanText2(message == null ? void 0 : message.message_text)
    }));
  }
  function getPmThreadCacheKey(item) {
    const id = cleanText2(item == null ? void 0 : item.id);
    const conversationId = cleanText2(item == null ? void 0 : item.conversationId) || "0";
    return `${id}:${conversationId}`;
  }
  function renderPmDialogListItems(items = []) {
    if (!items.length) return TmUI.empty("No messages in this folder.");
    return items.map((item) => {
      const sender = escapeHtml4(item.senderName || "Unknown sender");
      const subject = escapeHtml4(item.subject || "(No subject)");
      const time = escapeHtml4(item.time || "");
      const longTime = escapeHtml4(item.longTime || item.time || "");
      const unreadClass = item.unread ? " is-unread" : "";
      return `
            <button
                class="tmvu-pm-dialog-row${unreadClass}"
                type="button"
                data-pm-dialog-item
                data-pm-id="${escapeHtml4(item.id || "")}"
                data-pm-conversation-id="${escapeHtml4(item.conversationId || "0")}"
            >
                <div class="tmvu-pm-dialog-row-head">
                    <strong class="tmvu-pm-dialog-row-sender">${sender}</strong>
                    <span class="tmvu-pm-dialog-row-time" title="${longTime}">${time}</span>
                </div>
                <div class="tmvu-pm-dialog-row-subject" title="${subject}">${subject}</div>
            </button>
        `;
    }).join("");
  }
  function renderPmThreadHtml(items = [], currentClubId = "") {
    if (!items.length) return TmUI.empty("No conversation loaded.");
    return items.map((item) => {
      const isOwn = currentClubId && cleanText2(item.senderId) === currentClubId;
      const bodyHtml = item.messageHtml || `<div>${escapeHtml4(item.messageText || "")}</div>`;
      const displayTime = escapeHtml4(item.longTime || item.time || "");
      return `
            <article class="tmvu-pm-thread-item${isOwn ? " is-own" : ""}">
                <header class="tmvu-pm-thread-head">
                    <strong class="tmvu-pm-thread-sender">${escapeHtml4(item.senderName || "Unknown sender")}</strong>
                    <span class="tmvu-pm-thread-time" title="${displayTime}">${displayTime}</span>
                </header>
                <div class="tmvu-pm-thread-body">${bodyHtml}</div>
            </article>
        `;
    }).join("");
  }
  function renderPmThreadActionsHtml() {
    return `
        <div class="tmvu-pm-thread-actions">
            ${buttonHtml3({ label: "Forward", color: "secondary", size: "sm", cls: "tmvu-pm-thread-action", attrs: { "data-pm-thread-action": "forward" } })}
            ${buttonHtml3({ label: "Trash", color: "secondary", size: "sm", cls: "tmvu-pm-thread-action", attrs: { "data-pm-thread-action": "trash" } })}
            ${buttonHtml3({ label: "Mark as unread", color: "secondary", size: "sm", cls: "tmvu-pm-thread-action", attrs: { "data-pm-thread-action": "unread" } })}
            ${buttonHtml3({ label: "Close", color: "secondary", size: "sm", cls: "tmvu-pm-thread-action", attrs: { "data-pm-thread-action": "close" } })}
        </div>
    `;
  }
  function renderPmReplyComposerHtml(replyMeta = null) {
    if (!replyMeta) return "";
    return `
        <div class="tmvu-pm-reply-box" data-pm-reply-box>
            <div class="tmvu-pm-reply-head">
                <strong>Reply to ${escapeHtml4(replyMeta.recipientName || "manager")}</strong>
                <span>${escapeHtml4(replyMeta.subject || "")}</span>
            </div>
            <textarea
                class="tmvu-pm-reply-textarea"
                data-pm-reply-text
                placeholder="Write your reply..."
                rows="5"
            ></textarea>
            <div class="tmvu-pm-reply-foot">
                <div class="tmvu-pm-reply-status" data-pm-reply-status></div>
                ${buttonHtml3({ label: "Send Reply", color: "primary", size: "sm", cls: "tmvu-pm-reply-send", attrs: { "data-pm-reply-send": "1" } })}
            </div>
        </div>
    `;
  }
  function renderPmThreadPanelHtml(items = [], currentClubId = "", replyMeta = null) {
    return `
        ${renderPmThreadActionsHtml()}
        <div class="tmvu-pm-thread-list">
            ${renderPmThreadHtml(items, currentClubId)}
        </div>
        ${renderPmReplyComposerHtml(replyMeta)}
    `;
  }
  function getPmReplyMeta(thread = [], selectedItem = null, currentClubId = "") {
    var _a, _b;
    if (!Array.isArray(thread) || !thread.length) return null;
    const counterpart = thread.find((item) => cleanText2(item.senderId) !== currentClubId) || thread.find((item) => cleanText2(item.recipientId) !== currentClubId) || thread[thread.length - 1];
    const recipientName = cleanText2(counterpart == null ? void 0 : counterpart.senderId) === currentClubId ? cleanText2(counterpart == null ? void 0 : counterpart.recipientName) : cleanText2(counterpart == null ? void 0 : counterpart.senderName);
    const recipientId = cleanText2(counterpart == null ? void 0 : counterpart.senderId) === currentClubId ? cleanText2(counterpart == null ? void 0 : counterpart.recipientId) : cleanText2(counterpart == null ? void 0 : counterpart.senderId);
    const subjectBase = cleanText2((selectedItem == null ? void 0 : selectedItem.subject) || ((_a = thread[thread.length - 1]) == null ? void 0 : _a.subject) || "");
    const subject = /^re:/i.test(subjectBase) ? subjectBase : `re: ${subjectBase}`;
    const conversationId = cleanText2(selectedItem == null ? void 0 : selectedItem.conversationId) && cleanText2(selectedItem == null ? void 0 : selectedItem.conversationId) !== "0" ? cleanText2(selectedItem == null ? void 0 : selectedItem.conversationId) : cleanText2((selectedItem == null ? void 0 : selectedItem.id) || ((_b = thread[thread.length - 1]) == null ? void 0 : _b.id));
    if (!recipientName || !recipientId || !subject) return null;
    return {
      recipientName,
      recipientId,
      subject,
      conversationId: conversationId || "0"
    };
  }
  function syncPmMainHost(dialog, selectedItem, thread = []) {
    if (!(dialog == null ? void 0 : dialog.pmMainEl)) return;
    const safeSelected = selectedItem || {};
    dialog.pmMainEl.innerHTML = `
        <input type="hidden" name="id" value="${escapeHtml4(safeSelected.id || "")}">
        <input type="hidden" name="conversation_id" value="${escapeHtml4(safeSelected.conversationId || "0")}">
        <input type="hidden" name="subject" value="${escapeHtml4(safeSelected.subject || "")}">
        ${thread.map((item) => `
            <article
                class="tmvu-pm-native-item"
                data-message-id="${escapeHtml4(item.id || "")}"
                data-conversation-id="${escapeHtml4(item.conversationId || "0")}"
                data-sender-id="${escapeHtml4(item.senderId || "")}"
                data-recipient-id="${escapeHtml4(item.recipientId || "")}"
            >
                <div class="tmvu-pm-native-subject">${escapeHtml4(item.subject || "")}</div>
                <div class="tmvu-pm-native-message">${item.messageHtml || escapeHtml4(item.messageText || "")}</div>
            </article>
        `).join("")}
    `;
  }
  function setPmListPlaceholder(pmState, copy) {
    if (!(pmState == null ? void 0 : pmState.listEl)) return;
    pmState.listEl.innerHTML = TmAppShellHeader.renderPmPlaceholder(copy);
  }
  function setPmListItems(pmState, items) {
    if (!(pmState == null ? void 0 : pmState.listEl)) return;
    pmState.listEl.innerHTML = TmAppShellHeader.renderPmItems(items);
  }
  function setPmDialogListHtml(pmState, html) {
    var _a;
    if (!((_a = pmState == null ? void 0 : pmState.dialog) == null ? void 0 : _a.listEl)) return;
    pmState.dialog.listEl.innerHTML = html;
  }
  function setPmDialogDetailHtml(pmState, html) {
    var _a;
    if (!((_a = pmState == null ? void 0 : pmState.dialog) == null ? void 0 : _a.detailEl)) return;
    pmState.dialog.detailEl.innerHTML = html;
  }
  function setPmReplyStatus(pmState, copy = "", tone = "") {
    var _a, _b;
    const statusEl = (_b = (_a = pmState == null ? void 0 : pmState.dialog) == null ? void 0 : _a.detailEl) == null ? void 0 : _b.querySelector("[data-pm-reply-status]");
    if (!statusEl) return;
    statusEl.textContent = copy;
    statusEl.className = `tmvu-pm-reply-status${tone ? ` is-${tone}` : ""}`;
  }
  function setPmDialogTitle(pmState, title) {
    var _a;
    if (!((_a = pmState == null ? void 0 : pmState.dialog) == null ? void 0 : _a.titleEl)) return;
    pmState.dialog.titleEl.textContent = title || "Messages";
  }
  function highlightPmDialogSelection(pmState, item) {
    var _a;
    if (!((_a = pmState == null ? void 0 : pmState.dialog) == null ? void 0 : _a.listEl)) return;
    const selectedKey = getPmThreadCacheKey(item);
    pmState.dialog.listEl.querySelectorAll("[data-pm-dialog-item]").forEach((button) => {
      const buttonKey = `${button.getAttribute("data-pm-id") || ""}:${button.getAttribute("data-pm-conversation-id") || "0"}`;
      button.classList.toggle("is-active", buttonKey === selectedKey);
    });
  }
  function closePmDialog(pmState) {
    var _a;
    const overlayEl = (_a = pmState == null ? void 0 : pmState.dialog) == null ? void 0 : _a.overlayEl;
    if (!overlayEl) return;
    overlayEl.hidden = true;
    document.body.classList.remove("tmvu-pm-dialog-open");
  }
  function invalidatePmDialogCaches(pmState, places = []) {
    const dialog = pmState == null ? void 0 : pmState.dialog;
    if (!dialog) return;
    places.forEach((place) => dialog.listCache.delete(place));
  }
  function openPmMenu(pmState) {
    var _a;
    if (!(pmState == null ? void 0 : pmState.menuEl) || !(pmState == null ? void 0 : pmState.triggerEl)) return;
    pmState.isOpen = true;
    (_a = pmState.rootEl) == null ? void 0 : _a.classList.add("is-open");
    pmState.menuEl.hidden = false;
    pmState.triggerEl.setAttribute("aria-expanded", "true");
  }
  function closePmMenu(pmState) {
    var _a;
    if (!(pmState == null ? void 0 : pmState.menuEl) || !(pmState == null ? void 0 : pmState.triggerEl)) return;
    pmState.isOpen = false;
    (_a = pmState.rootEl) == null ? void 0 : _a.classList.remove("is-open");
    pmState.menuEl.hidden = true;
    pmState.triggerEl.setAttribute("aria-expanded", "false");
  }
  function executePmThreadAction(pmState, action) {
    var _a;
    const dialog = pmState == null ? void 0 : pmState.dialog;
    if (!dialog) return;
    if (action === "close") {
      closePmDialog(pmState);
      return;
    }
    if (action === "forward") {
      if (typeof window.pm_new === "function") {
        window.pm_new("#pm_main", action);
        return;
      }
      window.location.assign("/pm/");
      return;
    }
    if ((action === "trash" || action === "unread") && typeof window.pm_set_status === "function") {
      window.pm_set_status("#pm_main", 0, action);
      if ((_a = window.modal) == null ? void 0 : _a.hide) window.modal.hide();
      invalidatePmDialogCaches(pmState, ["inbox", "trash"]);
      closePmDialog(pmState);
    }
  }
  async function submitPmReply(pmState) {
    var _a, _b;
    const dialog = pmState == null ? void 0 : pmState.dialog;
    const replyMeta = dialog == null ? void 0 : dialog.replyMeta;
    const textarea = (_a = dialog == null ? void 0 : dialog.detailEl) == null ? void 0 : _a.querySelector("[data-pm-reply-text]");
    if (!dialog || !replyMeta || !textarea) return;
    const message = textarea.value.trim();
    if (!message) {
      setPmReplyStatus(pmState, "Message is required.", "error");
      textarea.focus();
      return;
    }
    const sendButton = dialog.detailEl.querySelector("[data-pm-reply-send]");
    if (sendButton) sendButton.disabled = true;
    textarea.disabled = true;
    setPmReplyStatus(pmState, "Sending reply...", "muted");
    const response = await TmApi2.sendPmMessage({
      recipient: replyMeta.recipientName,
      subject: replyMeta.subject,
      message,
      conversationId: replyMeta.conversationId,
      clubId: cleanText2(((_b = window.SESSION) == null ? void 0 : _b.id) || pmState.clubId || "")
    });
    if (sendButton) sendButton.disabled = false;
    textarea.disabled = false;
    if (!response) {
      setPmReplyStatus(pmState, "An error occurred while sending the message.", "error");
      return;
    }
    if (response.refresh) {
      if (typeof window.page_refresh === "function") {
        window.page_refresh();
        return;
      }
      window.location.reload();
      return;
    }
    if (Number(response.banned) > 0) {
      setPmReplyStatus(pmState, "You are not allowed to send PMs.", "error");
      return;
    }
    setPmReplyStatus(pmState, "Message sent.", "success");
    textarea.value = "";
    invalidatePmDialogCaches(pmState, ["inbox", "sent", "trash"]);
    const selectedItem = dialog.selectedItem ? {
      ...dialog.selectedItem,
      conversationId: dialog.selectedItem.conversationId && dialog.selectedItem.conversationId !== "0" ? dialog.selectedItem.conversationId : replyMeta.conversationId || dialog.selectedItem.id || "0"
    } : null;
    if (selectedItem) {
      dialog.selectedItem = selectedItem;
      dialog.detailCache.delete(getPmThreadCacheKey(selectedItem));
      await loadPmDialogFolder(pmState, dialog.activePlace, selectedItem);
      setPmReplyStatus(pmState, "Message sent.", "success");
    }
  }
  function ensurePmDialog(pmState) {
    var _a;
    if (!pmState) return null;
    if ((_a = pmState.dialog) == null ? void 0 : _a.overlayEl) return pmState.dialog;
    const overlayEl = document.createElement("div");
    overlayEl.className = "tmvu-pm-dialog-overlay";
    overlayEl.hidden = true;
    overlayEl.innerHTML = `
        <div class="tmvu-pm-dialog" role="dialog" aria-modal="true" aria-labelledby="tmvu-pm-dialog-title">
            <div class="tmvu-pm-dialog-head">
                <div>
                    <div class="tmvu-pm-dialog-kicker">Messages</div>
                    <h2 class="tmvu-pm-dialog-title" id="tmvu-pm-dialog-title">Messages</h2>
                </div>
                <div class="tmvu-pm-dialog-actions" data-pm-dialog-actions></div>
            </div>
            <div class="tmvu-pm-dialog-tabs" data-pm-dialog-tabs></div>
            <div class="tmvu-pm-dialog-body">
                <aside class="tmvu-pm-dialog-list" data-pm-dialog-list>${TmUI.loading("Loading messages...")}</aside>
                <section class="tmvu-pm-dialog-detail" data-pm-dialog-detail>${TmUI.empty("Select a conversation to read.")}</section>
            </div>
            <div id="pm_main" class="tmvu-pm-native-host" hidden></div>
        </div>
    `;
    document.body.appendChild(overlayEl);
    const actionsEl = overlayEl.querySelector("[data-pm-dialog-actions]");
    const composeBtn = TmUI.button({ label: "New Message", color: "secondary", size: "sm", cls: "tmvu-pm-dialog-compose" });
    const closeBtn = TmUI.button({ label: "Close", color: "secondary", size: "sm", cls: "tmvu-pm-dialog-close" });
    actionsEl.appendChild(composeBtn);
    actionsEl.appendChild(closeBtn);
    const dialog = {
      overlayEl,
      titleEl: overlayEl.querySelector("#tmvu-pm-dialog-title"),
      tabsHostEl: overlayEl.querySelector("[data-pm-dialog-tabs]"),
      listEl: overlayEl.querySelector("[data-pm-dialog-list]"),
      detailEl: overlayEl.querySelector("[data-pm-dialog-detail]"),
      pmMainEl: overlayEl.querySelector("#pm_main"),
      composeBtn,
      closeBtn,
      activePlace: "inbox",
      listCache: /* @__PURE__ */ new Map(),
      detailCache: /* @__PURE__ */ new Map(),
      selectedItem: null,
      replyMeta: null
    };
    const tabsEl = TmUI.tabs({
      items: [
        { key: "inbox", label: "Inbox" },
        { key: "sent", label: "Sent" },
        { key: "trash", label: "Trash" }
      ],
      active: dialog.activePlace,
      color: "secondary",
      cls: "tmvu-pm-dialog-tabs-bar",
      onChange: (place) => {
        openPmDialog(pmState, { place });
      }
    });
    dialog.tabsHostEl.appendChild(tabsEl);
    composeBtn.addEventListener("click", () => {
      if (typeof window.pm_new === "function") {
        window.pm_new("", "new");
        return;
      }
      window.location.assign("/pm/");
    });
    const closeDialog = () => {
      closePmDialog(pmState);
    };
    closeBtn.addEventListener("click", closeDialog);
    overlayEl.addEventListener("click", (event) => {
      if (event.target === overlayEl) closeDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || overlayEl.hidden) return;
      closeDialog();
    });
    dialog.listEl.addEventListener("click", (event) => {
      var _a2;
      const button = event.target.closest("[data-pm-dialog-item]");
      if (!button) return;
      const item = {
        id: cleanText2(button.getAttribute("data-pm-id")),
        conversationId: cleanText2(button.getAttribute("data-pm-conversation-id")) || "0",
        subject: ((_a2 = button.querySelector(".tmvu-pm-dialog-row-subject")) == null ? void 0 : _a2.textContent) || ""
      };
      loadPmDialogDetail(pmState, item);
    });
    dialog.detailEl.addEventListener("click", (event) => {
      const replyButton = event.target.closest("[data-pm-reply-send]");
      if (replyButton) {
        submitPmReply(pmState);
        return;
      }
      const actionButton = event.target.closest("[data-pm-thread-action]");
      if (!actionButton) return;
      executePmThreadAction(pmState, cleanText2(actionButton.getAttribute("data-pm-thread-action")));
    });
    pmState.dialog = dialog;
    return dialog;
  }
  async function loadPmDialogDetail(pmState, item) {
    var _a;
    const dialog = ensurePmDialog(pmState);
    if (!dialog || !(item == null ? void 0 : item.id)) return;
    dialog.selectedItem = item;
    highlightPmDialogSelection(pmState, item);
    setPmDialogTitle(pmState, item.subject || "Conversation");
    setPmDialogDetailHtml(pmState, TmUI.loading("Loading conversation..."));
    const cacheKey = getPmThreadCacheKey(item);
    if (dialog.detailCache.has(cacheKey)) {
      const cached = dialog.detailCache.get(cacheKey);
      dialog.replyMeta = getPmReplyMeta(cached, item, pmState.clubId || "");
      syncPmMainHost(dialog, item, cached);
      setPmDialogDetailHtml(pmState, renderPmThreadPanelHtml(cached, pmState.clubId || "", dialog.replyMeta));
      return;
    }
    const response = await TmApi2.fetchPmMessageText(item.id, item.conversationId || "0");
    const thread = normalizePmThreadItems(response);
    if (!thread.length) {
      dialog.replyMeta = null;
      syncPmMainHost(dialog, item, []);
      setPmDialogDetailHtml(pmState, TmUI.error("Failed to load conversation."));
      return;
    }
    dialog.detailCache.set(cacheKey, thread);
    dialog.replyMeta = getPmReplyMeta(thread, item, pmState.clubId || "");
    syncPmMainHost(dialog, item, thread);
    setPmDialogTitle(pmState, ((_a = thread[0]) == null ? void 0 : _a.subject) || item.subject || "Conversation");
    setPmDialogDetailHtml(pmState, renderPmThreadPanelHtml(thread, pmState.clubId || "", dialog.replyMeta));
  }
  async function loadPmDialogFolder(pmState, place = "inbox", selected = null) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog) return;
    dialog.activePlace = place;
    setPmDialogTitle(pmState, place.charAt(0).toUpperCase() + place.slice(1));
    TmUI.setActive(dialog.tabsHostEl.querySelector(".tmu-tabs"), place);
    setPmDialogListHtml(pmState, TmUI.loading(`Loading ${place}...`));
    setPmDialogDetailHtml(pmState, TmUI.empty("Select a conversation to read."));
    let items = dialog.listCache.get(place);
    if (!items) {
      const response = await TmApi2.fetchPmMessages(place);
      items = normalizePmFolderItems(response, place);
      dialog.listCache.set(place, items);
    }
    setPmDialogListHtml(pmState, renderPmDialogListItems(items));
    if (!items.length) {
      setPmDialogDetailHtml(pmState, TmUI.empty(`No ${place} messages.`));
      return;
    }
    const nextItem = selected ? items.find((entry) => getPmThreadCacheKey(entry) === getPmThreadCacheKey(selected)) || items[0] : items[0];
    await loadPmDialogDetail(pmState, nextItem);
  }
  async function openPmDialog(pmState, { place = "inbox", item = null } = {}) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog) return;
    dialog.overlayEl.hidden = false;
    document.body.classList.add("tmvu-pm-dialog-open");
    closePmMenu(pmState);
    await loadPmDialogFolder(pmState, place, item);
  }
  async function loadPmConversations(pmState) {
    var _a, _b;
    if (!pmState || pmState.isLoading) return;
    pmState.isLoading = true;
    (_a = pmState.rootEl) == null ? void 0 : _a.classList.add("is-loading");
    setPmListPlaceholder(pmState, "Loading latest conversations...");
    try {
      const response = await TmApi2.fetchPmMessages("inbox");
      const items = normalizePmConversationItems(response);
      if (items.length) {
        setPmListItems(pmState, items);
      } else if (response) {
        setPmListPlaceholder(pmState, "No recent conversations found.");
      } else {
        setPmListPlaceholder(pmState, "Unable to load messages right now.");
      }
    } finally {
      pmState.isLoading = false;
      (_b = pmState.rootEl) == null ? void 0 : _b.classList.remove("is-loading");
    }
  }
  function bindPmMenu(pmState) {
    var _a, _b, _c, _d;
    const rootEl = document.querySelector("[data-pm-root]");
    if (!rootEl) return null;
    Object.assign(pmState, {
      rootEl,
      triggerEl: rootEl.querySelector("[data-pm-trigger]"),
      menuEl: rootEl.querySelector("[data-pm-menu]"),
      listEl: rootEl.querySelector("[data-pm-list]"),
      countEl: rootEl.querySelector("[data-pm-count]"),
      summaryEl: rootEl.querySelector("[data-pm-summary]"),
      composeEl: rootEl.querySelector("[data-pm-compose]"),
      viewAllEl: rootEl.querySelector("[data-pm-view-all]")
    });
    (_a = pmState.composeEl) == null ? void 0 : _a.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof window.pm_new === "function") {
        window.pm_new("", "new");
        return;
      }
      window.location.assign("/pm/");
    });
    (_b = pmState.viewAllEl) == null ? void 0 : _b.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPmDialog(pmState, { place: "inbox" });
    });
    (_c = pmState.triggerEl) == null ? void 0 : _c.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (pmState.isOpen) {
        closePmMenu(pmState);
        return;
      }
      openPmMenu(pmState);
      await loadPmConversations(pmState);
    });
    document.addEventListener("click", (event) => {
      if (!pmState.isOpen) return;
      if (pmState.rootEl.contains(event.target)) return;
      closePmMenu(pmState);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !pmState.isOpen) return;
      closePmMenu(pmState);
    });
    (_d = pmState.listEl) == null ? void 0 : _d.addEventListener("click", (event) => {
      var _a2;
      const itemButton = event.target.closest("[data-pm-item]");
      if (!itemButton) return;
      event.preventDefault();
      event.stopPropagation();
      const item = {
        id: cleanText2(itemButton.getAttribute("data-pm-id")),
        conversationId: cleanText2(itemButton.getAttribute("data-pm-conversation-id")) || "0",
        subject: ((_a2 = itemButton.querySelector(".tmvu-pm-item-subject")) == null ? void 0 : _a2.textContent) || ""
      };
      openPmDialog(pmState, { place: "inbox", item });
    });
    return pmState;
  }
  function createAppShellPmController({ clubId = "", initialCount = 0 } = {}) {
    var _a, _b, _c;
    const pmState = {
      isOpen: false,
      isLoading: false,
      count: 0,
      clubId: cleanText2(clubId || ((_a = window.SESSION) == null ? void 0 : _a.main_id) || ((_b = window.SESSION) == null ? void 0 : _b.club_id) || ((_c = window.SESSION) == null ? void 0 : _c.id)),
      dialog: null,
      rootEl: null,
      triggerEl: null,
      menuEl: null,
      listEl: null,
      countEl: null,
      summaryEl: null,
      composeEl: null,
      viewAllEl: null
    };
    const setCount = (count) => {
      const safeCount = Math.max(0, Number(count) || 0);
      pmState.count = safeCount;
      if (pmState.countEl) pmState.countEl.textContent = String(safeCount);
      if (pmState.summaryEl) pmState.summaryEl.textContent = `${safeCount} new`;
    };
    return {
      bind() {
        injectStyles();
        bindPmMenu(pmState);
        setCount(initialCount);
        return pmState;
      },
      setCount,
      async refreshCount() {
        const topUserInfo = await TmApi2.fetchTopUserInfo();
        setCount(getTopUserInfoPmCount(topUserInfo, pmState.count));
        return topUserInfo;
      }
    };
  }

  // src/layouts/app-shell.js
  var GROUP_STORAGE_KEY = "tmvu-shell-group";
  var IMPORT_PATH = "/import/";
  function cleanText3(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function normalizeHref(href) {
    try {
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return "";
      if (!url.pathname || url.pathname === "/") return "/home/";
      return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    } catch (e) {
      return "";
    }
  }
  function dedupeChildren(children) {
    const seen = /* @__PURE__ */ new Set();
    return children.filter((child) => {
      if (!child.href || !child.label || seen.has(child.href)) return false;
      seen.add(child.href);
      return true;
    });
  }
  function isUsefulLink(anchor) {
    const href = normalizeHref(anchor.getAttribute("href") || "");
    const label = cleanText3(anchor.textContent);
    if (!href || !label) return false;
    if (href.includes("/logout")) return false;
    return true;
  }
  function collectNavGroups() {
    const groups = [];
    document.querySelectorAll("#top_menu > ul > li > a[top_menu]").forEach((anchor) => {
      const id = anchor.getAttribute("top_menu") || "";
      const href = normalizeHref(anchor.getAttribute("href") || "");
      if (!href) return;
      const meta = getHeaderGroupMeta(id, cleanText3(anchor.getAttribute("title")) || href);
      groups.push({
        id,
        href,
        label: meta.label,
        icon: meta.icon,
        children: []
      });
    });
    Array.from(document.querySelectorAll("#mega_menu_items > div")).forEach((column, index) => {
      const group = groups[index];
      if (!group) return;
      column.querySelectorAll("a").forEach((anchor) => {
        if (!isUsefulLink(anchor)) return;
        group.children.push({
          href: normalizeHref(anchor.getAttribute("href") || ""),
          label: cleanText3(anchor.textContent)
        });
      });
      group.children = dedupeChildren(group.children);
    });
    const resolvedGroups = groups.length < 4 ? getDefaultHeaderGroups() : groups.map((group) => ({
      ...group,
      children: dedupeChildren(group.children)
    }));
    return resolvedGroups.map((group) => ({
      ...group,
      children: dedupeChildren(group.children)
    }));
  }
  function getHeaderFab(currentPath) {
    return {
      href: IMPORT_PATH,
      label: "Import",
      icon: "\u{1F4E5}",
      isActive: currentPath === IMPORT_PATH
    };
  }
  function getInitialOpenGroup(groups, currentPath) {
    return "";
  }
  function getClubInfo() {
    var _a, _b;
    const session = window.SESSION || {};
    const clubId = String(session.main_id || session.club_id || "").trim();
    const clubName = cleanText3(
      session.main_name || session.clubname || session.club_name || ((_a = document.querySelector('a[href*="/club/"]')) == null ? void 0 : _a.textContent) || "TrophyManager"
    );
    return {
      clubId,
      clubName,
      logo: clubId ? `/pics/club_logos/${clubId}_140.png` : "",
      proDays: String((_b = session.pro_days) != null ? _b : "").trim(),
      cash: Number(session.cash || 0),
      newPms: Number(session.new_pms || 0)
    };
  }
  function formatCash(value) {
    const amount = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("en-US").format(amount);
  }
  function removeNativeMenus() {
    var _a, _b;
    (_a = document.getElementById("top_menu")) == null ? void 0 : _a.remove();
    (_b = document.getElementById("top_menu_sub")) == null ? void 0 : _b.remove();
    document.querySelectorAll("#cookies_disabled_message, .cookies_disabled_message, .column1_d").forEach((node) => node.remove());
  }
  function replaceMainCenterClass() {
    document.querySelectorAll(".main_center").forEach((mainCenter) => {
      if (mainCenter.id === "cookies_disabled_message") {
        mainCenter.remove();
        return;
      }
      mainCenter.classList.remove("main_center");
      mainCenter.classList.add("tmvu-main");
    });
  }
  function injectStyles2() {
    if (document.getElementById("tmvu-shell-styles")) return;
    const style = document.createElement("style");
    style.id = "tmvu-shell-styles";
    style.textContent = `
        :root {
            --tmvu-header-height: 140px;
            --tmvu-surface: #1a3210;
            --tmvu-surface-2: #1d3811;
            --tmvu-surface-3: #234217;
            --tmvu-border: rgba(255, 255, 255, 0.08);
            --tmvu-text: #e7eee6;
            --tmvu-text-soft: rgba(231, 238, 230, 0.56);
            --tmvu-text-inverse: #edf2eb;
            --tmvu-accent: #9dbc71;
            --tmvu-accent-soft: rgba(157, 188, 113, 0.16);
            --tmvu-font: "IBM Plex Sans", "Segoe UI", sans-serif;
            --tmu-tabs-primary-bg: #274a18;
            --tmu-tabs-primary-border: #3d6828;
            --tmu-tabs-primary-text: #90b878;
            --tmu-tabs-primary-hover-text: #c8e0b4;
            --tmu-tabs-primary-hover-bg: #305820;
            --tmu-tabs-primary-active-text: #e8f5d8;
            --tmu-tabs-primary-active-bg: #305820;
            --tmu-tabs-primary-active-border: #6cc040;
            --tmu-tabs-secondary-bg: #213714;
            --tmu-tabs-secondary-border: #365724;
            --tmu-tabs-secondary-text: #98b77f;
            --tmu-tabs-secondary-hover-text: #d4e8c6;
            --tmu-tabs-secondary-hover-bg: #2a471c;
            --tmu-tabs-secondary-active-text: #eff7e8;
            --tmu-tabs-secondary-active-bg: #2a471c;
            --tmu-tabs-secondary-active-border: #8ebc64;
        }

        body.tmvu-shell-active {
            margin: 0 !important;
            padding-top: var(--tmvu-header-height) !important;
            background-image: none !important;
            background-color: #203f08 !important;
            background: #203f08 !important;
            color: var(--tmvu-text) !important;
            font-family: var(--tmvu-font) !important;
            font-size: 13px !important;
            line-height: 1.4;
            text-align: left;
            min-height: 100vh;
        }

        body.tmvu-shell-active #body_foot,
        body.tmvu-shell-active .body_foot,
        body.tmvu-shell-active .link_area,
        body.tmvu-shell-active #body_end,
        body.tmvu-shell-active .body_end,
        body.tmvu-shell-active #cookies_disabled_message,
        body.tmvu-shell-active .notice_box {
            display: none !important;
        }

        body.tmvu-shell-active .tmvu-main {
            width: min(1250px, calc(100% - 24px)) !important;
            max-width: 1250px !important;
            margin: 16px auto !important;
            display: flex;
            gap: 16px;
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
        }

        #tmvu-header {
            box-sizing: border-box;
            font-family: var(--tmvu-font);
        }

        #tmvu-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(180deg, #1c3410, #1d3811 58%, #1b3410);
            color: var(--tmvu-text-inverse);
            border-bottom: 1px solid rgba(61, 104, 40, 0.42);
            box-shadow: inset 0 -1px 0 rgba(8, 16, 6, 0.24);
            z-index: 9999;
        }

        .tmvu-header-shell {
            width: min(1250px, calc(100% - 24px));
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .tmvu-header-top {
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 4px 0 4px;
        }

        .tmvu-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .tmvu-brand-logo,
        .tmvu-brand-mark {
            width: 72px;
            height: 72px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
        }

        .tmvu-brand-logo {
            object-fit: cover;
        }

        .tmvu-brand-mark {
            color: var(--tmvu-accent);
            background: var(--tmvu-surface-3);
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.08em;
        }

        .tmvu-brand-copy {
            min-width: 0;
        }

        .tmvu-brand-copy strong {
            display: block;
            font-size: 26px;
            line-height: 1.05;
            font-weight: 700;
            color: var(--tmvu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-header-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            min-width: 0;
            padding-right: 92px;
        }

        .tmvu-header-fab {
            position: absolute;
            top: 14px;
            right: 0;
            min-height: 34px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 0 12px;
            border-radius: 999px;
            border: 1px solid rgba(61, 104, 40, 0.45);
            background: rgba(8, 16, 6, 0.22);
            color: rgba(237, 242, 235, 0.92);
            text-decoration: none;
            white-space: nowrap;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        }

        .tmvu-header-fab:hover {
            background: rgba(108, 192, 64, 0.14);
            color: #fff;
        }

        .tmvu-header-fab.is-active {
            background: rgba(108, 192, 64, 0.18);
            border-color: rgba(157, 188, 113, 0.65);
            color: #fff;
        }

        .tmvu-header-fab-label {
            font-size: 12px;
            font-weight: 600;
        }

        .tmvu-brand-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }

        .tmvu-nav-wrap {
            display: flex;
            flex-direction: column;
            border-top: 1px solid rgba(61, 104, 40, 0.28);
        }

        .tmvu-metric-icon {
            width: 12px;
            height: 12px;
            position: relative;
            flex: 0 0 auto;
            color: rgba(231, 238, 230, 0.7);
        }

        .tmvu-metric-icon::before,
        .tmvu-metric-icon::after {
            content: '';
            position: absolute;
            background: currentColor;
        }

        .tmvu-metric-icon-pro::before {
            inset: 1px;
            border: 1px solid currentColor;
            background: transparent;
            border-radius: 50%;
        }

        .tmvu-metric-icon-pro::after {
            left: 5px;
            top: 3px;
            width: 1px;
            height: 4px;
            box-shadow: 2px 2px 0 0 currentColor;
            transform: rotate(45deg);
        }

        .tmvu-metric-icon-cash::before {
            left: 5px;
            top: 1px;
            width: 1px;
            height: 10px;
        }

        .tmvu-metric-icon-cash::after {
            left: 3px;
            top: 2px;
            width: 5px;
            height: 6px;
            background: transparent;
            border: 1px solid currentColor;
            border-radius: 45%;
        }

        .tmvu-nav-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0 6px;
            overflow-x: auto;
            overflow-y: hidden;
        }

        .tmvu-nav-secondary {
            display: none;
        }

        .tmvu-nav-secondary.has-open {
            display: block;
            min-height: 36px;
            padding: 0 0 2px;
        }

        .tmvu-secondary-group {
            display: none;
            align-items: center;
            gap: 10px;
            min-height: 36px;
            overflow-x: auto;
            overflow-y: hidden;
        }

        .tmvu-secondary-group.is-open {
            display: flex;
        }

        .tmvu-menu-group {
            flex: 0 0 auto;
        }

        .tmvu-menu-trigger {
            min-height: 36px;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 0 13px;
            border: 0;
            border-bottom: 2px solid transparent;
            background: transparent;
            color: rgba(237, 242, 235, 0.92);
            cursor: pointer;
            text-align: left;
            white-space: nowrap;
            text-decoration: none;
        }

        .tmvu-menu-trigger:hover {
            background: rgba(108, 192, 64, 0.08);
        }

        .tmvu-menu-group.is-open .tmvu-menu-trigger,
        .tmvu-menu-group.is-current .tmvu-menu-trigger {
            background: rgba(108, 192, 64, 0.12);
            border-bottom-color: var(--tmvu-accent);
            color: #fff;
        }

        .tmvu-group-label {
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
        }

        .tmvu-subitem {
            min-height: 36px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 11px;
            color: rgba(237, 242, 235, 0.74);
            text-decoration: none;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
            flex: 0 0 auto;
        }

        .tmvu-subitem:hover {
            background: rgba(108, 192, 64, 0.08);
            color: #fff;
        }

        .tmvu-subitem.is-active {
            color: #fff;
            background: rgba(108, 192, 64, 0.12);
            border-bottom-color: var(--tmvu-accent);
        }

        .tmvu-subitem-label {
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-subitem-dot {
            width: 5px;
            height: 5px;
            background: currentColor;
            opacity: 0.55;
        }

        .tmvu-metric {
            display: flex;
            align-items: center;
            gap: 6px;
            min-height: 22px;
            padding: 0 6px;
            border: 1px solid rgba(61, 104, 40, 0.34);
            background: rgba(8, 16, 6, 0.16);
        }

        .tmvu-metric-label {
            font-size: 8px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--tmvu-text-soft);
        }

        .tmvu-metric-value {
            font-size: 11px;
            font-weight: 600;
            color: var(--tmvu-text-inverse);
        }

        .tmvu-icon {
            width: 18px;
            height: 18px;
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: currentColor;
            font-size: 15px;
            line-height: 1;
            transform: translateY(-0.5px);
        }
    `;
    document.head.appendChild(style);
  }
  function syncLayoutState() {
    document.body.classList.add("tmvu-shell-active");
  }
  function setOpenGroup(groupId) {
    const nextGroupId = groupId || "";
    document.querySelectorAll(".tmvu-menu-group").forEach((group) => {
      const isOpen = group.getAttribute("data-group-id") === nextGroupId;
      group.classList.toggle("is-open", isOpen);
      const trigger = group.querySelector("[data-group-trigger]");
      if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
    });
    document.querySelectorAll(".tmvu-secondary-group").forEach((group) => {
      const isOpen = group.getAttribute("data-group-id") === nextGroupId;
      group.classList.toggle("is-open", isOpen);
    });
    document.querySelectorAll(".tmvu-nav-secondary").forEach((nav) => {
      nav.classList.toggle("has-open", Boolean(nextGroupId));
    });
    if (nextGroupId) {
      window.localStorage.removeItem(GROUP_STORAGE_KEY);
    }
  }
  function initAppShellLayout() {
    if (!document.body || !document.head) return;
    if (document.getElementById("tmvu-header")) return;
    removeNativeMenus();
    replaceMainCenterClass();
    injectStyles2();
    const currentPath = normalizeHref(window.location.pathname) || "/home/";
    const groups = collectNavGroups();
    const clubInfo = getClubInfo();
    const openGroupId = getInitialOpenGroup(groups, currentPath);
    const headerFab = getHeaderFab(currentPath);
    const headerHtml = TmAppShellHeader.render({
      clubName: clubInfo.clubName,
      logo: clubInfo.logo,
      proDays: clubInfo.proDays || "0",
      cash: formatCash(clubInfo.cash),
      pmCount: clubInfo.newPms || 0,
      groups,
      currentPath,
      openGroupId,
      headerFab
    });
    document.body.insertAdjacentHTML("beforeend", headerHtml);
    document.querySelectorAll("[data-group-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const groupId = trigger.getAttribute("data-group-trigger") || "";
        const groupHref = trigger.getAttribute("data-group-href") || "";
        const group = trigger.closest(".tmvu-menu-group");
        const isOpen = group == null ? void 0 : group.classList.contains("is-open");
        if (isOpen && groupHref) {
          window.location.assign(groupHref);
          return;
        }
        setOpenGroup(groupId);
      });
    });
    const pmController = createAppShellPmController({
      clubId: clubInfo.clubId,
      initialCount: clubInfo.newPms || 0
    });
    pmController.bind();
    syncLayoutState();
    pmController.refreshCount();
  }

  // src/pages/app-shell.js
  (function() {
    "use strict";
    if (window.top !== window.self) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAppShellLayout, { once: true });
    } else {
      initAppShellLayout();
    }
  })();

  // src/components/shared/tm-hero-card.js
  if (!document.getElementById("tm-hero-card-style")) {
    const style = document.createElement("style");
    style.id = "tm-hero-card-style";
    style.textContent = `
        .tmvu-hero-card {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(220px, .52fr);
            gap: 18px;
            padding: 20px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,.08);
            background:
                radial-gradient(circle at top left, rgba(128,224,72,.1), rgba(128,224,72,0) 36%),
                linear-gradient(135deg, rgba(19,34,11,.96), rgba(10,18,6,.92));
            box-shadow: 0 12px 28px rgba(0,0,0,.16);
        }

        .tmvu-hero-card-main,
        .tmvu-hero-card-side,
        .tmvu-hero-card-footer {
            min-width: 0;
        }

        .tmvu-hero-card-kicker {
            color: #7fa669;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        .tmvu-hero-card-title {
            color: #eef8e8;
            font-size: 30px;
            font-weight: 900;
            line-height: 1.02;
        }

        .tmvu-hero-card-subtitle {
            margin-top: 8px;
            color: #d9edcc;
            font-size: 15px;
            font-weight: 700;
            line-height: 1.3;
        }

        .tmvu-hero-card-main-slot {
            margin-top: 10px;
        }

        .tmvu-hero-card-actions {
            margin-top: 14px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
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
      return TmUI.render(container, `
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
        `);
    }
  };

  // src/components/shared/tm-side-menu.js
  var STYLE_ID3 = "tmvu-side-menu-style";
  function injectStyles3() {
    if (document.getElementById(STYLE_ID3)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID3;
    style.textContent = `
        .tmvu-side-menu {
            flex: 0 0 184px;
            position: sticky;
            top: 16px;
            align-self: flex-start;
        }

        .tmvu-side-menu-nav {
            background: #1c3410;
            border: 1px solid #28451d;
            border-radius: 8px;
            box-shadow: 0 0 9px #192a19;
            overflow: hidden;
        }

        .tmvu-side-menu-nav .tmu-list-item {
            min-height: 40px;
            padding: 0 14px;
            border-bottom: 1px solid rgba(42,74,28,.5);
            color: #90b878;
            background: rgba(108,192,64,.04);
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item:last-of-type {
            border-bottom: none;
        }

        .tmvu-side-menu-nav .tmu-list-item:hover {
            background: rgba(42,74,28,.4);
            color: #e8f5d8;
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item:focus,
        .tmvu-side-menu-nav .tmu-list-item:active,
        .tmvu-side-menu-nav .tmu-list-item:visited {
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item.is-active {
            color: #eff8e8;
            background: linear-gradient(180deg, rgba(108,192,64,.18), rgba(108,192,64,.1));
            box-shadow: inset 3px 0 0 #80e048;
        }

        .tmvu-side-menu-nav .tmu-list-icon {
            width: 18px;
            font-size: 14px;
        }

        .tmvu-side-menu-separator {
            height: 1px;
            background: rgba(40,69,29,.88);
        }
    `;
    document.head.appendChild(style);
  }
  function buildMenuHtml(items) {
    return `
        <div class="tmvu-side-menu-nav">
            ${items.map((item) => {
      if (item.type === "separator") return '<div class="tmvu-side-menu-separator"></div>';
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
    injectStyles3();
    const nav = document.createElement("aside");
    if (id) nav.id = id;
    nav.className = `tmvu-side-menu ${className}`.trim();
    TmUI.render(nav, buildMenuHtml(items));
    applyActiveState(nav, currentHref);
    mainContainer.insertBefore(nav, mainContainer.firstChild);
    return nav;
  }
  var TmSideMenu = { mount };

  // src/components/shared/tm-match-tooltip.js
  var STYLE_ID4 = "tmvu-match-tooltip-style";
  var ensureStyles = () => {
    if (document.getElementById(STYLE_ID4)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID4;
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

  // src/components/shared/tm-match-hover-card.js
  var state = {
    cache: {},
    tooltipEl: null,
    showTimer: null,
    hideTimer: null
  };
  var currentSeason = () => typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
  var injectStyles4 = () => {
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
    injectStyles4();
    clearTimeout(state.hideTimer);
    removeTooltip();
    const isCurrentSeason = Number(season) === currentSeason();
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
    injectStyles4();
    rows.forEach((row) => {
      if (row.dataset.hoverBound === "1") return;
      row.dataset.hoverBound = "1";
      row.addEventListener("mouseenter", () => {
        clearTimeout(state.hideTimer);
        const matchId = row.dataset.mid;
        if (!matchId) return;
        state.showTimer = setTimeout(() => show(row, matchId, season != null ? season : currentSeason()), 300);
      });
      row.addEventListener("mouseleave", () => {
        clearTimeout(state.showTimer);
        state.hideTimer = setTimeout(() => removeTooltip(), 100);
      });
    });
  };
  var TmMatchHoverCard = {
    injectStyles: injectStyles4,
    show,
    bind,
    removeTooltip,
    buildLegacyTooltipContent,
    buildRichTooltip
  };

  // src/components/national-teams/tm-national-teams-nt-save.js
  var STYLE_ID5 = "tmvu-nt-save-style";
  var SCAN_SEASON_COUNT = 15;
  var RESULT_COLUMNS = [
    { key: "name", label: "Player" },
    { key: "clubName", label: "Club" },
    { key: "age", label: "Age" },
    { key: "asi", label: "ASI" },
    { key: "position", label: "Pos" },
    { key: "reasons", label: "Reasons" },
    { key: "sources", label: "Sources" }
  ];
  var cleanText4 = (value) => String(value || "").replace(/\s+/g, " ").trim();
  var lowerText = (value) => cleanText4(value).toLowerCase();
  var escapeHtml5 = (value) => String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  function normalizeCountryCode(value) {
    const raw = cleanText4(value);
    if (!raw) return "";
    const bracketMatch = raw.match(/^\[([a-z]{2,3})\]$/i);
    if (bracketMatch) return lowerText(bracketMatch[1]);
    const hrefMatch = raw.match(/\/national-teams\/([a-z]{2,3})\//i);
    if (hrefMatch) return lowerText(hrefMatch[1]);
    const flagClassMatch = raw.match(/flag-img-([a-z]{2,3})/i);
    if (flagClassMatch) return lowerText(flagClassMatch[1]);
    return lowerText(raw);
  }
  function resolvePlayerCountryCode(player = {}) {
    return normalizeCountryCode(
      (player == null ? void 0 : player.country) || (player == null ? void 0 : player.player_country) || (player == null ? void 0 : player.nationality) || (player == null ? void 0 : player.country_link) || (player == null ? void 0 : player.country_html) || (player == null ? void 0 : player.flag) || ""
    );
  }
  function matchesTargetCountry(player, targetCountryCode) {
    return resolvePlayerCountryCode(player) === normalizeCountryCode(targetCountryCode);
  }
  var buttonHtml4 = (opts) => TmUI.button(opts).outerHTML;
  function injectStyles5() {
    if (document.getElementById(STYLE_ID5)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID5;
    style.textContent = `
        .tmvu-nt-save-panel {
            margin-top: 12px;
            padding: 12px;
            border: 1px solid #28451d;
            border-radius: 8px;
            background: #1c3410;
            box-shadow: 0 0 9px #192a19;
        }

        .tmvu-nt-save-kicker {
            color: #8aac72;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-title {
            margin-top: 6px;
            color: #eef8e8;
            font-size: 13px;
            font-weight: 700;
        }

        .tmvu-nt-save-copy {
            margin-top: 6px;
            color: #90b878;
            font-size: 11px;
            line-height: 1.55;
        }

        .tmvu-nt-save-btn {
            width: 100%;
            margin-top: 10px;
            justify-content: center;
        }

        .tmvu-nt-save-mini {
            margin-top: 8px;
            min-height: 16px;
            color: #8aac72;
            font-size: 10px;
            line-height: 1.5;
        }

        .tmvu-side-menu-nav .tmu-list-item.tmvu-nt-save-action {
            color: #d7efbf;
            background: rgba(108, 192, 64, 0.08);
            font-weight: 700;
        }

        .tmvu-side-menu-nav .tmu-list-item.tmvu-nt-save-action:hover {
            background: rgba(108, 192, 64, 0.16);
            color: #eef8e8;
        }

        .tmvu-nt-save-inline-status {
            margin-top: 8px;
            padding: 8px 10px;
            border: 1px solid rgba(61, 104, 40, 0.24);
            border-radius: 8px;
            background: rgba(12, 24, 9, 0.3);
            color: #8aac72;
            font-size: 10px;
            line-height: 1.45;
        }

        .tmvu-nt-save-overlay {
            position: fixed;
            inset: 0;
            z-index: 10080;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px;
            background: rgba(4, 10, 3, 0.76);
            backdrop-filter: blur(4px);
        }

        .tmvu-nt-save-overlay[hidden] {
            display: none !important;
        }

        .tmvu-nt-save-dialog {
            width: min(1200px, calc(100vw - 20px));
            max-height: calc(100vh - 20px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: linear-gradient(180deg, #17300f, #0f2209 72%);
            border: 1px solid rgba(74, 144, 48, 0.72);
            box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
            color: #d9e7d1;
        }

        .tmvu-nt-save-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 18px 18px 12px;
            border-bottom: 1px solid rgba(61, 104, 40, 0.3);
        }

        .tmvu-nt-save-head h2 {
            margin: 4px 0 0;
            color: #f0f6ec;
            font-size: 20px;
            line-height: 1.15;
        }

        .tmvu-nt-save-head p {
            margin: 6px 0 0;
            color: #90b878;
            font-size: 12px;
        }

        .tmvu-nt-save-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tmvu-nt-save-body {
            min-height: 0;
            overflow-y: auto;
            padding: 16px 18px 18px;
        }

        .tmvu-nt-save-status {
            padding: 10px 12px;
            border: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(12, 24, 9, 0.36);
            color: #d7ebc9;
            font-size: 12px;
        }

        .tmvu-nt-save-status strong {
            color: #eef8e8;
        }

        .tmvu-nt-save-progress {
            margin-top: 12px;
            padding: 12px;
            border: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(12, 24, 9, 0.34);
        }

        .tmvu-nt-save-progress-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
        }

        .tmvu-nt-save-progress-label {
            color: #d7ebc9;
            font-size: 12px;
            font-weight: 700;
        }

        .tmvu-nt-save-progress-meta {
            color: #8aac72;
            font-size: 11px;
        }

        .tmvu-nt-save-progress-track {
            height: 10px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 0 0 1px rgba(61, 104, 40, 0.22);
        }

        .tmvu-nt-save-progress-bar {
            width: 0%;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #4a9030, #80e048);
            transition: width 0.18s ease;
        }

        .tmvu-nt-save-progress-note {
            margin-top: 8px;
            color: #8aac72;
            font-size: 11px;
            line-height: 1.5;
        }

        .tmvu-nt-save-summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
        }

        .tmvu-nt-save-metric {
            padding: 12px;
            border: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(12, 24, 9, 0.32);
        }

        .tmvu-nt-save-metric-label {
            color: #8aac72;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-metric-value {
            margin-top: 6px;
            color: #eef8e8;
            font-size: 20px;
            font-weight: 800;
        }

        .tmvu-nt-save-result-table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
            border: 1px solid rgba(61, 104, 40, 0.22);
            background: rgba(12, 24, 9, 0.32);
        }

        .tmvu-nt-save-result-table th,
        .tmvu-nt-save-result-table td {
            padding: 9px 10px;
            border-bottom: 1px solid rgba(61, 104, 40, 0.16);
            text-align: left;
            vertical-align: top;
            font-size: 12px;
        }

        .tmvu-nt-save-result-table th {
            color: #8aac72;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-results-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 14px;
            color: #8aac72;
            font-size: 11px;
        }

        .tmvu-nt-save-results-toolbar strong {
            color: #eef8e8;
        }

        .tmvu-nt-save-sort {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0;
            border: 0;
            background: transparent;
            color: inherit;
            font: inherit;
            letter-spacing: inherit;
            text-transform: inherit;
            cursor: pointer;
        }

        .tmvu-nt-save-sort::after {
            content: '\u2195';
            opacity: 0.4;
            font-size: 10px;
        }

        .tmvu-nt-save-sort.is-active {
            color: #d7efbf;
        }

        .tmvu-nt-save-sort.is-active::after {
            opacity: 1;
        }

        .tmvu-nt-save-sort.is-active.asc::after {
            content: '\u25B2';
        }

        .tmvu-nt-save-sort.is-active.desc::after {
            content: '\u25BC';
        }

        .tmvu-nt-save-export[disabled] {
            opacity: 0.55;
            pointer-events: none;
        }

        .tmvu-nt-save-result-table td {
            color: #d7ebc9;
        }

        .tmvu-nt-save-result-table a {
            color: #eef8e8;
            text-decoration: none;
        }

        .tmvu-nt-save-result-table a:hover {
            text-decoration: underline;
        }

        .tmvu-nt-save-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .tmvu-nt-save-tag {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 0 8px;
            border-radius: 999px;
            border: 1px solid rgba(61, 104, 40, 0.32);
            background: rgba(108, 192, 64, 0.1);
            color: #d7efbf;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
        }

        .tmvu-nt-save-tag.is-danger {
            border-color: rgba(239, 68, 68, 0.34);
            background: rgba(239, 68, 68, 0.12);
            color: #f7b2b2;
        }

        .tmvu-nt-save-tag.is-muted {
            border-color: rgba(61, 104, 40, 0.24);
            background: rgba(255, 255, 255, 0.04);
            color: #9bbc84;
        }

        .tmvu-nt-save-sources {
            color: #8aac72;
            font-size: 11px;
            line-height: 1.55;
        }

        .tmvu-nt-save-empty {
            margin-top: 14px;
            padding: 16px;
            border: 1px solid rgba(61, 104, 40, 0.22);
            background: rgba(12, 24, 9, 0.28);
            color: #90b878;
            font-size: 12px;
        }

        @media (max-width: 900px) {
            .tmvu-nt-save-summary {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 760px) {
            .tmvu-nt-save-dialog {
                width: calc(100vw - 10px);
                max-height: calc(100vh - 10px);
            }

            .tmvu-nt-save-head {
                flex-direction: column;
                align-items: stretch;
            }

            .tmvu-nt-save-actions {
                justify-content: flex-end;
            }

            .tmvu-nt-save-summary {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
  }
  function extractClubId(anchor) {
    var _a;
    if (!anchor) return "";
    const attrId = cleanText4(anchor.getAttribute("club_link"));
    if (attrId) return attrId;
    const href = cleanText4(anchor.getAttribute("href"));
    return ((_a = href.match(/\/club\/(\d+)\//)) == null ? void 0 : _a[1]) || "";
  }
  function extractPlayerId(anchor) {
    var _a;
    if (!anchor) return "";
    const attrId = cleanText4(anchor.getAttribute("player_link"));
    if (attrId) return attrId;
    const href = cleanText4(anchor.getAttribute("href"));
    return ((_a = href.match(/\/players\/(\d+)\//)) == null ? void 0 : _a[1]) || "";
  }
  function extractCountryCodeFromNode(node) {
    var _a, _b;
    if (!node) return "";
    const anchor = ((_a = node.matches) == null ? void 0 : _a.call(node, 'a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]')) ? node : (_b = node.querySelector) == null ? void 0 : _b.call(node, 'a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]');
    if (anchor) {
      const href = cleanText4(anchor.getAttribute("href"));
      const hrefCode = normalizeCountryCode(href);
      if (hrefCode) return hrefCode;
      const classCode = normalizeCountryCode(anchor.innerHTML);
      if (classCode) return classCode;
    }
    const htmlCode = normalizeCountryCode(node.innerHTML || "");
    if (htmlCode) return htmlCode;
    return "";
  }
  function extractTransferPlayerCountryCode(row, playerAnchor) {
    var _a;
    const playerCell = (_a = playerAnchor == null ? void 0 : playerAnchor.closest) == null ? void 0 : _a.call(playerAnchor, "td");
    return extractCountryCodeFromNode(playerCell || row);
  }
  function normalizeDivisionGroups(divisions = []) {
    return divisions.flatMap((item) => {
      const division = cleanText4(item == null ? void 0 : item.division);
      const groups = Math.max(1, Number(item == null ? void 0 : item.groups) || 1);
      const name = cleanText4(item == null ? void 0 : item.name) || `Division ${division}`;
      if (!division) return [];
      return Array.from({ length: groups }, (_, index) => ({
        division,
        group: String(index + 1),
        name
      }));
    });
  }
  function parseLeagueFlaggedClubs(html, groupCtx) {
    if (!html) return [];
    const doc = new DOMParser().parseFromString(html, "text/html");
    const map = /* @__PURE__ */ new Map();
    doc.querySelectorAll("tr").forEach((row) => {
      const clubAnchor = row.querySelector('a[club_link], a[href*="/club/"]');
      if (!clubAnchor) return;
      const clubId = extractClubId(clubAnchor);
      if (!clubId) return;
      const hasBanned = !!row.querySelector('img[src*="/pics/icons/lg_ban.gif"]');
      const hasInactive = !!row.querySelector('img[src*="/pics/icons/lg_ina.gif"]');
      if (!hasBanned && !hasInactive) return;
      const existing = map.get(clubId) || {
        clubId,
        clubName: cleanText4(clubAnchor.textContent) || `Club ${clubId}`,
        division: groupCtx.division,
        group: groupCtx.group,
        statuses: /* @__PURE__ */ new Set()
      };
      if (hasBanned) existing.statuses.add("league-banned");
      if (hasInactive) existing.statuses.add("league-inactive");
      map.set(clubId, existing);
    });
    return Array.from(map.values()).map((item) => ({ ...item, statuses: [...item.statuses] }));
  }
  function parseTransferHistory(html, groupCtx, season, targetCountryCode) {
    if (!html) return [];
    const doc = new DOMParser().parseFromString(html, "text/html");
    const tables = [];
    doc.querySelectorAll("h3").forEach((h3) => {
      const label = lowerText(h3.textContent);
      let table = h3.nextElementSibling;
      while (table && table.tagName !== "TABLE") table = table.nextElementSibling;
      if (!table) return;
      if (label.includes("bought")) tables.push({ type: "bought", table });
      if (label.includes("sold")) tables.push({ type: "sold", table });
    });
    const items = [];
    tables.forEach(({ type, table }) => {
      table.querySelectorAll("tr").forEach((row) => {
        const playerAnchor = row.querySelector('a[player_link], a[href*="/players/"]');
        const clubAnchor = row.querySelector('a[club_link], a[href*="/club/"]');
        if (!playerAnchor || !clubAnchor) return;
        const playerCountryCode = extractTransferPlayerCountryCode(row, playerAnchor);
        if (!playerCountryCode || playerCountryCode !== normalizeCountryCode(targetCountryCode)) return;
        const playerId = extractPlayerId(playerAnchor);
        const clubId = extractClubId(clubAnchor);
        if (!playerId) return;
        items.push({
          playerId,
          playerName: cleanText4(playerAnchor.textContent),
          clubId,
          clubName: cleanText4(clubAnchor.textContent),
          transferType: type,
          division: groupCtx.division,
          group: groupCtx.group,
          season: String(season),
          playerCountryCode
        });
      });
    });
    return items;
  }
  function hasClubBannedBadge(html) {
    return /\/pics\/club_banned\.png/i.test(String(html || ""));
  }
  function buildCandidateRecord(player, club, clubId = "", clubName = "") {
    var _a;
    return {
      playerId: cleanText4((player == null ? void 0 : player.player_id) || (player == null ? void 0 : player.id)),
      name: cleanText4((player == null ? void 0 : player.name) || (player == null ? void 0 : player.player_name)) || "Unknown player",
      country: resolvePlayerCountryCode(player),
      age: Number(player == null ? void 0 : player.age) || 0,
      months: Number((_a = player == null ? void 0 : player.months) != null ? _a : player == null ? void 0 : player.month) || 0,
      asi: TmUtils.parseNum((player == null ? void 0 : player.skill_index) || (player == null ? void 0 : player.asi)),
      position: cleanText4((player == null ? void 0 : player.favposition) || (player == null ? void 0 : player.fp) || (player == null ? void 0 : player.favorite_position)),
      clubId: cleanText4(clubId || (player == null ? void 0 : player.club_id) || (club == null ? void 0 : club.id)),
      clubName: cleanText4(clubName || (player == null ? void 0 : player.club_name) || (club == null ? void 0 : club.club_name)) || "Unknown club",
      clubCreated: lowerText(club == null ? void 0 : club.created),
      sources: [],
      reasons: []
    };
  }
  function upsertCandidate(map, candidate) {
    if (!(candidate == null ? void 0 : candidate.playerId)) return;
    const existing = map.get(candidate.playerId) || {
      ...candidate,
      sources: [],
      reasons: []
    };
    existing.name = existing.name || candidate.name;
    existing.country = existing.country || candidate.country;
    existing.age = existing.age || candidate.age;
    existing.months = existing.months || candidate.months;
    existing.asi = existing.asi || candidate.asi;
    existing.position = existing.position || candidate.position;
    existing.clubId = existing.clubId || candidate.clubId;
    existing.clubName = existing.clubName || candidate.clubName;
    existing.clubCreated = existing.clubCreated || candidate.clubCreated;
    candidate.reasons.forEach((reason) => {
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    });
    candidate.sources.forEach((source) => {
      if (!existing.sources.includes(source)) existing.sources.push(source);
    });
    map.set(candidate.playerId, existing);
  }
  function createSummaryHtml(summary) {
    const metrics = [
      ["League Groups", summary.groupsScanned],
      ["Transfer Candidates", summary.transferCandidates],
      ["Flagged Clubs", summary.flaggedClubs],
      ["NT Save Players", summary.results]
    ];
    return `
        <div class="tmvu-nt-save-summary">
            ${metrics.map(([label, value]) => `
                <div class="tmvu-nt-save-metric">
                    <div class="tmvu-nt-save-metric-label">${escapeHtml5(label)}</div>
                    <div class="tmvu-nt-save-metric-value">${escapeHtml5(String(value))}</div>
                </div>
            `).join("")}
        </div>
    `;
  }
  function createReasonTags(reasons = []) {
    if (!reasons.length) return '<span class="tmvu-nt-save-tag is-muted">No reasons</span>';
    return reasons.map((reason) => {
      const danger = /inactive|banned/i.test(reason);
      return `<span class="tmvu-nt-save-tag${danger ? " is-danger" : ""}">${escapeHtml5(reason)}</span>`;
    }).join("");
  }
  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round((Number(ms) || 0) / 1e3));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  function getResultSortValue(item, key) {
    switch (key) {
      case "name":
        return lowerText(item.name);
      case "clubName":
        return lowerText(item.clubName);
      case "age":
        return (Number(item.age) || 0) * 12 + (Number(item.months) || 0);
      case "asi":
        return Number(item.asi) || 0;
      case "position":
        return lowerText(item.position);
      case "reasons":
        return lowerText((item.reasons || []).join(" | "));
      case "sources":
        return lowerText((item.sources || []).join(" | "));
      default:
        return lowerText(item.name);
    }
  }
  function compareResultItems(left, right, sortKey, sortDir) {
    const a = getResultSortValue(left, sortKey);
    const b = getResultSortValue(right, sortKey);
    let cmp = 0;
    if (typeof a === "number" && typeof b === "number") cmp = a - b;
    else cmp = String(a).localeCompare(String(b));
    if (cmp !== 0) return cmp * sortDir;
    const nameCmp = lowerText(left.name).localeCompare(lowerText(right.name));
    if (nameCmp !== 0) return nameCmp;
    return (Number(right.asi) || 0) - (Number(left.asi) || 0);
  }
  function getSortedResults(state2) {
    return [...state2.results.values()].sort((left, right) => compareResultItems(left, right, state2.sortKey, state2.sortDir));
  }
  function syncExportButton(state2) {
    if (!state2.exportEl) return;
    state2.exportEl.disabled = state2.isScanning || state2.results.size === 0;
  }
  function toCsvCell(value) {
    const text = String(value != null ? value : "").replace(/\r?\n/g, " | ");
    return `"${text.replace(/"/g, '""')}"`;
  }
  function toExcelHyperlink(url, label) {
    const safeUrl = String(url != null ? url : "").replace(/"/g, '""');
    const safeLabel = String(label != null ? label : "").replace(/"/g, '""');
    return `=HYPERLINK("${safeUrl}","${safeLabel}")`;
  }
  function exportResultsToCsv(state2) {
    const results = getSortedResults(state2);
    if (!results.length) return;
    const rows = [
      ["Player ID", "Player Link", "Player", "Country", "Club ID", "Club Link", "Club", "Age", "ASI", "Pos", "Reasons", "Sources"],
      ...results.map((item) => [
        item.playerId,
        item.playerId ? toExcelHyperlink(`${window.location.origin}/players/${item.playerId}/`, item.playerId) : "",
        item.name,
        item.country,
        item.clubId,
        item.clubId ? toExcelHyperlink(`${window.location.origin}/club/${item.clubId}/`, item.clubId) : "",
        item.clubName,
        `${item.age}.${item.months}`,
        item.asi,
        item.position,
        (item.reasons || []).join(" | "),
        (item.sources || []).join(" | ")
      ])
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(toCsvCell).join(",")).join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    link.href = url;
    link.download = `nt-save-${state2.countryCode}-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function handleResultSort(state2, sortKey) {
    if (!sortKey) return;
    if (state2.sortKey === sortKey) state2.sortDir *= -1;
    else {
      state2.sortKey = sortKey;
      state2.sortDir = sortKey === "asi" || sortKey === "age" ? -1 : 1;
    }
    renderResults(state2);
  }
  function renderResults(state2) {
    var _a;
    const results = getSortedResults(state2);
    state2.summary.results = results.length;
    syncExportButton(state2);
    if (!state2.resultsEl) return;
    if (!results.length) {
      state2.resultsEl.innerHTML = `<div class="tmvu-nt-save-empty">No NT save candidates were found for ${escapeHtml5(state2.countryCode.toUpperCase())}.</div>`;
      return;
    }
    state2.resultsEl.innerHTML = `
        ${createSummaryHtml(state2.summary)}
        <div class="tmvu-nt-save-results-toolbar">
            <div>Sorted by <strong>${escapeHtml5(((_a = RESULT_COLUMNS.find((col) => col.key === state2.sortKey)) == null ? void 0 : _a.label) || "Player")}</strong> ${state2.sortDir === 1 ? "ascending" : "descending"}.</div>
            <div>${escapeHtml5(String(results.length))} rows</div>
        </div>
        <table class="tmvu-nt-save-result-table">
            <thead>
                <tr>
                    ${RESULT_COLUMNS.map((col) => `
                        <th>
                            <button
                                type="button"
                                class="tmvu-nt-save-sort${state2.sortKey === col.key ? ` is-active ${state2.sortDir === 1 ? "asc" : "desc"}` : ""}"
                                data-nt-save-sort="${escapeHtml5(col.key)}"
                            >${escapeHtml5(col.label)}</button>
                        </th>
                    `).join("")}
                </tr>
            </thead>
            <tbody>
                ${results.map((item) => `
                    <tr>
                        <td>
                            <a href="/players/${escapeHtml5(item.playerId)}/" target="_blank" rel="noreferrer">${escapeHtml5(item.name)}</a>
                        </td>
                        <td>
                            ${item.clubId ? `<a href="/club/${escapeHtml5(item.clubId)}/" target="_blank" rel="noreferrer">${escapeHtml5(item.clubName)}</a>` : escapeHtml5(item.clubName)}
                        </td>
                        <td>${escapeHtml5(`${item.age}.${item.months}`)}</td>
                        <td>${escapeHtml5(String(item.asi || 0))}</td>
                        <td>${escapeHtml5(item.position || "-")}</td>
                        <td><div class="tmvu-nt-save-tags">${createReasonTags(item.reasons)}</div></td>
                        <td><div class="tmvu-nt-save-sources">${item.sources.map((source) => escapeHtml5(source)).join("<br>")}</div></td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
    state2.resultsEl.querySelectorAll("[data-nt-save-sort]").forEach((button) => {
      button.addEventListener("click", () => handleResultSort(state2, button.getAttribute("data-nt-save-sort")));
    });
  }
  function setStatus(state2, html) {
    if (state2.statusEl) state2.statusEl.innerHTML = html;
    if (state2.miniStatusEl) state2.miniStatusEl.textContent = cleanText4(html.replace(/<[^>]+>/g, " "));
  }
  function setProgress(state2, { phase = "", current = 0, total = 0, note = "" } = {}) {
    var _a, _b;
    const safeTotal = Math.max(0, Number(total) || 0);
    const safeCurrent = Math.max(0, Math.min(safeTotal || Number(current) || 0, Number(current) || 0));
    const percent = safeTotal > 0 ? Math.max(0, Math.min(100, Math.round(safeCurrent / safeTotal * 100))) : 0;
    const now = Date.now();
    if (!state2.progressTimer || state2.progressTimer.phase !== phase || safeCurrent < (((_a = state2.progress) == null ? void 0 : _a.current) || 0)) {
      state2.progressTimer = { phase, startedAt: now };
    }
    let etaText = "ETA --:--";
    if (safeTotal > 0 && safeCurrent > 0 && ((_b = state2.progressTimer) == null ? void 0 : _b.startedAt)) {
      const elapsedMs = Math.max(1, now - state2.progressTimer.startedAt);
      const rate = safeCurrent / elapsedMs;
      if (rate > 0) {
        const remainingMs = Math.max(0, (safeTotal - safeCurrent) / rate);
        etaText = `ETA ${formatDuration(remainingMs)}`;
      }
    }
    state2.progress = {
      phase,
      current: safeCurrent,
      total: safeTotal,
      percent,
      note,
      etaText
    };
    if (state2.progressBarEl) state2.progressBarEl.style.width = `${percent}%`;
    if (state2.progressPhaseEl) state2.progressPhaseEl.textContent = phase || "Idle";
    if (state2.progressMetaEl) state2.progressMetaEl.textContent = safeTotal > 0 ? `${safeCurrent}/${safeTotal} \xB7 ${percent}% \xB7 ${etaText}` : "0/0 \xB7 0% \xB7 ETA --:--";
    if (state2.progressNoteEl) state2.progressNoteEl.textContent = note || "";
    if (state2.miniStatusEl) {
      const phaseText = phase ? `${phase} \xB7 ` : "";
      state2.miniStatusEl.textContent = `${phaseText}${safeTotal > 0 ? `${safeCurrent}/${safeTotal} \xB7 ${percent}% \xB7 ${etaText}` : "idle"}`;
    }
  }
  function ensureDialog(state2) {
    var _a, _b;
    if (state2.overlayEl) return;
    const overlay = document.createElement("div");
    overlay.className = "tmvu-nt-save-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="tmvu-nt-save-dialog" role="dialog" aria-modal="true" aria-labelledby="tmvu-nt-save-title">
            <div class="tmvu-nt-save-head">
                <div>
                    <div class="tmvu-nt-save-kicker">National Teams</div>
                    <h2 id="tmvu-nt-save-title">NT Save Scan \xB7 ${escapeHtml5(state2.countryCode.toUpperCase())}</h2>
                    <p>Scans last ${SCAN_SEASON_COUNT} seasons of league transfers and flagged league clubs for national-team save candidates.</p>
                </div>
                <div class="tmvu-nt-save-actions">
                    ${buttonHtml4({ label: "Run Scan", color: "primary", size: "sm", cls: "tmvu-nt-save-run", attrs: { "data-nt-save-run": "1" } })}
                    ${buttonHtml4({ label: "Export Excel CSV", color: "secondary", size: "sm", cls: "tmvu-nt-save-export", attrs: { "data-nt-save-export": "1" } })}
                    ${buttonHtml4({ label: "Close", color: "secondary", size: "sm", cls: "tmvu-nt-save-close", attrs: { "data-nt-save-close": "1" } })}
                </div>
            </div>
            <div class="tmvu-nt-save-body">
                <div class="tmvu-nt-save-status" data-nt-save-status>Ready to scan ${escapeHtml5(state2.countryCode.toUpperCase())}.</div>
                <div class="tmvu-nt-save-progress" data-nt-save-progress>
                    <div class="tmvu-nt-save-progress-top">
                        <div class="tmvu-nt-save-progress-label" data-nt-save-progress-phase>Idle</div>
                        <div class="tmvu-nt-save-progress-meta" data-nt-save-progress-meta>0/0 \xB7 0%</div>
                    </div>
                    <div class="tmvu-nt-save-progress-track">
                        <div class="tmvu-nt-save-progress-bar" data-nt-save-progress-bar></div>
                    </div>
                    <div class="tmvu-nt-save-progress-note" data-nt-save-progress-note>Waiting to start scan.</div>
                </div>
                <div data-nt-save-results></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    state2.overlayEl = overlay;
    state2.statusEl = overlay.querySelector("[data-nt-save-status]");
    state2.resultsEl = overlay.querySelector("[data-nt-save-results]");
    state2.runEl = overlay.querySelector("[data-nt-save-run]");
    state2.exportEl = overlay.querySelector("[data-nt-save-export]");
    state2.progressPhaseEl = overlay.querySelector("[data-nt-save-progress-phase]");
    state2.progressMetaEl = overlay.querySelector("[data-nt-save-progress-meta]");
    state2.progressBarEl = overlay.querySelector("[data-nt-save-progress-bar]");
    state2.progressNoteEl = overlay.querySelector("[data-nt-save-progress-note]");
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target.closest("[data-nt-save-close]")) {
        overlay.hidden = true;
      }
    });
    (_a = state2.runEl) == null ? void 0 : _a.addEventListener("click", () => runScan(state2));
    (_b = state2.exportEl) == null ? void 0 : _b.addEventListener("click", () => exportResultsToCsv(state2));
    syncExportButton(state2);
    setProgress(state2, { phase: "Idle", current: 0, total: 0, note: "Waiting to start scan." });
  }
  async function getTooltipCandidate(state2, playerId) {
    if (!playerId) return null;
    if (!state2.tooltipCache.has(playerId)) {
      state2.tooltipCache.set(playerId, TmApi2.fetchTooltipRaw(playerId).then((data) => data || null));
    }
    return state2.tooltipCache.get(playerId);
  }
  async function getClubPage(state2, clubId) {
    if (!clubId) return null;
    if (!state2.clubPageCache.has(clubId)) {
      state2.clubPageCache.set(clubId, TmApi2.fetchClubPageHtml(clubId).then((html) => html || null));
    }
    return state2.clubPageCache.get(clubId);
  }
  async function collectTransferPages(state2, divisionGroups) {
    const seasonStart = Number(state2.currentSeason) || 0;
    const seenPlayers = /* @__PURE__ */ new Map();
    const totalSteps = divisionGroups.reduce((sum, groupCtx) => sum + 1 + SCAN_SEASON_COUNT, 0);
    let completedSteps = 0;
    for (const groupCtx of divisionGroups) {
      state2.summary.groupsScanned += 1;
      setStatus(state2, `<strong>Scanning</strong> ${escapeHtml5(groupCtx.name)} \xB7 Group ${escapeHtml5(groupCtx.group)} \xB7 current league status`);
      setProgress(state2, {
        phase: "League scan",
        current: completedSteps,
        total: totalSteps,
        note: `${groupCtx.name} \xB7 Group ${groupCtx.group} \xB7 current league flags`
      });
      const leagueHtml = await TmApi2.fetchLeaguePageHtml(state2.countryCode, groupCtx.division, groupCtx.group);
      parseLeagueFlaggedClubs(leagueHtml, groupCtx).forEach((item) => {
        const existing = state2.flaggedClubs.get(item.clubId) || { ...item, statuses: [] };
        item.statuses.forEach((status) => {
          if (!existing.statuses.includes(status)) existing.statuses.push(status);
        });
        state2.flaggedClubs.set(item.clubId, existing);
      });
      completedSteps += 1;
      for (let offset = 0; offset < SCAN_SEASON_COUNT; offset++) {
        const season = seasonStart - offset;
        setStatus(state2, `<strong>Scanning</strong> ${escapeHtml5(groupCtx.name)} \xB7 Group ${escapeHtml5(groupCtx.group)} \xB7 Season ${escapeHtml5(String(season))} transfers`);
        setProgress(state2, {
          phase: "Transfer history",
          current: completedSteps,
          total: totalSteps,
          note: `${groupCtx.name} \xB7 Group ${groupCtx.group} \xB7 Season ${season}`
        });
        const html = await TmApi2.fetchLeagueTransferHistory(state2.countryCode, groupCtx.division, groupCtx.group, season);
        parseTransferHistory(html, groupCtx, season, state2.countryCode).forEach((entry) => {
          const existing = seenPlayers.get(entry.playerId) || {
            playerId: entry.playerId,
            playerName: entry.playerName,
            playerCountryCode: entry.playerCountryCode,
            hits: []
          };
          existing.playerName = existing.playerName || entry.playerName;
          existing.playerCountryCode = existing.playerCountryCode || entry.playerCountryCode;
          existing.hits.push(entry);
          seenPlayers.set(entry.playerId, existing);
        });
        completedSteps += 1;
      }
    }
    state2.summary.flaggedClubs = state2.flaggedClubs.size;
    state2.summary.transferCandidates = seenPlayers.size;
    return [...seenPlayers.values()];
  }
  async function processTransferCandidates(state2, transferCandidates) {
    for (let index = 0; index < transferCandidates.length; index++) {
      const candidate = transferCandidates[index];
      if (candidate.playerCountryCode !== normalizeCountryCode(state2.countryCode)) continue;
      setStatus(state2, `<strong>Inspecting players</strong> ${index + 1}/${transferCandidates.length} \xB7 ${escapeHtml5(candidate.playerName || candidate.playerId)}`);
      setProgress(state2, {
        phase: "Tooltip checks",
        current: index + 1,
        total: transferCandidates.length,
        note: candidate.playerName || candidate.playerId
      });
      const tooltipData = await getTooltipCandidate(state2, candidate.playerId);
      const player = tooltipData == null ? void 0 : tooltipData.player;
      const club = tooltipData == null ? void 0 : tooltipData.club;
      if (!player) continue;
      if (!matchesTargetCountry(player, state2.countryCode)) continue;
      const record = buildCandidateRecord(player, club);
      const transferSources = candidate.hits.slice(0, 10).map((hit) => `S${hit.season} \xB7 D${hit.division}.${hit.group} \xB7 ${hit.transferType}`);
      record.sources.push(...transferSources);
      if (lowerText(club == null ? void 0 : club.created) === "inactive") {
        record.reasons.push("club inactive");
        upsertCandidate(state2.results, record);
        continue;
      }
      const clubId = record.clubId;
      const clubHtml = await getClubPage(state2, clubId);
      if (hasClubBannedBadge(clubHtml)) {
        record.reasons.push("club banned");
        upsertCandidate(state2.results, record);
      }
    }
  }
  async function processFlaggedClubs(state2) {
    const flaggedClubs = [...state2.flaggedClubs.values()];
    for (let index = 0; index < flaggedClubs.length; index++) {
      const flaggedClub = flaggedClubs[index];
      setStatus(state2, `<strong>Inspecting clubs</strong> ${index + 1}/${flaggedClubs.length} \xB7 ${escapeHtml5(flaggedClub.clubName)}`);
      setProgress(state2, {
        phase: "Flagged club squads",
        current: index + 1,
        total: flaggedClubs.length,
        note: flaggedClub.clubName
      });
      const squadData = await TmApi2.fetchSquadRaw(flaggedClub.clubId, { skipSync: true });
      const squadPlayers = Array.isArray(squadData == null ? void 0 : squadData.post) ? squadData.post : [];
      for (const squadPlayer of squadPlayers) {
        let countryCode = resolvePlayerCountryCode(squadPlayer);
        let tooltipData = null;
        if (!countryCode) {
          tooltipData = await getTooltipCandidate(state2, squadPlayer.id || squadPlayer.player_id);
          countryCode = resolvePlayerCountryCode(tooltipData == null ? void 0 : tooltipData.player);
        }
        if (countryCode !== normalizeCountryCode(state2.countryCode)) continue;
        const player = (tooltipData == null ? void 0 : tooltipData.player) || squadPlayer;
        const club = (tooltipData == null ? void 0 : tooltipData.club) || {
          id: flaggedClub.clubId,
          club_name: flaggedClub.clubName,
          created: flaggedClub.statuses.includes("league-inactive") ? "inactive" : ""
        };
        const record = buildCandidateRecord(player, club, flaggedClub.clubId, flaggedClub.clubName);
        flaggedClub.statuses.forEach((status) => {
          record.reasons.push(status === "league-inactive" ? "league inactive squad" : "league banned squad");
        });
        record.sources.push(`Current league \xB7 D${flaggedClub.division}.${flaggedClub.group}`);
        upsertCandidate(state2.results, record);
      }
    }
  }
  async function runScan(state2) {
    if (state2.isScanning) return;
    state2.isScanning = true;
    state2.progressTimer = null;
    state2.results.clear();
    state2.flaggedClubs.clear();
    state2.summary = {
      groupsScanned: 0,
      transferCandidates: 0,
      flaggedClubs: 0,
      results: 0
    };
    ensureDialog(state2);
    state2.overlayEl.hidden = false;
    state2.runEl.disabled = true;
    syncExportButton(state2);
    state2.resultsEl.innerHTML = "";
    setProgress(state2, { phase: "Preparing", current: 0, total: 1, note: `Loading divisions for ${state2.countryCode.toUpperCase()}` });
    try {
      setStatus(state2, `<strong>Preparing</strong> divisions for ${escapeHtml5(state2.countryCode.toUpperCase())}...`);
      const divisionsData = await TmApi2.fetchLeagueDivisions(state2.countryCode);
      const divisionGroups = normalizeDivisionGroups((divisionsData == null ? void 0 : divisionsData.divisions) || []);
      if (!divisionGroups.length) {
        setStatus(state2, `<strong>Failed</strong> to load league divisions for ${escapeHtml5(state2.countryCode.toUpperCase())}.`);
        setProgress(state2, { phase: "Failed", current: 0, total: 0, note: "No divisions returned." });
        renderResults(state2);
        return;
      }
      const transferCandidates = await collectTransferPages(state2, divisionGroups);
      await processTransferCandidates(state2, transferCandidates);
      await processFlaggedClubs(state2);
      setStatus(state2, `<strong>Done</strong> scan complete for ${escapeHtml5(state2.countryCode.toUpperCase())}. Found ${escapeHtml5(String(state2.results.size))} candidates.`);
      setProgress(state2, {
        phase: "Completed",
        current: state2.results.size,
        total: Math.max(state2.results.size, 1),
        note: `Found ${state2.results.size} candidates for ${state2.countryCode.toUpperCase()}.`
      });
      renderResults(state2);
    } catch (error) {
      setStatus(state2, `<strong>Failed</strong> ${escapeHtml5((error == null ? void 0 : error.message) || "Unknown error")}`);
      setProgress(state2, { phase: "Failed", current: 0, total: 0, note: (error == null ? void 0 : error.message) || "Unknown error" });
      renderResults(state2);
    } finally {
      state2.isScanning = false;
      if (state2.runEl) state2.runEl.disabled = false;
      syncExportButton(state2);
    }
  }
  var TmNationalTeamsNtSave = {
    mount({ navEl, countryCode = "", currentSeason: currentSeason2 = null } = {}) {
      var _a, _b;
      if (!navEl || !countryCode) return null;
      injectStyles5();
      const state2 = {
        countryCode: lowerText(countryCode),
        currentSeason: Number(currentSeason2) || Number((_a = window.SESSION) == null ? void 0 : _a.season) || null,
        tooltipCache: /* @__PURE__ */ new Map(),
        clubPageCache: /* @__PURE__ */ new Map(),
        flaggedClubs: /* @__PURE__ */ new Map(),
        results: /* @__PURE__ */ new Map(),
        summary: {
          groupsScanned: 0,
          transferCandidates: 0,
          flaggedClubs: 0,
          results: 0
        },
        isScanning: false,
        overlayEl: null,
        statusEl: null,
        resultsEl: null,
        runEl: null,
        miniStatusEl: null,
        progressPhaseEl: null,
        progressMetaEl: null,
        progressBarEl: null,
        progressNoteEl: null,
        exportEl: null,
        progress: null,
        progressTimer: null,
        sortKey: "name",
        sortDir: 1
      };
      const panel = document.createElement("section");
      panel.className = "tmvu-nt-save-panel";
      panel.innerHTML = `
            <div class="tmvu-nt-save-kicker">National Teams</div>
            <div class="tmvu-nt-save-title">NT Save Finder \xB7 ${escapeHtml5(state2.countryCode.toUpperCase())}</div>
            <div class="tmvu-nt-save-copy">Scans league transfer history, inactive clubs, banned clubs and flagged league squads for players eligible for NT save.</div>
            ${buttonHtml4({ label: "Find NT Save Players", color: "secondary", size: "sm", cls: "tmvu-nt-save-btn", attrs: { "data-nt-save-open": "1" } })}
            <div class="tmvu-nt-save-mini" data-nt-save-mini>Idle</div>
        `;
      (_b = panel.querySelector("[data-nt-save-open]")) == null ? void 0 : _b.addEventListener("click", () => {
        ensureDialog(state2);
        state2.overlayEl.hidden = false;
        if (!state2.results.size && !state2.isScanning) runScan(state2);
      });
      state2.miniStatusEl = panel.querySelector("[data-nt-save-mini]");
      const navListEl = navEl.querySelector(".tmvu-side-menu-nav");
      if (navListEl) {
        const separator = document.createElement("div");
        separator.className = "tmvu-side-menu-separator";
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "tmu-list-item tmvu-nt-save-action";
        actionButton.innerHTML = '<span class="tmu-list-icon">\u{1F6DF}</span><span class="tmu-list-lbl">NT Save Players</span>';
        actionButton.addEventListener("click", () => {
          ensureDialog(state2);
          state2.overlayEl.hidden = false;
          if (!state2.results.size && !state2.isScanning) runScan(state2);
        });
        const inlineStatus = document.createElement("div");
        inlineStatus.className = "tmvu-nt-save-inline-status";
        inlineStatus.textContent = "Idle";
        state2.miniStatusEl = inlineStatus;
        navListEl.append(separator, actionButton);
        navEl.appendChild(inlineStatus);
        return actionButton;
      }
      navEl.appendChild(panel);
      return panel;
    }
  };

  // src/pages/national-teams.js
  (function() {
    "use strict";
    const routeMatch = window.location.pathname.match(/^\/national-teams\/(?:([a-z]{2,3})\/?)?$/i);
    if (!routeMatch) return;
    const main = document.querySelector(".tmvu-main, .main_center");
    if (!main) return;
    const sourceRoot = main.cloneNode(true);
    const STYLE_ID6 = "tmvu-national-teams-style";
    const { R5_THRESHOLDS: R5_THRESHOLDS2 } = TmConst;
    const CURRENT_SEASON = typeof SESSION !== "undefined" && SESSION.season ? Number(SESSION.season) : null;
    const cleanText5 = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const escapeHtml6 = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const metricHtml = (opts) => TmUI.metric(opts);
    const decodeHtmlEntities = (value) => {
      const text = String(value || "");
      if (!text.includes("&")) return text;
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    };
    const injectStyles6 = () => {
      if (document.getElementById(STYLE_ID6)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID6;
      style.textContent = `
            .tmvu-main.tmvu-nt-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 0.9fr) 390px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-nt-main,
            .tmvu-nt-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-nt-country {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .tmvu-nt-country ib,
            .tmvu-nt-country img {
                flex-shrink: 0;
            }

            .tmvu-nt-subcopy {
                color: #8aac72;
                font-size: 12px;
                line-height: 1.6;
                max-width: 54ch;
            }

            .tmvu-nt-subcopy a {
                color: #d8efc2;
                text-decoration: none;
            }

            .tmvu-nt-subcopy a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-chip-row .tmu-chip {
                background: rgba(108,192,64,.12);
                border: 1px solid rgba(108,192,64,.2);
                color: #d7efbf;
            }

            .tmvu-nt-logo-shell {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 132px;
                border-radius: 18px;
                background:
                    radial-gradient(circle at center, rgba(108,192,64,.18), rgba(108,192,64,.02) 60%, transparent 75%),
                    linear-gradient(180deg, rgba(10,18,6,.52), rgba(10,18,6,.12));
                border: 1px solid rgba(61,104,40,.24);
            }

            .tmvu-nt-logo-shell img {
                width: 104px;
                height: 104px;
                object-fit: contain;
                filter: drop-shadow(0 8px 18px rgba(0,0,0,.35));
            }

            .tmvu-nt-stat-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }

            .tmvu-nt-standings-wrap,
            .tmvu-nt-squad-wrap {
                border: 1px solid rgba(61,104,40,.22);
                border-radius: 10px;
                overflow: hidden;
                background: rgba(12,24,9,.28);
            }

            .tmvu-nt-standings-wrap table,
            .tmvu-nt-squad-wrap table {
                width: 100%;
                border-collapse: collapse;
            }

            .tmvu-nt-standings-wrap td,
            .tmvu-nt-standings-wrap th,
            .tmvu-nt-squad-wrap td,
            .tmvu-nt-squad-wrap th {
                border: 0;
            }

            .tmvu-nt-standings-wrap tr,
            .tmvu-nt-squad-wrap tr {
                background: transparent !important;
            }

            .tmvu-nt-standings-wrap tr:nth-child(even),
            .tmvu-nt-squad-wrap tr:nth-child(even) {
                background: rgba(255,255,255,.025) !important;
            }

            .tmvu-nt-standings-wrap td,
            .tmvu-nt-standings-wrap th {
                padding: 9px 8px;
                color: #d7ebc9;
                font-size: 12px;
                text-align: center;
                border-bottom: 1px solid rgba(61,104,40,.16);
            }

            .tmvu-nt-standings-wrap td.name,
            .tmvu-nt-standings-wrap .align_left {
                text-align: left;
            }

            .tmvu-nt-standings-wrap .highlighted_row_done td,
            .tmvu-nt-standings-wrap .highlight_td {
                background: rgba(108,192,64,.12) !important;
                color: #fff;
                font-weight: 700;
            }

            .tmvu-nt-standings-wrap a,
            .tmvu-nt-squad-wrap a,
            .tmvu-nt-fixture-team a,
            .tmvu-nt-trophy-title a {
                color: #eef8e8;
                text-decoration: none;
            }

            .tmvu-nt-standings-wrap a:hover,
            .tmvu-nt-squad-wrap a:hover,
            .tmvu-nt-fixture-team a:hover,
            .tmvu-nt-trophy-title a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-standings-wrap img[src*="/pics/trophies/"] {
                width: 56px;
                height: 56px;
                object-fit: contain;
                filter: drop-shadow(0 4px 10px rgba(0,0,0,.22));
            }

            .tmvu-nt-fixture-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .tmvu-nt-fixture-row {
                position: relative;
                display: grid;
                grid-template-columns: 58px minmax(0, 1fr) auto minmax(0, 1fr) 54px;
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid rgba(61,104,40,.2);
                background: rgba(12,24,9,.34);
            }

            .tmvu-nt-fixture-date {
                color: #8aac72;
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-nt-fixture-team {
                min-width: 0;
                display: inline-flex;
                align-items: center;
                gap: 7px;
                color: #d7ebc9;
                font-size: 12px;
            }

            .tmvu-nt-fixture-team.home {
                justify-content: flex-end;
                text-align: right;
            }

            .tmvu-nt-fixture-team.away {
                justify-content: flex-start;
                text-align: left;
            }

            .tmvu-nt-fixture-team.is-focus {
                color: #fff;
                font-weight: 800;
            }

            .tmvu-nt-fixture-team a.normal {
                flex: 1 1 auto;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .tmvu-nt-fixture-score a,
            .tmvu-nt-fixture-score span {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 58px;
                min-height: 30px;
                padding: 0 10px;
                border-radius: 999px;
                background: rgba(42,74,28,.38);
                color: #eef8e8;
                font-size: 13px;
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-nt-fixture-type {
                justify-self: end;
                min-width: 40px;
                padding: 4px 7px;
                border-radius: 999px;
                background: rgba(96,165,250,.14);
                color: #cfe1ff;
                font-size: 10px;
                font-weight: 800;
                text-align: center;
                letter-spacing: .06em;
            }

            .tmvu-nt-empty {
                padding: 10px 2px 4px;
                color: #8aac72;
                font-size: 12px;
            }

            .tmvu-nt-trophy-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-nt-trophy-item {
                display: grid;
                grid-template-columns: 72px minmax(0, 1fr);
                gap: 12px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(61,104,40,.18);
            }

            .tmvu-nt-trophy-icon {
                height: 58px;
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
                filter: saturate(1.05);
            }

            .tmvu-nt-trophy-title {
                color: #eef8e8;
                font-size: 13px;
                font-weight: 700;
                line-height: 1.4;
            }

            .tmvu-nt-trophy-season {
                margin-top: 3px;
                color: #8aac72;
                font-size: 11px;
            }

            .tmvu-nt-squad-wrap td {
                padding: 8px;
                border-bottom: 1px solid rgba(61,104,40,.16);
                color: #d7ebc9;
                font-size: 12px;
            }

            .tmvu-nt-squad-wrap th {
                padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,.2);
                color: #8aac72;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: .08em;
                background: rgba(42,74,28,.28);
            }

            .tmvu-nt-squad-wrap tr:last-child td {
                border-bottom: none;
            }

            .tmvu-nt-squad-wrap th:first-child,
            .tmvu-nt-squad-wrap td:first-child {
                text-align: right;
                white-space: nowrap;
            }

            .tmvu-nt-squad-wrap th:nth-child(2),
            .tmvu-nt-squad-wrap td:nth-child(2) {
                text-align: left;
                padding-right: 0;
            }

            .tmvu-nt-squad-wrap th:nth-child(3),
            .tmvu-nt-squad-wrap td:nth-child(3) {
                width: 180px;
                padding-left: 0;
                padding-right: 0;
            }

            .tmvu-nt-squad-wrap th:last-child,
            .tmvu-nt-squad-wrap td:last-child {
                text-align: right;
                white-space: nowrap;
            }

            .tmvu-nt-squad-name a {
                color: #eef8e8;
                text-decoration: none;
                font-weight: 700;
            }

            .tmvu-nt-squad-name a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-squad-loading,
            .tmvu-nt-squad-error {
                padding: 10px 2px 4px;
            }

            .tmvu-nt-squad-wrap .favposition {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0;
                font-weight: 700;
            }

            .tmvu-nt-squad-wrap .gk { color: #7fe185; }
            .tmvu-nt-squad-wrap .d { color: #7db9ff; }
            .tmvu-nt-squad-wrap .dm,
            .tmvu-nt-squad-wrap .m,
            .tmvu-nt-squad-wrap .om { color: #ffd45f; }
            .tmvu-nt-squad-wrap .f { color: #ff9476; }
            .tmvu-nt-squad-wrap .side,
            .tmvu-nt-squad-wrap .split { color: #8aac72; }

            @media (max-width: 1220px) {
                .tmvu-main.tmvu-nt-page {
                    grid-template-columns: 184px minmax(0, 0.94fr) 350px;
                }
            }
        `;
      document.head.appendChild(style);
    };
    const parseMenu = () => Array.from(sourceRoot.querySelectorAll(".column1 .content_menu > *")).flatMap((node) => {
      if (node.tagName === "HR") return [{ type: "separator" }];
      if (node.tagName !== "A") return [];
      const label = cleanText5(node.textContent);
      return [{
        type: "link",
        href: node.getAttribute("href") || "#",
        label,
        icon: /players/i.test(label) ? "\u{1F465}" : /tournaments/i.test(label) ? "\u{1F3C6}" : /rankings/i.test(label) ? "\u{1F4C8}" : /fixtures/i.test(label) ? "\u{1F4C5}" : /statistics/i.test(label) ? "\u{1F4CA}" : /history/i.test(label) ? "\u{1F4DC}" : /election/i.test(label) ? "\u{1F5F3}" : "\u{1F30D}",
        isSelected: node.classList.contains("selected")
      }];
    });
    const parseFactTable = (table) => Array.from((table == null ? void 0 : table.querySelectorAll("tr")) || []).map((row) => {
      var _a, _b;
      const label = cleanText5(((_a = row.querySelector("th")) == null ? void 0 : _a.textContent) || "");
      const valueCell = row.querySelector("td:last-child");
      const valueHtml = ((_b = valueCell == null ? void 0 : valueCell.innerHTML) == null ? void 0 : _b.trim()) || "";
      if (!label || !valueHtml) return null;
      return { label, valueHtml };
    }).filter(Boolean);
    const sanitizeStandingsTable = (table) => {
      if (!table) return "";
      const clone = table.cloneNode(true);
      clone.querySelectorAll('td[rowspan] img[src*="/pics/trophies/"]').forEach((img) => {
        var _a;
        (_a = img.closest("td[rowspan]")) == null ? void 0 : _a.remove();
      });
      return clone.outerHTML;
    };
    const parseOverview = () => {
      var _a;
      const box = sourceRoot.querySelector(".column2_a > .box");
      if (!box) return null;
      const subHeader = box.querySelector(".box_sub_header");
      const countryNode = subHeader == null ? void 0 : subHeader.querySelector(".large");
      const changeLink = subHeader == null ? void 0 : subHeader.querySelector(".float_right");
      const overviewTable = box.querySelector(".std table.zebra");
      const logoSrc = ((_a = overviewTable == null ? void 0 : overviewTable.querySelector('img[src*="/pics/nt_logos/"]')) == null ? void 0 : _a.getAttribute("src")) || "";
      const facts = parseFactTable(overviewTable);
      const sections = Array.from(box.querySelectorAll("h3")).map((heading) => {
        const title = cleanText5(heading.textContent);
        const body = heading.nextElementSibling;
        if (!body || !body.classList.contains("std")) return null;
        const factTable = body.querySelector("table.zebra:not(.group_table):not(.fixtures_table)");
        const standingsTable = body.querySelector("table.group_table");
        const fixtureTable = body.querySelector("table.fixtures_table");
        if (factTable) {
          return { type: "facts", title, items: parseFactTable(factTable) };
        }
        if (standingsTable) {
          return { type: "standings", title, html: sanitizeStandingsTable(standingsTable) };
        }
        if (fixtureTable) {
          return { type: "fixtures", title, rows: parseFixtures(fixtureTable) };
        }
        return null;
      }).filter(Boolean);
      const countryInfoSection = sections.find((section) => section.type === "facts");
      const uetaChampionsCup = (countryInfoSection == null ? void 0 : countryInfoSection.items.find((item) => /ueta champions cup spots/i.test(item.label))) || null;
      return {
        countryName: cleanText5((countryNode == null ? void 0 : countryNode.textContent) || "National Team"),
        countryHtml: (countryNode == null ? void 0 : countryNode.innerHTML) || escapeHtml6(cleanText5((countryNode == null ? void 0 : countryNode.textContent) || "National Team")),
        changeHtml: (changeLink == null ? void 0 : changeLink.outerHTML) || "",
        logoSrc,
        facts,
        uetaChampionsCup,
        sections
      };
    };
    function parseFixtures(table) {
      return Array.from(table.querySelectorAll("tr")).map((row) => {
        var _a, _b;
        const cells = row.querySelectorAll("td");
        if (cells.length < 5) return null;
        const homeCell = row.querySelector("td.home") || cells[1];
        const awayCell = row.querySelector("td.away") || cells[3];
        const resultCell = cells[2];
        const typeCell = cells[4];
        const matchHref = ((_a = resultCell.querySelector("a")) == null ? void 0 : _a.getAttribute("href")) || "";
        const matchId = ((_b = matchHref.match(/\/(?:matches\/nt|matches)\/(\d+)\//)) == null ? void 0 : _b[1]) || "";
        return {
          date: cleanText5(cells[0].textContent),
          homeHtml: homeCell.innerHTML,
          awayHtml: awayCell.innerHTML,
          resultHtml: resultCell.innerHTML,
          resultHref: matchHref,
          resultText: cleanText5(resultCell.textContent || "vs"),
          matchId,
          type: cleanText5(typeCell.textContent),
          focus: homeCell.classList.contains("bold") ? "home" : awayCell.classList.contains("bold") ? "away" : ""
        };
      }).filter(Boolean);
    }
    const parseTrophies = () => {
      var _a;
      const trophyHead = Array.from(sourceRoot.querySelectorAll(".column3_a .box_head h2")).find((node) => /trophies/i.test(node.textContent || ""));
      const trophyBody = (_a = trophyHead == null ? void 0 : trophyHead.closest(".box_head")) == null ? void 0 : _a.nextElementSibling;
      return Array.from((trophyBody == null ? void 0 : trophyBody.querySelectorAll(".clearfix")) || []).map((row) => {
        var _a2;
        const icon = row.children[0];
        const content = row.children[1];
        const subtle = content == null ? void 0 : content.querySelector(".subtle");
        const season = cleanText5((subtle == null ? void 0 : subtle.textContent) || "");
        if (subtle) subtle.remove();
        return {
          iconStyle: (icon == null ? void 0 : icon.getAttribute("style")) || "",
          titleHtml: ((_a2 = content == null ? void 0 : content.innerHTML) == null ? void 0 : _a2.replace(/<br\s*\/?>/gi, " ").trim()) || "",
          season
        };
      }).filter((item) => item.titleHtml);
    };
    const parseSquad = () => {
      var _a;
      const squadHead = Array.from(sourceRoot.querySelectorAll(".column3_a .box_head h2")).find((node) => /squad/i.test(node.textContent || ""));
      const squadBody = (_a = squadHead == null ? void 0 : squadHead.closest(".box_head")) == null ? void 0 : _a.nextElementSibling;
      const rows = Array.from((squadBody == null ? void 0 : squadBody.querySelectorAll("table tr")) || []).map((row) => {
        var _a2, _b;
        const cells = row.querySelectorAll("td");
        const playerAnchor = row.querySelector('a[player_link], a[href*="/players/"]');
        if (!playerAnchor || cells.length < 3) return null;
        const playerId = playerAnchor.getAttribute("player_link") || ((_b = (_a2 = playerAnchor.getAttribute("href")) == null ? void 0 : _a2.match(/\/players\/(\d+)\//)) == null ? void 0 : _b[1]) || "";
        return {
          playerId: String(playerId),
          number: cleanText5(cells[0].textContent),
          name: decodeHtmlEntities(cleanText5(playerAnchor.textContent)),
          href: playerAnchor.getAttribute("href") || "#"
        };
      }).filter((row) => row && row.playerId);
      return { rows };
    };
    const formatAge = (player) => {
      var _a;
      const years = Number(player == null ? void 0 : player.age) || 0;
      const months = Number((_a = player == null ? void 0 : player.months) != null ? _a : player == null ? void 0 : player.month) || 0;
      return `${years}.${String(months).padStart(2, "0")}`;
    };
    const formatR5 = (value) => {
      if (!Number.isFinite(Number(value))) return '<span style="color:#6a9a58">\u2014</span>';
      const numeric = Number(value);
      return `<span style="color:${TmUtils.getColor(numeric, R5_THRESHOLDS2)};font-weight:700">${numeric.toFixed(1)}</span>`;
    };
    const loadSquadPlayers = async (squad) => {
      const players = await Promise.all(squad.rows.map(async (row) => {
        try {
          const response = await TmPlayerService.fetchPlayerTooltip(row.playerId);
          const player = response == null ? void 0 : response.player;
          if (!player) return null;
          return {
            id: String(player.id || row.playerId),
            href: `/players/${player.id || row.playerId}/`,
            name: decodeHtmlEntities(player.name || row.name),
            age: formatAge(player),
            posHtml: TmPosition.chip(player.positions || []),
            r5Html: formatR5(player.r5)
          };
        } catch (e) {
          return null;
        }
      }));
      return players.filter(Boolean);
    };
    const buildSquadTable = (players) => {
      if (!players.length) return '<div class="tmvu-nt-empty">No squad players available.</div>';
      return `
            <div class="tmvu-nt-squad-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Age</th>
                            <th>Pos</th>
                            <th>Name</th>
                            <th>R5</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map((player) => `
                            <tr>
                                <td>${escapeHtml6(player.age)}</td>
                                <td>${player.posHtml}</td>
                                <td class="tmvu-nt-squad-name"><a href="${player.href}">${escapeHtml6(player.name)}</a></td>
                                <td>${player.r5Html}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    };
    const hydrateSquadCard = async (host, squad) => {
      if (!host) return;
      host.innerHTML = `<div class="tmvu-nt-squad-loading">${TmUI.loading("Loading squad...", true)}</div>`;
      try {
        const players = await loadSquadPlayers(squad);
        host.innerHTML = buildSquadTable(players);
      } catch (error) {
        host.innerHTML = `<div class="tmvu-nt-squad-error">${TmUI.error(`Failed to load squad: ${error.message}`, true)}</div>`;
      }
    };
    const renderOverviewCard = (overview) => {
      const wrap = document.createElement("section");
      const quickFacts = overview.facts.slice(0, 6);
      if (overview.uetaChampionsCup && !quickFacts.some((item) => /ueta champions cup spots/i.test(item.label))) {
        quickFacts.push(overview.uetaChampionsCup);
      }
      const changeHtml = overview.changeHtml ? overview.changeHtml.replace(/\bfloat_right\b/g, "").replace(/class="([^"]*)"/, (_, classes) => `class="${`${classes} tmu-btn tmu-btn-secondary rounded-full py-1 px-3 text-sm`.replace(/\s+/g, " ").trim()}"`) : "";
      TmHeroCard.mount(wrap, {
        cardClass: "tmvu-nt-overview-card",
        sideClass: "tmvu-nt-logo-shell",
        slots: {
          kicker: "National Team",
          title: `<span class="tmvu-nt-country">${overview.countryHtml}</span>`,
          subtitle: '<span class="tmvu-nt-subcopy">Recent form, trophies, fixtures and senior squad in one place.</span>',
          actions: changeHtml,
          side: overview.logoSrc ? `<img src="${overview.logoSrc}" alt="${escapeHtml6(overview.countryName)} logo">` : "",
          footer: `
                    <div class="tmvu-nt-stat-grid">
                        ${quickFacts.map((item) => metricHtml({ label: escapeHtml6(item.label), value: item.valueHtml, tone: "overlay", size: "sm" })).join("")}
                    </div>
                `
        }
      });
      return wrap.firstElementChild || wrap;
    };
    const renderStandingsCard = (title, html) => {
      const wrap = document.createElement("section");
      TmUI.render(wrap, `
            <tm-card data-title="${escapeHtml6(title)}" data-icon="\u{1F3C1}">
                <div class="tmvu-nt-standings-wrap">${html}</div>
            </tm-card>
        `);
      return wrap.firstElementChild || wrap;
    };
    const renderFixturesCard = (title, rows) => {
      const wrap = document.createElement("section");
      TmUI.render(wrap, `
            <tm-card data-title="${escapeHtml6(title)}" data-icon="\u{1F4C5}">
                ${rows.length ? `
                    <div class="tmvu-nt-fixture-list">
                        ${rows.map((row) => `
                            <div class="tmvu-nt-fixture-row" data-mid="${escapeHtml6(row.matchId)}" data-season="${CURRENT_SEASON || ""}">
                                <div class="tmvu-nt-fixture-date">${escapeHtml6(row.date)}</div>
                                <div class="tmvu-nt-fixture-team home${row.focus === "home" ? " is-focus" : ""}">${row.homeHtml}</div>
                                <div class="tmvu-nt-fixture-score">${row.resultHref ? `<a href="${row.resultHref}">${escapeHtml6(row.resultText)}</a>` : `<span>${escapeHtml6(row.resultText)}</span>`}</div>
                                <div class="tmvu-nt-fixture-team away${row.focus === "away" ? " is-focus" : ""}">${row.awayHtml}</div>
                                <div class="tmvu-nt-fixture-type">${escapeHtml6(row.type || "NT")}</div>
                            </div>
                        `).join("")}
                    </div>
                ` : '<div class="tmvu-nt-empty">No matches listed.</div>'}
            </tm-card>
        `);
      return wrap.firstElementChild || wrap;
    };
    const renderTrophiesCard = (items) => {
      const wrap = document.createElement("section");
      TmUI.render(wrap, `
            <tm-card data-title="Trophies" data-icon="\u{1F3C6}">
                ${items.length ? `
                    <div class="tmvu-nt-trophy-list">
                        ${items.map((item) => `
                            <div class="tmvu-nt-trophy-item">
                                <div class="tmvu-nt-trophy-icon" style="${item.iconStyle}"></div>
                                <div>
                                    <div class="tmvu-nt-trophy-title">${item.titleHtml}</div>
                                    ${item.season ? `<div class="tmvu-nt-trophy-season">${escapeHtml6(item.season)}</div>` : ""}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                ` : '<div class="tmvu-nt-empty">No trophies listed.</div>'}
            </tm-card>
        `);
      return wrap.firstElementChild || wrap;
    };
    const renderSquadCard = (squad) => {
      const wrap = document.createElement("section");
      TmUI.render(wrap, `
            <tm-card data-title="Squad" data-icon="\u{1F465}">
                <div data-ref="squad-host"></div>
            </tm-card>
        `);
      return wrap.firstElementChild || wrap;
    };
    const render = () => {
      var _a, _b;
      injectStyles6();
      TmMatchHoverCard.injectStyles();
      const overview = parseOverview();
      if (!overview) return;
      const menuItems = parseMenu();
      const activeHref = ((_a = menuItems.find((item) => item.isSelected)) == null ? void 0 : _a.href) || window.location.pathname;
      const trophies = parseTrophies();
      const squad = parseSquad();
      main.classList.add("tmvu-nt-page");
      main.innerHTML = "";
      const sideMenuEl = TmSideMenu.mount(main, {
        id: "tmvu-national-teams-nav",
        className: "tmvu-national-teams-nav",
        items: menuItems,
        currentHref: activeHref
      });
      TmNationalTeamsNtSave.mount({
        navEl: sideMenuEl,
        countryCode: routeMatch[1] || cleanText5(((_b = window.SESSION) == null ? void 0 : _b.country) || ""),
        currentSeason: CURRENT_SEASON
      });
      const mainColumn = document.createElement("section");
      mainColumn.className = "tmvu-nt-main";
      mainColumn.appendChild(renderOverviewCard(overview));
      overview.sections.forEach((section) => {
        if (section.type === "standings" && section.html) {
          mainColumn.appendChild(renderStandingsCard(section.title, section.html));
        }
        if (section.type === "fixtures") {
          mainColumn.appendChild(renderFixturesCard(section.title, section.rows));
        }
      });
      const sideColumn = document.createElement("aside");
      sideColumn.className = "tmvu-nt-side";
      sideColumn.appendChild(renderTrophiesCard(trophies));
      const squadCard = renderSquadCard(squad);
      sideColumn.appendChild(squadCard);
      main.append(mainColumn, sideColumn);
      hydrateSquadCard(squadCard.querySelector('[data-ref="squad-host"]'), squad);
      TmMatchHoverCard.bind(Array.from(main.querySelectorAll(".tmvu-nt-fixture-row[data-mid]")).filter((row) => row.dataset.mid), { season: CURRENT_SEASON });
    };
    render();
  })();
})();

