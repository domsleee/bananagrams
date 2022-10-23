import { TestBed } from '@angular/core/testing';

import { ImagePreloaderService } from './image-preloader.service';

describe('ImagePreloaderService', () => {
  let service: ImagePreloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagePreloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
