import { Component, OnInit } from '@angular/core';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-local',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss']
})
export class LocalComponent implements OnInit {
  constructor(
    private gameService: GameService,
    private gameHostService: GameHostService
  ) { }

  ngOnInit(): void {
    this.gameService.initFromPeerToPeer();
    this.gameService.updatePlayer('abc');
    this.gameHostService.startGame();
  }

}
