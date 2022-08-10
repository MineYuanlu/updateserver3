import type { FetchFunction } from '$def/FetchFunction.type';
import { getInfinitePageBlock, getPerPage, type InfinitePageBlock } from '$def/pageable';
import { makeUrl } from '$def/Tool';
import type { VersionInfo } from '$def/Version';

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
): Promise<InfinitePageBlock<VersionInfo> | null> => {
  const resp = await f(makeUrl('/api/v1/versions', type, name, { per_page, cursor }));
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  getPerPage(per_page);
  const data: VersionInfo[] | null = await resp.json();
  if (!data) return null;
  return getInfinitePageBlock(data, per_page, 'id');
};

export const getVersion = async (
  f: FetchFunction,
  type: string,
  name: string,
  id: number | string,
) => {
  const resp = await f(`/api/v1/versions/${type}/${name}/${id}`);
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  return await resp.json();
};
