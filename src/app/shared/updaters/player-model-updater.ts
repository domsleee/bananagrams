import { PlayerModel } from "src/app/models/player-model";
import { BoardUpdater } from "./board-updater";
import { ModelUpdaterHelper } from "./helpers";

export const playerKeysToUpdate: Array<keyof PlayerModel> = [
  'isEliminated',
  'isSpectator',
  'tilesUsed',
  'nameEncoded',
  'disconnected'
];

export class PlayerModelUpdater {
  
  updatePlayer(player: PlayerModel, newPlayer: Partial<PlayerModel>, isNewPlayer = false) {
    const helper = new ModelUpdaterHelper(player);

    if ('nameEncoded' in newPlayer && player.nameEncoded !== newPlayer.nameEncoded) {
      player.name = decodeURI(newPlayer.nameEncoded);
    }

    // do not update totalTiles or boardState, please.
    for (let key of playerKeysToUpdate) {
      helper.updateByAssignment(newPlayer, key);
    }
    if (isNewPlayer) helper.updateByAssignment(newPlayer, 'totalTiles');

    new BoardUpdater().updateBoard(player.boardState, newPlayer.boardState);
  }


}