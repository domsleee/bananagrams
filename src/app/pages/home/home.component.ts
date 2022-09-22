import { APP_BASE_HREF } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService } from 'src/app/services/game.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ParamOverrideService } from 'src/app/services/param-override.service';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loading = false;
  url = `${window.location.href}join/00000`;

  constructor(
    private gameHostService: GameHostService,
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private navigationService: NavigationService,
    private activatedRoute: ActivatedRoute,
    private paramOverrideService: ParamOverrideService,
    @Inject(APP_BASE_HREF) public baseHref: string
  ) { }

  ngOnInit(): void {
    this.gameHostService.dispose();
    this.gameService.dispose();
    this.peerToPeerService.dispose();
    this.paramOverrideService.setupOverrides(this.activatedRoute.snapshot.queryParams);
  }

  async createGame() {
    this.loading = true;
    try {
      await this.gameHostService.createGame();
      this.navigationService.gotoLobby();
    }
    finally {
      this.loading = false;
    }
  }
}
