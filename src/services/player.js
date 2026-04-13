
import { _post, _dedup } from './engine.js';
import { normalizeTooltipPlayer, normalizeSquadPlayer, normalizePlayerStats, syncMissingRecords, normalizePlayerTraining } from '../utils/normalize/player.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmLib } from '../lib/tm-lib.js';


export const TmPlayerService = {


    async fetchPlayerTooltip(player_id) {
        const [playerData, initialDBPlayer] = await Promise.all([
            _post('/ajax/tooltip.ajax.php', { player_id }),
            this.fetchDBPlayer(player_id)
        ]);
        initialDBPlayer.records = {
            "32.8": {
                "SI": 191045,
                "REREC": 5.23,
                "R5": 100.28,
                "skills": [
                    13.9444406178668,
                    15.4722203089334,
                    19.37777624714672,
                    18.37777624714672,
                    18.37777624714672,
                    19.37777624714672,
                    18.37777624714672,
                    16.472220308933398,
                    18.37777624714672,
                    17.472220308933398,
                    15.4722203089334
                ],
                "routine": 40.5,
                "locked": true
            },
            "32.9": {
                "SI": 188263,
                "REREC": 5.22,
                "R5": 100.13,
                "skills": [
                    13.99,
                    15.534325864502549,
                    18.428771553752124,
                    18.428771553752124,
                    18.428771553752124,
                    19.428771553752124,
                    18.428771553752124,
                    16.53432586450255,
                    18.428771553752124,
                    17.53432586450255,
                    15.534325864502549
                ],
                "routine": 40.8,
                "locked": true,
                "TI": -4
            },
            "32.10": {
                "SI": 184195,
                "REREC": 5.2,
                "R5": 99.9,
                "skills": [
                    13.879964665836594,
                    15.479308197420846,
                    18.38475742008676,
                    18.38475742008676,
                    18.38475742008676,
                    19.38475742008676,
                    18.38475742008676,
                    16.479308197420846,
                    18.38475742008676,
                    17.479308197420846,
                    15.479308197420846
                ],
                "routine": 41.1,
                "locked": true,
                "TI": -6
            },
            "32.11": {
                "SI": 180126,
                "REREC": 5.19,
                "R5": 99.67,
                "skills": [
                    13.767798416311507,
                    15.423225072658303,
                    18.339890920276726,
                    18.339890920276726,
                    18.339890920276726,
                    19.339890920276726,
                    18.339890920276726,
                    16.4232250726583,
                    18.339890920276726,
                    17.4232250726583,
                    15.423225072658303
                ],
                "routine": 41.4,
                "locked": true,
                "TI": -6
            },
            "33.0": {
                "SI": 176825,
                "REREC": 5.17,
                "R5": 99.49,
                "skills": [
                    13.675195817894478,
                    15.37692377344979,
                    18.302849880909914,
                    18.302849880909914,
                    18.302849880909914,
                    19.302849880909914,
                    18.302849880909914,
                    16.37692377344979,
                    18.302849880909914,
                    17.37692377344979,
                    15.37692377344979
                ],
                "routine": 41.7,
                "locked": true,
                "TI": -5
            },
            "33.1": {
                "SI": 175524,
                "REREC": 5.17,
                "R5": 99.58,
                "skills": [
                    13.80623171048903,
                    14.45278870664838,
                    18.363886727032167,
                    18.363886727032167,
                    18.363886727032167,
                    19.363886727032167,
                    18.363886727032167,
                    16.45278870664838,
                    18.363886727032167,
                    17.45278870664838,
                    15.45278870664838
                ],
                "routine": 42,
                "locked": true,
                "TI": -2
            },
            "33.2": {
                "SI": 174222,
                "REREC": 5.16,
                "R5": 99.53,
                "skills": [
                    13.772213391470162,
                    14.418770387629513,
                    18.35027939942462,
                    18.35027939942462,
                    18.35027939942462,
                    19.35027939942462,
                    18.35027939942462,
                    16.435779547138946,
                    18.35027939942462,
                    17.435779547138946,
                    15.435779547138948
                ],
                "routine": 42.3,
                "locked": true,
                "TI": -2
            },
            "33.3": {
                "SI": 170379,
                "REREC": 5.15,
                "R5": 99.29,
                "skills": [
                    12.83814755613815,
                    14.396343698688849,
                    18.387001588022795,
                    18.387001588022795,
                    18.387001588022795,
                    19.387001588022795,
                    18.387001588022795,
                    16.48116485675012,
                    18.387001588022795,
                    17.48116485675012,
                    15.48116485675012
                ],
                "routine": 42.6,
                "locked": true,
                "TI": -6
            },
            "33.4": {
                "SI": 167814,
                "REREC": 5.14,
                "R5": 99.15,
                "skills": [
                    12.769171495423809,
                    14.327367637974508,
                    18.35941116373706,
                    18.35941116373706,
                    18.35941116373706,
                    19.35941116373706,
                    18.35941116373706,
                    16.44667682639295,
                    18.35941116373706,
                    17.44667682639295,
                    15.446676826392949
                ],
                "routine": 42.9,
                "TI": -4,
                "_estimated": true
            },
            "33.5": {
                "SI": 165249,
                "REREC": 5.11,
                "R5": 98.55,
                "skills": [
                    12.866550569105874,
                    14.319069978849523,
                    18.41073929283531,
                    17.41073929283531,
                    18.41073929283531,
                    19.41073929283531,
                    18.41073929283531,
                    16.51021816278449,
                    18.41073929283531,
                    17.51021816278449,
                    15.510218162784488
                ],
                "routine": 43.2,
                "TI": -4,
                "_estimated": true
            },
            "33.6": {
                "SI": 162684,
                "REREC": 5.11,
                "R5": 98.59,
                "skills": [
                    12.99,
                    15.002751302526766,
                    17.491625299355153,
                    17.482733311135444,
                    18.491625299355153,
                    19.491625299355153,
                    18.491625299355153,
                    16.609750359226183,
                    18.491625299355153,
                    16.609750359226183,
                    15.609750359226181
                ],
                "routine": 43.5,
                "TI": -4,
                "_estimated": true
            },
            "33.7": {
                "SI": 160119,
                "REREC": 5.08,
                "R5": 97.82,
                "skills": [
                    12.945724195312325,
                    14.96373333133038,
                    17.46937167262335,
                    16.460174762574177,
                    18.477194136257843,
                    19.477194136257843,
                    18.477194136257843,
                    17,
                    18.477194136257843,
                    16.591547447415657,
                    16
                ],
                "routine": 43.5,
                "TI": -4,
                "_estimated": true
            },
            "33.8": {
                "SI": 157554,
                "REREC": 5.05,
                "R5": 97.48,
                "skills": [
                    12.99,
                    14.927432163169566,
                    17.821034486546388,
                    16.804781011450313,
                    18.84840984359753,
                    18.84840984359753,
                    17.84840984359753,
                    16.991525363264795,
                    17.84840984359753,
                    16.99,
                    15.991525363264795
                ],
                "routine": 43.5,
                "TI": -4,
                "_estimated": true
            },
            "33.9": {
                "SI": 154989,
                "REREC": 5.04,
                "R5": 97.28,
                "skills": [
                    12.914926817312335,
                    14.889895571825733,
                    17.783497895202558,
                    16.767244420106483,
                    18.81838057052246,
                    18.81838057052246,
                    17.810873252253696,
                    16.95398877192096,
                    17.810873252253696,
                    16.95246340865617,
                    15.953988771920963
                ],
                "routine": 43.5,
                "TI": -4,
                "_estimated": true
            },
            "33.10": {
                "SI": 152424,
                "REREC": 5,
                "R5": 96.45,
                "skills": [
                    12.81867305758143,
                    16,
                    17.72755503676954,
                    15.711691203929856,
                    18.769033509527326,
                    18.769033509527326,
                    17.754274128263443,
                    16.917931618211533,
                    17.754274128263443,
                    16.892469963900826,
                    15.917931618211535
                ],
                "routine": 43.5,
                "TI": -4,
                "_estimated": true
            },
            "33.11": {
                "SI": 149859,
                "REREC": 4.99,
                "R5": 96.31,
                "skills": [
                    12.875850801463955,
                    15.95613073264723,
                    16.81395978865533,
                    15.79525542120299,
                    18.871973753968,
                    18.871973753968,
                    17.845463127750307,
                    16.859367410396995,
                    17.845463127750307,
                    16.99,
                    15.859367410396995
                ],
                "routine": 43.5,
                "TI": -4,
                "_estimated": true
            },
            "34.0": {
                "SI": 147294,
                "REREC": 5,
                "R5": 96.51,
                "skills": [
                    12.939135796078151,
                    15.914973906228576,
                    16.91273969932752,
                    15.890984108403213,
                    18.989335646964612,
                    18.989335646964612,
                    17.949382144459463,
                    16.8024256866367,
                    17.949382144459463,
                    15.99,
                    15.802425686636699
                ],
                "routine": 43.5,
                "TI": -5,
                "_estimated": true
            },
            "34.1": {
                "SI": 144729,
                "REREC": 4.97,
                "R5": 95.85,
                "skills": [
                    12.99,
                    16.002482838860494,
                    16.99,
                    14.99,
                    18.99,
                    18.99,
                    17.99,
                    16.87305727414523,
                    17.99,
                    15.99,
                    15.873057274145228
                ],
                "routine": 43.5,
                "TI": -5,
                "_estimated": true
            },
            "34.2": {
                "SI": 142164,
                "REREC": 4.93,
                "R5": 94.93,
                "skills": [
                    12.508478955920896,
                    17,
                    16.529131710702025,
                    14.508478955920896,
                    18.53326226165825,
                    18.53326226165825,
                    17.529131710702025,
                    18,
                    17.529131710702025,
                    15.529131710702025,
                    17
                ],
                "routine": 43.5,
                "TI": -5
            },
            "34.6": {
                "SI": 134731,
                "REREC": 4.96,
                "R5": 96.15,
                "skills": [
                    11.774141659692827,
                    14.530545267145824,
                    17,
                    17,
                    18.800080390014045,
                    18.800080390014045,
                    17.795757268293844,
                    16.568801066868375,
                    18,
                    17,
                    14.530545267145824
                ],
                "routine": 43.5
            },
            "34.3": {
                "SI": 140306,
                "REREC": 4.95,
                "R5": 95.44,
                "skills": [
                    11.968601772527077,
                    15.989175282667425,
                    16.99,
                    14.968601772527077,
                    18.99,
                    18.99,
                    17.99,
                    17.000478444559224,
                    17.99,
                    15.99,
                    15.989175282667425
                ],
                "_estimated": true,
                "routine": 43.5
            },
            "34.4": {
                "SI": 138448,
                "REREC": 4.95,
                "R5": 95.66,
                "skills": [
                    11.99,
                    15.290117655569636,
                    16.99,
                    15.341354291038376,
                    18.99,
                    18.99,
                    17.99,
                    17.305185154163443,
                    17.99,
                    16.341354291038378,
                    15.290117655569636
                ],
                "_estimated": true,
                "routine": 43.5
            },
            "34.5": {
                "SI": 136589,
                "REREC": 4.97,
                "R5": 96.1,
                "skills": [
                    11.99,
                    14.694956653886432,
                    16.99,
                    16.34749357897816,
                    18.99,
                    18.99,
                    17.99,
                    16.715111212076447,
                    17.99,
                    16.76349170265954,
                    14.694956653886432
                ],
                "_estimated": true,
                "routine": 43.5
            }
        };
        const player = normalizeTooltipPlayer(playerData);
        const records = await syncMissingRecords(player, initialDBPlayer);
        let DBPlayer = initialDBPlayer;
        if (Object.keys(records).length) {
            DBPlayer = await this.fetchDBPlayer(player_id);
        }

        const latestRecord = DBPlayer?.records?.[player.ageMonthsString];

        if (Array.isArray(latestRecord?.skills) && player.skills?.length) {
            player.skills = player.skills.map((skill, index) => ({
                ...skill,
                value: latestRecord.skills[index] != null ? Number(latestRecord.skills[index]) : skill.value,
            }));
            player.positions = player.positions.map(position => ({
                ...position,
                r5: TmLib.calculatePlayerR5(position, player),
                rec: TmLib.calculatePlayerREC(position, player),
            }));
        }

        return player;
    },

    fetchDBPlayer(id) {
        return TmPlayerDB.get(id);
    },

    normalizeSquadPlayer(postPlayer) {
        return normalizeSquadPlayer(postPlayer);
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

    fetchPlayerGraphs(pid) {
        return _post('/ajax/players_get_info.ajax.php', {
            player_id: pid,
            type: 'graphs',
            show_non_pro_graphs: true
        });
    },

    async fetchPlayerHistory(playerId) {
        const data = await _post('/ajax/players_get_info.ajax.php', {
            player_id: playerId,
            type: 'history',
            show_non_pro_graphs: true
        });
        if (!data) return null;
        return normalizePlayerStats(data);
    },


    async fetchPlayerTraining(playerId) {
        const data = await _post('/ajax/players_get_info.ajax.php', {
            player_id: playerId,
            type: 'training',
            show_non_pro_graphs: true
        });
        if (!data) return null;
        return normalizePlayerTraining(data);
    },

    normalizePlayer(player) {
        return player;
    },
}