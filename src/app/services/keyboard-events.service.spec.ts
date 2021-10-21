import { TestBed } from '@angular/core/testing';

import { KeyboardEventsService } from './keyboard-events.service';

describe('KeyboardEventsService', () => {
  let service: KeyboardEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
