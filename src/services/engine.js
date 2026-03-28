import { TmConst } from '../lib/tm-constants.js';
import { TmSync } from '../lib/tm-dbsync.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmMatchCacheDB, TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmUtils } from '../lib/tm-utils.js';

const _errors = [];
const _logError = (context, err) => {
    const entry = { context, err, time: Date.now() };
    _errors.push(entry);
    if (typeof TmApi?.onError === 'function') TmApi.onError(entry);
    console.warn(`[TmApi] ${context}`, err);
};

const _post = (url, data) => new Promise(resolve => {
    const $ = window.jQuery;
    if (!$) { resolve(null); return; }
    const isFeedDebugRequest = /top_user_info\.ajax\.php|feed_get\.ajax\.php/i.test(String(url || ''));
    $.post(url, data)
        .done(res => {
            if (isFeedDebugRequest) {
                console.log('[tmvu api post:done]', url, data, res);
            }
            try { resolve(typeof res === 'object' ? res : JSON.parse(res)); }
            catch (e) {
                if (isFeedDebugRequest) {
                    console.error('[tmvu api post:parse-error]', url, data, res, e);
                }
                _logError(`JSON parse: ${url}`, e);
                resolve(null);
            }
        })
        .fail((xhr, s, e) => {
            if (isFeedDebugRequest) {
                console.error('[tmvu api post:fail]', url, data, {
                    status: xhr?.status,
                    statusText: xhr?.statusText,
                    responseText: xhr?.responseText,
                    error: e || s,
                });
            }
            _logError(`POST ${url}`, e || s);
            resolve(null);
        });
});

const _get = (url) => new Promise(resolve => {
    const $ = window.jQuery;
    if (!$) { resolve(null); return; }
    $.get(url)
        .done(res => {
            try { resolve(typeof res === 'object' ? res : JSON.parse(res)); }
            catch (e) { _logError(`JSON parse: ${url}`, e); resolve(null); }
        })
        .fail((xhr, s, e) => { _logError(`GET ${url}`, e || s); resolve(null); });
});

const _getHtml = (url) => new Promise(resolve => {
    const $ = window.jQuery;
    if (!$) { resolve(null); return; }
    $.ajax({ url, type: 'GET', dataType: 'html' })
        .done(res => resolve(res || null))
        .fail(() => resolve(null));
});

// ─── In-flight deduplication ────────────────────────────────────────────
// Prevents multiple concurrent identical fetches for the same key.
const _inflight = new Map();
const _dedup = (key, promiseFn) => {
    if (_inflight.has(key)) return _inflight.get(key);
    const p = promiseFn().finally(() => _inflight.delete(key));
    _inflight.set(key, p);
    return p;
};

// Named exports for use by individual service modules
export { _post, _get, _getHtml, _dedup, _logError, _errors };

// ─────────────────────────────────────────────────────────────────────────

export const TmApiEngine = {

    errors: _errors,
    onError: null,

};

