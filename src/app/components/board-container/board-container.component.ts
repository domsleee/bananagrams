import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player-model';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';

@Component({
  selector: 'app-board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.scss']
})
export class BoardContainerComponent implements OnInit {
  gameServiceState: Readonly<GameServiceState>;
  activePlayer: PlayerModel;
  myId: string;
  hostId: string;
  subs: Subscription[];

  constructor(
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private gameHostService: GameHostService
  ) { }

  ngOnInit(): void {
    this.activePlayer = this.gameService.getMyPlayer();
    this.myId = this.gameService.getMyPlayer().id;
    this.hostId = this.peerToPeerService.getHostId();
    this.gameServiceState = this.gameService.state;
    this.subs = [
      this.gameService.winner$.subscribe(() => {
        const winnerId = this.gameServiceState.winnerId;
        this.activePlayer = this.gameService.getPlayerById(winnerId);
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
