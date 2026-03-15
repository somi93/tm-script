
import { _post, _dedup, _logError } from './engine.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmSync } from '../lib/tm-dbsync.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmUtils } from '../lib/tm-utils.js';

// Resolved-promise cache — survives for the lifetime of the page
const _tooltipResolvedCache = new Map();

export const TmPlayerService = {

        /**
         * Fetch raw player tooltip response without normalization or DB writes.
         * Use this when you need the plain API response in non-playerdb contexts.
         * @param {string|number} playerId
         * @returns {Promise<object|null>}
         */
        fetchTooltipRaw(playerId) {
            return _dedup(`tooltip:${playerId}`, () => _post('/ajax/tooltip.ajax.php', { player_id: playerId }));
        },

        /**
         * Like fetchTooltipRaw but keeps the resolved promise in a page-level cache.
         * Subsequent calls return the same promise immediately — no re-fetch, no re-dedup.
         * @param {string|number} playerId
         * @returns {Promise<object|null>}
         */
        fetchTooltipCached(playerId) {
            const pid = String(playerId);
            if (!_tooltipResolvedCache.has(pid)) {
                _tooltipResolvedCache.set(pid, this.fetchTooltipRaw(pid));
            }
            return _tooltipResolvedCache.get(pid);
        },
    
    
        fetchPlayerTooltip(player_id) {
            return _dedup(`tooltip:${player_id}`, () => _post('/ajax/tooltip.ajax.php', { player_id })).then(data => {
                if (!data?.player) return data;
                data.retired = data.player.club_id === null || data.club === null;
                const DBPlayer = TmPlayerDB.get(player_id);
                if (data.retired) {
                    if (DBPlayer) {
                        TmPlayerArchiveDB.set(player_id, DBPlayer).then(() => TmPlayerDB.remove(player_id));
                        console.log(`%c[Cleanup] Archived retired/deleted player ${player_id}`, 'font-weight:bold;color:#fbbf24');
                    }
                    return data;
                }
                this.normalizePlayer(data.player, DBPlayer);
                return data;
            });
        },
    
        /**
         * Fetch the players_get_info endpoint.
         * show_non_pro_graphs is always included automatically.
         * @param {string|number} pid
         * @param {string} type — 'history' | 'training' | 'graphs' | 'scout' | etc.
         * @param {object} [extra={}] — optional extra params (e.g. { scout_id: '123' })
         * @returns {Promise<object|null>}
         */
        fetchPlayerInfo(pid, type, extra = {}) {
            return _post('/ajax/players_get_info.ajax.php', {
                player_id: pid,
                type,
                show_non_pro_graphs: true,
                ...extra
            });
        },
    /**
     * One-time migration: backfill meta (name, pos, isGK, country) on existing DB records
     * that were saved before the meta field existed. Safe to call on every tooltip fetch —
     * no-ops once the record already has meta.pos populated.
     * @param {object} player — normalized player object
     * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
     */
    _migratePlayerMeta(player, DBPlayer) {
        try {
            if (!DBPlayer || !DBPlayer.meta) {
                if (!DBPlayer) DBPlayer = {};
                DBPlayer.meta = {
                    name: player.name || '',
                    pos: player.favposition,
                    isGK: player.isGK,
                    country: player.country || '',
                    club_id: player.club_id != null ? String(player.club_id) : undefined,
                };
                TmPlayerDB.set(player.id, DBPlayer);
            } else {
                let dirty = false;
                if (!DBPlayer.meta.name && player.name) { DBPlayer.meta.name = player.name; dirty = true; }
                if (!DBPlayer.meta.country && player.country) { DBPlayer.meta.country = player.country; dirty = true; }
                // pos + isGK always sync — player may have changed position
                if (player.favposition && player.favposition !== DBPlayer.meta.pos) {
                    DBPlayer.meta.pos = player.favposition;
                    DBPlayer.meta.isGK = player.isGK;
                    dirty = true;
                } else if (DBPlayer.meta.isGK == null) { DBPlayer.meta.isGK = player.isGK; dirty = true; }
                // club_id always sync — player may have transferred
                if (player.club_id != null && String(player.club_id) !== DBPlayer.meta.club_id) {
                    DBPlayer.meta.club_id = String(player.club_id); dirty = true;
                }
                if (dirty) TmPlayerDB.set(player.id, DBPlayer);
            }
        } catch (e) { _logError('_migratePlayerMeta', e); }
    },

    /**
     * Parses all raw string/numeric scalar fields on a player object in-place.
     * Called by normalizePlayer() before skill or position resolution.
     */
    _parseScalars(player) {
        player.asi = TmUtils.parseNum(player.asi || player.skill_index);
        player.wage = TmUtils.parseNum(player.wage);
        player.age = parseInt(player.age) || 0;
        player.id = parseInt(player.player_id || player.id);
        player.months = parseInt(player.month || player.months) || 0;
        player.ageMonths = player.age * 12 + player.months;
        player.ageMonthsString = `${player.age}.${player.months}`;
        player.trainingCustom = player.training_custom || '';
        player.training = player.training || '';
        const s = window.SESSION;
        const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
        player.isOwnPlayer = ownClubIds.includes(Number(player.club_id));
        player.routine = parseFloat(player.rutine || player.routine) || 0;
        player.isGK = String(player.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
    },

    /**
     * Resolves a player's skills array from one of three sources (in priority order):
     *   1. IndexedDB record for the player's current age key
     *   2. Tooltip-API rich objects (already { key, value } shaped)
     *   3. Squad-API flat numeric fields on the player object
     * Returns an array of skill objects matching the given defs.
     */
    _resolveSkills(player, defs, DBRecord) {
        const ageKey = player.ageMonthsString;
        if (DBRecord && DBRecord.records?.[ageKey]) {
            const skills = DBRecord.records[ageKey].skills;
            return defs.map(def => {
                const raw = skills[def.id];
                const v = (typeof raw === 'object' && raw !== null) ? raw.value : raw;
                return { ...def, value: parseFloat(v) || 0 };
            });
        }
        if (player.skills && Array.isArray(player.skills) && typeof player.skills[0] === 'object' && 'key' in player.skills[0]) {
            /* Tooltip API: skills already rich objects — reorder to match defs and normalise value */
            return defs.map(def => {
                const sk = player.skills.find(s => s.key === def.key || (def.key2 && s.key === def.key2));
                const raw = sk?.value ?? 0;
                const value = typeof raw === 'string' && raw.includes('star') ? (raw.includes('silver') ? 19 : 20) : (parseFloat(raw) || 0);
                return { ...def, value };
            });
        }
        /* Squad API: individual numeric fields on player — use key, falling back to removing underscores */
        return defs.map(def => {
            const raw = player[def.key] ?? player[def.key.replace(/_/g, '')];
            return { ...def, value: parseFloat(raw) || 0 };
        });
    },

    /**
     * Converts string fields (asi, wage, age, months, routine) to numbers.
     * Safe to call multiple times (idempotent once numeric).
     * @param {object} player — raw player from fetchPlayerTooltip / tooltip.ajax.php
     * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
     * @returns {object} the same player, mutated
     */
    normalizePlayer(player, DBPlayer, { skipSync = false } = {}) {
        this._parseScalars(player);
        this._migratePlayerMeta(player, DBPlayer);
        const defs = player.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
        player.skills = this._resolveSkills(player, defs, DBPlayer);
        const applyPositions = () => {
            player.positions = String(player.favposition || '').split(',').map(s => {
                const pos = s.trim().toLowerCase();
                const positionData = TmConst.POSITION_MAP[pos];
                if (!positionData) return null;
                return {
                    ...positionData,
                    r5: TmLib.calculatePlayerR5(positionData, player),
                    rec: TmLib.calculatePlayerREC(positionData, player)
                };
            }).filter(Boolean).sort((a, b) => a.ordering - b.ordering);
            player.r5 = Math.max(0, ...player.positions.map(p => parseFloat(p.r5) || 0));
            player.rec = Math.max(0, ...player.positions.map(p => parseFloat(p.rec) || 0));
            player.ti = TmLib.calculateTIPerSession(player);
        };

        const syncPromise = skipSync ? null : TmSync?.syncPlayerStore(player, DBPlayer);
        if (syncPromise instanceof Promise) {
            syncPromise.then(updatedDB => {
                const curRec = updatedDB?.records?.[player.ageMonthsString];
                if (!curRec?.skills) return;
                player.skills = this._resolveSkills(player, defs, updatedDB);
                applyPositions();
                window.dispatchEvent(new CustomEvent('tm:player-synced', { detail: { id: player.id, player } }));
            });
        }

        applyPositions();
        player.name = player.player_name || player.name;
        return player;
    },
}