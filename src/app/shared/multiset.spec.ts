import { Multiset } from "./multiset";


describe('Multiset', () => {
  it('basic test', () => {
    const multiset = new Multiset<number>();
    assertEqualArray(multiset, []);
    multiset.add(5);
    assertEqualArray(multiset, [5]);
    multiset.add(5);
    multiset.add(5);
    assertEqualArray(multiset, [5,5,5]);
    multiset.delete(5);
    assertEqualArray(multiset, [5,5]);
    multiset.add(1);
    multiset.add(1);
    assertEqualArray(multiset, [1,1,5,5]);
  });

  function assertEqualArray(multiset: Multiset<number>, arr: Array<number>) {
    const multisetArray = Array.from(multiset).sort();
    expect(multiset.size).toEqual(arr.length, 'size is correct');
    expect(multisetArray).toEqual(arr, 'array is correct');
  }
});
