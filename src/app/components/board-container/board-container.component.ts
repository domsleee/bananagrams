import { Component, OnInit } from '@angular/core';
import { PlayerModel } from 'src/app/models/player-model';
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

  constructor(
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService
  ) { }

  ngOnInit(): void {
    this.activePlayer = this.gameService.getMyPlayer();
    this.myId = this.gameService.getMyPlayer().id;
    this.hostId = this.peerToPeerService.getHostId();
    this.gameServiceState = this.gameService.state;
  }

  selectPlayer(player: PlayerModel) {
    if (player.id === this.activePlayer?.id) {
      this.activePlayer = null;
    } else {
      this.activePlayer = player;
    }
  }

}
