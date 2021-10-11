import { Injectable } from '@angular/core';
import { getLogger } from 'loglevel';
import { Subscription } from 'rxjs';
import { Letter } from '../shared/defs';
import { Multiset } from '../shared/multiset';
import { IGenericMessage } from '../shared/peer-to-peer/defs';
import { IRequestData } from '../shared/peer-to-peer/messages';
import { GameService, ISharedState } from './game.service';
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
  state: GameHostServiceState = GameHostService.getDefaultState();
  subs: Subscription[] = [];

  constructor(
    private peerToPeerService: PeerToPeerService,
    private gameService: GameService
  ) {
  }

  async createGame() {
    this.dispose();
    await this.peerToPeerService.setupAsHost();

    this.subs = [
      this.peerToPeerService.connectionAdded.subscribe(() => this.updateSharedState()),
      this.peerToPeerService.connectionRemoved.subscribe(() => this.updateSharedState()),
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
                this.peerToPeerService.broadcastAndToSelf({
                  command: 'WINNER',
                  playerId: message.from
                });
              }
              else {
                this.peerToPeerService.broadcastAndToSelf({
                  command: 'LOSER',
                  playerId: message.from
                });
  
                this.addLetters(playerLetterSet);
              }
              return;
            }
            this.giveEveryPlayerNLetters(1);
            this.updateSharedState();
          } break;
        }
      })
    ];
  }

  async startGame() {
    this.peerToPeerService.broadcastAndToSelf({
      command: 'GAME_START',
      totalTiles: this.state.letters.length
    });
    const numPlayers = this.gameService.state.players.length;
    for (let player of this.gameService.state.players) {
      this.state.lettersPerPlayer[player.id] = new Multiset<Letter>();
    }
    const initTiles = this.getInitialTileNumbers(numPlayers);
    this.state.totalTilesInGame = initTiles * numPlayers;
    this.giveEveryPlayerNLetters(this.getInitialTileNumbers(numPlayers));
    this.updateSharedState();
  }

  dispose() {
    this.subs?.forEach(t => t.unsubscribe());
    this.state = GameHostService.getDefaultState();
  }

  updateSharedState() {
    this.peerToPeerService.broadcastAndToSelf({
      command: 'UPDATE_SHARED_STATE',
      state: this.getSharedState()
    })
  }

  private giveEveryPlayerNLetters(n: number) {
    for (const player of this.gameService.state.players) {
      const letters = this.takeLetters(n);
      this.sendPlayerLetters(player.id, letters);
    } 
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
    return this.state.letters.length < this.gameService.state.players.length;
  }

  private get canDump() {
    return this.state.letters.length >= 3;
  }

  private getInitialTileNumbers(numPlayers: number) {
    if (1 <= numPlayers && numPlayers <= 4) return 21;
    if (5 <= numPlayers && numPlayers <= 6) return 15;
    if (7 <= numPlayers && numPlayers <= 8) return 11;
    throw new Error(`unknown for #players ${numPlayers}`);
  }

  private addLetters(letters: Iterable<Letter>) {
    this.state.letters.concat([...letters]);
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
    return letters;
  }

  private getSharedState(): ISharedState {
    let tilesUsedByPlayers = 0;
    for (let k of Object.keys(this.state.lettersPerPlayer)) {
      if (this.state.losers.includes(k)) continue;
      tilesUsedByPlayers += this.state.lettersPerPlayer[k].size
    }
    return {
      winnerId: this.state.winnerId,
      canDump: this.canDump,
      nextPeelWins: this.nextPeelWins,
      tilesUsedByPlayers,
      totalTilesInGame: this.state.totalTilesInGame,
      tilesRemaining: this.state.letters.length,
      totalPeerCount: 1 + this.peerToPeerService.getConnections().length,
      inGame: this.state.inGame,
    }
  }
}
