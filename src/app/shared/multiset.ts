export class Multiset<T> {
  private d  = new Map<T, number>();
  private _size = 0;

  get size() {
    return this._size;
  }

  add(value: T) {
    if (this.d.has(value)) {
      this.d.set(value, this.d.get(value) + 1);
      this._size++;
    } else {
      this.d.set(value, 1);
      this._size++;
    }
  }

  delete(value: T) {
    if (this.d.has(value)) {
      this.d.set(value, this.d.get(value) - 1);
      this._size--;
    }
  }

  get(value: T) {
    return this.d.get(value);
  }

  [Symbol.iterator]() {
    let counter = 0;
    let arr = [];
    for (let [key, value] of this.d.entries()) {
      for (let i = 0; i < value; ++i) arr.push(key);
    }

    return {
      next: () => {
        return {
          done: counter === arr.length,
          value: arr[counter++] 
        }
      }
    }
  }
}

