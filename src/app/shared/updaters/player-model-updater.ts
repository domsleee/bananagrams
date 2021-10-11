import { PlayerModel } from "src/app/models/player-model";
import { BoardUpdater } from "./board-updater";
import { ModelUpdaterHelper } from "./helpers";

export class PlayerModelUpdater {
  
  updatePlayer(player: PlayerModel, newPlayer: Partial<PlayerModel>) {
    const helper = new ModelUpdaterHelper(player);

    // do not update totalTiles or boardState, please.
    helper.updateByAssignment(newPlayer, 'isEliminated');
    helper.updateByAssignment(newPlayer, 'tilesUsed');
    helper.updateByAssignment(newPlayer, 'name');

    new BoardUpdater().updateBoard(player.boardState, newPlayer.boardState);
  }


}