import { TmHeroCard } from './tm-hero-card.js';

const STYLE_ID = 'tmu-page-hero-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
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

export const TmPageHero = {
    mount(container, opts = {}) {
        injectStyles();
        return TmHeroCard.mount(container, {
            ...opts,
            heroClass: ['tmu-page-hero', opts.heroClass].filter(Boolean).join(' '),
            sideClass: ['tmu-page-hero-side', opts.sideClass].filter(Boolean).join(' '),
        });
    },
};
