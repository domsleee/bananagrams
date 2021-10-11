import { Letter } from "../shared/defs";
import { DropzoneModel } from "./dropzone-model";

export class SquareModel {
  readonly id;
  x: number = 0;
  y: number = 0;
  letter: Letter = 'A';
  dropzoneRef?: DropzoneModel = null;
  dropIndex: number = -1;
  lastClicked: boolean = false;

  constructor(id: number) {
    this.id = id;
  }
}