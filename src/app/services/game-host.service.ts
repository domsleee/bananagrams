import { Injectable } from '@angular/core';
import { getLogger } from 'loglevel';
import { Subscription } from 'rxjs';
import { Letter } from '../shared/defs';
import { Multiset } from '../shared/multiset';
import { IGenericMessage } from '../shared/peer-to-peer/defs';
import { IRequestData } from '../shared/peer-to-peer/messages';
import { GameService, ISharedState } from './game.service';
import { InitialTilesProviderService } from './initial-tiles-provider.service';
import { PeerToPeerService } from './peer-to-peer.service';

export interface GameHostServiceState {
  letters: Letter[];
  lettersPerPlayer: {[key: string]: Multiset<Letter>};
  losers: Array<string>,
  totalTilesInGame: number;
  winnerId?: string;
  inGame: boolean;
}

const logger = getLogger('game-host');

@Injectable({
  providedIn: 'root'
})
export class GameHostService {
  private state: GameHostServiceState = GameHostService.getDefaultState();
  private subs: Subscription[] = [];

  constructor(
    private peerToPeerService: PeerToPeerService,
    private gameService: GameService,
    private initialTilesProviderService: InitialTilesProviderService
  ) {
    this.subs = [
      this.peerToPeerService.connectionAdded.subscribe(() => this.updateSharedState()),
      this.peerToPeerService.connectionRemoved.subscribe(playerId => {
        const player = this.gameService.getPlayerById(playerId);
        if (player) {
          this.peerToPeerService.broadcastAndToSelf({
            command: 'PLAYER_DISCONNECTED',
            playerId: player.id
          });
        }
        this.updateSharedState();
      }),
      this.peerToPeerService.getMessageObservable().subscribe((message: IGenericMessage<IRequestData>) => {
        switch(message.data.command) {
          case 'DUMP_LETTER': {
            const playerLetterSet = this.state.lettersPerPlayer[message.from];
            playerLetterSet.delete(message.data.letter);
            let lettersToSend = [message.data.letter];
            if (this.canDump) {
              lettersToSend = this.takeLetters(3);
              this.state.letters.push(message.data.letter);
            }
            this.sendPlayerLetters(message.from, lettersToSend);
            this.updateSharedState();
          } break;
          case 'CLAIM_SUCCESS': {
            const playerLetterSet = this.state.lettersPerPlayer[message.from];
  
            // the player received a letter, ignore the message
            if (playerLetterSet.size !== message.data.numLetters) {
              logger.warn(`CLAIM_SUCCESS: host suggests ${playerLetterSet.size}, message has ${message.data.numLetters}`);
              break;
            }
  
            if (this.nextPeelWins) {
              if (message.data.boardValid) {
                if (!this.state.winnerId) {
                  this.state.winnerId = message.from;
                  this.updateSharedState();
                  this.peerToPeerService.broadcastAndToSelf({
                    command: 'WINNER'
                  });
                }

              }
              else {
                this.state.losers.push(message.from);
                this.peerToPeerService.broadcastAndToSelf({
                  command: 'LOSER',
                  playerId: message.from
                });
  
                this.addLetters(playerLetterSet);
              }
            }
            else {
              this.giveEveryPlayerNLetters(1);
            }
            this.updateSharedState();
          } break;
          case 'REQUEST_ALL_STATE': {
            for (let player of this.gameService.state.players) {
              this.gameService.sendPlayerUpdateMessage(player, message.from);
            }
            this.updateSharedState();
          } break;
          case 'REJOIN_AS_PLAYER': {
            this.state.lettersPerPlayer[message.from] = this.state.lettersPerPlayer[message.data.toPlayer] ?? new Multiset();
            this.state.lettersPerPlayer[message.data.toPlayer] = new Multiset();
          } break;
        }
      })
    ];
  }

  async createGame() {
    await this.peerToPeerService.setupAsHost();
  }

  async startGame() {
    this.dispose();
    this.updateSharedState(); // client needs to know server state before navigating to the game
    this.state.inGame = true;
    this.peerToPeerService.broadcastAndToSelf({
      command: 'GAME_START'
    });
    const numPlayers = this.gameService.state.players.length;
    for (let player of this.gameService.state.players) {
      this.state.lettersPerPlayer[player.id] = new Multiset<Letter>();
    }

    this.state.letters = this.initialTilesProviderService.getInitialTiles(numPlayers);
    GameHostService.shuffleArray(this.state.letters);
    const initTiles = this.initialTilesProviderService.getNumTilesPerPlayer(numPlayers);
    this.state.totalTilesInGame = this.state.letters.length;
    this.giveEveryPlayerNLetters(initTiles, true);
    this.updateSharedState();
  }

  dispose() {
    //this.subs?.forEach(t => t.unsubscribe());
    this.state = GameHostService.getDefaultState();
  }

  updateSharedState() {
    this.peerToPeerService.broadcastAndToSelf({
      command: 'UPDATE_SHARED_STATE',
      state: this.getSharedState()
    })
  }

  returnToLobby() {
    this.state.inGame = false;
    this.updateSharedState();
    this.peerToPeerService.broadcastAndToSelf({
      command: 'RETURN_TO_LOBBY'
    });
  }

  private giveEveryPlayerNLetters(n: number, firstTurn = false) {
    for (const player of this.getActivePlayers(firstTurn)) {
      if (player.disconnected) continue;
      const letters = this.takeLetters(n);
      this.sendPlayerLetters(player.id, letters);
    } 
  }

  private getActivePlayers(firstTurn = false) {
    return this.gameService.state.players
      .filter(t => !t.isEliminated && (firstTurn || (this.state.lettersPerPlayer[t.id]?.size ?? 0) > 0));
  }

  private sendPlayerLetters(peerId: string, letters: Array<Letter>) {
    for (const letter of letters) this.state.lettersPerPlayer[peerId].add(letter);
    this.peerToPeerService.broadcastAndToSelf({
      command: 'RECEIVE_LETTERS',
      playerId: peerId,
      playerTotalTiles: this.state.lettersPerPlayer[peerId].size,
      letters
    });
  }

  private get nextPeelWins() {
    const numActivePlayers = this.getActivePlayers().length;
    return this.state.letters.length < numActivePlayers;
  }

  private get canDump() {
    return this.state.letters.length >= 3;
  }

  private addLetters(letters: Iterable<Letter>) {
    this.state.letters = this.state.letters.concat([...letters]);
    GameHostService.shuffleArray(this.state.letters);
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  private static shuffleArray(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private takeLetters(n: number) {
    if (n > this.state.letters.length) throw new Error(`tried to take ${n} letters, only ${this.state.letters.length} available`);
    const letters = this.state.letters.slice(0, n);
    this.state.letters = this.state.letters.slice(n);
    return letters;
  }

  private static getDefaultState(): GameHostServiceState {
    return {
      letters: GameHostService.getDefaultLetters(),
      lettersPerPlayer: {},
      totalTilesInGame: 0,
      losers: [],
      winnerId: null,
      inGame: false
    };
  }

  private static getDefaultLetters(): Letter[] {
    let letters = new Array<Letter>();
    for (let i = 0; i < 26; ++i) {
      let letter: Letter = String.fromCharCode('A'.charCodeAt(0)+i) as Letter;
      for (let j = 0; j < 2; ++j) letters.push(letter);
    }
    GameHostService.shuffleArray(letters);
    return letters;
  }

  private getSharedState(): ISharedState {
    let tilesUsedByPlayers = 0;
    for (let k of Object.keys(this.state.lettersPerPlayer)) {
      if (this.state.losers.includes(k)) continue;
      tilesUsedByPlayers += this.state.lettersPerPlayer[k].size
    }
    const gameOver = this.state.winnerId != null || this.state.losers.length === Object.keys(this.state.lettersPerPlayer).length
    return {
      winnerId: this.state.winnerId,
      canDump: !gameOver && this.canDump,
      nextPeelWins: this.nextPeelWins,
      tilesUsedByPlayers,
      totalTilesInGame: this.state.totalTilesInGame,
      tilesRemaining: this.state.letters.length,
      totalPeerCount: 1 + this.peerToPeerService.getConnections().length,
      inGame: this.state.inGame,
      gameOver
    }
  }
}
