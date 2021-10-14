import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player-model';
import { SquareModel } from 'src/app/models/square-model';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { InvalidSquareFinderService } from 'src/app/services/invalid-square-finder.service';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';

@Component({
  selector: 'app-board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.scss']
})
export class BoardContainerComponent implements OnInit {
  gameServiceState: Readonly<GameServiceState>;
  activePlayer: PlayerModel;
  winner?: PlayerModel;
  myId: string;
  hostId: string;
  subs: Subscription[];

  constructor(
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private gameHostService: GameHostService,
    private invalidSquareService: InvalidSquareFinderService
  ) { }

  ngOnInit(): void {
    this.activePlayer = this.gameService.getOrCreateMyPlayer();
    this.myId = this.gameService.getOrCreateMyPlayer().id;
    this.hostId = this.peerToPeerService.getHostId();
    this.gameServiceState = this.gameService.state;
    this.subs = [
      this.gameService.winner$.subscribe(() => {
        const winnerId = this.gameServiceState.winnerId;
        this.activePlayer = this.gameService.getPlayerById(winnerId);
        this.winner = this.activePlayer;
      }),
      this.gameService.loser$.subscribe(() => {
        let mySquares = this.gameService.getOrCreateMyPlayer().boardState.squares;
        this.gameService.getOrCreateMyPlayer().isEliminated = true;
        const invalidSquares = this.invalidSquareService.getInvalidSquares(mySquares);
        invalidSquares.forEach(sq => { (sq as SquareModel).invalid = true });
        this.gameService.updateAfterDrop();
      })
    ]
  }

  selectPlayer(player: PlayerModel) {
    if (player.id === this.activePlayer?.id) {
      this.activePlayer = null;
    } else {
      this.activePlayer = player;
    }
  }

  returnToLobby() {
    this.gameHostService.returnToLobby();
  }

}
