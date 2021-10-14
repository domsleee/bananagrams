import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { InitialTilesProviderService } from './initial-tiles-provider.service';
import { getLogger } from './logger';

const logger = getLogger('param-override');

@Injectable({
  providedIn: 'root'
})
export class ParamOverrideService {

  constructor(
    private initialTilesProviderService: InitialTilesProviderService
  ) { }

  setupOverrides(params: Params) {
    if (params?.tiles) {
      logger.info('tiles override applied');
      this.initialTilesProviderService.initialTilesOverride = params?.tiles.split('');
    }
    if (params?.numTiles) {
      logger.info('numTiles override applied');
      this.initialTilesProviderService.numTilesPerPlayerOverride = params.numTiles;
    }
  }
}
