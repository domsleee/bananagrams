import { Component, OnInit } from '@angular/core';
import packageJson from '../../package.json';
import { fadeAnimation } from './animations/fade.animation';
import { ImagePreloaderService } from './image-preloader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit {
  readonly title = 'bananagrams';
  readonly myTitle = "BGRAMS".split("");
  readonly link = 'https://github.com/domsleee/bananagrams';
  readonly version = packageJson.version;

  constructor(private imagePreloader: ImagePreloaderService) {}
  public getRouterOutletState(outlet) {
    const r = outlet.isActivated ? outlet.activatedRoute : 'INACTIVE';
    return r;
  }

  ngOnInit() {
    this.imagePreloader.preloadImages(['/assets/banana.jpeg']);
  }
}
