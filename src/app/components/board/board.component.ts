import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { default as interact } from 'interactjs';
import { Interactable} from '@interactjs/core/Interactable';
import { SquareModel } from 'src/app/models/square-model';
import { GRID_SIZE, Letter, START_AREA_ROWS, TILE_SIZE } from 'src/app/shared/defs';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player-model';
import { getLogger } from 'src/app/services/logger';
import { KeyboardEventsService } from 'src/app/services/keyboard-events.service';

const logger = getLogger('board');

const NUM_TILE_INDEXES = (GRID_SIZE * (START_AREA_ROWS+GRID_SIZE));

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  providers: [KeyboardEventsService]
})
export class BoardComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() playerModel: PlayerModel;
  @Input() readonly: boolean = false;

  // constants
  readonly GRID_SIZE = GRID_SIZE;
  readonly topDropzones = Array(GRID_SIZE*GRID_SIZE).fill(null).map((t, i) => i);
  readonly bottomDropzones = Array(GRID_SIZE*START_AREA_ROWS).fill(null).map((t, i) => GRID_SIZE*GRID_SIZE + i);
  readonly borderSize = 3; // todo: import from scss

  readonly gameServiceState: Readonly<GameServiceState>;
  readonly gameServiceGameId: number;
  lastSquare?: SquareModel;
  dropIndexHasTile = new Array<boolean>(NUM_TILE_INDEXES).fill(false);

  private readonly clickHander;
  private interactables: Interactable[] = [];
  private subs: Subscription[] = [];

  constructor(
    private gameService: GameService,
    private keyboardEventsService: KeyboardEventsService
  ) {
    this.gameServiceState = gameService.state;
    this.clickHander = this.clickEventListener.bind(this);
    this.gameServiceGameId = gameService.state.gameId;
  }

  ngOnInit() {
    let lastSquares = this.boardState.squares.filter(t => t.lastClicked);
    if (lastSquares.length) {
      this.lastSquare = lastSquares[0];
    }
    for (let i = 1; i < lastSquares.length; ++i) {
      lastSquares[i].lastClicked = false;
    }
    for (let sq of this.boardState.squares) {
      this.setDropIndexHasTile(sq.dropIndex, true);
    }
  }

  ngOnDestroy() {
    this.subs.forEach(t => t.unsubscribe());
    this.interactables.forEach(t => t.unset());
    document.removeEventListener('click', this.clickHander);
    this.keyboardEventsService.detachListeners();
  }

  get boardState() {
    return this.playerModel.boardState;
  }

  ngAfterViewInit() {
    // reason it is NOT ok to use `this.readonly` here:
    // GameHostService.startGame calls updateSharedState and then GAME_START, but these messages are sometimes not in order. 
    if (this.playerModel.id !== this.gameServiceState.myPlayer.id) return;

    this.keyboardEventsService.attachListeners();

    this.unloadQueue();
    this.subs = [
      this.gameService.letter$.subject.subscribe(() => {
        this.unloadQueue();
      }),
      this.keyboardEventsService.keydownFirstTime.subscribe((key: string) => {
        this.moveAllSquares(key);
      })
    ]

    this.interactables = [
      interact('.draggable').draggable({
        listeners: {
          start: (event) => {
          },
          end: (event) => {
            const squareEl = event.target as HTMLElement;
            const square = this.boardState.getSquareFromEl(squareEl);
            if (this.dropIndexHasTile[square.dropIndex]) {
              logger.info('unlikely event - an incoming square from another peel has taken the square the tile was being dropped on');
              this.dropSquareInNearestDropzone(square);
            } else {
              this.setCoordsBasedOnDropIndex(square, square.dropIndex);
            }
            this.gameService.updateAfterDrop();
          },
          move: (event) => {
            const square = this.boardState.getSquareFromEl(event.target);

            const boardEl = document.getElementById('board');
            const boardRec = boardEl.getBoundingClientRect();
            const calcX = event.clientX - boardRec.left - (TILE_SIZE/2);
            const calcY = event.clientY - boardRec.top - (TILE_SIZE/2);
            //console.log(event.target.style);
            //console.log('square,event', square.x, calcX, event.target.style.width, 'a', event);

            this.setElementCoords(square, calcX, calcY);
          }
        }
      })
        .on('down', (event) => {
          const squareEl = event.target as HTMLElement;
          const square = this.boardState.getSquareFromEl(squareEl);
          this.updateLastSquare(square);
        }),

      interact('.dropzone.droppable').dropzone({
        // Require a % element overlap for a drop to be possible
        overlap: 0.25,

        ondragenter: (event) => {
          const squareEl = event.relatedTarget as HTMLElement;
          const square = this.boardState.getSquareFromEl(squareEl);
          this.setDropIndexHasTile(square.dropIndex, false);
          const dropzoneEl = event.target;
          const dropIndex = parseInt(dropzoneEl.getAttribute('data-id'));

          if (!this.dropIndexHasTile[dropIndex]) {
            square.dropIndex = dropIndex;
            event.target.classList.add('drop-target');
          }
        },
        ondragleave: function (event) {
          event.target.classList.remove('drop-target');
        },
        ondropdeactivate: function (event) {
          event.target.classList.remove('drop-target');
        },
        ondrop: (event: DragEvent) => {
        }
      })
    ];

    document.addEventListener('click', this.clickHander);
  }

  claimSuccess() {
    this.gameService.claimSuccess();
  }

  dump() {
    if (!this.lastSquare) return;
    const sq = this.lastSquare;
    this.setDropIndexHasTile(sq.dropIndex, false);
    this.gameService.dump(sq);
    this.updateLastSquare(null);
    this.gameService.updateAfterDrop();
  }

  private setDropIndexHasTile(dropIndex: number, hasTile: boolean) {
    this.dropIndexHasTile[dropIndex] = hasTile;
  }

  private clickEventListener(event: Event) {
    const target = event.target as HTMLElement;
    if (!target?.classList.contains('draggable')) {
      this.updateLastSquare(null);
    }
  }

  private unloadQueue() {
    if (this.gameServiceGameId !== this.gameServiceState.gameId) {
      logger.warn(`gameid: ${this.gameServiceGameId} does not match game service id ${this.gameServiceState.gameId}`);
      return;
    }

    const letters = [];
    while (this.gameService.letter$.getLength() > 0) {
      letters.push(this.gameService.letter$.pop());
    }
    for (const letter of letters) {
      this.createSquareAndDropInDropzone(letter);
    }
  }

  private createSquareAndDropInDropzone(letter: Letter): void {
    const count = this.boardState.squares.length;
    const sq = this.boardState.createNewSquare();
    sq.letter = letter;

    this.dropSquareInNearestDropzone(sq);
  }

  private dropSquareInNearestDropzone(sq: SquareModel) {
    const dropInDropzone = () => {
      for (let i = 0; i < GRID_SIZE*START_AREA_ROWS; ++i) {
        if (this.tryDropInDropzone(sq, GRID_SIZE*GRID_SIZE + i)) return;
      }

      for (let i = GRID_SIZE*GRID_SIZE-1; i >= 0; --i) {
        if (this.tryDropInDropzone(sq, i)) return;
      }
    }
    dropInDropzone();
    this.gameService.updateAfterDrop();
  }

  private tryDropInDropzone(sq: SquareModel, i: number): boolean {
    if (!this.dropIndexHasTile[i]) {
      this.setCoordsBasedOnDropIndex(sq, i);
      return true;
    }
    return false;
  }

  private setCoordsBasedOnDropIndex(square: SquareModel, dropIndex: number) {
    if (this.dropIndexHasTile[dropIndex]) {
      logger.warn('dropping square on dropzone that already has a tile???');
    }
    const dropzoneEl = document.querySelector(`.dropzone[data-id='${dropIndex}']`) as HTMLElement;
    const dropzoneRec = interact.getElementRect(dropzoneEl);
    const boardEl = document.getElementById('board');
    const boardRec = boardEl.getBoundingClientRect();
    this.setElementCoords(
      square,
      dropzoneRec.left-boardRec.left-window.scrollX - this.borderSize,
      dropzoneRec.top-boardRec.top-window.scrollY - this.borderSize);

    square.dropIndex = dropIndex;
    this.setDropIndexHasTile(square.dropIndex, true);
  }

  private setElementCoords(square: SquareModel, x: number, y: number) {
    square.x = x;
    square.y = y;
  }

  private updateLastSquare(square: SquareModel) {
    if (this.lastSquare) this.lastSquare.lastClicked = false;
    this.lastSquare = square;
    if (this.lastSquare) this.lastSquare.lastClicked = true;
  }

  private moveAllSquares(keycode: string) {
    const res = this.gameService.moveAllSquares(keycode);
    if (res.shouldMove) {
      for (let i = 0; i < res.squaresInPlay.length; ++i) {
        const sq = res.squaresInPlay[i];
        const newDropIndex = res.movedIds[i];
        if (sq.dropIndex === newDropIndex) continue;
        this.setDropIndexHasTile(sq.dropIndex, false);
        this.setCoordsBasedOnDropIndex(sq, newDropIndex);
      }
      this.gameService.updateAfterDrop();
    }
  }
}
