import { browser } from '$app/env';
import type { MaybePromise } from '@sveltejs/kit/types/private';
import { readable, type Readable } from 'svelte/store';
import type { InfinitePageBlock } from './pageable';

export type Getter<T> = (cursor: number | undefined) => MaybePromise<InfinitePageBlock<T> | null>;
export type Update = () => MaybePromise<unknown>;

class VarBox<T> {
  public readable: Readable<T>;
  private setter?: (data: T) => void;
  public real: T;
  public readonly set = (data: T) => {
    this.real = data;
    if (this.setter) this.setter(data);
  };
  public constructor(value: T) {
    this.readable = readable((this.real = value), (set) => {
      this.setter = set;
      set(this.real);
    });
  }
}

export class InfiniteListImpl<T> {
  private getter: Getter<T>;
  private updates: Update[];
  private end = new VarBox(false);
  private cursor = new VarBox<number | undefined>(undefined);
  private modCount: number = 0;
  private loading = new VarBox(false);
  private list = new VarBox(<T[]>[]);
  public readonly reset = () => {
    this.end.set(false);
    this.cursor.set(undefined);
    this.modCount++;
    this.loading.set(false);
    this.list.set([]);
  };
  public readonly isEnd = () => this.end.readable;
  public readonly getCursor = () => this.cursor.readable;
  public readonly isLoading = () => this.loading.readable;
  public readonly getList = () => this.list.readable;
  public readonly addUpdate = (func: Update) => this.updates.push(func);

  public readonly load = async (): Promise<T[]> => {
    if (!browser || this.end.real || this.loading.real) return this.list.real;
    this.loading.set(true);
    const mc = ++this.modCount;
    try {
      const block = await this.getter(this.cursor.real);
      if (!block || mc !== this.modCount) return this.list.real; //无响应/已更新
      this.list.set(this.list.real.concat(block.data));
      this.end.set(isNaN(block.cursor) || block.end);
      this.cursor.set(block.cursor);
      for (const key in this.updates) await this.updates[key]();
    } catch (err) {
      console.log(err);
      this.end.set(true);
    } finally {
      this.loading.set(false);
    }
    return this.list.real;
  };

  /**
   * @param getter 获取
   * @param update 更新调用
   */
  public constructor(getter: Getter<T>, update?: Update) {
    this.getter = getter;
    this.updates = update ? [update] : [];
  }
}
