import type { KeyOfType } from './Tool';

/** 默认的单页数量 */
export const defaultPerPage = 20;
/** 最大的单页数量 */
export const maxPerPage = 100;
/** 最小的单页数量 */
export const minPerPage = 1;

/**
 * 获取单页数量
 * @param val 用户定义参数
 * @returns 合法的单页数量
 */
export function getPerPage(val: string | null | number | undefined): number {
  if (typeof val === 'string') val = parseInt(val);
  if (!val) return defaultPerPage;
  return Math.max(Math.min(maxPerPage, val), minPerPage);
}

/**
 * 获取指针位置
 * @param val 用户输入的指针
 * @returns 合法的指针位置
 */
export function getCursor(val: string | null | number): number | null {
  return val ? Math.max(parseInt(val as string) || 0, 0) : null;
}

/**
 * 不指定页数的一页数据
 */
export type InfinitePageBlock<T> = {
  /**下次请求的指针 */
  cursor: number;
  /**是否到达尾部 */
  end: boolean;
  /** 数据块*/
  data: T[];
};
/**
 * 获取一页数据
 * @param data 数据
 * @param per_page 用户指定的一页数量
 * @param idKey 数据id键名称
 * @returns 不指定页数的一页数据
 */
export function getInfinitePageBlock<T>(
  data: T[],
  per_page: number | undefined | string | null,
  idKey: KeyOfType<T, number>,
): InfinitePageBlock<T> {
  return {
    cursor: data.length ? (data[data.length - 1][idKey] as any) : NaN,
    end: data.length < getPerPage(per_page),
    data,
  };
}
