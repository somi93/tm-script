import { _post } from './engine.js';
import { normalizeScout, normalizeScoutReport, normalizeScoutListReport, normalizeBestEstimate } from '../utils/normalize/scout.js';
import { normalizeClubFromScoutReport } from '../utils/normalize/club.js';

export const TmScoutsService = {
    async fetchPlayerScouting(playerId) {
        const data = await _post('/ajax/players_get_info.ajax.php', {
            player_id: playerId,
            type: 'scout',
            show_non_pro_graphs: true
        });
        if (!data) return null;
        const rawScouts = data.scouts ?? {};
        const scouts = Object.fromEntries(
            Object.entries(rawScouts).map(([id, raw]) => [id, normalizeScout(raw)])
        );
        const reports = Array.isArray(data.reports)
            ? data.reports.map(raw => normalizeScoutReport(raw, rawScouts))
            : [];
        const interested = Array.isArray(data.interested)
            ? data.interested.map(club => normalizeClubFromScoutReport(club))
            : [];
        const bestEstimate = normalizeBestEstimate(reports);
        return { reports, scouts, interested, bestEstimate };
    },
    async sendScout(playerId, scoutId) {
        const data = await _post('/ajax/players_get_info.ajax.php', {
            player_id: playerId,
            type: 'scout',
            show_non_pro_graphs: true,
            scout_id: scoutId,
        });
        if (!data) return null;
        const rawScouts = data.scouts ?? {};
        const scouts = Object.fromEntries(
            Object.entries(rawScouts).map(([id, raw]) => [id, normalizeScout(raw)])
        );
        const reports = Array.isArray(data.reports)
            ? data.reports.map(raw => normalizeScoutReport(raw, rawScouts))
            : [];
        const interested = Array.isArray(data.interested)
            ? data.interested.map(club => normalizeClubFromScoutReport(club))
            : [];
        const bestEstimate = normalizeBestEstimate(reports);
        return { reports, scouts, interested, bestEstimate };
    },
    async fetchReports(scouts = []) {
        const data = await _post('/ajax/scouts_get_reports.ajax.php', {});
        if (!data || typeof data !== 'object') return [];
        return Object.values(data)
            .map(raw => normalizeScoutListReport(raw, scouts))
            .sort((a, b) => (b.doneTs - a.doneTs) || (parseInt(b.id, 10) - parseInt(a.id, 10)));
    },
};