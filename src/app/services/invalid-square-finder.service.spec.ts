import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InvalidSquareFinderService } from './invalid-square-finder.service';
import { APP_BASE_HREF } from '@angular/common';

describe('InvalidSquareFinderService', () => {
  let service: InvalidSquareFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: APP_BASE_HREF, useValue: 'abc' }
      ]
    });
    service = TestBed.inject(InvalidSquareFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
