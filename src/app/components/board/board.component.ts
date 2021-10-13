import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import interact from 'interactjs';
import { SquareModel } from 'src/app/models/square-model';
import { GRID_SIZE, Letter, START_AREA_ROWS, TILE_SIZE } from 'src/app/shared/defs';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player-model';
import { getLogger } from 'src/app/services/logger';

const logger = getLogger('board');

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @Input() playerModel: PlayerModel;
  @Input() readonly: boolean = false;

  // constants
  readonly GRID_SIZE = GRID_SIZE;
  readonly topDropzones = Array(GRID_SIZE*GRID_SIZE).fill(null).map((t, i) => i);
  readonly bottomDropzones = Array(GRID_SIZE*START_AREA_ROWS).fill(null).map((t, i) => GRID_SIZE*GRID_SIZE + i);

  readonly readonlyGameServiceState: Readonly<GameServiceState>;
  letterSubscription: Subscription;
  lastSquare?: SquareModel;

  private readonly clickHander;
  private static squareIdCounter = 500;

  constructor(private gameService: GameService) {
    this.readonlyGameServiceState = gameService.state;
    this.clickHander = this.clickEventListener.bind(this);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.letterSubscription?.unsubscribe();
    document.removeEventListener('click', this.clickHander);
  }

  get boardState() {
    return this.playerModel.boardState;
  }

  ngAfterViewInit() {
    if (this.readonly) return;

    this.unloadQueue();
    this.letterSubscription = this.gameService.letter$.subject.subscribe(() => {
      this.unloadQueue();
    });

    interact('.draggable').draggable({
      listeners: {
        start: (event) => {
        },
        end: (event) => {
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
      square.dropzoneRef.setActive(true);
      square.dropIndex = -1;
    })
    .on('up', (event) => {
      const squareEl = event.target as HTMLElement;
      const square = this.boardState.getSquareFromEl(squareEl);
      square.dropzoneRef.setActive(false);
      square.dropIndex = square.dropzoneRef.id;
      const dropzoneEl = document.querySelector(`.dropzone[data-id='${square.dropzoneRef.id}']`) as HTMLElement;
      this.setCoordsBasedOnDropZone(square, dropzoneEl);
      this.gameService.updateAfterDrop();
    });

    interact('.dropzone.droppable').dropzone({
      // Require a % element overlap for a drop to be possible
      overlap: 0.25,

      ondragenter: (event) => {
        const squareEl = event.relatedTarget as HTMLElement;
        const square = this.boardState.getSquareFromEl(squareEl);
        square.dropzoneRef = this.boardState.getDropzone(event.target);
        event.target.classList.add('drop-target');
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

    document.addEventListener('click', this.clickHander);
  }

  private clickEventListener(event: Event) {
    const target = event.target as HTMLElement;
    if (!target?.classList.contains('draggable')) {
      this.updateLastSquare(null);
    }
  }

  claimSuccess() {
    this.gameService.claimSuccess();
  }

  dump() {
    if (!this.lastSquare) return;
    const sq = this.lastSquare;
    sq.dropzoneRef?.setActive(true);
    this.gameService.dump(sq);
    this.updateLastSquare(null);
    this.gameService.updateAfterDrop();
  }

  private unloadQueue() {
    while (this.gameService.letter$.getLength() > 0) {
      this.addSquare(this.gameService.letter$.pop());
    }
  }

  private addSquare(letter: Letter): void {
    window.requestAnimationFrame(() => {
      const count = this.boardState.squares.length;
      const sq = this.boardState.getSquareFromId(BoardComponent.squareIdCounter++);
      if (this.boardState.squares.length === count) {
        logger.warn(`could not add new square... apparently ${sq.id} already exists.`);
      }
      sq.letter = letter;

      const tryDropInDropzone = (i: number): boolean => {
        const dropzoneEl = document.querySelector(`.dropzone[data-id='${i}']`) as HTMLElement;
        const dropzone = this.boardState.getDropzone(dropzoneEl);
        if (dropzone.active) {
          this.setCoordsBasedOnDropZone(sq, dropzoneEl);
          dropzone.active = false;
          return true;
        }
        return false;
      }

      for (let i = 0; i < GRID_SIZE*START_AREA_ROWS; ++i) {
        if (tryDropInDropzone(GRID_SIZE*GRID_SIZE + i)) return;
      }

      for (let i = GRID_SIZE*GRID_SIZE-1; i >= 0; --i) {
        if (tryDropInDropzone(i)) return;
      }

      this.gameService.updateAfterDrop();
    })
  }

  private setCoordsBasedOnDropZone(square: SquareModel, dropzoneEl: HTMLElement) {
    const dropzoneRec = interact.getElementRect(dropzoneEl);
    const boardEl = document.getElementById('board');
    const boardRec = boardEl.getBoundingClientRect();
    this.setElementCoords(
      square,
      dropzoneRec.left-boardRec.left-window.scrollX,
      dropzoneRec.top-boardRec.top-window.scrollY);
    square.dropzoneRef = this.boardState.getDropzone(dropzoneEl);
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
}
