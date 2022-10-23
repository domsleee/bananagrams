import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePreloaderService {

  constructor() { }

  preloadImages(images: string[]) {
    for (let image of images) {
      const img = new Image();
      img.src = image;
    }
  }
}
