
export class BoundedLogQueue {
  private readonly data = new Array<string>();
  private startOfQueue = 0;

  constructor(private maxElements: number) {
  }

  push(value: string) {
    if (this.data.length < this.maxElements) {
      this.data.push(value);
      return;
    }

    this.data[this.startOfQueue] = value;
    this.startOfQueue = (this.startOfQueue + 1) % this.maxElements
  }

  getOrderedArray() {
    return [...this.data.slice(this.startOfQueue), ...this.data.slice(0, this.startOfQueue)];
  }
}