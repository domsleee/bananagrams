import { TestBed } from '@angular/core/testing';

import { InitialTilesProviderService } from './initial-tiles-provider.service';

describe('InitialTilesProviderService', () => {
  let service: InitialTilesProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitialTilesProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 144 letters', () => {
    expect(service.getInitialTiles().length).toBe(144);
  });

  it('overrides work', () => {
    service.initialTilesOverride = ['A'];
    service.numTilesPerPlayerOverride = 1;
    expect(service.getInitialTiles()).toEqual(['A']);
    expect(service.getNumTilesPerPlayer(1)).toEqual(1);
  })
});
