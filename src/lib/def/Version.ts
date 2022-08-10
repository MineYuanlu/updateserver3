import type { SubBox } from '$lib/db/Prisma';
import type { versions } from '@prisma/client';

/**
 * 资源
 *
 * name -> url
 */
export type Assets = Record<string, string>;
export const VersionInfoField = ['id', 'version', 'prerelease', 'platform', 'time'] as const;
/**
 * 一个版本的基础信息
 */
export type VersionInfo = SubBox<versions, typeof VersionInfoField[number]>;
/**
 * 一个版本(可能附带资源文件)
 */
export type Version = Expand<
  versions & {
    /** 资源文件. undefined 为未加载.*/
    assets?: Assets | null;
  }
>;

/**
 * 更新信息
 */
export type UpdateInfo = {
  normal?: Version;
  prerelease?: Version;
};

/**
 * 版本额外数据
 */
export type VersionExtra = {
  arr: string[];
  offset: number;
};

export function isVersionExtra(arg: any): arg is VersionExtra {
  return arg && Array.isArray(arg.arr) && !isNaN(arg.offset);
}

/**
 * 默认的版本额外数据
 */
export const defaultExtra: Record<string, VersionExtra> = {
  def: {
    /*https://www.jianshu.com/p/aefe0453d081*/
    arr: ['alpha', 'beta', 'pre', 'snapshot', 'RC', 'current', 'GA', 'release', 'stable'],
    offset: -4,
  },
};

/**
 * 转换为版本额外数据
 * @param data 序列化数据/版本额外数据/null
 * @returns 版本额外数据/null
 */
export const toVersionExtra = (data: string | VersionExtra | null): VersionExtra | null => {
  if (!data) return null;
  if (typeof data === 'string') return defaultExtra[data] || JSON.parse(data);
  return data;
};
/**
 * 比较两个版本
 * @param v1 版本1
 * @param v2 版本2
 * @param extra 额外版本别称
 * @return 0 版本一致, 1 v2较新, -1 v1较新
 * */
export const compareVersion = (
  v1: string,
  v2: string,
  extra?: VersionExtra | string[] | null,
): 0 | 1 | -1 => {
  if (!v1) throw new Error('v1 can not be ' + v1);
  if (!v2) throw new Error('v2 can not be ' + v2);
  (v1 = v1.toString()), (v2 = v2.toString());

  let offset = 0;
  let extraType: string[];
  if (!extra) extraType = [];
  else if (Array.isArray(extra)) extraType = [...extra];
  else if (isVersionExtra(extra)) {
    offset = extra.offset || 0;
    extraType = [...extra.arr];
  } else extraType = [];

  extraType = extraType.map((x) => x.toLowerCase());
  const r = new RegExp( //按照长度从长到短排序, 并允许匹配任何数字
    `(${[...extraType.sort((a, b) => b.length - a.length), '[0-9]+'].join('|')})`,
    'gi',
  ); //e.g. /(snapshot|current|release|stable|alpha|beta|pre|rc|ga|[0-9]+)/gi

  const a1 = v1.match(r);
  const a2 = v2.match(r);
  if (!a1 && !a2) return 0; //当无法匹配所有tag时, 直接当做一致返回
  if (!a1) return 1; //当无法匹配v1时, 认为v2较新
  if (!a2) return -1; //当无法匹配v2时, 认为v1较新
  const getNumber = (x: string) => {
    const i = extraType.indexOf(x.toLowerCase());
    return i < 0 ? parseInt(x) : i + offset;
  };
  for (let i = 0; i < a1.length || i < a2.length; i++) {
    const x1 = getNumber(i < a1.length ? a1[i] : '0');
    const x2 = getNumber(i < a2.length ? a2[i] : '0');
    if (x1 == x2) continue;
    return x1 < x2 ? 1 : -1;
  }
  return 0;
};
