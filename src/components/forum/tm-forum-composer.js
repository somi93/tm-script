import { TmSectionCard } from '../shared/tm-section-card.js';
import { TmUI } from '../shared/tm-ui.js';

const btn = (opts) => (TmUI.button(opts) || document.createElement('span')).outerHTML;

export const TmForumComposer = {
    /**
     * Mount a reply/compose card wrapping TM's live form element.
     * @param {Element} host  container to append the card into
     * @param {{ liveForm: Element, title: string }} props
     * @returns {Element|null}
     */
    mount(host, { liveForm, title }) {
        if (!liveForm) return null;

        // Park TM's original pickers off-screen so TM's own JS can still find them by ID
        ['smiley_picker', 'color_picker'].forEach((id) => {
            const el = liveForm.querySelector('#' + id);
            if (el) {
                el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden';
                document.body.appendChild(el);
            }
        });

        // BB text helpers assigned to window so inline onclick= attributes can call them
        window._tmvuF = {
            _ta() { return document.getElementById('topic_content'); },
            _wrap(open, close) {
                const ta = this._ta(); if (!ta) return;
                const s = ta.selectionStart, e = ta.selectionEnd;
                const sel = ta.value.substring(s, e);
                const ins = (sel.startsWith(open) && close && sel.endsWith(close))
                    ? sel.slice(open.length, sel.length - close.length)
                    : open + sel + close;
                ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e);
                ta.selectionStart = s; ta.selectionEnd = s + ins.length;
                ta.focus();
            },
            _ins(text) {
                const ta = this._ta(); if (!ta) return;
                const s = ta.selectionStart, e = ta.selectionEnd;
                ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
                ta.selectionStart = ta.selectionEnd = s + text.length;
                ta.focus();
            },
            bold()       { this._wrap('[b]', '[/b]'); },
            italic()     { this._wrap('[i]', '[/i]'); },
            code()       { this._wrap('[pre]', '[/pre]'); },
            color(c)     { this._wrap('[color=' + c + ']', '[/color]'); this._close(); },
            smiley(n)    { this._ins('[smiley=' + n + ']'); this._close(); },
            link(url) {
                url = (url || '').trim(); if (!url) return;
                const ta = this._ta(); if (!ta) return;
                const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd);
                if (sel) this._wrap('[url=' + url + ']', '[/url]');
                else this._ins('[url=' + url + ']' + url + '[/url]');
                this._close();
            },
            image(url) {
                url = (url || '').trim(); if (!url) return;
                this._ins('[img=' + url + ']');
                this._close();
            },
            player(id) {
                id = (id || '').trim(); if (!id) return;
                this._ins('[player=' + id + ']');
                this._close();
            },
            _panel() { return document.getElementById('tmvu-forum-panel'); },
            _close() {
                const p = this._panel();
                if (p) { p.style.display = 'none'; p.innerHTML = ''; }
            },
            _open(html) {
                const p = this._panel(); if (!p) return;
                p.innerHTML = html;
                p.style.display = 'block';
            },
            showColors() {
                this._open('<div class="tmvu-fpanel-colors">'
                    + ['yellow', 'orange', 'red', 'purple', 'blue', 'pink', 'black'].map(c =>
                        btn({ cls: 'tmvu-fcolor tmvu-fcolor--' + c, title: c, size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.color(\'' + c + '\')' } })
                    ).join('')
                    + btn({ slot: '&times;', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF._close()' } })
                    + '</div>');
            },
            showSmileys() {
                this._open('<div class="tmvu-fpanel-smileys">'
                    + [1, 2, 3, 4, 5, 6, 7].map(n =>
                        btn({ slot: '<span class="smiley smiley' + n + '"></span>', cls: 'tmvu-fsmiley', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.smiley(' + n + ')' } })
                    ).join('')
                    + btn({ slot: '&times;', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF._close()' } })
                    + '</div>');
            },
            showPrompt(type) {
                const ph = type === 'player' ? 'Player ID' : type === 'image' ? 'Image URL' : 'https://';
                const call = '_tmvuF.' + type + '(document.getElementById(\'tmvu-fpanel-input\').value)';
                this._open('<div class="tmvu-fpanel-prompt">'
                    + '<input id="tmvu-fpanel-input" type="text" class="tmvu-fpanel-input" placeholder="' + ph + '"'
                    + ' onkeydown="if(event.key===\'Enter\'){' + call + '}else if(event.key===\'Escape\'){_tmvuF._close()}">'
                    + btn({ label: 'OK', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: call } })
                    + btn({ slot: '&times;', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF._close()' } })
                    + '</div>');
                setTimeout(() => { document.getElementById('tmvu-fpanel-input')?.focus(); }, 20);
            },
        };

        const cardHost = document.createElement('div');
        TmSectionCard.mount(cardHost, { title: title || 'Reply', icon: '\u270D', bodyHtml: '<div class="tmvu-forum-form"></div>' });
        const card = cardHost.firstElementChild || cardHost;
        const wrap = card.querySelector('.tmvu-forum-form');

        // Topic title field (New Topic only)
        const titleInput = liveForm.querySelector('#topic_title');
        if (titleInput) {
            titleInput.className = 'tmvu-forum-title-input';
            titleInput.placeholder = 'Topic title…';
            wrap.appendChild(titleInput);
        }

        // SVG toolbar icons
        const icons = {
            B: '<svg viewBox="0 0 16 16" fill="none" stroke="none" xmlns="http://www.w3.org/2000/svg"><text x="2" y="13" font-size="13" font-weight="900" font-family="serif" fill="currentColor">B</text></svg>',
            I: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><text x="5" y="13" font-size="13" font-style="italic" font-weight="700" font-family="serif" fill="currentColor">I</text></svg>',
            code: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="5,4 1,8 5,12"/><polyline points="11,4 15,8 11,12"/></svg>',
            color: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" xmlns="http://www.w3.org/2000/svg"><path d="M8 2 L14 13 H2 Z" stroke-linejoin="round"/><line x1="4.5" y1="9.5" x2="11.5" y2="9.5"/></svg>',
            link: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4"/><path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12"/></svg>',
            img: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><circle cx="5.5" cy="6.5" r="1"/><path d="M1.5 11 L5 7.5 L8 10.5 L10.5 8 L14.5 13"/></svg>',
            user: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>',
            smiley: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6"/><circle cx="5.5" cy="7" r=".7" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7" r=".7" fill="currentColor" stroke="none"/><path d="M5.5 10.5 Q8 12.5 10.5 10.5" stroke-linejoin="round"/></svg>',
        };

        const tb = document.createElement('div');
        tb.className = 'tmvu-forum-form-toolbar';
        tb.innerHTML =
            btn({ slot: icons.B,      cls: 'tmvu-ftool', title: 'Bold',    size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.bold()' } })
            + btn({ slot: icons.I,    cls: 'tmvu-ftool', title: 'Italic',  size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.italic()' } })
            + btn({ slot: icons.code, cls: 'tmvu-ftool', title: 'Code',    size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.code()' } })
            + btn({ slot: icons.color,cls: 'tmvu-ftool', title: 'Color',   size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showColors()' } })
            + btn({ slot: icons.link, cls: 'tmvu-ftool', title: 'Link',    size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showPrompt(\'link\')' } })
            + btn({ slot: icons.img,  cls: 'tmvu-ftool', title: 'Image',   size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showPrompt(\'image\')' } })
            + btn({ slot: icons.user, cls: 'tmvu-ftool', title: 'Player',  size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showPrompt(\'player\')' } })
            + btn({ slot: icons.smiley, cls: 'tmvu-ftool', title: 'Smileys', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showSmileys()' } });

        const panel = document.createElement('div');
        panel.id = 'tmvu-forum-panel';
        panel.className = 'tmvu-forum-panel';

        // Ensure hidden submit_post field so form.submit() sends it server-side
        if (!liveForm.querySelector('[name="submit_post"][type="hidden"]')) {
            const hs = document.createElement('input');
            hs.type = 'hidden'; hs.name = 'submit_post'; hs.value = 'Submit';
            liveForm.appendChild(hs);
        }

        wrap.appendChild(tb);
        wrap.appendChild(panel);
        wrap.appendChild(liveForm);

        const acts = document.createElement('div');
        acts.innerHTML =
            btn({ label: 'Submit',  cls: 'tmvu-post-btn tmvu-post-btn--primary', color: 'primary',    size: 'xs', attrs: { onclick: 'document.getElementById(\'forum_post_form\').submit()' } })
            + btn({ label: 'Preview', cls: 'tmvu-post-btn',                       color: 'secondary',  size: 'xs', attrs: { onclick: 'pop_preview2()' } });
        wrap.appendChild(acts);

        host.appendChild(card);
        return card;
    },

    /**
     * Watch the DOM for #forum_post_form and mount it once available.
     * @param {Element} col  column to append composer into
     * @param {string} title
     */
    mountWhenReady(col, title) {
        const tryMount = () => {
            const f = document.querySelector('#forum_post_form');
            if (!f) return false;
            f.remove();
            TmForumComposer.mount(col, { liveForm: f, title });
            return true;
        };
        if (!tryMount()) {
            const obs = new MutationObserver(() => { if (tryMount()) obs.disconnect(); });
            obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }
    },
};
