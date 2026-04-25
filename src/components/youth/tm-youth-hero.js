import { TmPageHero } from '../shared/tm-page-hero.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmUtils } from '../../lib/tm-utils.js';

const _esc = TmUtils.escHtml;

const renderSelectOptions = (options, selectedValue) => options
    .map(o => `<option value="${_esc(o.value)}"${o.value === selectedValue ? ' selected' : ''}>${_esc(o.label)}</option>`)
    .join('');

export const TmYouthHero = {
    /**
     * Renders the youth page hero into `container` (a freshly-created div).
     * Returns the rendered innerHTML string for use in a larger template.
     *
     * @param {HTMLElement} container
     * @param {{
     *   pull: { visible: boolean, label: string, ageOptions: Array, positionOptions: Array },
     *   selectedAge: string,
     *   selectedPosition: string,
     *   activePlayers: number,
     *   hiddenPlayers: number,
     *   notice: string,
     * }} opts
     */
    render(container, { pull, selectedAge, selectedPosition, activePlayers, hiddenPlayers, notice }) {
        TmPageHero.mount(container, {
            slots: {
                title: 'Youth Development',
                main: `
                    <div>
                        <div class="tmu-kicker">How Estimates Work</div>
                        <p class="tmu-note" style="margin:var(--tmu-space-sm) 0 0;font-size:var(--tmu-font-sm);line-height:1.65">
                            Current youth players show their full report immediately.
                            Newly pulled players stay hidden until you reveal them,
                            matching the native youth flow before actions unlock.
                        </p>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:var(--tmu-space-md);margin-top:var(--tmu-space-lg)">
                        ${pull.visible ? `
                            <div style="display:flex;flex-wrap:wrap;gap:var(--tmu-space-sm);align-items:end">
                                <label style="display:grid;gap:var(--tmu-space-xs);min-width:128px">
                                    <span class="tmu-kicker">Age Focus</span>
                                    <select class="tmu-input tmu-input-full tmu-input-tone-overlay tmu-input-density-comfy" data-youth-age>
                                        ${renderSelectOptions(pull.ageOptions, selectedAge)}
                                    </select>
                                </label>
                                <label style="display:grid;gap:var(--tmu-space-xs);min-width:128px">
                                    <span class="tmu-kicker">Position Focus</span>
                                    <select class="tmu-input tmu-input-full tmu-input-tone-overlay tmu-input-density-comfy" data-youth-position>
                                        ${renderSelectOptions(pull.positionOptions, selectedPosition)}
                                    </select>
                                </label>
                            </div>
                        ` : ''}
                        <div style="display:flex;flex-wrap:wrap;gap:var(--tmu-space-sm);align-items:end" data-youth-bulk-actions></div>
                    </div>
                `,
                side: TmUI.metric({
                    label: 'Active / Hidden',
                    value: `${activePlayers} / ${hiddenPlayers}`,
                    tone: 'overlay',
                    size: 'xl',
                }),
                footer: notice ? TmUI.notice(notice) : '',
            },
        });
        return container.innerHTML;
    },
};
