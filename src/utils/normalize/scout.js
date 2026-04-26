import { Scout } from '../../lib/scout.js';

const _confPct = (skill) => Math.round((parseInt(skill, 10) || 0) / 20 * 100);
const _extractTierVal = (txt) => {
    const m = txt ? txt.match(/\((\d+)\/(\d+)\)/) : null;
    return m ? { value: parseInt(m[1], 10), max: parseInt(m[2], 10) } : null;
};

export const normalizeScout = (raw) => {
    const scout = Scout.create();
    scout.id = raw.id ?? null;
    scout.firstname = raw.name ?? null;
    scout.lastname = raw.surname ?? null;
    scout.name = raw.name && raw.surname ? `${raw.name} ${raw.surname}` : null;
    scout.country = raw.nationality ?? null;
    scout.age = raw.age ?? null;
    scout.wage = raw.wage ?? null;
    scout.seniors = raw.seniors ?? null;
    scout.youths = raw.youths ?? null;
    scout.physical = raw.physical ?? null;
    scout.tactical = raw.tactical ?? null;
    scout.technical = raw.technical ?? null;
    scout.development = raw.development ?? null;
    scout.psychology = raw.psychology ?? null;
    scout.last_action = raw.last_action ?? null;
    scout.away = raw.away ?? false;
    scout.returns = raw.returns ?? null;
    return scout;
};

export const normalizeScoutReport = (raw, rawScoutsMap = {}) => {
    const report = Scout.createReport();
    const scoutRaw = rawScoutsMap[String(raw.scoutid)] ?? null;

    report.scout = scoutRaw ? normalizeScout(scoutRaw) : Scout.create();
    report.date = raw.done ?? null;
    report.age = raw.report_age != null ? parseFloat(raw.report_age) : null;

    let potRel = null, bloomRel = null, phyRel = null, tacRel = null, tecRel = null, psyRel = null;
    if (scoutRaw) {
        const age = parseInt(raw.report_age, 10) || 0;
        const senYth = age < 20 ? (parseInt(scoutRaw.youths, 10) || 0) : (parseInt(scoutRaw.seniors, 10) || 0);
        const dev = parseInt(scoutRaw.development, 10) || 0;
        potRel = _confPct(Math.min(senYth, dev));
        bloomRel = _confPct(dev);
        phyRel = _confPct(parseInt(scoutRaw.physical, 10) || 0);
        tacRel = _confPct(parseInt(scoutRaw.tactical, 10) || 0);
        tecRel = _confPct(parseInt(scoutRaw.technical, 10) || 0);
        psyRel = _confPct(parseInt(scoutRaw.psychology, 10) || 0);
    }

    report.specialist = { label: 'Specialty', reliability: null, value: raw.specialist != null ? parseInt(raw.specialist, 10) : null };
    report.rec = raw.rec != null ? parseFloat(raw.rec) : null;
    report.currentSkill = raw.current_skill != null ? parseInt(raw.current_skill, 10) : null;

    report.development[0] = { key: 'potential', label: 'Potential', reliability: potRel, value: raw.old_pot != null ? parseInt(raw.old_pot, 10) : null };
    report.development[1] = { key: 'bloom', label: 'Bloom', reliability: bloomRel, value: raw.bloom_status_txt ?? null };
    report.development[2] = { key: 'devStatus', label: 'Development status', reliability: bloomRel, value: raw.dev_status ?? null };

    report.peaks[0] = { key: 'physical', label: 'Physique', reliability: phyRel, value: _extractTierVal(raw.peak_phy_txt) };
    report.peaks[1] = { key: 'tactical', label: 'Tactical', reliability: tacRel, value: _extractTierVal(raw.peak_tac_txt) };
    report.peaks[2] = { key: 'technical', label: 'Technical', reliability: tecRel, value: _extractTierVal(raw.peak_tec_txt) };

    report.personality[0] = { key: 'leadership', label: 'Leadership', reliability: psyRel, value: raw.charisma != null ? parseInt(raw.charisma, 10) : null };
    report.personality[1] = { key: 'professionalism', label: 'Professionalism', reliability: psyRel, value: raw.professionalism != null ? parseInt(raw.professionalism, 10) : null };
    report.personality[2] = { key: 'aggression', label: 'Aggression', reliability: psyRel, value: raw.aggression != null ? parseInt(raw.aggression, 10) : null };

    return report;
};
export const normalizeScoutListReport = (raw, scouts = []) => {
    const scoutsById = Object.fromEntries(scouts.map(scout => [String(scout.id), scout]));
    const scout = scoutsById[String(raw.scoutid)] || null;
    const playerHref = `/players/${raw.playerid}/${encodeURIComponent(String(raw.name || '').replace(/\s+/g, '-'))}/`;
    return {
        id: String(raw.id || raw.playerid || ''),
        playerId: String(raw.playerid || ''),
        name: String(raw.name || '').replace(/\s+/g, ' ').trim(),
        playerHref,
        displayTime: String(raw.display_time || raw.done || '').replace(/\s+/g, ' ').trim(),
        done: String(raw.done || '').replace(/\s+/g, ' ').trim(),
        doneTs: Date.parse(raw.done || '') || 0,
        displayRec: raw.display_rec != null ? parseFloat(raw.display_rec) : (raw.rec != null ? parseFloat(raw.rec) : null),
        potentialStars: (raw.potential != null ? parseFloat(raw.potential) : 0) / 2,
        skill: raw.skill != null ? parseFloat(raw.skill) : null,
        skillPotential: raw.skill_potential != null ? parseFloat(raw.skill_potential) : null,
        age: parseInt(raw.age || '0', 10) || 0,
        position: String(raw.favposition || '').replace(/\s+/g, ' ').trim(),
        country: String(raw.nationalitet || '').replace(/\s+/g, ' ').trim(),
        scoutId: String(raw.scoutid || ''),
        scoutName: scout?.fullName || `Scout ${raw.scoutid || ''}`,
        peakPhy: parseInt(raw.peak_phy || '0', 10) || 0,
        peakTac: parseInt(raw.peak_tac || '0', 10) || 0,
        peakTec: parseInt(raw.peak_tec || '0', 10) || 0,
        charisma: parseInt(raw.charisma || '0', 10) || 0,
        professionalism: parseInt(raw.professionalism || '0', 10) || 0,
        aggression: parseInt(raw.aggression || '0', 10) || 0,
        specialist: parseInt(raw.specialist || '0', 10) || 0,
    };
};

export const normalizeBestEstimate = (reports) => {
    const regular = (reports || []).filter(r => r.scout?.id && r.scout.id !== '0');
    if (!regular.length) return null;

    // returns the report with highest reliability for a given slot; ties broken by date
    const _pickBest = (getEntry) => {
        let best = null, bestRel = -1, bestDate = '';
        for (const r of regular) {
            const entry = getEntry(r);
            if (!entry) continue;
            const rel = entry.reliability ?? -1;
            const d = r.date || '';
            if (rel > bestRel || (rel === bestRel && d > bestDate)) { best = r; bestRel = rel; bestDate = d; }
        }
        return best;
    };

    const potReport = _pickBest(r => r.development?.[0]);
    const bloomReport = _pickBest(r => r.development?.[1]);
    const phyReport = _pickBest(r => r.peaks?.[0]);
    const tacReport = _pickBest(r => r.peaks?.[1]);
    const tecReport = _pickBest(r => r.peaks?.[2]);
    const psyReport = _pickBest(r => r.personality?.[0]);

    const estimate = Scout.createReport();
    estimate.rec = potReport?.rec ?? null;

    let specVal = null;
    for (const r of [phyReport, tacReport, tecReport]) {
        if (r && (r.specialist?.value ?? 0) > 0) { specVal = r.specialist.value; break; }
    }
    estimate.specialist = { label: 'Specialty', reliability: null, value: specVal };

    if (potReport) estimate.development[0] = { ...potReport.development[0] };
    // bloom and devStatus share the same reliability (bloomRel), so the same report wins for both
    if (bloomReport) estimate.development[1] = { ...bloomReport.development[1] };
    if (bloomReport) estimate.development[2] = { ...bloomReport.development[2] };

    if (phyReport) estimate.peaks[0] = { ...phyReport.peaks[0] };
    if (tacReport) estimate.peaks[1] = { ...tacReport.peaks[1] };
    if (tecReport) estimate.peaks[2] = { ...tecReport.peaks[2] };

    // all personality fields share the same reliability (psyRel), take all three from same report
    if (psyReport) {
        estimate.personality[0] = { ...psyReport.personality[0] };
        estimate.personality[1] = { ...psyReport.personality[1] };
        estimate.personality[2] = { ...psyReport.personality[2] };
    }

    return estimate;
};