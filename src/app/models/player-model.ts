import { BoardState } from "../utils/board";

export class PlayerModel {
  readonly id: string;

  name: string;
  tilesUsed: number = 0;
  totalTiles: number = 0;
  boardState: BoardState = new BoardState();
  isEliminated = false;
  isSpectator = false;
  disconnected = false;

  constructor(id: string) {
    this.id = id;
  }
}