if(Symbol["asyncIterator"] === undefined) ((<any>Symbol)["asyncIterator"]) = Symbol.for("asyncIterator");

import { EventEmitter } from 'events';
import terminator from '@async-generators/terminator';

const $terminated = Symbol.for("terminated");

export interface Subject<T> extends AsyncIterable<T> {
  /** 
   * whether the subject has been disposed. 
   */
  readonly isDisposed: boolean;

  /** 
   * push an item into the subject to yield
   * @param {T} item the item to buffer and yield to the consumer.
   * @returns {number} the number of items stored in the internal buffer 
   */
  next(item: T): number;
  /** 
   * immediately rethrow an error to the consumer
   * @param err the error object to rethrow
   */
  error(err: any): void;
  /** 
   * signal the the pushed sequence is complete
   */
  done(): void;

  /**
   * raised when the Subject has been disposed
   */
  on(event: "disposed", cb: () => void);

  /**
   * raised when the Subject has yielded an item. 
   * @param {number} cb.remaining remaining items in the internal buffer
   */
  on(event: "pull", cb: (remaining: number) => void);
}

function _Subject<T>() {
  let _signal = new EventEmitter();
  let _buffer: T[] = [];
  let _done: boolean = false;
  let _error: any;
  let _disposed = false;

  function dispose() {
    _disposed = true;
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
    get isDisposed() { return _disposed; },
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
      if(_disposed) throw Error("Subject already disposed");
      _signal.on(event, cb);
    }
  }
}

export default function <T>(
): Subject<T> {
  return _Subject<T>();
}