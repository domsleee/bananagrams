import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InvalidSquareFinderService } from './invalid-square-finder.service';
import { defaultProviders } from '../mocks/test-helpers.spec';

describe('InvalidSquareFinderService', () => {
  let service: InvalidSquareFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ...defaultProviders
      ]
    });
    service = TestBed.inject(InvalidSquareFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
