import { EventEmitter } from 'events';

export interface Subject<T> extends AsyncIterable<T> {
  next(item: T): number;
  error(err: any): void;
  done(): void;
}

export default function <T>(
): Subject<T> {
  let _signal = new EventEmitter();
  let _buffer: T[] = [];
  let _done: boolean = false;
  let _error: any;

  return {
    next: function (item: T) {
      _buffer.push(item);
      _signal.emit("tick");
      return _buffer.length;
    },
    error: function (err: any) {
      _error = err;
      _signal.emit("tick");
    },
    done: function () {
      _done = true;
      _signal.emit("tick");
    },
    [Symbol.asyncIterator]: async function* () {
      while (true) {
        if (_error) {
          throw _error;
        }
        if (_buffer.length === 0) {
          if (_done) return;
          await new Promise((r) => {
            _signal.once("tick", r);
          });
        } else {
          yield _buffer.shift();
        }
      }
    }
  }
}