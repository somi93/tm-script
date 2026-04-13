import { POSITION_MAP } from '../constants/player.js';
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

const createPositions = () => Object.entries(POSITION_MAP)
    .filter(([, position]) => position.main)
    .map(([key, position]) => ({
        ...position,
        key,
        r5: null,
        rec: null,
        preferred: false,
    }));

export const Player = {
    create() {
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
            ti: null,
            wage: null,
            retire: null,
            ban: null,
            injury: null,
            faceUrl: null,
            positions: createPositions(),
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