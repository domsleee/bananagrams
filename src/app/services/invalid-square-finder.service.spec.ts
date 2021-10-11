import { TestBed } from '@angular/core/testing';

import { InvalidSquareFinderService } from './invalid-square-finder.service';

describe('InvalidSquareFinderService', () => {
  let service: InvalidSquareFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvalidSquareFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
