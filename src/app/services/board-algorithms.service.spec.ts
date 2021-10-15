import { TestBed } from '@angular/core/testing';
import { GRID_SIZE, Letter } from '../shared/defs';
import { BoardState } from '../utils/board';

import { BoardAlgorithmsService } from './board-algorithms.service';

describe('BoardAlgorithmsService', () => {
  let service: BoardAlgorithmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardAlgorithmsService);
  });

  function setupBoard(arr: Array<string>): BoardState {
    const boardState = new BoardState();
    let sqId = 0;
    for (let r = 0; r < arr.length; ++r) {
      const row = arr[r];
      for (let c = 0; c < row.length; ++c) {
        if (row[c] === '.') continue;
        const sq = boardState.getSquareFromId(sqId++);
        sq.letter = row[c] as Letter;
        sq.dropIndex = r * GRID_SIZE + c;
      }
    }
    return boardState;
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('num components', () => {
    const state = setupBoard([
      'ABC....I',
      'DEF....G'
    ]);
    expect(service.getNumComponents(state.squares)).toBe(2);
  })
});
