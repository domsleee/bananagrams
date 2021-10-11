import { PlayerModel } from "src/app/models/player-model";
import { ISharedState } from "src/app/services/game.service";
import { Letter } from "../defs";


export type IRequestData = IClaimSuccess | IDumpLetter | IUpdatePlayer;
export type IResponseData = IReceiveLetters | IWinner | IGameStart | IUpdatePlayer | ILoser | IUpdateSharedState | IReturnToLobby;

// SHARED
// ==================

interface IUpdatePlayer {
  command: 'UPDATE_PLAYER';
  state: Partial<PlayerModel>; // lol
  playerId: string;
};


// REQUESTS from client
// ==================

interface IClaimSuccess {
  command: 'CLAIM_SUCCESS';
  boardValid: boolean;
  numLetters: number;
};

interface IDumpLetter {
  command: 'DUMP_LETTER';
  letter: Letter;
};

// RESPONSES from host
// ==================
interface IReceiveLetters {
  command: 'RECEIVE_LETTERS';
  playerId: string;
  letters: Letter[];
  playerTotalTiles: number;
};

interface IWinner {
  command: 'WINNER';
};

interface ILoser {
  command: 'LOSER';
  playerId: string;
};

interface IGameStart {
  command: 'GAME_START';
};

interface IUpdateSharedState {
  command: 'UPDATE_SHARED_STATE';
  state: ISharedState;
}

interface IReturnToLobby {
  command: 'RETURN_TO_LOBBY';
};

// request