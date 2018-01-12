import subject from '../src';
import equal from '@async-generators/equal';
import { expect } from 'chai';

describe("@async-generator/subject", () => {
  it("should buffer all items before iteration", async () => {
    let source = subject<number>();

    let expected = function* () {
      yield 1; yield 2; yield 3; yield 4;
    }

    for (let item of expected()) {
      source.next(item);
    }
    source.done();

    expect(await equal(source, expected())).to.be.true;
  })

  it("should throw error when using on after disposed", async () => {
    let source = subject<number>();

    let expected = function* () {
      yield 1; yield 2; yield 3; yield 4;
    }

    for (let item of expected()) {
      source.next(item);
    }
    source.done();

    for await (let item of source) { }

    let error;

    expect(source.isDisposed).to.be.true;
    
    try {
      source.on("pull", () => { });
    } catch (err) { error = err; }

    expect(error.message).to.be.eq("Subject already disposed");
  })

  it("should wait until items are pushed", async () => {
    let source = subject<number>();

    let expected = function* () {
      yield 1; yield 2; yield 3; yield 4;
    }

    let result = equal(source, expected())

    await new Promise(async done => {
      for (let item of expected()) {
        source.next(item);
        await new Promise(r => setImmediate(r));
      }
      source.done();
      done();
    });

    expect(await result).to.be.true;
  })

  it("should dispose if consumer stops iteration", async () => {
    let source = subject<number>();

    source.next(1);
    source.next(2);
    source.next(3);
    source.done();

    await new Promise(async r => {
      source.on("disposed", r);

      for await (let item of source) {
        break;
      }
    });
  })

  it("should raise pull event when consumer iterates", async () => {
    let source = subject<number>();

    source.next(1);
    source.next(2);
    source.next(3);
    source.done();

    let countPromise = new Promise(async r => {
      source.on("pull", r);
    });

    let consumer = new Promise(r => source.on("pull", r));

    for await (let item of source) { }

    let count = await countPromise;

    expect(count).to.be.eq(2);
  })

  it("should rethrow error", async () => {
    let source = subject<number>();
    let consumer = equal(source, []);
    let result;

    source.error(Error("pickle rick!"));

    try {
      await consumer
    } catch (err) {
      result = err;
    }

    expect(result.message).to.be.eq("pickle rick!");
  })
})
