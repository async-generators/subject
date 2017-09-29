import { EventEmitter } from 'events';
import terminator from '@async-generators/terminator';

const $terminated = Symbol.for("terminated");

export interface Subject<T> extends AsyncIterable<T> {
  readonly isDisposed: boolean;

  next(item: T): number;
  error(err: any): void;
  done(): void;

  on(event: "disposed", cb: () => void);
  on(event: "pull", cb: (remaining: number) => void);
}

function _Subject<T>() {
  let _signal = new EventEmitter();
  let _buffer: T[] = [];
  let _done: boolean = false;
  let _error: any;

  function dispose() {
    _done = true;
    _signal.emit("disposed");
  }

  async function* iterator() {
    while (true) {
      if (_error) {
        dispose();
        throw _error;
      }
      if (_buffer.length === 0) {
        if (_done) {
          dispose();
          return;
        };
        await new Promise((r) => {
          _signal.once("push", r);
        });
      } else {
        if ((yield _buffer.shift()) === $terminated) {
          dispose();
          return;
        }
        _signal.emit("pull", _buffer.length);
      }
    }
  }

  return {
    get isDisposed() { return _done; },
    next: function (item: T) {
      if (_done) return -1;
      _buffer.push(item);
      _signal.emit("push");
      return _buffer.length;
    },
    error: function (err: any) {
      if (_done) return;
      _error = err;
      _signal.emit("push");
    },
    done: function () {
      if (_done) return;
      _done = true;
      _signal.emit("push");
    },
    [Symbol.asyncIterator]: function () {
      return terminator(iterator())[Symbol.asyncIterator]()
    },
    on(event: "disposed" | "pull", cb: (...args) => void) {
      _signal.on(event, cb);
    }
  }
}

export default function <T>(
): Subject<T> {
  return _Subject<T>();
}