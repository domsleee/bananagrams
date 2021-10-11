import { asLiteral } from '@angular/compiler/src/render3/view/util';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService } from 'src/app/services/game.service';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';
import { RouteNames } from '../routes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loading = false;

  constructor(
    private gameHostService: GameHostService,
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.gameHostService.dispose();
    this.gameService.dispose();
    this.peerToPeerService.dispose();
  }

  async createGame() {
    this.loading = true;
    try {
      await this.gameHostService.createGame();
      this.router.navigate([RouteNames.LOBBY + '/' + this.peerToPeerService.getHostId()])
    }
    finally {
      this.loading = false;
    }
  }
}
