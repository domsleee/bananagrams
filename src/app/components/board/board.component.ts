import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import interact from 'interactjs';
import { SquareModel } from 'src/app/models/square-model';
import { GRID_SIZE, Letter, START_AREA_ROWS, TILE_SIZE } from 'src/app/shared/defs';
import { GameService, GameServiceState } from 'src/app/services/game.service';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player-model';

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

  private squareIdCounter = 500;

  constructor(private gameService: GameService) {
    this.readonlyGameServiceState = gameService.state;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.letterSubscription?.unsubscribe();
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
          const squareEl = event.target as HTMLElement;
          const square = this.boardState.getSquareFromEl(squareEl);
          square.dropzoneRef?.setActive(true);
          this.updateLastSquare(square);
          square.dropIndex = -1;
        },
        end: (event) => {
          const square = this.boardState.getSquareFromEl(event.target);
          square.dropzoneRef?.setActive(false);
          this.gameService.updateAfterDrop();
          square.dropIndex = -1;
          if (event.relatedTarget) {
            square.dropIndex = this.boardState.getDropzone(event.relatedTarget).id;
          }
        },
        move: (event) => {
          const square = this.boardState.getSquareFromEl(event.target);
          const x = square.x + event.dx;
          const y = square.y + event.dy;

          const boardEl = document.getElementById('board');
          const boardRec = boardEl.getBoundingClientRect();
          const calcX = event.pageX - boardRec.left - (TILE_SIZE/2);
          const calcY = event.pageY - boardRec.top - (TILE_SIZE/2);

          //console.log(event.target.style);
          //console.log('square,event', square.x, calcX, event.target.style.width, 'a', event);

          this.setElementCoords(square, calcX, calcY);
        }
      },
      modifiers: [
        interact.modifiers.restrict({
          restriction: 'parent',
          endOnly: true
        })
      ]
    })
    .on('down', (event) => {
      const squareEl = event.target as HTMLElement;
      this.updateLastSquare(this.boardState.getSquareFromEl(squareEl));
    });

    interact('.dropzone.droppable').dropzone({
      // Require a % element overlap for a drop to be possible
      overlap: 0.25,

      ondragenter: (event) => {
        event.target.classList.add('drop-target')
      },
      ondragleave: function (event) {
        event.target.classList.remove('drop-target');
      },
      ondropdeactivate: function (event) {
        event.target.classList.remove('drop-target');
      },
      ondrop: (event: DragEvent) => {
        const draggableElement = event.relatedTarget as HTMLElement;
        const dropzoneElement = event.target as HTMLElement;

        const square = this.boardState.getSquareFromEl(draggableElement);
        this.setCoordsBasedOnDropZone(square, dropzoneElement);
      }
    })

    document.getElementById('board').addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target?.classList.contains('draggable')) {
        this.updateLastSquare(null);
      }
    })
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
      const sq = this.boardState.getSquareFromId(this.squareIdCounter++);
      sq.letter = letter;

      for (let i = 0; i < GRID_SIZE*START_AREA_ROWS; ++i) {
        const dropzoneEl = document.querySelector(`#startArea .dropzone[data-id='${GRID_SIZE*GRID_SIZE + i}']`) as HTMLElement;
        const dropzone = this.boardState.getDropzone(dropzoneEl);
        if (dropzone.active) {
          this.setCoordsBasedOnDropZone(sq, dropzoneEl);
          dropzone.active = false;
          break;
        }
      }
    })
  }

  private setCoordsBasedOnDropZone(square: SquareModel, dropzoneEl: HTMLElement) {
    const dropzoneRec = interact.getElementRect(dropzoneEl);
    const boardEl = document.getElementById('board');
    const boardRec = boardEl.getBoundingClientRect();
    this.setElementCoords(
      square,
      dropzoneRec.left-boardRec.left,
      dropzoneRec.top-boardRec.top);
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
