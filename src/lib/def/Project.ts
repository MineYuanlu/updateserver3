import type { UserInfoPublic } from './User';
import type { Version, VersionExtra, VersionInfo } from './Version';

/**
 * 项目名字/项目类型限定, 大小写字母开头, 可以包含大小写字母，数字，下划线和减号, 长度1~16
 *
 * 正则表达式:
 * ```js
 * /^[a-zA-Z][a-zA-Z0-9_\-]{0,15}$/
 * ```
 *
 */
export const nameLimit = /^[a-zA-Z][a-zA-Z0-9_-]{0,15}$/;
/**
 * 检测项目的名称是否合法
 * @param type 类型
 * @param name 名称
 * @return 是否合法
 */
export function checkProjectTypeName(type: string, name: string): boolean {
  return !!(type && name && nameLimit.test(type) && nameLimit.test(name));
}

/**
 * 代表一个项目的基础信息
 */
export type ProjectInfo<
  U extends UserInfoPublic | string | number,
  V extends VersionInfo | Version | number,
> = {
  /** 项目ID */
  id: number;
  /** 项目类型 */
  type: string;
  /** 项目名称 */
  name: string;
  /** 项目所有者(名称) */
  owner: U | null;

  /** 最新稳定版本 */
  v_nor: V | null;
  /** 最新预览版本 */
  v_pre: V | null;
};
/**
 * 代表一个项目的全部数据
 */
export type Project<
  U extends UserInfoPublic | string | number,
  V extends VersionInfo | Version | number,
> = Expand<
  ProjectInfo<U, V> & {
    /** 额外的版本串: json数据, 将按顺序转换为对应的序号 */
    v_ext: string | VersionExtra | null;
    /** 文件名匹配格式 */
    v_filename: string | null;

    /** 更新token */
    token: string | null;
  }
>;

/**
 * 项目列表信息
 */
export type ProjectInfoList = {
  /**项目列表*/
  list: ProjectInfo<string, VersionInfo>[];
  /**下次请求时的序号*/
  nextIndex: number;
  /**是否全部读取完毕*/
  end: boolean;
};
/**
 * 项目概览
 *
 * 即只包含最基础的信息
 */
export type ProjectOverview = {
  /** 项目ID */
  id: number;
  /** 项目类型 */
  type: string;
  /** 项目名称 */
  name: string;
};
/**
 * 项目概览列表信息
 */
export type ProjectOverviewList = {
  /**最新的一些项目*/
  news: ProjectOverview[];
  /**最老的一些项目 */
  olds: ProjectOverview[];
  /**随机的一些项目*/
  rand: ProjectOverview[];
};
