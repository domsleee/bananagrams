import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService } from 'src/app/services/game.service';
import { ParamOverrideService } from 'src/app/services/param-override.service';

@Component({
  selector: 'app-local',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss']
})
export class LocalComponent implements OnInit {
  constructor(
    private gameService: GameService,
    private gameHostService: GameHostService,
    private activatedRoute: ActivatedRoute,
    private paramOverrideService: ParamOverrideService
  ) { }

  ngOnInit(): void {
    this.paramOverrideService.setupOverrides(this.activatedRoute.snapshot.queryParams);
    this.gameService.initFromPeerToPeer();
    this.gameService.updatePlayer('abc');
    this.gameHostService.startGame();
  }
}
