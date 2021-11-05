import { SquareModel } from "../models/square-model";

export class BoardState {
  squares: SquareModel[] = [];

  getSquareFromId(id: number): SquareModel {
    const sq = this.squares.find(t => t.id === id);
    if (sq) return sq;
    const newSq = new SquareModel(id);
    this.squares.push(newSq);
    return newSq;
  }

  getSquareFromEl(el: HTMLElement): SquareModel {
    return this.getSquareFromId(parseInt(el.getAttribute('data-id')));
  }
}