import { Injectable } from '@angular/core';
import { Letter } from '../shared/defs';

@Injectable({
  providedIn: 'root'
})
export class InitialTilesProviderService {
  numTilesPerPlayerOverride?: number = null;
  initialTilesOverride?: Letter[] = null;

  constructor() { }

  // taken from https://bananagrams.com/blogs/news/how-to-play-bananagrams-instructions-for-getting-started
  getInitialTiles(): Letter[] {
    if (this.initialTilesOverride) return this.initialTilesOverride;
    let result = new Array<Letter>();
    for (let [key, value] of letterMap.entries()) {
      for (let i = 0; i < value; ++i) result.push(key);
    }
    return result;
  }

  getNumTilesPerPlayer(numPlayers: number): number {
    if (this.numTilesPerPlayerOverride) return this.numTilesPerPlayerOverride;
    if (1 <= numPlayers && numPlayers <= 4) return 21;
    if (5 <= numPlayers && numPlayers <= 6) return 15;
    if (7 <= numPlayers && numPlayers <= 8) return 11;
    throw new Error(`unknown for #players ${numPlayers}`);
  }
}

const letterMap = new Map<Letter, number>([
  ['A', 13],
  ['B', 3],
  ['C', 3],
  ['D', 6],
  ['E', 18],
  ['F', 3],
  ['G', 4],
  ['H', 3],
  ['I', 12],
  ['J', 2],
  ['K', 2],
  ['L', 5],
  ['M', 3],
  ['N', 8],
  ['O', 11],
  ['P', 3],
  ['Q', 2],
  ['R', 9],
  ['S', 6],
  ['T', 9],
  ['U', 6],
  ['V', 3],
  ['W', 3],
  ['X', 2],
  ['Y', 3],
  ['Z', 2]
]);
