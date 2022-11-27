import { Letter } from "../shared/defs";

export class SquareModel {
  readonly id;
  x: number = 0;
  y: number = 0;
  letter: Letter = 'A';
  dropIndex: number = -1;
  lastClicked: boolean = false;
  invalid: boolean;

  constructor(id: number) {
    this.id = id;
    this.invalid = false;
  }
}