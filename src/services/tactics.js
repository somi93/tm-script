import { _post, _dedup } from './engine.js';

// ── Shared tactics rule helpers ───────────────────────────────────────────────
export const CLUB_COUNTRY = String(window.SESSION?.country || '').trim().toLowerCase();
export const isForeigner = (p) => !!CLUB_COUNTRY && String(p?.country || '').trim().toLowerCase() !== CLUB_COUNTRY;
export const isUnavailable = (p) =>
    (p?.ban && String(p.ban).startsWith('r')) ||
    (p?.injury && p.injury !== '0' && Number(p.injury) !== 0);

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function encodeNested(obj, prefix = '') {
    const parts = [];
    for (const [key, val] of Object.entries(obj)) {
        const k = prefix ? `${prefix}[${key}]` : key;
        if (val !== null && val !== undefined && typeof val === 'object') {
            parts.push(encodeNested(val, k));
        } else if (val !== null && val !== undefined) {
            parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(val)}`);
        }
    }
    return parts.join('&');
}

export const TmTacticsService = {

    fetchTacticsRaw(reserves, national, miniGameId) {
        return _dedup(`tactics:get:${reserves}:${national}:${miniGameId}`, () =>
            _post('/ajax/tactics_get.ajax.php', { reserves, national, miniGameId })
        );
    },

    postLineupSave(assoc, changedPlayers, reserves, national, miniGameId) {
        return fetch('/ajax/tactics_post.ajax.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: encodeNested({ on_field: assoc, players: changedPlayers, reserves, national, miniGameId }),
        });
    },

    saveSettingValue(saveKey, value, reserves, national, miniGameId) {
        const clubId = String(window.SESSION?.id || window.SESSION?.main_id || window.SESSION?.club_id || '');
        const body = { save: saveKey, value: String(value), reserves, national, club_id: clubId };
        if (saveKey !== 'focus') body.miniGameId = miniGameId;
        return fetch('/ajax/tactics_post.ajax.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: new URLSearchParams(body).toString(),
        });
    },
};