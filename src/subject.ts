import createCoupler, { Coupler } from './coupler';

export interface ISubject<T> extends AsyncIterable<T> {
  /** 
   * push an item into the subject to yield to iterators
   * @param {T} item the item to buffer and yield to the consumer.
   */
  next(item: T): void;
  /** 
   * rethrow an error to the consumer iterators
   * @param err the error object to rethrow
   */
  error(err: any): void;
  /** 
   * signal the pushed sequence is complete
   * disposes of the subject and cannot be used again
   */
  done(): void;
}

/**
 * Subject (Sync)
 * 
 * items are pushed into a buffers to allow iterators to pull them. 
 */
export class Subject<T> implements ISubject<T>
{
  private _subs: Coupler<T>[] = [];

  next(item: T): void {
    for (let sub of this._subs) {
      sub.next(item);
    }
  }
  error(err: any): void {
    for (let sub of this._subs) {
      sub.error(err);
    }
    this._subs = [];
  }
  done(): void {
    for (let sub of this._subs) {
      sub.done();
    }
    this._subs = [];
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this._addSubscription()[Symbol.asyncIterator]();
  }

  private _addSubscription() {
    let coupler = createCoupler<T>();
    coupler.on("disposed", () => {
      this._subs.splice(this._subs.indexOf(coupler), 1);
    });
    this._subs.push(coupler);
    return coupler;
  }
}