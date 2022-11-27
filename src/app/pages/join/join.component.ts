import { APP_BASE_HREF } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';
import { RouteNames } from '../routes';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {
  error = null;

  constructor(
    private peerToPeerService: PeerToPeerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Inject(APP_BASE_HREF) public baseHref: string
  ) { }

  async ngOnInit() {
    await this.tryConnect();
  }

  async tryConnect() {
    this.error = null;
    try {
      if (!this.peerToPeerService.getIsConnected() || !this.peerToPeerService.getIsHost()) {
        await this.peerToPeerService.setupByConnectingToId(this.activatedRoute.snapshot.params['id']);
      }
      this.router.navigate([RouteNames.LOBBY + '/' + this.peerToPeerService.getHostId()]);
    } catch (e) {
      this.error = e;
    }
  }
}
