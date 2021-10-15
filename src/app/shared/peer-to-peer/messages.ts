import { PlayerModel } from "src/app/models/player-model";
import { ISharedState } from "src/app/services/game.service";
import { Letter } from "../defs";


export type ISharedData = IUpdatePlayer | IRejoinPlayer;
export type IRequestData = ISharedData | IClaimSuccess | IDumpLetter | IRequestState;
export type IResponseData = ISharedData | IReceiveLetters | IWinner | IGameStart | IUpdatePlayer | ILoser | IUpdateSharedState | IReturnToLobby | IPlayerDisconnected | IRejoinSuccess | IRejoinPlayer;

// SHARED
// ==================

interface IUpdatePlayer {
  command: 'UPDATE_PLAYER';
  state: Partial<PlayerModel>; // lol
  playerId: string;
};

interface IRejoinPlayer {
  command: 'REJOIN_AS_PLAYER';
  toPlayer: string;
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

interface IRequestState {
  command: 'REQUEST_ALL_STATE';
};

// RESPONSES from host
// ==================
interface IReceiveLetters {
  command: 'RECEIVE_LETTERS';
  playerId: string;
  letters: Letter[];
  playerTotalTiles: number;
};

interface IPlayerDisconnected {
  command: 'PLAYER_DISCONNECTED';
  playerId: string
};

interface IRejoinSuccess {
  command: 'REJOIN_SUCCESS';
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