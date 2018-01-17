# subject
![logo](https://avatars1.githubusercontent.com/u/31987273?v=4&s=110)

push items to pulling iterators

[![NPM version][npm-image]][npm-url]
[![Travis Status][travis-image]][travis-url]
[![Travis Status][codecov-image]][codecov-url]

### Install
```
npm install @async-generators/subject --save
yarn add @async-generators/subject
```

This package's `main` entry points to a `commonjs` dist. 
The `module` entry points to a `es2015` module dist. Both require native async-generator support, or be down-compiled with a webpack loader. 

## Api

### Soupler()

<code>Subject</code> that provides three methods: `next(item)`, `error(err)`, and `done()` to push data and events. When `[Symbol.asyncIterator]` is called an internal subscription is created. items are buffered (per iterator) until they are pulled by the consuming iterator. If the consuming iterator pulls items slower than the speed they are pushed to the subject, then the internal buffer will continue to grow in size. `error(err)` will cause the iterator to rethrow the given error to the consumer and dispose of the subject.

## Example

example.js
```js
const {Subject} = require('@async-generators/subject');

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
```

Execute with the latest node.js 9: 

```
node --harmony example.js
```

output:
```
PUSH: 1
PUSH: 2
PULL: 1
PULL: 1
PUSH: 3
PULL: 2
PULL: 2
PUSH: 4
PULL: 3
PULL: 3
PULL: 4
PULL: 4
```
## Typescript

This library is fully typed and can be imported using: 

```ts
import {Subject} from '@async-generators/subject');
```

It is also possible to directly execute your [properly configured](https://stackoverflow.com/a/43694282/1657476) typescript with [ts-node](https://www.npmjs.com/package/ts-node):

```
ts-node --harmony foo.ts
```

[npm-url]: https://npmjs.org/package/@async-generators/subject
[npm-image]: https://img.shields.io/npm/v/@async-generators/subject.svg
[npm-downloads]: https://img.shields.io/npm/dm/@async-generators/subject.svg
[travis-url]: https://travis-ci.org/async-generators/subject
[travis-image]: https://img.shields.io/travis/async-generators/subject/master.svg
[codecov-url]: https://codecov.io/gh/async-generators/subject
[codecov-image]: https://codecov.io/gh/async-generators/subject/branch/master/graph/badge.svg
