import type { FetchFunction } from '$def/FetchFunction.type';
import { getInfinitePageBlock, getPerPage, type InfinitePageBlock } from '$def/pageable';
import { makeUrl } from '$def/Tool';
import type { VersionDetail } from '$def/Version';
import type { versions } from '@prisma/client';
import type { useVersion as useVersion_db } from '$db/Prisma';

/**
 * 列出版本
 * @param f fetch
 * @param type 项目类型
 * @param name 项目名称
 * @param cursor 上一次最后的ID
 * @param per_page 一页显示数量
 * @returns
 */
export const listVersion = async (
  f: FetchFunction,
  type: string,
  name: string,
  cursor: number | undefined,
  per_page?: number,
): Promise<InfinitePageBlock<VersionDetail> | null> => {
  const resp = await f(makeUrl('/api/v1/versions', type, name, { per_page, cursor }));
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  getPerPage(per_page);
  const data: VersionDetail[] | null = await resp.json();
  if (!data) return null;
  return getInfinitePageBlock(data, per_page, 'id');
};

/**
 * 获取版本详细信息
 * @param f fetch
 * @param type 项目类型
 * @param name 项目名称
 * @param id 版本ID
 * @returns 版本信息
 */
export const getVersion = async (
  f: FetchFunction,
  type: string,
  name: string,
  id: number | string,
): Promise<versions> => {
  const resp = await f(`/api/v1/versions/${type}/${name}/${id}`);
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  return await resp.json();
};

/**
 * 使用一个版本
 *
 * 使项目使用某一个版本作为当前版本
 * @param f fetch
 * @param type 项目类型
 * @param name 项目名称
 * @param id 版本ID
 * @returns 使用结果
 */
export const useVersion = async (
  f: FetchFunction,
  type: string,
  name: string,
  id: number | string,
): ReturnType<typeof useVersion_db> => {
  const resp = await f(`/api/v1/versions/${type}/${name}/use/${id}`);
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  return await resp.json();
};
