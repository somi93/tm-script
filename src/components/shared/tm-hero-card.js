import { TmButton } from './tm-button.js';
import { TmUI } from './tm-ui.js';

if (!document.getElementById('tm-hero-card-style')) {
    const style = document.createElement('style');
    style.id = 'tm-hero-card-style';
    style.textContent = `
        .tmvu-hero-card-shell.tmu-card {
            border-radius: 16px;
        }

        .tmvu-hero-card {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(220px, .52fr);
            gap: 18px;
            padding: 20px;
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
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        .tmvu-hero-card-title {
            color: var(--tmu-text-strong);
            font-size: 30px;
            font-weight: 900;
            line-height: 1.02;
        }

        .tmvu-hero-card-subtitle {
            margin-top: 8px;
            color: var(--tmu-text-strong);
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

const toSlotHtml = (slot) => {
    if (!slot) return '';
    if (typeof slot === 'function') return String(slot() || '');
    return String(slot);
};

export const TmHeroCard = {
    button({
        label = '',
        id = '',
        href = '',
        className = '',
        attrs = '',
        type = 'button',
    } = {}) {
        const cls = ['tmu-btn', 'tmu-btn-secondary', 'rounded-full', 'py-1', 'px-3', 'text-sm', className].filter(Boolean).join(' ');
        if (href) {
            const idAttr = id ? ` id="${id}"` : '';
            const extraAttrs = attrs ? ` ${attrs.trim()}` : '';
            return `<a${idAttr} class="${cls}" href="${href}"${extraAttrs}>${label}</a>`;
        }

        return TmButton.button({
            label,
            id,
            color: 'secondary',
            size: 'sm',
            shape: 'full',
            type,
            cls: className,
        }).outerHTML;
    },

    mount(container, {
        cardClass = '',
        cardVariant = 'soft',
        heroClass = '',
        mainClass = '',
        sideClass = '',
        footerClass = '',
        slots = {},
    } = {}) {
        if (!container) return {};

        const kickerHtml = toSlotHtml(slots.kicker);
        const titleHtml = toSlotHtml(slots.title);
        const subtitleHtml = toSlotHtml(slots.subtitle);
        const mainSlotHtml = toSlotHtml(slots.main);
        const actionsHtml = toSlotHtml(slots.actions);
        const sideHtml = toSlotHtml(slots.side);
        const footerHtml = toSlotHtml(slots.footer);
        const shellClass = ['tmvu-hero-card-shell', cardClass].filter(Boolean).join(' ');

        return TmUI.render(container, `
            <tm-card data-ref="card" data-body-ref="body" data-flush${cardVariant ? ` data-variant="${cardVariant}"` : ''}${shellClass ? ` data-cls="${shellClass}"` : ''}>
                <div data-ref="hero" class="tmvu-hero-card${heroClass ? ` ${heroClass}` : ''}">
                    <div data-ref="main" class="tmvu-hero-card-main${mainClass ? ` ${mainClass}` : ''}">
                        ${kickerHtml ? `<div class="tmvu-hero-card-kicker">${kickerHtml}</div>` : ''}
                        ${titleHtml ? `<div class="tmvu-hero-card-title">${titleHtml}</div>` : ''}
                        ${subtitleHtml ? `<div class="tmvu-hero-card-subtitle">${subtitleHtml}</div>` : ''}
                        ${mainSlotHtml ? `<div class="tmvu-hero-card-main-slot">${mainSlotHtml}</div>` : ''}
                        ${actionsHtml ? `<div data-ref="actions" class="tmvu-hero-card-actions">${actionsHtml}</div>` : ''}
                    </div>
                    ${sideHtml ? `<div data-ref="side" class="tmvu-hero-card-side${sideClass ? ` ${sideClass}` : ''}">${sideHtml}</div>` : ''}
                    ${footerHtml ? `<div data-ref="footer" class="tmvu-hero-card-footer${footerClass ? ` ${footerClass}` : ''}">${footerHtml}</div>` : ''}
                </div>
            </tm-card>
        `);
    },
};