import { BoundedLogQueue } from './bounded-log-queue';

describe('BoundedLogQueue', () => {

  it('should be created', () => {
    const q = new BoundedLogQueue(5);
    q.push("a");
    q.push("b");
    q.push("c");
    q.push("d");
    q.push("e");
    q.push("f");

    expect(q.getOrderedArray()).toEqual(["b", "c", "d", "e", "f"]);
  });
});
