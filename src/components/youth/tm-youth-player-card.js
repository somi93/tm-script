import { TmUI } from '../shared/tm-ui.js';
import { TmSkill } from '../shared/tm-skill.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmPosition } from '../../lib/tm-position.js';

const STYLE_ID = 'tmvu-youth-player-card-style';

const _esc = TmUtils.escHtml;
const _fmtAge = (p) => `${p.age}.${String(p.month).padStart(2, '0')}`;
const _fmtAsi = (v) => Number.isFinite(v) ? Math.round(v).toLocaleString('en-US') : '--';
const _posChip = (player) => {
    const prefs = player.positions.filter(p => p.preferred).map(p => p.key);
    const keys = prefs.length ? prefs : player.positions.slice(0, 1).map(p => p.key);
    return TmPosition.chip(keys);
};

export const TmYouthPlayerCard = {
    injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            .tmvu-yd-player-card {
                display: grid;
                gap: var(--tmu-space-md);
                padding: var(--tmu-space-lg);
                min-width: 0;
                border-radius: var(--tmu-space-lg);
                background: var(--tmu-card-bg);
                border: 1px solid var(--tmu-border-soft-alpha);
                box-shadow: 0 10px 22px var(--tmu-shadow-elev);
                position: relative;
            }
            .tmvu-yd-player-card::before {
                content: '';
                position: absolute;
                inset: 0 auto 0 0;
                width: var(--tmu-space-xs);
                border-radius: var(--tmu-space-lg) 0 0 var(--tmu-space-lg);
                background: linear-gradient(180deg, #5f8925, #3f5f1c);
            }
            .tmvu-yd-player-card-status::before {
                background: linear-gradient(180deg, #547b22, #39551a);
            }
            .tmvu-yd-player-name {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-2xl);
                font-weight: 900;
                line-height: 1.15;
            }
            .tmvu-yd-player-name a { color: inherit; text-decoration: none; }
            .tmvu-yd-player-name a:hover { text-decoration: underline; }
            .tmvu-yd-stars-row {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-md);
                margin-top: var(--tmu-space-md);
                padding-top: var(--tmu-space-md);
                border-top: 1px solid var(--tmu-border-soft-alpha);
            }
            .tmvu-yd-rating-row {
                display: grid;
                grid-template-columns: repeat(4, minmax(82px, 1fr));
                gap: var(--tmu-space-sm);
                min-width: min(100%, 392px);
            }
            .tmvu-yd-rating-row .tmu-metric,
            .tmvu-yd-skills .tmu-metric {
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-soft-alpha);
            }
            .tmvu-yd-rating-row .tmu-metric {
                background: #324a17;
                box-shadow: 0 8px 18px var(--tmu-shadow-soft);
            }
            .tmvu-yd-rating-row .tmu-metric { min-width: 0; }
            .tmvu-yd-rating-row .tmu-metric-value { font-size: var(--tmu-font-xl); line-height: 1; }
            .tmvu-yd-skills-panel {
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-lg);
                border: 1px solid var(--tmu-border-soft-alpha);
                background: #35501a;
            }
            .tmvu-yd-skills-panel-hidden {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: var(--tmu-space-md);
            }
            .tmvu-yd-skills {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
                gap: var(--tmu-space-sm);
            }
            .tmvu-yd-skills .tmu-metric { background: #1f2c0d; }
            .tmvu-yd-skills .tmu-metric-value { font-size: var(--tmu-font-md); line-height: 1; }
            @keyframes tmvu-yd-skill-in {
                from { opacity: 0; transform: scale(0.82) translateY(3px); }
                to   { opacity: 1; transform: none; }
            }
        `;
        document.head.appendChild(s);
    },

    renderActionButtons(player) {
        if (!player.id || player._status !== 'active') return '';
        return `<div style="display:flex;flex-wrap:wrap;gap:var(--tmu-space-sm);margin-top:var(--tmu-space-md)" data-player-actions="${Number(player.id)}"></div>`;
    },

    renderStatus(player) {
        const statusCopy = player._status === 'hired'
            ? `The youth player was hired successfully.${player._resultPlayerId ? ` <a href="/players/${_esc(player._resultPlayerId)}" style="color:var(--tmu-accent)">Open player profile</a>.` : ''}`
            : 'The youth player was released from the intake.';
        return `
            <article class="tmvu-yd-player-card tmvu-yd-player-card-status">
                <div style="display:grid;gap:var(--tmu-space-sm);min-width:0">
                    <div class="tmu-kicker">Age ${_fmtAge(player)}</div>
                    <div class="tmvu-yd-player-name">${_esc(player.name || 'Youth Player')}</div>
                    <div>${_posChip(player)}</div>
                    <div class="tmu-note" style="line-height:1.6;font-size:var(--tmu-font-sm)">${statusCopy}</div>
                </div>
            </article>
        `;
    },

    render(player) {
        if (player._status !== 'active') return this.renderStatus(player);

        const isRevealed = Boolean(player._revealed);
        const skillSum = player.skills.reduce((sum, s) => sum + Math.floor(s.value ?? 0), 0);
        const profileName = player.id
            ? `<a href="/players/${_esc(player.id)}">${_esc(player.name)}</a>`
            : _esc(player.name);
        const skillsHtml = player.skills
            .filter(s => s.value != null)
            .map(s => TmUI.metric({ label: s.name.slice(0, 3), value: TmSkill.skillBadge(s.value), tone: 'muted', size: 'sm' }))
            .join('');

        return `
            <article class="tmvu-yd-player-card" id="tmvu-youth-player-${Number(player.id)}">
                <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--tmu-space-lg);align-items:start;min-width:0">
                    <div style="min-width:0">
                        <div class="tmu-kicker">Age ${_fmtAge(player)}</div>
                        <div style="display:flex;flex-wrap:wrap;gap:var(--tmu-space-md);align-items:center;margin-top:var(--tmu-space-sm)">
                            <div class="tmvu-yd-player-name">${profileName}</div>
                            <div>${_posChip(player)}</div>
                        </div>
                        <div class="tmvu-yd-stars-row">
                            <div class="tmu-kicker">Stars</div>
                            <div class="tmu-text-strong">${isRevealed ? (player.youthRecommendationHtml || '-') : 'Hidden until reveal'}</div>
                        </div>
                        ${this.renderActionButtons(player)}
                    </div>
                    <div class="tmvu-yd-rating-row">
                        ${TmUI.metric({ label: 'ASI', value: isRevealed ? _fmtAsi(player.asi) : '--', tone: 'overlay', size: 'lg' })}
                        ${TmUI.metric({ label: 'R5', value: isRevealed ? TmUtils.formatR5(player.r5, '--') : '--', tone: 'overlay', size: 'lg', valueAttrs: { style: `color:${isRevealed ? TmUtils.r5Color(player.r5) : 'var(--tmu-text-muted)'}` } })}
                        ${TmUI.metric({ label: 'REC', value: isRevealed ? (player.rec != null ? TmUtils.fix2(player.rec) : '--') : '--', tone: 'overlay', size: 'lg', valueAttrs: { style: `color:${isRevealed ? TmUtils.getColor(player.rec, TmConst.REC_THRESHOLDS) : 'var(--tmu-text-muted)'}` } })}
                        ${TmUI.metric({ label: 'Skill Sum', value: isRevealed ? String(skillSum) : '--', tone: 'overlay', size: 'lg' })}
                    </div>
                </div>
                <div class="tmvu-yd-skills-panel${isRevealed ? '' : ' tmvu-yd-skills-panel-hidden'}">
                    ${isRevealed
                        ? `<div class="tmvu-yd-skills">${skillsHtml}</div>`
                        : `<div class="tmu-note" style="font-size:var(--tmu-font-sm);max-width:52ch"><strong class="tmu-text-strong">Skills are hidden.</strong> Reveal this youth report to unlock skill values, recommendation stars and player actions.</div>`
                    }
                </div>
            </article>
        `;
    },

    animateReveal(playerId) {
        const card = document.getElementById(`tmvu-youth-player-${Number(playerId)}`);
        if (!card) return;
        const skills = card.querySelectorAll('.tmvu-yd-skills .tmu-metric');
        skills.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.82) translateY(3px)';
            setTimeout(() => {
                el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                el.style.opacity = '1';
                el.style.transform = '';
            }, i * 500);
        });
        const afterMs = skills.length > 0 ? (skills.length - 1) * 500 + 350 : 350;
        const ratingEls = [...card.querySelectorAll('.tmvu-yd-rating-row .tmu-metric')];
        const starsText = card.querySelector('.tmvu-yd-stars-row .tmu-text-strong');
        [...ratingEls, starsText].filter(Boolean).forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.82) translateY(3px)';
        });
        setTimeout(() => {
            [...ratingEls, starsText].filter(Boolean).forEach(el => {
                el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                el.style.opacity = '1';
                el.style.transform = '';
            });
        }, afterMs);
    },
};
