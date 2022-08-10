import type { Project } from '$def/Project';
import type { UserInfoPublic } from '$def/User';
import { compareVersion, toVersionExtra, type Assets, type VersionExtra } from '$def/Version';
import { UpdatePushCount } from '$lib/Counter';
import { stdTTL } from '$lib/def/Config';
import type { versions } from '@prisma/client';
import NodeCache from 'node-cache';
import { getAllTypes as getAllTypes0, saveAssets, saveVersion, useVersion } from './Prisma';

const cache = new NodeCache({ stdTTL });

const keys = { types: 'types' };
/**
 * 获取全部类型
 * @returns 类型(有缓存)
 */
export async function getAllTypes() {
  let data: Record<string, string> | undefined = cache.get(keys.types);
  if (data) return data;
  data = await getAllTypes0();
  cache.set(keys.types, data);
  return data;
}

/**
 * 添加新版本并使用
 * @param project 项目数据
 * @param version_tag 版本标签
 * @param prerelease 是否是预览版
 * @param platform 所属平台
 * @param assets 资源数据
 */
export async function newVersion(
  project: Project<UserInfoPublic, versions>,
  version_tag: string,
  prerelease: boolean,
  platform: string,
  assets: Assets | null,
) {
  UpdatePushCount.add();

  prerelease = !!prerelease;
  const version = await saveVersion(project.id, version_tag, prerelease, platform);
  if (assets) await saveAssets(version.id, assets);

  const oldVersion = prerelease ? project.v_pre : project.v_nor;
  if (!oldVersion || isNotOldThan(project, version, oldVersion)) await useVersion(version);
}

/**
 * 判断`me`版本是否不旧于`other`版本
 * @param project 项目数据
 * @param me 比较版本
 * @param other 其他版本
 * @returns `me`版本是否不旧于`other`版本
 */
function isNotOldThan(
  project: { v_ext: string | VersionExtra | null },
  me: versions,
  other: versions,
): boolean {
  const extraType = toVersionExtra(project.v_ext);

  return compareVersion(other.version, me.version, extraType) >= 0;
}
