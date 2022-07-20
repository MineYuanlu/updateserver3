import type { FetchFunction } from '$lib/def/FetchFunction.type';

/**
 * 获取全部的信息
 * @param f fetch
 * @returns 全部信息
 */
export const getAllInfo = async (f: FetchFunction): Promise<any> => {
  const res = await f('/api/v1/info/all');
  return await res.json();
};

/**
 * 获取项目相关信息(全部信息的缩减版)
 * @param f fetch
 * @returns 项目相关信息
 */
export const getProjInfo = async (f: FetchFunction): Promise<any> => {
  const res = await f('/api/v1/info/proj');
  return await res.json();
};

/**
 * 获取项目类型
 * @param f fetch
 * @returns 项目类型
 */
export const getProjTypes = async (f: FetchFunction): Promise<any> => {
  const res = await f('/api/v1/info/project-types');
  return await res.json();
};
