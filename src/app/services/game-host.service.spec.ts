import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { GameHostService } from './game-host.service';

describe('GameHostService', () => {
  let service: GameHostService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: APP_BASE_HREF, useValue: 'abc' }
      ]
    });
    service = TestBed.inject(GameHostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
