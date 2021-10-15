import { Injectable } from '@angular/core';
import { SquareModel } from '../models/square-model';
import { GRID_SIZE } from '../shared/defs';

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
}
