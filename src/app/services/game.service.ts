import { Injectable } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { PeerToPeerService } from './peer-to-peer.service';
import { PlayerModel } from '../models/player-model';
import { GRID_SIZE, Letter } from '../shared/defs';
import { IGenericMessage, MessageData } from '../shared/peer-to-peer/defs';
import { IRequestData, IResponseData } from '../shared/peer-to-peer/messages';
import { SquareModel } from '../models/square-model';
import { InvalidSquareFinderService } from './invalid-square-finder.service';
import { SubscribableQueue } from '../shared/subscribable-queue';
import { playerKeysToUpdate, PlayerModelUpdater } from '../shared/updaters/player-model-updater';
import { Navigation, Router } from '@angular/router';
import { RouteNames } from '../pages/routes';
import { BoardState } from '../utils/board';
import { BoardAlgorithmsService, Direction, directions } from './board-algorithms.service';
import { LocalStorageService } from './local-storage.service';
import { getLogger } from './logger';
import { NavigationService } from './navigation.service';

const logger = getLogger('game');
const MAX_PLAYERS = 8;

export interface GameServiceState extends ISharedState {
  canClaimSuccess: boolean;
  players: Array<PlayerModel>;
  myPlayer: PlayerModel | null;
  rejoinCandidate: PlayerModel | null;
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
  gameOver: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  letter$ = new SubscribableQueue<Letter>();
  gameStart$ = new Subject<boolean>();
  winner$ = new Subject<void>();
  loser$ = new Subject<void>();
  subs: Array<Subscription> = [];
  state: GameServiceState = GameService.getInitialState();

  constructor(
    private peerToPeerService: PeerToPeerService,
    private invalidSquareFinderService: InvalidSquareFinderService,
    private boardAlgorithmsService: BoardAlgorithmsService,
    private localStorageService: LocalStorageService,
    private navigationService: NavigationService
  ) { }

  initFromPeerToPeer() {
    if (this.subs.length > 0) return;

    this.state.players = [];
        
    const peerId = this.peerToPeerService.getId();
    const previousIds = this.localStorageService.localState.previousIds;
    if (!previousIds.includes(peerId)) {
      previousIds.push(peerId);
      this.localStorageService.localState.previousIds = previousIds.slice(Math.max(previousIds.length - 10, 0));
      this.localStorageService.updateLocalState();
    }
    this.subs = [
      this.peerToPeerService.connectionRemoved.subscribe(playerId => {
        if (this.peerToPeerService.getIsHost()) {
          this.peerToPeerService
        }
        const player = this.getPlayerById(playerId);
        if (player) {
          player.disconnected = true;
        }
      }),
      this.peerToPeerService.getMessageObservable().subscribe((message: IGenericMessage<IResponseData>) => {
        switch(message.data.command) {
          case 'UPDATE_PLAYER': {
            let player = this.getPlayerById(message.data.playerId);
            if (!player) {
              player = new PlayerModel(message.data.playerId);
              this.state.players.push(player);
              if (this.localStorageService.localState.previousIds.includes(player.id)
                  && player.id !== this.peerToPeerService.getId()) {
                logger.info(`has been ${player.id} before.`);
                this.state.rejoinCandidate = player;
              }
            }
            new PlayerModelUpdater().updatePlayer(player, message.data.state);
          } break;
          case 'GAME_START': {
            this.letter$ = new SubscribableQueue<Letter>();
            this.resetLocalState();
            this.gameStart$.next(true);
          } break;
          case 'REJOIN_AS_PLAYER': {
            logger.info("REJOIN AS PLAYER", message);
            const player = this.getPlayerById(message.data.toPlayer);
            if (player) {
              this.state.players = this.state.players.filter(t => t.id !== message.from);
              (player as any).id = message.from;
              player.disconnected = false;

              if (player.id === this.peerToPeerService.getId()) {
                this.state.rejoinCandidate = null;
              }
            }
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
            if (message.data.playerId === this.peerToPeerService.getId()) {
              this.loser$.next();
            }
          } break;
          case 'PLAYER_DISCONNECTED': {
            let player = this.getPlayerById(message.data.playerId);
            if (player) player.disconnected = true;
            if (!this.peerToPeerService.getIsConnected() || message.data.playerId === this.peerToPeerService.getHostId()) {
              const myPlayer = this.getOrCreateMyPlayer();
              myPlayer.disconnected = true;
            }
          } break;
          case 'WINNER': {
            this.winner$.next();
          } break;
          case 'UPDATE_SHARED_STATE': {
            Object.assign(this.state, message.data.state);
          } break;
          case 'RETURN_TO_LOBBY': {
            this.navigationService.gotoLobby();
          } break;
        }
      })
    ];

    this.peerToPeerService.sendSingleMessage(this.peerToPeerService.getHostId(), {
      command: 'REQUEST_ALL_STATE'
    });
  }

  dispose() {
    this.state = GameService.getInitialState();
    this.subs.forEach(t => t.unsubscribe);
    this.subs = [];
  }

  private resetLocalState() {
    this.state.players.forEach(player => {
      player.boardState = new BoardState();
      player.tilesUsed = 0;
      player.isEliminated = false;
      player.isSpectator = false;
    });
    this.state.canClaimSuccess = false;
  }

  rejoinAsPlayer(player: PlayerModel) {
    this.peerToPeerService.broadcastAndToSelf({
      command: 'REJOIN_AS_PLAYER',
      toPlayer: player.id
    });
  }

  updatePlayer(name: string) {
    let player = this.getOrCreateMyPlayer();
    player.name = name;
    player.nameEncoded = encodeURI(player.name);
    this.sendPlayerUpdateMessage(player);
    this.sendPlayerUpdateMessage(player, this.peerToPeerService.getId());
  }

  updateAfterDrop() {
    let player = this.getOrCreateMyPlayer();
    player.tilesUsed = player.boardState.squares.reduce((a, sq) => a + (sq.dropIndex < GRID_SIZE * GRID_SIZE ? 1 : 0), 0);
    this.state.canClaimSuccess = this.canClaimSuccess();
    this.sendUpdateMessage(this.getOrCreateMyPlayer());
  }

  private canClaimSuccess() {
    const player = this.getOrCreateMyPlayer();
    const allTilesUsed = player.tilesUsed === player.totalTiles;
    if (!allTilesUsed) return false;

    return this.boardAlgorithmsService.isOneComponent(player.boardState.squares);
  }

  private sendUpdateMessage(player: PlayerModel) {
    this.sendPlayerUpdateMessage(player);
  }

  sendPlayerUpdateMessage(player: PlayerModel, to: string = null) {
    let res: Partial<PlayerModel> = {};
    for (const key of playerKeysToUpdate) {
      res[key as any] = player[key];
    }
    res.boardState = player.boardState;

    const message: MessageData = {
      command: 'UPDATE_PLAYER',
      state: res,
      playerId: player.id
    };
  
    if (to) {
      this.peerToPeerService.sendSingleMessage(to, message);
    } else {
      this.peerToPeerService.broadcast(message);
    }
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

  getOrCreateMyPlayer(): PlayerModel {
    let player = this.getPlayerById(this.peerToPeerService.getId());
    if (!player) {
      player = new PlayerModel(this.peerToPeerService.getId());
    }
    return this.state.myPlayer = player;
  }

  moveAllSquares(keycode: string) {
    const direction = directions.find(d => d === keycode);
    if (!direction) return {shouldMove: false};

    const myPlayer = this.getOrCreateMyPlayer();
    let squaresInPlay = myPlayer.boardState.squares.filter(t => t.dropIndex < GRID_SIZE * GRID_SIZE);
    let movedIds = this.boardAlgorithmsService.getMovedSquareIds(squaresInPlay, direction);
    
    const set = new Set(movedIds);
    if (set.size !== squaresInPlay.length) {
      logger.debug(`refused to moved squares ${set.size} != ${squaresInPlay.length}`, set, movedIds);
      return {shouldMove: false};
    }

    const sortFns: {[key in Direction]: (a1: SquareModel, a2: SquareModel) => number} = {
      'ArrowRight': (a1, a2) => a2.dropIndex - a1.dropIndex,
      'ArrowLeft': (a1, a2) => a1.dropIndex - a2.dropIndex,
      'ArrowUp': (a1, a2) => a1.dropIndex - a2.dropIndex,
      'ArrowDown': (a1, a2) => a2.dropIndex - a1.dropIndex
    }

    const sortFn = sortFns[keycode];
    [squaresInPlay, movedIds] = this.boardAlgorithmsService.sortTwoArrays(squaresInPlay, movedIds, sortFn);
    return {shouldMove: true, squaresInPlay, movedIds};
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
      totalPeerCount: 0,
      inGame: false,
      nextPeelWins: false,
      gameOver: false,
      myPlayer: null,
      rejoinCandidate: null
    }
  }

  getPlayerById(playerId: string) {
    return this.state.players.find(t => t.id == playerId);
  }
}
