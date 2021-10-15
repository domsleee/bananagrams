import { DropzoneModel } from "../models/dropzone-model";
import { SquareModel } from "../models/square-model";
import { GRID_SIZE, START_AREA_ROWS } from "../shared/defs";

export class BoardState {
  _dropzones: DropzoneModel[] = null;
  squares: SquareModel[] = [];

  get dropzones() {
    if (!this._dropzones) {
      this._dropzones = Array(GRID_SIZE*(GRID_SIZE+START_AREA_ROWS))
        .fill(null)
        .map((t, i) => new DropzoneModel(i));
    }
    return this._dropzones;
  }

  set dropzones(value: any) {
    this._dropzones = value;
  }

  getDropzone(el: HTMLElement): DropzoneModel {
    const id = parseInt(el.getAttribute('data-id'));
    return this.getDropzoneFromId(id);
  }

  getDropzoneFromId(id: number): DropzoneModel {
    if (id === -1) return null;
    return this.dropzones[id];
  }

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