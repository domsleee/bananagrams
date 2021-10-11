export class DropzoneModel {
  readonly id;
  active = true;

  constructor(id: number) {
    this.id = id;
  }

  setActive(active: boolean) {
    this.active = active;
  }
}
