import equal from '@async-generators/equal';
import { expect } from 'chai';
import { Subject } from '../src/subject';

describe("Subject", () => {
  it("should return same sequence to all iterators", async () => {
    let source = new Subject<number>();

    let expected = function* () {
      yield 1; yield 2; yield 3; yield 4;
    }

    let equalTask1 = equal(source, expected());
    let equalTask2 = equal(source, expected());

    for (let item of expected()) {
      source.next(item);
    }

    source.done();

    expect(await equalTask1).to.be.true;
    expect(await equalTask2).to.be.true;
  })
})
