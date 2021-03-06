import { Injectable, NgZone } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouteNames } from '../pages/routes';
import { PeerToPeerService } from './peer-to-peer.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private peerToPeerService: PeerToPeerService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  wrappedNavigate(commands: any[], extras?: NavigationExtras) {
    this.ngZone.run(() => {
      return this.router.navigate(commands, extras);
    })
  }

  gotoLobby() {
    return this.wrappedNavigate([RouteNames.LOBBY + '/' + this.peerToPeerService.getHostId()]);
  }

  gotoGame() {
    return this.wrappedNavigate([RouteNames.GAME + '/' + this.peerToPeerService.getHostId()]);
  }
}
