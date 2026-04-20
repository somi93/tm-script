import { POSITION_MAP, BENCH_SLOTS } from '../constants/player.js';
import { SKILL_DEFS } from '../constants/skills.js';
import { Club } from './club.js';

const createSkills = () => SKILL_DEFS.map(skill => ({
    ...skill,
    value: null,
}));
export const Stat = {
    create() {
        return {
            games: null,
            goals: null,
            assists: null,
            productivity: null,
            cards: null,
            conceded: null,
            rating: null,
        }
    }
}

const createPositions = (allPositions = false) => {
    const entries = allPositions
        ? Object.entries(POSITION_MAP)
        : Object.entries(POSITION_MAP).filter(([, pos]) => pos.main);
    const positions = entries.map(([key, pos]) => ({ ...pos, key, r5: null, rec: null, preferred: false }));
    if (allPositions) {
        for (const sub of BENCH_SLOTS) positions.push({ key: sub, playing: false });
    }
    return positions;
};

export const Player = {
    create({ allPositions = false } = {}) {
        return {
            id: null,
            club_id: null,
            club: { ...Club },
            name: null,
            firstname: null,
            lastname: null,
            country: null,
            isGK: null,
            age: null,
            month: null,
            ageMonths: null,
            ageMonthsString: null,
            asi: null,
            routine: null,
            r5: null,
            ti: null,
            wage: null,
            retire: null,
            ban: null,
            injury: null,
            faceUrl: null,
            positions: createPositions(allPositions),
            skills: createSkills(),
            no: null,
            note: null,
            transfer: null,
            training: {
                custom: [null, null, null, null, null, null],
                standard: null
            },
            stats: []
        };
    },
};