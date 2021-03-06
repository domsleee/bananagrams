import { SquareModel } from "src/app/models/square-model";
import { BoardState } from "src/app/utils/board";
import { ModelUpdaterHelper } from "./helpers";

export class BoardUpdater {
  updateBoard(boardState: BoardState, newBoardState: Partial<BoardState>) {
    const inv = this.getInvSquares(boardState.squares);
    const newInv = this.getInvSquares(newBoardState.squares);
    const idsToRemove = [];

    for (let sq of boardState.squares) {
      if (!(sq.id in newInv)) {
        idsToRemove.push(sq.id);
        continue;
      };
      const newSq = newInv[sq.id];

      const helper = new ModelUpdaterHelper<SquareModel>(sq);
      helper.updateByAssignment(newSq, 'dropIndex');
      helper.updateByAssignment(newSq, 'lastClicked');
      helper.updateByAssignment(newSq, 'letter');
      helper.updateByAssignment(newSq, 'x');
      helper.updateByAssignment(newSq, 'y');
      helper.updateByAssignment(newSq, 'invalid');
    }

    for (let sq of newBoardState.squares) {
      if (!(sq.id in inv)) {
        boardState.squares.push(sq); // this cannot conflict, since it is read-only
      }
    }

    boardState.squares = boardState.squares.filter(t => !idsToRemove.includes(t.id));
  }

  getInvSquares(squares: Array<SquareModel>): {[key: string]: Partial<SquareModel>} {
    const res = {};
    for (let sq of squares) {
      res[sq.id] = sq;
    }
    return res;
  }
}