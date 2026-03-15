import { TmApiEngine } from './engine.js';
import { TmMatchService } from './match.js';
import { TmPlayerService } from './player.js';
import { TmClubService } from './club.js';
import { TmTransferService } from './transfer.js';
import { TMLeagueService } from './league.js';
import { TmShortlistService } from './shortlist.js';
import { TmTrainingService } from './training.js';

export const TmApi = {
    ...TmApiEngine,
    ...TmClubService,
    ...TmMatchService,
    ...TmPlayerService,
    ...TmTransferService,
    ...TMLeagueService,
    ...TmShortlistService,
    ...TmTrainingService,
};
