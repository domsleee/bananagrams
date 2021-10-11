import { Injectable } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { PeerToPeerService } from './peer-to-peer.service';
import { PlayerModel } from '../models/player-model';
import { GRID_SIZE, Letter } from '../shared/defs';
import { IGenericMessage } from '../shared/peer-to-peer/defs';
import { IRequestData, IResponseData } from '../shared/peer-to-peer/messages';
import { SquareModel } from '../models/square-model';
import { InvalidSquareFinderService } from './invalid-square-finder.service';
import { SubscribableQueue } from '../shared/subscribable-queue';
import { PlayerModelUpdater } from '../shared/updaters/player-model-updater';
import { getLogger } from 'loglevel';

const logger = getLogger('game');
const MAX_PLAYERS = 8;

export interface GameServiceState extends ISharedState {
  canClaimSuccess: boolean;
  players: Array<PlayerModel>;
};

export interface ISharedState {
  winnerId?: string;
  canDump: boolean;
  tilesUsedByPlayers: number;
  totalTilesInGame: number;
  tilesRemaining: number;
  totalPeerCount: number;
  inGame: boolean;
  nextPeelWins: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  letter$ = new SubscribableQueue<Letter>();
  gameStart$ = new Subject<boolean>();
  subs: Array<Subscription> = [];
  state: GameServiceState = GameService.getInitialState();

  constructor(
    private peerToPeerService: PeerToPeerService,
    private invalidSquareFinderService: InvalidSquareFinderService
  ) { }

  initFromPeerToPeer() {
    if (this.subs.length > 0) return;
    this.state.players = [];
    this.subs.forEach(t => t.unsubscribe());
    this.subs = [
      this.peerToPeerService.connectionRemoved.subscribe(playerId => {
        this.state.players = this.state.players.filter(t => t.id !== playerId);
      }),
      this.peerToPeerService.getMessageObservable().subscribe((message: IGenericMessage<IResponseData>) => {
        switch(message.data.command) {
          case 'UPDATE_PLAYER': {
            let player = this.getPlayerById(message.data.playerId);
            if (!player) {
              if (this.state.players.length >= MAX_PLAYERS) {
                logger.info(`a new player ${message.data.state.name} tried to join, but game was full`);
                break;
              }
              player = new PlayerModel(message.data.playerId);
              this.state.players.push(player);
            }
            new PlayerModelUpdater().updatePlayer(player, message.data.state);
          } break;
          case 'GAME_START': {
            this.letter$ = new SubscribableQueue<Letter>();
            this.state.totalTilesInGame = message.data.totalTiles;
            this.gameStart$.next(true);
          } break;
          case 'RECEIVE_LETTERS': {
            const player = this.getPlayerById(message.data.playerId);
            for (let letter of message.data.letters) {
              if (message.data.playerId === this.peerToPeerService.getId()) {
                this.letter$.add(letter);
              }
            }
            player.totalTiles = message.data.playerTotalTiles;
          } break;
          case 'LOSER': {
            let player = this.getPlayerById(message.data.playerId);
            player.isEliminated = true;
          } break;
          case 'WINNER': {
            let player = this.getPlayerById(message.data.playerId);
            this.state.winnerId = player.id;
          } break;
          case 'UPDATE_SHARED_STATE': {
            Object.assign(this.state, message.data.state);
          } break;
        }
      })
    ];
  }

  dispose() {
    this.state = GameService.getInitialState();
    this.subs.forEach(t => t.unsubscribe);
    this.subs = [];
  }

  updatePlayer(name: string) {
    let player = this.getMyPlayer();
    if (!player) {
      player = new PlayerModel(this.peerToPeerService.getId());
    }
    player.name = name;
    this.sendUpdateMessage(player);
  }

  updateAfterDrop() {
    let player = this.getMyPlayer();
    window['squares'] = player.boardState.squares;
    player.tilesUsed = player.boardState.squares.reduce((a, sq) => a + (sq.dropzoneRef?.id < GRID_SIZE * GRID_SIZE ? 1 : 0), 0);
    this.state.canClaimSuccess = player.tilesUsed === player.totalTiles;
    this.sendUpdateMessage(this.getMyPlayer());
  }

  echoAllPlayers() {
    for (let player of this.state.players) {
      this.sendUpdateMessage(player);
    }
  }

  private sendUpdateMessage(player: PlayerModel) {
    const partialPlayer: Partial<PlayerModel> = JSON.parse(JSON.stringify(player));
    partialPlayer.boardState.dropzones = [];
    this.peerToPeerService.broadcastAndToSelf({
      command: 'UPDATE_PLAYER',
      state: partialPlayer,
      playerId: player.id
    })
  }

  claimSuccess() {
    let player = this.getPlayerById(this.peerToPeerService.getId());
    const invalidSquares = this.invalidSquareFinderService.getInvalidSquares(player.boardState.squares);
    this.peerToPeerService.sendSingleMessage(this.peerToPeerService.getHostId(), {
      command: 'CLAIM_SUCCESS',
      boardValid: invalidSquares.length === 0,
      numLetters: player.totalTiles
    });
  }

  dump(squareModel: SquareModel) {    
    let player = this.getPlayerById(this.peerToPeerService.getId());
    player.boardState.squares = player.boardState.squares.filter(t => t.id !== squareModel.id);
    this.peerToPeerService.sendSingleMessage(this.peerToPeerService.getHostId(), {
      command: 'DUMP_LETTER',
      letter: squareModel.letter
    });
  }

  getMyPlayer(): PlayerModel {
    return this.getPlayerById(this.peerToPeerService.getId());
  }

  private static getInitialState(): GameServiceState {
    return {
      canDump: true,
      canClaimSuccess: false,
      winnerId: null,
      totalTilesInGame: 0,
      tilesUsedByPlayers: 0,
      tilesRemaining: 0,
      players: [],
      totalPeerCount: 1,
      inGame: false,
      nextPeelWins: false
    }
  }

  private getPlayerById(playerId: string) {
    return this.state.players.find(t => t.id == playerId);
  }
}
