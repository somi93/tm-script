import { TmUI } from './tm-ui.js';

if (!document.getElementById('tm-hero-card-style')) {
    const style = document.createElement('style');
    style.id = 'tm-hero-card-style';
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

        .tmvu-hero-card-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,.1);
            background: rgba(42,74,28,.32);
            color: #e8f5d8;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
        }

        .tmvu-hero-card-btn:hover {
            background: rgba(108,192,64,.14);
            color: #fff;
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
        const tag = href ? 'a' : 'button';
        const cls = ['tmvu-hero-card-btn', className].filter(Boolean).join(' ');
        const idAttr = id ? ` id="${id}"` : '';
        const hrefAttr = href ? ` href="${href}"` : '';
        const typeAttr = href ? '' : ` type="${type}"`;
        const extraAttrs = attrs ? ` ${attrs.trim()}` : '';
        return `<${tag}${idAttr} class="${cls}"${hrefAttr}${typeAttr}${extraAttrs}>${label}</${tag}>`;
    },

    mount(container, {
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

        return TmUI.render(container, `
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
        `);
    },
};