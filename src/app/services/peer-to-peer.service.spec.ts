import { TestBed } from '@angular/core/testing';

import { PeerToPeerService } from './peer-to-peer.service';

describe('PeerToPeerService', () => {
  let service: PeerToPeerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeerToPeerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
