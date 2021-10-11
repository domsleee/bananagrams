
export class ModelUpdaterHelper<T> {
  constructor(private v: T){}

  updateByAssignment(b: Partial<T>, key: keyof T) {
    if (key in b) this.v[key] = b[key];
  }
}
