export const Scout = {
    create() {
        return {
            id: null,
            firstname: null,
            lastname: null,
            name: null,
            country: null,
            age: null,
            wage: null,
            seniors: null,
            youths: null,
            physical: null,
            tactical: null,
            technical: null,
            development: null,
            psychology: null,
            last_action: null,
            away: false,
            returns: null,
        };
    },
    createReport() {
        return {
            scout: null,
            date: null,
            age: null,
            rec: null,
            currentSkill: null,
            specialist: { label: 'Specialty', reliability: null, value: null },
            development: [
                { key: 'potential', label: 'Potential', reliability: null, value: null },
                { key: 'bloom', label: 'Bloom', reliability: null, value: null },
                { key: 'devStatus', label: 'Development status', reliability: null, value: null },
            ],
            peaks: [
                { key: 'physical', label: 'Physique', reliability: null, value: null },
                { key: 'tactical', label: 'Tactical', reliability: null, value: null },
                { key: 'technical', label: 'Technical', reliability: null, value: null },
            ],
            personality: [
                { key: 'leadership', label: 'Leadership', reliability: null, value: null },
                { key: 'professionalism', label: 'Professionalism', reliability: null, value: null },
                { key: 'aggression', label: 'Aggression', reliability: null, value: null },
            ],
        };
    }
};
