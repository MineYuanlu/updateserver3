import type { SubBox } from '$lib/db/Prisma';
import type { versions } from '.prisma/client';

/**
 * 资源
 *
 * name -> url
 */
export type Assets = Record<string, string>;
export const VersionInfoField = ['version', 'version_id', 'prerelease'] as const;
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
