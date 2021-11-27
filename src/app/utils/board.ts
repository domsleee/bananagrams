import { SquareModel } from "../models/square-model";
import { getLogger } from "../services/logger";

const logger = getLogger('board');

export class BoardState {
  squares: SquareModel[] = [];

  createNewSquare(): SquareModel {
    let M = 0;
    for (const sq of this.squares) M = Math.max(M, sq.id);
    const id = M + 1;
    const newSq = new SquareModel(id);
    this.squares.push(newSq);
    return newSq;
  }

  getSquareFromId(id: number): SquareModel {
    const sq = this.squares.find(t => t.id === id);
    if (sq) return sq;

    logger.warn("New square created from getSquareFromId...");
    const newSq = new SquareModel(id);
    this.squares.push(newSq);
    return newSq;
  }

  getSquareFromEl(el: HTMLElement): SquareModel {
    return this.getSquareFromId(parseInt(el.getAttribute('data-id')));
  }
}