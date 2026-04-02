import { TmUI } from './tm-ui.js';

if (!document.getElementById('tm-section-card-style')) {
    const style = document.createElement('style');
    style.id = 'tm-section-card-style';
    style.textContent = `
        .tm-section-card-titlebar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--tmu-space-md);
        }
        .tm-section-card-title {
            font-size: var(--tmu-font-md);
            font-weight: 700;
            color: var(--tmu-text-inverse);
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
        }
    `;
    document.head.appendChild(style);
}

export const TmSectionCard = {
    mount(container, {
        title = '',
        icon = '',
        titleMode = 'head',
        titleBarClass = 'tm-section-card-titlebar',
        titleClass = 'tm-section-card-title',
        subtitle = '',
        subtitleId = '',
        flush = false,
        cardVariant = '',
        hostClass = '',
        metaClass = '',
        subtitleClass = '',
        beforeBodyHtml = '',
        bodyClass = '',
        bodyId = '',
        bodyHtml = '',
    } = {}) {
        if (!container) return {};

        const hostCls = hostClass ? ` class="${hostClass}"` : '';
        const titleHtml = title && titleMode === 'body'
            ? `<div data-ref="titleBar"${titleBarClass ? ` class="${titleBarClass}"` : ''}><div data-ref="title"${titleClass ? ` class="${titleClass}"` : ''}>${icon ? `${icon} ` : ''}${title}</div></div>`
            : '';
        const metaHtml = subtitle
            ? `<div data-ref="meta"${metaClass ? ` class="${metaClass}"` : ''}><div data-ref="subtitle"${subtitleClass ? ` class="${subtitleClass}"` : ''}${subtitleId ? ` id="${subtitleId}"` : ''}>${subtitle}</div></div>`
            : '';

        return TmUI.render(container, `
            <div${hostCls}>
                <tm-card${titleMode === 'head' ? ` data-title="${title}"${icon ? ` data-icon="${icon}"` : ''}` : ''}${flush ? ' data-flush' : ''}${cardVariant ? ` data-variant="${cardVariant}"` : ''}>
                    ${titleHtml}
                    ${metaHtml}
                    ${beforeBodyHtml}
                    <div data-ref="body"${bodyClass ? ` class="${bodyClass}"` : ''}${bodyId ? ` id="${bodyId}"` : ''}>${bodyHtml}</div>
                </tm-card>
            </div>
        `);
    },
};