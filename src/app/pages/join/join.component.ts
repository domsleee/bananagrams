import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Peer from 'peerjs';
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
    private router: Router
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
