import { TmApiEngine } from './engine.js';
import { TmMatchService } from './match.js';
import { TmPlayerService } from './player.js';
import { TmClubService } from './club.js';
import { TmTransferService } from './transfer.js';
import { TMLeagueService } from './league.js';
import { TmQuickmatchService } from './quickmatch.js';
import { TmScoutsService } from './scouts.js';
import { TmShortlistService } from './shortlist.js';
import { TmTrainingService } from './training.js';
import { TmMessagesService } from './messages.js';
import { TmYouthService } from './youth.js';

export const TmApi = {
    ...TmApiEngine,
    ...TmClubService,
    ...TmMatchService,
    ...TmPlayerService,
    ...TmTransferService,
    ...TMLeagueService,
    ...TmQuickmatchService,
    ...TmScoutsService,
    ...TmShortlistService,
    ...TmTrainingService,
    ...TmMessagesService,
    ...TmYouthService,
};
