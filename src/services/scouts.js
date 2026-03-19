import { _post } from './engine.js';

export const TmScoutsService = {
    fetchReports() {
        return _post('/ajax/scouts_get_reports.ajax.php', {});
    },
};