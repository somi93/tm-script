import { TmPlayerDB } from '../../lib/tm-playerdb.js';

/**
 * Parse "age.month" key to absolute month index for ordering.
 * @param {string} key
 * @returns {number}
 */
const parseKey = (key) => {
    const [age, month] = String(key).split('.').map(Number);
    return age * 12 + month;
};

/**
 * Convert absolute month index back to "age.month" key.
 * @param {number} abs
 * @returns {string}
 */
const absToKey = (abs) => `${Math.floor(abs / 12)}.${abs % 12}`;

/**
 * Returns true if any month between the first DB record and the player's
 * current month is absent from DBPlayer.records.
 * @param {object} player - normalized player with ageMonthsString
 * @param {object|null} DBPlayer - indexed DB entry with .records
 * @returns {boolean}
 */
const hasMissingMonths = (player, DBPlayer) => {
    const records = DBPlayer?.records;
    if (!records) return false;
    const keys = Object.keys(records);
    if (!keys.length) return false;

    const currentAbs = parseKey(player.ageMonthsString);
    const firstAbs = Math.min(...keys.map(parseKey));

    for (let abs = firstAbs; abs <= currentAbs; abs++) {
        if (!records[absToKey(abs)]) return true;
    }
    return false;
};

/**
 * Step 3: For each player, load their DB entry and attach needSync + DBPlayer.
 * needSync is false only when current month has fullySynced: true AND no missing months exist.
 *
 * @param {object[]} players - merged A+B team raw players with ageMonthsString
 * @returns {Promise<object[]>} same players array with needSync and DBPlayer attached
 */
export const attachSyncStatus = async (players) => {
    return Promise.all(
        players.map(async (player) => {
            const DBPlayer = await TmPlayerDB.get(player.id);
            const currentRecord = DBPlayer?.records?.[player.ageMonthsString];
            const synced = currentRecord?.fullySynced === true;
            const missing = hasMissingMonths(player, DBPlayer);
            return { ...player, needSync: !(synced && !missing), DBPlayer };
        })
    );
};
