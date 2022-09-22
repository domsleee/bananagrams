import { Component } from '@angular/core';
import packageJson from '../../package.json';
import { fadeAnimation } from './animations/fade.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeAnimation]
})
export class AppComponent {
  readonly title = 'bananagrams';
  readonly myTitle = "BGRAMS".split("");
  readonly link = 'https://github.com/domsleee/bananagrams';
  readonly version = packageJson.version;

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
}
