import { Injectable } from '@angular/core';
import { SquareModel } from '../models/square-model';
import { GRID_SIZE } from '../shared/defs';

export const directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const;
export type Direction = (typeof directions)[number];

@Injectable({
  providedIn: 'root'
})
export class BoardAlgorithmsService {

  constructor() { }

  isOneComponent(squares: Array<SquareModel>) {
    return this.getNumComponents(squares) === 1;
  }

  getNumComponents(squares: Array<SquareModel>) {
    const ids = squares.map(t => t.dropIndex);
    const idSet = new Set(ids);
    const stack = [];

    const comp: {[key: string]: number} = {};
    const seen: {[key: string]: number} = {};

    for (const id of ids) stack.push(id);
    let nComp = 0;

    while (stack.length) {
      const id = stack.pop();
      if (id in seen) continue;
      seen[id] = 1;
      if (!(id in comp)) {
        comp[id] = nComp++;
      }

      for (const adj of this.getAdjacentSquares(id)) {
        if (idSet.has(adj)) {
          comp[adj] = comp[id];
          if (!seen[adj]) stack.push(adj);
        }
      }
    }
    return nComp;
  }

  *getAdjacentSquares(id: number): Iterable<number> {
    const c = id % GRID_SIZE;
    yield id - GRID_SIZE;
    yield id + GRID_SIZE;
    if (c > 0) yield id - 1;
    if (c < GRID_SIZE-1) yield id + 1;
  }

  getMovedSquareIds(squares: Array<SquareModel>, direction: Direction): number[] {
    const isHorizontal = direction === 'ArrowLeft' || direction === 'ArrowRight';
    const deltas: {[key in Direction]: number} = {
      'ArrowLeft': -1,
      'ArrowRight': 1,
      'ArrowDown': GRID_SIZE,
      'ArrowUp': -GRID_SIZE
    };
    const delta = deltas[direction];

    const ids = [];
    for (let square of squares) {
      if (isHorizontal) {
        const c = square.dropIndex % GRID_SIZE;
        const newC = c + delta;
        const newIndex = 0 <= newC && newC < GRID_SIZE
          ? square.dropIndex + delta
          : square.dropIndex;
        ids.push(newIndex);
      } else {
        let newIndex = square.dropIndex + delta;
        if (newIndex < 0 || newIndex >= GRID_SIZE * GRID_SIZE) {
          newIndex = square.dropIndex;
        }
        ids.push(newIndex);
      }
    }

    return ids;
  }

  sortTwoArrays<T, U>(a1: Array<T>, a2: Array<U>, cmp: (a: T, b: T) => number): [Array<T>, Array<U>]
  {
    if (a1.length !== a2.length)
      throw new Error(`expected same length ${a1.length}, ${a2.length}`);
    const a1Indexes = Array(a1.length).fill(null).map((_, i) => i);

    a1Indexes.sort((v1, v2) => cmp(a1[v1], a1[v2]));
    return [
      a1Indexes.map(t => a1[t]),
      a1Indexes.map(t => a2[t])
    ]
  }
}
