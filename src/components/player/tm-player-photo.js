'use strict';

const STYLE_ID = 'tmvu-player-photo-style';

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-player-photo {
            width: var(--tmvu-player-photo-size, 112px);
            min-width: var(--tmvu-player-photo-size, 112px);
            height: var(--tmvu-player-photo-size, 112px);
            border-radius: var(--tmu-space-md);
            overflow: hidden;
            background: linear-gradient(180deg, var(--tmu-surface-item-dark), var(--tmu-surface-overlay));
            border: 1px solid var(--tmu-border-soft-alpha);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tmu-text-faint) 8%, transparent);
        }

        .tmvu-player-photo img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `;

    document.head.appendChild(style);
}

function extractImageSrc(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const srcMatch = raw.match(/src=['"]([^'"]+)['"]/i);
    return srcMatch ? srcMatch[1] : raw;
}

function html({ imageHtml = '', src = '', alt = '', size = 112, className = '' } = {}) {
    injectStyles();
    const resolvedSrc = src || extractImageSrc(imageHtml);
    return `<div class="tmvu-player-photo${className ? ` ${className}` : ''}" style="--tmvu-player-photo-size:${Number(size) || 112}px;">${resolvedSrc ? `<img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt || 'Player')}">` : ''}</div>`;
}

export const TmPlayerPhoto = { html, extractImageSrc };