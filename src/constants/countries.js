/**
 * constants/countries.js
 *
 * Primary structure: COUNTRIES � flat map keyed by country name.
 * Each value: { suffix, region }
 *
 * Examples:
 *   COUNTRIES['Serbia']         // ? { suffix: 'cs', region: 'Europe' }
 *   COUNTRIES['Serbia'].suffix  // ? 'cs'
 *   COUNTRIES['Serbia'].region  // ? 'Europe'
 */

export const COUNTRIES = {
    // -- Europe ----------------------------------------------------------
    Albania: { suffix: 'al', region: 'Europe' },
    Andorra: { suffix: 'ad', region: 'Europe' },
    Armenia: { suffix: 'am', region: 'Europe' },
    Austria: { suffix: 'at', region: 'Europe' },
    Azerbaijan: { suffix: 'az', region: 'Europe' },
    Belarus: { suffix: 'by', region: 'Europe' },
    Belgium: { suffix: 'be', region: 'Europe' },
    'Bosnia-Herzegovina': { suffix: 'ba', region: 'Europe' },
    Bulgaria: { suffix: 'bg', region: 'Europe' },
    Croatia: { suffix: 'hr', region: 'Europe' },
    Cyprus: { suffix: 'cy', region: 'Europe' },
    'Czech Republic': { suffix: 'cz', region: 'Europe' },
    Denmark: { suffix: 'dk', region: 'Europe' },
    England: { suffix: 'en', region: 'Europe' },
    Estonia: { suffix: 'ee', region: 'Europe' },
    'Faroe Islands': { suffix: 'fo', region: 'Europe' },
    Finland: { suffix: 'fi', region: 'Europe' },
    France: { suffix: 'fr', region: 'Europe' },
    Georgia: { suffix: 'ge', region: 'Europe' },
    Germany: { suffix: 'de', region: 'Europe' },
    Greece: { suffix: 'gr', region: 'Europe' },
    Hungary: { suffix: 'hu', region: 'Europe' },
    Iceland: { suffix: 'is', region: 'Europe' },
    Ireland: { suffix: 'ie', region: 'Europe' },
    Israel: { suffix: 'il', region: 'Europe' },
    Italy: { suffix: 'it', region: 'Europe' },
    Kazakhstan: { suffix: 'kz', region: 'Europe' },
    Latvia: { suffix: 'lv', region: 'Europe' },
    Lithuania: { suffix: 'lt', region: 'Europe' },
    Luxembourg: { suffix: 'lu', region: 'Europe' },
    Malta: { suffix: 'mt', region: 'Europe' },
    Moldova: { suffix: 'md', region: 'Europe' },
    Montenegro: { suffix: 'me', region: 'Europe' },
    Netherlands: { suffix: 'nl', region: 'Europe' },
    'North Macedonia': { suffix: 'mk', region: 'Europe' },
    'Northern Ireland': { suffix: 'rt', region: 'Europe' },
    Norway: { suffix: 'no', region: 'Europe' },
    Poland: { suffix: 'pl', region: 'Europe' },
    Portugal: { suffix: 'pt', region: 'Europe' },
    Romania: { suffix: 'ro', region: 'Europe' },
    Russia: { suffix: 'ru', region: 'Europe' },
    'San Marino': { suffix: 'sm', region: 'Europe' },
    Scotland: { suffix: 'ct', region: 'Europe' },
    Serbia: { suffix: 'cs', region: 'Europe' },
    Slovakia: { suffix: 'sk', region: 'Europe' },
    Slovenia: { suffix: 'si', region: 'Europe' },
    Spain: { suffix: 'es', region: 'Europe' },
    Sweden: { suffix: 'se', region: 'Europe' },
    Switzerland: { suffix: 'he', region: 'Europe' },
    Turkey: { suffix: 'tr', region: 'Europe' },
    Ukraine: { suffix: 'ua', region: 'Europe' },
    Wales: { suffix: 'wa', region: 'Europe' },

    // -- North America ----------------------------------------------------
    Belize: { suffix: 'bz', region: 'North America' },
    Canada: { suffix: 'ca', region: 'North America' },
    'Costa Rica': { suffix: 'cr', region: 'North America' },
    Cuba: { suffix: 'cu', region: 'North America' },
    'Dominican Republic': { suffix: 'do', region: 'North America' },
    'El Salvador': { suffix: 'sv', region: 'North America' },
    Guatemala: { suffix: 'gt', region: 'North America' },
    Honduras: { suffix: 'hn', region: 'North America' },
    Jamaica: { suffix: 'jm', region: 'North America' },
    Mexico: { suffix: 'mx', region: 'North America' },
    Panama: { suffix: 'pa', region: 'North America' },
    'Puerto Rico': { suffix: 'pr', region: 'North America' },
    'Trinidad & Tobago': { suffix: 'tt', region: 'North America' },
    USA: { suffix: 'us', region: 'North America' },
    'West Indian Islands': { suffix: 'vc', region: 'North America' },

    // -- Asia -------------------------------------------------------------
    Afghanistan: { suffix: 'af', region: 'Asia' },
    Bahrain: { suffix: 'bh', region: 'Asia' },
    Bangladesh: { suffix: 'bd', region: 'Asia' },
    Brunei: { suffix: 'bn', region: 'Asia' },
    China: { suffix: 'cn', region: 'Asia' },
    'Hong Kong': { suffix: 'hk', region: 'Asia' },
    India: { suffix: 'in', region: 'Asia' },
    Indonesia: { suffix: 'id', region: 'Asia' },
    Iran: { suffix: 'ir', region: 'Asia' },
    Iraq: { suffix: 'iq', region: 'Asia' },
    Japan: { suffix: 'jp', region: 'Asia' },
    Jordan: { suffix: 'jo', region: 'Asia' },
    Kuwait: { suffix: 'kw', region: 'Asia' },
    Lebanon: { suffix: 'lb', region: 'Asia' },
    Malaysia: { suffix: 'my', region: 'Asia' },
    Nepal: { suffix: 'np', region: 'Asia' },
    Oman: { suffix: 'om', region: 'Asia' },
    Pakistan: { suffix: 'pk', region: 'Asia' },
    Philippines: { suffix: 'ph', region: 'Asia' },
    Qatar: { suffix: 'qa', region: 'Asia' },
    'Saudi Arabia': { suffix: 'sa', region: 'Asia' },
    Singapore: { suffix: 'sg', region: 'Asia' },
    'South Korea': { suffix: 'kr', region: 'Asia' },
    Syria: { suffix: 'sy', region: 'Asia' },
    Taiwan: { suffix: 'tw', region: 'Asia' },
    Thailand: { suffix: 'th', region: 'Asia' },
    'United Emirates': { suffix: 'ae', region: 'Asia' },
    Vietnam: { suffix: 'vn', region: 'Asia' },

    // -- Oceania -----------------------------------------------------------
    Australia: { suffix: 'au', region: 'Oceania' },
    Fiji: { suffix: 'fj', region: 'Oceania' },
    'New Zealand': { suffix: 'nz', region: 'Oceania' },
    Oceania: { suffix: 'oc', region: 'Oceania' },

    // -- South America -----------------------------------------------------
    Argentina: { suffix: 'ar', region: 'South America' },
    Bolivia: { suffix: 'bo', region: 'South America' },
    Brazil: { suffix: 'br', region: 'South America' },
    Chile: { suffix: 'cl', region: 'South America' },
    Colombia: { suffix: 'co', region: 'South America' },
    Ecuador: { suffix: 'ec', region: 'South America' },
    Paraguay: { suffix: 'py', region: 'South America' },
    Peru: { suffix: 'pe', region: 'South America' },
    Uruguay: { suffix: 'uy', region: 'South America' },
    Venezuela: { suffix: 've', region: 'South America' },

    // -- Africa ------------------------------------------------------------
    Algeria: { suffix: 'dz', region: 'Africa' },
    Angola: { suffix: 'ao', region: 'Africa' },
    Botswana: { suffix: 'bw', region: 'Africa' },
    Cameroun: { suffix: 'cm', region: 'Africa' },
    Chad: { suffix: 'td', region: 'Africa' },
    Egypt: { suffix: 'eg', region: 'Africa' },
    Ghana: { suffix: 'gh', region: 'Africa' },
    'Ivory Coast': { suffix: 'ci', region: 'Africa' },
    Libya: { suffix: 'ly', region: 'Africa' },
    Morocco: { suffix: 'ma', region: 'Africa' },
    Nigeria: { suffix: 'ng', region: 'Africa' },
    Palestine: { suffix: 'so', region: 'Africa' },
    Senegal: { suffix: 'sn', region: 'Africa' },
    'South Africa': { suffix: 'za', region: 'Africa' },
    Tunisia: { suffix: 'tn', region: 'Africa' },
};

// -- Derived ---------------------------------------------------------------

/** suffix ? country name  (e.g. 'cs' ? 'Serbia') */
export const COUNTRY_BY_SUFFIX = Object.fromEntries(
    Object.entries(COUNTRIES).map(([name, c]) => [c.suffix, name])
);
/** suffix → region  (e.g. 'cs' → 'Europe') */
const _REGION_BY_SUFFIX = Object.fromEntries(
    Object.entries(COUNTRIES).map(([, c]) => [c.suffix, c.region])
);
// -- International Cup URL resolver ----------------------------------------
// Europe        cl* ? /1/   ue* ? /2/
// Asia+Oce+Afr  cl* ? /3/   ue* ? /4/
// N+S America   cl* ? /5/   ue* ? /6/
const _CUP_GROUP = {
    Europe: { cl: 1, ue: 2 },
    Asia: { cl: 3, ue: 4 },
    Oceania: { cl: 3, ue: 4 },
    Africa: { cl: 3, ue: 4 },
    'North America': { cl: 5, ue: 6 },
    'South America': { cl: 5, ue: 6 },
};

/** Tournament ID → display name */
const _CUP_NAMES = {
    1: 'UETA Champions Cup',
    2: 'UETA Cup',
    3: 'Champions Cup',
    4: 'International Cup',
    5: 'Champions Cup',
    6: 'International Cup',
};

/**
 * Returns the canonical int-cup URL, e.g. '/international-cup/1/', or null.
 * @param {string} typeRaw        venue.matchtype ('cl1', 'ue1', 'clg', …)
 * @param {string} countrySuffix  home club country suffix ('cs', 'jp', …)
 */
export const resolveIntCupUrl = (typeRaw, countrySuffix) => {
    if (!typeRaw || !countrySuffix) return null;
    const tier = typeRaw.startsWith('cl') ? 'cl' : typeRaw.startsWith('ue') ? 'ue' : null;
    if (!tier) return null;
    const region = _REGION_BY_SUFFIX[countrySuffix];
    if (!region) return null;
    const id = _CUP_GROUP[region]?.[tier];
    return id ? `/international-cup/${id}/` : null;
};

/**
 * Returns the tournament display name, e.g. 'UETA Champions Cup'.
 * Same inputs as resolveIntCupUrl.
 */
export const resolveCupName = (typeRaw, countrySuffix) => {
    if (!typeRaw || !countrySuffix) return null;
    const tier = typeRaw.startsWith('cl') ? 'cl' : typeRaw.startsWith('ue') ? 'ue' : null;
    if (!tier) return null;
    const region = _REGION_BY_SUFFIX[countrySuffix];
    if (!region) return null;
    const id = _CUP_GROUP[region]?.[tier];
    return id ? (_CUP_NAMES[id] || null) : null;
};
