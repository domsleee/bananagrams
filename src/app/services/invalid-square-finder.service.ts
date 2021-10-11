import { invalid } from '@angular/compiler/src/render3/view/util';
import { Injectable } from '@angular/core';
import { SquareModel } from '../models/square-model';
import { GRID_SIZE } from '../shared/defs';

@Injectable({
  providedIn: 'root'
})
export class InvalidSquareFinderService {

  constructor() { }

  getInvalidSquares(squares: Readonly<Array<SquareModel>>): Array<Readonly<SquareModel>> {
    const g: Array<Array<Readonly<SquareModel>>> = [];
    for (let i = 0; i < GRID_SIZE; ++i) g.push(Array(GRID_SIZE).fill(null));

    for (const sq of squares) {
      const r = Math.floor(sq.dropIndex / GRID_SIZE);
      const c = sq.dropIndex % GRID_SIZE;
      g[r][c] = sq;
    }

    const horizontalAcc = new Accumulator();
    const verticalAcc = new Accumulator();

    for (let r = 0; r < GRID_SIZE; ++r) {
      for (let c = 0; c < GRID_SIZE; ++c) {
        horizontalAcc.next(g[r][c]);
        verticalAcc.next(g[c][r]);
      }
      horizontalAcc.clear();
      verticalAcc.clear();
    }

    const allWords = horizontalAcc.squares.concat(verticalAcc.squares);
    const invalidWords = allWords.filter(word => this.isInvalidWord(word));

    const idSeen = new Set<number>();
    const result: Array<Readonly<SquareModel>> = [];
    for (let word of invalidWords) {
      for (let sq of word) {
        if (sq.id in idSeen) continue;
        idSeen.add(sq.id);
        result.push(sq);
      }
    }
    return result;
  }

  private isInvalidWord(word: Array<Readonly<SquareModel>>) {
    return false;
  }
}

class Accumulator {
  squares: Array<Array<Readonly<SquareModel>>> = [];
  private currentArr: Array<Readonly<SquareModel>> = [];

  next(sq: SquareModel) {
    if (sq) {
      this.currentArr.push(sq);
    } else {
      this.clear();
    }
  }

  clear() {
    if (this.currentArr.length) {
      this.squares.push(this.currentArr);
    }
  }
}
