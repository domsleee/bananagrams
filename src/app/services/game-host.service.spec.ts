import { TestBed } from '@angular/core/testing';

import { GameHostService } from './game-host.service';

describe('GameHostService', () => {
  let service: GameHostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameHostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
