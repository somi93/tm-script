import { Player } from '../../lib/player.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { normalizeClubFromTooltip } from './club.js';

export const applyPlayerPositionRatings = (player) => {
    player.positions = player.positions.map(position => ({
        ...position,
        r5: TmLib.calculatePlayerR5(position, player),
        rec: TmLib.calculatePlayerREC(position, player),
    }));

    const preferredPositions = player.positions.filter(position => position.preferred);
    const positionsForRatings = preferredPositions.length ? preferredPositions : player.positions;

    player.r5 = positionsForRatings.reduce((best, position) => {
        const value = Number(position?.r5);
        if (!Number.isFinite(value)) return best;
        return best == null || value > best ? value : best;
    }, null);

    player.rec = positionsForRatings.reduce((best, position) => {
        const value = Number(position?.rec);
        if (!Number.isFinite(value)) return best;
        return best == null || value > best ? value : best;
    }, null);

    return player;
};

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
    applyPlayerPositionRatings(player);
    player.isOwnPlayer = TmUtils.getOwnClubIds().includes(String(player.club_id));
    return player;
};

const _parseTacticsBan = (status, banned) => {
    if (!banned && !status) return '0';
    const s = String(status || '');
    if (s.includes('yellow_card')) return 'g';
    if (s.includes('red_card')) {
        const m = s.match(/^(\d+)/);
        return `r${m ? parseInt(m[1]) : 1}`;
    }
    // banned is truthy but status is unknown/empty — treat as 1-match red
    return banned ? 'r1' : '0';
};

export const normalizeTacticsPlayer = (p) => {
    const player = Player.create();
    player.id = Number(p.player_id);
    player.player_id = player.id;
    player.club_id = Number(p.club_id);
    player.club.id = String(p.club_id);
    player.club.name = p.club_name || '';
    player.age = Number(p.age);
    player.month = Number(p.months);
    player.ageMonths = player.age * 12 + player.month;
    player.ageMonthsString = `${player.age}.${player.month}`;
    player.lastname = p.lastname;
    player.name = p.name;
    player.firstname = p.name.split(' ').filter(n => n !== p.lastname).join(' ');
    player.country = p.country;
    player.routine = Number(p.routine) || 0;
    player.wage = TmUtils.parseNum(p.wage, null);
    player.asi = TmUtils.parseNum(p.skill_index, null);
    player.no = p.no;
    player.retire = p.isretirering;
    player.ban = _parseTacticsBan(p.status, p.banned);
    player.injury = p.injury;
    player.isGK = p.fp === 'GK';
    player.rec_sort = p.rec_sort;
    player.faceUrl = TmUtils.extractFaceUrl(p.appearance, null);
    TmUtils.applyTooltipSkills(player, p.skills);
    TmUtils.applyPlayerPositions(player, p.favposition);
    player.skills = TmLib.calcSkillDecimalsSimple(player);
    applyPlayerPositionRatings(player);
    player.allPositionRatings = player.positions;
    player.ti = TmLib.calculateTIPerSession(player);
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
    player.routine = TmUtils.parseNum(Number(postPlayer.rutine), 0);
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
    applyPlayerPositionRatings(player);
    player.ti = TmLib.calculateTIPerSession(player);
    player.isOwnPlayer = TmUtils.getOwnClubIds().includes(String(player.club_id));
    return player;
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

const populateSkillIndexFromTI = (tiHistory, currentAsi, isGK = false) => {
    if (!Array.isArray(tiHistory) || !tiHistory.length || !Number.isFinite(Number(currentAsi))) return null;
    tiHistory = tiHistory.slice(1);
    const skillIndex = new Array(tiHistory.length).fill(null);
    let currentSkillSum = TmLib.calcAsiSkillSum({ asi: Number(currentAsi), isGK });
    skillIndex[tiHistory.length - 1] = Number(currentAsi);

    for (let index = tiHistory.length - 2; index >= 0; index -= 1) {
        const nextTI = Number(tiHistory[index + 1]);
        if (!Number.isFinite(nextTI)) return null;
        currentSkillSum -= nextTI / 10;
        skillIndex[index] = TmLib.calcASIFromSkillSum(currentSkillSum, isGK);
    }

    return skillIndex;
};

export const normalizePlayerGraphs = (graphs, player) => {
    if (!graphs) return null;
    const TI = graphs.TI ?? graphs.ti ?? null;
    return {
        ...graphs,
        TI: TI,
        skill_index: graphs.skill_index ?? populateSkillIndexFromTI(TI, player?.asi, player?.isGK),
        one_on_ones: graphs.one_on_ones ?? graphs.oneonones ?? null,
        aerial_ability: graphs.aerial_ability ?? graphs.arialability ?? null,
    };
};

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