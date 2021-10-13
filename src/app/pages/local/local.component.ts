import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { DictionaryService } from 'src/app/services/dictionary.service';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService } from 'src/app/services/game.service';
import { InitialTilesProviderService } from 'src/app/services/initial-tiles-provider.service';

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
    private initialTilesProviderService: InitialTilesProviderService
  ) { }

  ngOnInit(): void {
    this.setupOverrides();
    this.gameService.initFromPeerToPeer();
    this.gameService.updatePlayer('abc');
    this.gameHostService.startGame();
  }

  private setupOverrides() {
    const params = this.activatedRoute.snapshot.queryParams;
    if (params?.tiles) {
      this.initialTilesProviderService.initialTilesOverride = params?.tiles.split('');
    }
    if (params?.numTiles) {
      this.initialTilesProviderService.numTilesPerPlayerOverride = params.numTiles;
    }
  }

}
