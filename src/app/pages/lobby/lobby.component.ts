import { APP_BASE_HREF } from '@angular/common';
import { Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { NavigationService } from 'src/app/services/navigation.service';
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
  rejoining = false;
  copied = false;

  constructor(
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private gameHostService: GameHostService,
    private navigationService: NavigationService,
    @Inject(APP_BASE_HREF) public baseHref: string
  ) { }

  async ngOnInit() {
    this.isHost = this.peerToPeerService.getIsHost();
    this.gameServiceState = this.gameService.state;
    this.gameService.initFromPeerToPeer();
    
    this.subs = [
      this.gameService.gameStart$.subscribe(t => this.gotoGame()),
    ];
  }

  private gotoGame() {
    this.navigationService.gotoGame();
  }

  ngOnDestroy() {
    this.subs.forEach(t => t.unsubscribe);
  }

  setName(event: Event) {
    this.gameService.updatePlayer(this.name);
  }

  startGame() {
    this.gameHostService.startGame();
  }

  rejoin() {
    this.rejoining = true;
    setTimeout(() => this.rejoining = false, 500);
    this.gameService.rejoinAsPlayer(this.gameServiceState.rejoinCandidate);
    this.setIsSpectatorAndGotoGame(false);
  }

  joinAsSpectator() {
    this.setIsSpectatorAndGotoGame(true);
  }

  copyJoinLink() {
    navigator.clipboard.writeText(window.location.href);
    this.copied = true;
    setTimeout(() => this.copied = false, 2 * 1000);
  }

  private setIsSpectatorAndGotoGame(isSpectator: boolean) {
    this.gameService.getOrCreateMyPlayer().isSpectator = isSpectator;
    this.gameService.sendPlayerUpdateMessage(this.gameService.getOrCreateMyPlayer());
    if (this.gameServiceState.inGame) this.gotoGame();
  }
}
