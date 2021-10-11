import { SquareModel } from "src/app/models/square-model";
import { BoardState } from "src/app/utils/board";
import { ModelUpdaterHelper } from "./helpers";

export class BoardUpdater {
  updateBoard(boardState: BoardState, newBoardState: Partial<BoardState>) {
    const inv = this.getInvSquares(boardState);
    const newInv = this.getInvSquares(newBoardState);

    for (let sq of boardState.squares) {
      if (!(sq.id in newInv)) continue;
      const newSq = newInv[sq.id];

      const helper = new ModelUpdaterHelper<SquareModel>(sq);
      helper.updateByAssignment(newSq, 'dropIndex');
      helper.updateByAssignment(newSq, 'lastClicked');
      helper.updateByAssignment(newSq, 'letter');
      helper.updateByAssignment(newSq, 'x');
      helper.updateByAssignment(newSq, 'y');
    }

    for (let sq of newBoardState.squares) {
      if (!(sq.id in inv)) {
        boardState.squares.push(sq); // this cannot conflict, since it is read-only
      }
    }
  }

  private getInvSquares(state: Partial<BoardState>): {[key: string]: Partial<SquareModel>} {
    const res = {};
    for (let sq of state.squares) {
      res[sq.id] = sq;
    }
    return res;
  }
}