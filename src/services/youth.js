import { TmConst } from '../lib/tm-constants.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { _dedup, _post } from './engine.js';
import { TmPlayerService } from './player.js';

const YOUTH_OUTFIELD_FIELDS = {
    strength: 'strength',
    stamina: 'stamina',
    pace: 'pace',
    marking: 'marking',
    tackling: 'tackling',
    workrate: 'workrate',
    positioning: 'positioning',
    passing: 'passing',
    crossing: 'crossing',
    technique: 'technique',
    heading: 'heading',
    finishing: 'finishing',
    longshots: 'longshots',
    setpieces: 'set_pieces',
};

const YOUTH_GK_FIELDS = {
    strength: 'strength',
    pace: 'pace',
    jumping: 'jumping',
    stamina: 'stamina',
    oneonones: 'one_on_ones',
    reflexes: 'reflexes',
    aerial: 'aerial_ability',
    communication: 'communication',
    kicking: 'kicking',
    throwing: 'throwing',
    handling: 'handling',
};

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

export const TmYouthService = {
    parseSkillValue(value) {
        if (Number.isFinite(value)) return Number(value);
        const text = String(value || '');
        const attrMatch = text.match(/(?:title|alt)=['"]?(\d{1,2})/i);
        if (attrMatch) return Number(attrMatch[1]);
        const plainMatch = cleanText(text).match(/\d+/);
        return plainMatch ? Number(plainMatch[0]) : null;
    },

    estimateASI(skillValues, isGK) {
        const values = skillValues.filter(Number.isFinite);
        if (!values.length) return 0;
        const weight = isGK ? TmConst.ASI_WEIGHT_GK : TmConst.ASI_WEIGHT_OUTFIELD;
        const integerSum = values.reduce((sum, value) => sum + value, 0);
        const nonMax = values.filter(value => value < 20).length;
        const assumedRemainder = Math.min(nonMax * 0.35, isGK ? 4.2 : 5.4);
        const totalPoints = integerSum + assumedRemainder;
        return totalPoints > 0 ? Math.round(Math.pow(totalPoints, 7) / weight) : 0;
    },

    buildRawYouthPlayer(player, index) {
        if (!player || typeof player !== 'object') return null;

        const id = Number.parseInt(player.id || player.player_id, 10);
        const favposition = String(player.favposition || '')
            .split(',')
            .map(value => value.trim().toLowerCase())
            .filter(Boolean)
            .join(',');
        const primaryPos = favposition.split(',')[0] || '';
        const isGK = primaryPos === 'gk';
        const fieldMap = isGK ? YOUTH_GK_FIELDS : YOUTH_OUTFIELD_FIELDS;
        const rawPlayer = {
            id,
            player_id: id,
            name: cleanText(player.player_name || player.name || `Youth Player ${index + 1}`),
            player_name: cleanText(player.player_name || player.name || `Youth Player ${index + 1}`),
            favposition,
            age: Number(player.age) || 0,
            month: 0,
            months: 0,
            wage: Number(player.wage) || 0,
            routine: 0,
            rutine: 0,
            club_id: window.SESSION?.main_id || null,
            youthRecommendationHtml: String(player.rec_stars || ''),
            youthPotential: Number(player.potential) || null,
            youthFee: Number(player.fee) || 0,
        };

        const skillValues = [];
        Object.entries(fieldMap).forEach(([sourceKey, targetKey]) => {
            const value = this.parseSkillValue(player[sourceKey]);
            if (!Number.isFinite(value)) return;
            rawPlayer[targetKey] = value;
            skillValues.push(value);
        });

        if (!skillValues.length) return null;

        const estimatedASI = this.estimateASI(skillValues, isGK);
        rawPlayer.asi = estimatedASI;
        rawPlayer.skill_index = estimatedASI;
        return rawPlayer;
    },

    normalizeYouthPlayer(player, index, { skipSync = true } = {}) {
        const rawPlayer = this.buildRawYouthPlayer(player, index);
        if (!rawPlayer) return null;

        const DBPlayer = skipSync ? null : TmPlayerDB.get(rawPlayer.id);
        const normalized = TmPlayerService.normalizePlayer(rawPlayer, DBPlayer, { skipSync });
        normalized.youthRecommendationHtml = rawPlayer.youthRecommendationHtml;
        normalized.youthPotential = rawPlayer.youthPotential;
        normalized.youthFee = rawPlayer.youthFee;
        return normalized;
    },

    normalizeYouthPlayers(players, { skipSync = true, reverse = true } = {}) {
        const normalized = (Array.isArray(players) ? players : [])
            .map((player, index) => this.normalizeYouthPlayer(player, index, { skipSync }))
            .filter(Boolean);
        return reverse ? normalized.reverse() : normalized;
    },

    async fetchYouthPlayers(options = {}) {
        const { skipSync = true } = options;
        return _dedup(`youth:players:${skipSync ? 'nosync' : 'sync'}`, async () => {
            const data = await _post('/ajax/youth.ajax.php', { type: 'get' });
            if (!data || !Array.isArray(data.players)) return null;

            return {
                ...data,
                cash: Number(data.cash) || 0,
                squad_size: Number(data.squad_size) || data.players.length,
                players: this.normalizeYouthPlayers(data.players, { skipSync, reverse: true }),
            };
        });
    },

    async fetchNewYouthPlayers({ age, position, skipSync = true } = {}) {
        const data = await _post('/ajax/youth.ajax.php', { type: 'new', age, position });
        if (!data) return null;
        if (data.error) {
            return { error: String(data.error) };
        }

        const players = Object.values(data)
            .filter(player => player && typeof player === 'object' && (player.id || player.player_id));

        return {
            players: this.normalizeYouthPlayers(players, { skipSync, reverse: true }),
        };
    },

    actOnYouthPlayer({ playerId, action }) {
        return _post('/ajax/youth.ajax.php', {
            type: 'act',
            player_id: playerId,
            action,
        });
    },
};