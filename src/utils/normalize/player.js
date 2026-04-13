import { Player } from '../../lib/player.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { normalizeClubFromTooltip } from './club.js';
import { _post } from '../../services/engine.js';

export const normalizeTooltipPlayer = (playerData) => {
    const player = Player.create();
    const rawClub = playerData.club ?? {};
    player.club = normalizeClubFromTooltip(rawClub);
    const { player: playerTooltip } = playerData;
    player.club_id = Number(player.club.id);
    player.id = Number(playerTooltip.player_id);
    player.age = Number(playerTooltip.age);
    player.month = Number(playerTooltip.months);
    player.ageMonths = player.age * 12 + player.month;
    player.ageMonthsString = `${player.age}.${player.month}`;
    player.lastname = playerTooltip.lastname;
    player.name = playerTooltip.name;
    player.firstname = playerTooltip.name.split(' ').filter(n => n !== player.lastname).join(' ');
    player.country = playerTooltip.country;
    player.routine = Number(playerTooltip.routine);
    player.wage = TmUtils.parseNum(playerTooltip.wage, null);
    player.asi = TmUtils.parseNum(playerTooltip.skill_index, null);
    player.no = playerTooltip.no;
    player.retire = playerTooltip.isretirering;
    player.isGK = playerTooltip.fp === 'GK';
    player.ti = TmLib.calculateTIPerSession(player);
    player.faceUrl = TmUtils.extractFaceUrl(playerTooltip.appearance, playerTooltip.face_url);
    TmUtils.applyTooltipSkills(player, playerTooltip.skills);
    TmUtils.applyPlayerPositions(player, playerTooltip.favposition);
    player.skills = TmLib.calcSkillDecimalsSimple(player);
    player.positions = player.positions.map(position => ({
        ...position,
        r5: TmLib.calculatePlayerR5(position, player),
        rec: TmLib.calculatePlayerREC(position, player),
    }));
    player.isOwnPlayer = TmUtils.getOwnClubIds().includes(String(player.club_id));
    return player;
};

export const normalizeSquadPlayer = (postPlayer) => {
    const player = Player.create();
    player.id = Number(postPlayer.player_id || postPlayer.id);
    player.club_id = Number(postPlayer.club_id);
    player.club.id = postPlayer.club_id;
    player.age = Number(postPlayer.age);
    player.month = Number(postPlayer.month);
    player.ageMonths = player.age * 12 + player.month;
    player.ageMonthsString = `${player.age}.${player.month}`;
    player.lastname = postPlayer.lastname;
    player.name = postPlayer.player_name;
    player.firstname = postPlayer.player_name.split(' ').filter(n => n !== postPlayer.lastname).join(' ');
    player.country = postPlayer.country;
    player.routine = TmUtils.parseNum(postPlayer.rutine, null);
    player.wage = TmUtils.parseNum(postPlayer.wage, null);
    player.asi = postPlayer.asi;
    player.no = postPlayer.no;
    player.retire = postPlayer.retire;
    player.ban = postPlayer.ban;
    player.injury = postPlayer.injury;
    player.isGK = postPlayer.fp === 'GK';
    player.training.custom = String(postPlayer.training_custom || '').split('').map(v => parseInt(v) || 0);
    player.training.standard = postPlayer.training;
    player.transfer = postPlayer.transfer;
    TmUtils.applySquadSkills(player, postPlayer);
    TmUtils.applyPlayerPositions(player, postPlayer.favposition);
    player.positions = player.positions.map(position => ({
        ...position,
        r5: TmLib.calculatePlayerR5(position, player),
        rec: TmLib.calculatePlayerREC(position, player),
    }));
    player.ti = TmLib.calculateTIPerSession(player);
    player.isOwnPlayer = TmUtils.getOwnClubIds().includes(String(player.club_id));
    return player;
};

const getMissingRecords = (player, DBPlayer) => {
    if (!DBPlayer?.records) return [];
    const keys = Object.keys(DBPlayer.records);
    const [y0, m0] = keys.at(-1).split('.').map(Number);
    const [y1, m1] = player.ageMonthsString.split('.').map(Number);
    const totalFrom = y0 * 12 + m0 + 1;
    const totalTo = y1 * 12 + m1;
    return Array.from({ length: Math.max(0, totalTo - totalFrom + 1) }, (_, i) => {
        const t = totalFrom + i;
        return `${Math.floor(t / 12)}.${t % 12}`;
    }).filter(k => !DBPlayer.records[k]);
}

export const syncMissingRecords = async (player, DBPlayer) => {
    const missing = getMissingRecords(player, DBPlayer);
    console.log(missing);
    if (!missing.length) return {};
    const [trainingData, graphData] = await Promise.all([
        fetchPlayerTraining(player),
        _post('/ajax/players_get_info.ajax.php', { player_id: player.id, type: 'graphs', show_non_pro_graphs: true })
    ]);
    player.training = trainingData;
    let historyRecords = null;

    if (graphData?.graphs?.ti?.length) {
        historyRecords = syncMissingRecordsFromGraph(player, DBPlayer, missing, graphData.graphs);
    } else {
        historyRecords = syncMissingRecordsGuess(player, DBPlayer, missing);
    }

    if (historyRecords && Object.keys(historyRecords).length) {
        const preferredPositions = player.positions.filter(position => position.preferred);
        const store = {
            ...(DBPlayer || {}),
            _v: DBPlayer?._v || 1,
            meta: {
                ...(DBPlayer?.meta || {}),
                name: DBPlayer?.meta?.name || player.name,
                pos: DBPlayer?.meta?.pos || (preferredPositions.length
                    ? preferredPositions.map(position => position.position).join(', ')
                    : player.positions.filter(position => position.preferred || position.r5 != null).map(position => position.position).join(', ')),
            },
            records: {
                ...(DBPlayer?.records || {}),
                ...historyRecords,
            },
        };

        await TmPlayerDB.set(player.id, store);
    }
    return historyRecords;
};

const fetchPlayerTraining = async (player) => {
    if (player.isOwnPlayer) {
        const data = await _post('/ajax/players_get_info.ajax.php', {
            player_id: player.id,
            type: 'training',
        });
        return data;
    } else {
        const data = await _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: player.club_id })

        return normalizeSquadPlayerTraining(data?.post[player.id]);
    }
}

export const syncMissingRecordsFromGraph = (player, DBPlayer, missing, graphData) => {
    if (!missing.length || !graphData?.skill_index?.length) return {};
    const asi = graphData.skill_index;
    const n = asi.length;

    const result = {};
    for (const key of missing) {
        const [y, m] = key.split('.').map(Number);
        const idx = (n - 1) - (player.ageMonths - (y * 12 + m));
        if (idx < 0 || idx >= n) continue;
        result[key] = { SI: Number(asi[idx]) };
    }
    if (graphData?.strength?.length) {
        return syncStatsFromGraph(player, DBPlayer, graphData, result);
    } else {
        return syncStatsFromRecords(player, DBPlayer, result);
    }
};

const enrichHistoryRecords = (player, history) => {
    const preferedPositions = player.positions.filter(position => position.preferred);
    const positionsForRatings = preferedPositions.length ? preferedPositions : player.positions;

    Object.keys(history).forEach((ageKey) => {
        const historyRecord = history[ageKey];

        const playerSnapshot = {
            ...player,
            asi: historyRecord.SI,
            skills: historyRecord.skills,
        };

        let maxR5 = null;
        let maxRec = null;
        positionsForRatings.forEach((position) => {
            const r5 = Number(TmLib.calculatePlayerR5(position, playerSnapshot));
            const rec = Number(TmLib.calculatePlayerREC(position, playerSnapshot));
            if (Number.isFinite(r5) && (maxR5 === null || r5 > maxR5)) maxR5 = r5;
            if (Number.isFinite(rec) && (maxRec === null || rec > maxRec)) maxRec = rec;
        });

        history[ageKey] = {
            ...historyRecord,
            R5: maxR5,
            REREC: maxRec,
        };
    });

    return history;
};

const syncStatsFromGraph = (player, DBPlayer, graphData, records) => {
    const history = TmLib.reconstructSkillHistoryFromGraph(player, DBPlayer, graphData, records);
    return enrichHistoryRecords(player, history);
};

const syncStatsFromRecords = (player, DBPlayer, records) => {
    const history = TmLib.reconstructSkillHistoryFromRecords(player, DBPlayer, records);
    return enrichHistoryRecords(player, history);
};

export const syncMissingRecordsGuess = (player, DBPlayer, missing) => {
    const history = TmLib.reconstructSkillHistoryFromGuess(player, DBPlayer, missing);
    const enriched = enrichHistoryRecords(player, history);
    console.log(enriched);
    return enriched;
};

const _extractClub = (html) => {
    if (!html || html === '-') return { name: null, href: null };
    const name = (html.match(/>([^<]+)<\/a>/) || [])[1] ?? null;
    const href = (html.match(/href="([^"]+)"/) || [])[1] ?? null;
    return { name, href };
};

const _normalizeStatsRow = (raw, prev) => {
    if (raw.season === 'transfer') {
        return { type: 'transfer', amount: raw.transfer, transferamount: Number(raw.transferamount) || 0 };
    }
    const isTotal = raw.season === 'total';
    const games = Number(raw.games) || 0;
    const { name, href } = _extractClub(raw.klubnavn);
    return {
        type: isTotal ? 'total' : 'season',
        season: isTotal ? 'total' : Number(raw.season),
        club_id: isTotal ? null : (raw.klub_id ?? prev?.club_id ?? null),
        club_name: isTotal ? null : (name ?? prev?.club_name ?? null),
        club_href: isTotal ? null : (href ?? prev?.club_href ?? null),
        country: raw.country ?? null,
        division: raw.division ?? null,
        group: raw.group ?? null,
        games,
        goals: Number(raw.goals) || 0,
        conceded: Number(raw.conceded) || 0,
        assists: Number(raw.assists) || 0,
        cards: Number(raw.cards) || 0,
        rating: games > 0 ? ((Number(raw.rating) / games * 100) / 100).toFixed(2) : null,
        productivity: Number(raw.productivity) || 0,
        ...(isTotal && { mom: Number(raw.mom) || 0 }),
    };
};

const _normalizeStatsTab = (rows) => {
    if (!Array.isArray(rows)) return [];
    let prev = null;
    return rows.map(raw => {
        const row = _normalizeStatsRow(raw, prev);
        if (row.type === 'season') prev = row;
        return row;
    });
};

export const normalizePlayerStats = (data) => ({
    nat: _normalizeStatsTab(data?.table?.nat),
    cup: _normalizeStatsTab(data?.table?.cup),
    int: _normalizeStatsTab(data?.table?.int),
    total: _normalizeStatsTab(data?.table?.total),
    current_season: data?.current_season ?? null,
});

export const normalizeSquadPlayerTraining = (data) => {
    if (!data) return null;
    const customRaw = String(data.training_custom || '').trim();
    if (!customRaw) {
        return {
            custom: [null, null, null, null, null, null],
            standard: data.training ?? null,
        };
    }

    const customTraining = Array.from({ length: 6 }, (_, i) => {
        const value = customRaw[i];
        return value != null ? Number(value) || 0 : 0;
    });

    return { custom: customTraining, standard: null };
}

export const normalizePlayerTraining = (data) => {
    console.log(data);
    const { custom } = data;
    if (!custom.custom_on) {
        return {
            custom: [null, null, null, null, null, null],
            standard: custom.team ?? null,
        };
    }
    const customTraining = Array.from({ length: 6 }, (_, i) => {
        const pts = custom.custom?.[`team${i + 1}`]?.points;
        return pts != null ? Number(pts) : null;
    });
    return { custom: customTraining, standard: null };

};