# subject
![logo](https://avatars1.githubusercontent.com/u/31987273?v=4&s=100)

push items to a pulling iterable 

[![NPM version][npm-image]][npm-url]
[![Travis Status][travis-image]][travis-url]
[![Travis Status][codecov-image]][codecov-url]

## Usage

_package requires a system that supports async-iteration, either natively or via down-compiling_

### Install
```
npm install @async-generators/subject --save
yarn add @async-generators/subject
```

This package's `main` entry points to a `commonjs` distribution. 

Additionally, the `module` entry points to a `es2015` distribution, which can be used by build systems, such as webpack, to directly use es2015 modules. 

## Api

### subject()

<code>subject()</code> returns an iterable `Subject`, that provides three methods: `next(item)`, `error(err)`, and `done()` to push data and events to the subject. Items are buffered internally until `[Symbol.asyncIterator]` is called and items are pulled by the consuming iterator. If the consuming iterator pulls items slower than the speed they are pushed to the subject, then the internal buffer will continue to grow in size. `next()` returns the current internal buffer length, which can be used by the producer to apply back-pressure measures. `error(err)` will cause the iterator to rethrow the given error to the consumer. 

## Example

example.js
```js
const subject = require('@async-generators/subject').default;

async function delay(duration) {
  return new Promise(r => setTimeout(r, duration));
}

async function main() {
  let limit = 2;
  let buffer = subject();

  let source = function* () {
    for (let i = 0; i < 6; i++) {
      yield i;
    }
  }

  let producer = new Promise(async done => {
    let count = 0;
    for (let item of source()) {
      if (count >= 2) {
        console.log("back-pressure");
        await delay(200);
      }
      console.log("produced", item);
      count = buffer.next(item);
      console.log("count", count);
    }
    buffer.done();
    done();
  });

  for await (let item of buffer) {
    await delay(100);
    console.log("consumed", item);
  }

  await producer;
}

main();

```

Execute with the latest node.js: 

```
node --harmony-async-iteration example.js
```

output:
```
produced 0
count 1
produced 1
count 2
back-pressure
consumed 0
produced 2
count 1
produced 3
count 2
back-pressure
consumed 1
consumed 2
produced 4
count 1
produced 5
count 2
consumed 3
consumed 4
consumed 5
```
## Typescript

This library is fully typed and can be imported using: 

```ts
import subject from '@async-generators/subject');
```

It is also possible to directly execute your [properly configured](https://stackoverflow.com/a/43694282/1657476) typescript with [ts-node](https://www.npmjs.com/package/ts-node):

```
ts-node --harmony_async_iteration foo.ts
```

[npm-url]: https://npmjs.org/package/@async-generators/subject
[npm-image]: https://img.shields.io/npm/v/@async-generators/subject.svg
[npm-downloads]: https://img.shields.io/npm/dm/@async-generators/subject.svg
[travis-url]: https://travis-ci.org/async-generators/subject
[travis-image]: https://img.shields.io/travis/async-generators/subject/master.svg
[codecov-url]: https://codecov.io/gh/async-generators/subject
[codecov-image]: https://codecov.io/gh/async-generators/subject/branch/master/graph/badge.svg
