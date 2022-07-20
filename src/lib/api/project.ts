import type { FetchFunction } from '$lib/def/FetchFunction.type';
import type { Project, ProjectInfoList, ProjectOverviewList } from '$lib/def/Project';
import { makeUrl } from '$lib/def/Tool';
import type { UserInfoPublic } from '$lib/def/User';
import type { VersionInfo } from '$lib/def/Version';
/**
 * 获取项目列表
 * @param f fetch
 * @param type 获取类型
 * @param index 开始序号
 * @param amount 获取数量
 * @returns 项目列表
 */
export const getProjectList = async (
  f: FetchFunction,
  type: 'all' | 'me',
  index: number | undefined,
  amount?: number,
): Promise<ProjectInfoList> => {
  const res = await f(makeUrl(`/api/v1/project/list-${type}`, { amount, index }));
  if (res.ok) return await res.json();
  throw new Error(`${res.status} - ${await res.text()}`);
};
/**
 * 获取项目预览列表
 * @param f fetch
 * @returns 项目预览列表
 */
export const getProjectOverview = async (f: FetchFunction): Promise<ProjectOverviewList> => {
  const res = await f('/api/v1/project/list-overview');
  if (res.ok) return res.json();
  throw new Error(`${res.status} - ${await res.text()}`);
};

/**
 * 获取项目信息
 * @param f fetch
 * @param type 项目类型
 * @param name 项目名称
 * @returns 项目
 */
export const getProjectInfo = async (
  f: FetchFunction,
  type: string,
  name: string,
): Promise<Project<UserInfoPublic, VersionInfo> | null> => {
  const res = await f(`/api/v1/project/info/${type}/${name}`);
  if (res.ok) return await res.json();
  return null;
};
