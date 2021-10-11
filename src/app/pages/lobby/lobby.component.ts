import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';
import { RouteNames } from '../routes';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {
  gameServiceState: GameServiceState;
  name: string;
  isHost: boolean;
  subs: Subscription[];

  constructor(
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private gameHostService: GameHostService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.isHost = this.peerToPeerService.getIsHost();
    this.gameServiceState = this.gameService.state;
    this.gameService.initFromPeerToPeer();
    this.subs = [
      this.gameService.gameStart$.subscribe(t => this.router.navigate([RouteNames.GAME + '/' + this.peerToPeerService.getHostId()])),
      this.peerToPeerService.connectionAdded.subscribe(t => {
        if (this.isHost) this.gameService.echoAllPlayers();
      })
    ]
  }

  ngOnDestroy() {
    this.subs.forEach(t => t.unsubscribe);
  }

  setName() {
    this.gameService.updatePlayer(this.name);
  }

  startGame() {
    this.gameHostService.startGame();
  }
}
