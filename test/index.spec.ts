import equal from '@async-generators/equal';
import subject from '../src';
import { expect } from 'chai';

describe("@async-generator/subject", () => {
  it("should buffer all items before iteration", async () => {
    let source = subject<number>();

    let expected = function*(){
      yield 1; yield 2; yield 3; yield 4;    
    }

    for(let item of expected()){
      source.next(item);
    }
    source.done();

    expect(await equal(source, expected())).to.be.true;
  })

  it("should wait until items are pushed", async () => {
    let source = subject<number>();

    let expected = function*(){
      yield 1; yield 2; yield 3; yield 4;    
    }

    let result = equal(source, expected())

    for(let item of expected()){
      source.next(item);
    }
    source.done();

    expect(await result).to.be.true;
  })

  it("should rethrow error", async () => {
    let source = subject<number>();
    let consumer = equal(source, []);
    let result;

    source.error(Error("pickle rick!"));

    try{
      await consumer
    }catch(err){    
      result = err;  
    }

    expect(result.message).to.be.eq("pickle rick!");
  })
})
