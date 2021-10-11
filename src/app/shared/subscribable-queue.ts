import { Subject } from "rxjs";

export class SubscribableQueue<T> {
  subject = new Subject<void>();
  private q: Array<T> = [];

  add(el: T) {
    this.q.push(el);
    this.subject.next();
  }

  getLength() {
    return this.q.length;
  }

  pop(): T {
    return this.q.shift();
  }
}
