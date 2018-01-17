import { Subject } from "./src/index";

let subject = new Subject<number>();

async function* source(){
  yield 1; yield 2; yield 3; yield 4;
}

async function main() {
  let reader = async function () {
    for await (let item of subject) {
      console.log("PULL:", item);
    }
  };

  let readers = [reader(), reader()];
  
  let writer = async function () {
    for await (let item of source()){
      console.log("PUSH:", item);
      subject.next(item);
    }
    subject.done();
  }

  await writer();
  await Promise.all(readers);
}

main().catch(console.log);