import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player-model';
import { SquareModel } from 'src/app/models/square-model';
import { GameHostService } from 'src/app/services/game-host.service';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { InvalidSquareFinderService } from 'src/app/services/invalid-square-finder.service';
import { PeerToPeerService } from 'src/app/services/peer-to-peer.service';
import { BananaAnimation } from 'src/app/shared/banana-animation';

@Component({
  selector: 'app-board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.scss']
})
export class BoardContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly animation: BananaAnimation;
  gameServiceState: Readonly<GameServiceState>;
  activePlayer: PlayerModel;
  winner?: PlayerModel;
  myId: string;
  hostId: string;
  subs: Subscription[];
  isHost = false;
  isMobile = false; // wip

  constructor(
    private gameService: GameService,
    private peerToPeerService: PeerToPeerService,
    private gameHostService: GameHostService,
    private invalidSquareService: InvalidSquareFinderService,
    private ngZone: NgZone
  ) {
    this.animation = new BananaAnimation(this.ngZone);
  }

  ngOnInit(): void {
    this.isHost = this.peerToPeerService.getIsHost();
    this.activePlayer = this.gameService.getOrCreateMyPlayer();
    this.myId = this.gameService.getOrCreateMyPlayer().id;
    this.hostId = this.peerToPeerService.getHostId();
    this.gameServiceState = this.gameService.state;
    this.subs = [
      this.gameService.winner$.subscribe(() => {
        const winnerId = this.gameServiceState.winnerId;
        this.winner = this.gameService.getPlayerById(winnerId);
        this.setActivePlayer(this.winner, true);
      }),
      this.gameService.loser$.subscribe(() => {
        let mySquares = this.gameService.getOrCreateMyPlayer().boardState.squares;
        this.gameService.getOrCreateMyPlayer().isEliminated = true;
        const invalidSquares = this.invalidSquareService.getInvalidSquares(mySquares);
        invalidSquares.forEach(sq => { (sq as SquareModel).invalid = true });
        this.gameService.updateAfterDrop();
      })
    ]
  }

  ngAfterViewInit() {
    if (false) {
      this.winner = this.activePlayer;
      this.playAnimation();
    }
  }

  ngOnDestroy() {
    this.destroyAnimation();
    this.subs.forEach(t => t.unsubscribe());
  }

  selectPlayer(player: PlayerModel) {
    this.setActivePlayer(player);
  }

  returnToLobby() {
    this.gameHostService.returnToLobby();
  }

  private setActivePlayer(player: PlayerModel, force = false) {
    let activePlayerChanged = false;
    if (player.id === this.activePlayer?.id) {
      //this.activePlayer = null;
    } else {
      this.activePlayer = player;
      activePlayerChanged = true;
    }
    const isWinner = this.activePlayer.id === this.winner?.id;
    const isMe = this.activePlayer.id === this.myId;
    if ((activePlayerChanged || force) && isWinner && isMe) {
      this.playAnimation();
    } else if (activePlayerChanged) {
      this.destroyAnimation();
    }
  }

  private playAnimation() {
    const el = document.getElementsByClassName('board-' + this.winner.id)[0] as HTMLElement;
    this.ngZone.runOutsideAngular(() => this.animation.runAnimation(el));
  }

  private destroyAnimation() {
    this.animation.stopAnimation();
  }
}
