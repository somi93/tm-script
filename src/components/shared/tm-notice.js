const STYLE_ID = 'tm-notice-style';

const CSS_TEXT = `
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

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    target.appendChild(style);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeNoticeArgs(content, opts = {}) {
    if (content && typeof content === 'object' && !Array.isArray(content)) {
        return { ...content };
    }
    return { ...opts, text: content };
}

function buildClassName(opts) {
    return [
        'tmu-notice',
        opts.variant === 'footnote' ? 'tmu-notice-footnote' : 'tmu-notice-surface',
        opts.tone === 'warm' ? 'tmu-notice-tone-warm' : '',
        opts.tone === 'muted' ? 'tmu-notice-tone-muted' : '',
        opts.cls || opts.className || '',
    ].filter(Boolean).join(' ');
}

function getInnerHtml(opts) {
    if (opts.html != null) return String(opts.html);
    return escapeHtml(opts.text);
}

export const TmNotice = {
    cssText: CSS_TEXT,
    injectCSS(target = document.head) {
        ensureStyle(target);
    },
    notice(content, opts = {}) {
        ensureStyle(document.head);
        const normalized = normalizeNoticeArgs(content, opts);
        const tag = normalized.tag || 'div';
        return `<${tag} class="${buildClassName(normalized)}">${getInnerHtml(normalized)}</${tag}>`;
    },
    noticeElement(content, opts = {}) {
        ensureStyle(document.head);
        const normalized = normalizeNoticeArgs(content, opts);
        const node = document.createElement(normalized.tag || 'div');
        node.className = buildClassName(normalized);
        if (normalized.html != null) node.innerHTML = String(normalized.html);
        else node.textContent = String(normalized.text ?? '');
        return node;
    },
};