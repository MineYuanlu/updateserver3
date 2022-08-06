import { UpdateCheckCount } from '$lib/Counter';
import { getProjectInternalByName } from '$lib/db/Prisma';
import { compareVersion, toVersionExtra, type VersionExtra } from '$lib/def/Version';
import { b2n } from '$lib/def/Tool';
import type { UpdateInfo, Version } from '$lib/def/Version';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 获取版本状态
 * @returns
 */
export const GET: RequestHandler = async (event) => {
  const params = event.params || {};
  const project = await getProjectInternalByName(params.type, params.name);
  if (!project)
    return {
      status: 404,
      body: { success: false, err: '找不到项目' },
    };
  UpdateCheckCount.add();

  const id = parseInt(event.url.searchParams.get('id') || '');
  const tag = event.url.searchParams.get('tag') || null;
  const extra = toVersionExtra(project.v_ext);

  const update: UpdateInfo & { success: true } = { success: true };
  if (checkVersion(id, tag, project.cmpWithId, project.v_nor, extra)) {
    update.normal = project.v_nor || undefined;
    if (update.normal) update.normal.downloadCount = b2n(update.normal.downloadCount) as any;
  }
  if (checkVersion(id, tag, project.cmpWithId, project.v_pre, extra)) {
    update.prerelease = project.v_pre || undefined;
    if (update.prerelease)
      update.prerelease.downloadCount = b2n(update.prerelease.downloadCount) as any;
  }

  return { status: 200, body: update as any };
};
/**
 * 检查版本
 * @param cid 客户端版本ID
 * @param ctag 客户端版本串
 * @param cmpWithId 优先比较id
 * @param version 服务器版本
 * @param extraType 版本额外数据
 * @returns 是否使用服务器版本
 */
function checkVersion(
  cid: number | typeof NaN,
  ctag: string | null,
  cmpWithId: boolean,
  version: Version | null,
  extraType: VersionExtra | null,
): boolean {
  if (!version || !version.id) return false; //不存在版本

  const vid = version.version_id; //匹配ID
  if ((cmpWithId || !ctag) && typeof cid === 'number' && typeof vid === 'number' && vid <= cid)
    return false;

  const vtag = version.version; //匹配tag
  if (ctag && vtag && compareVersion(ctag, vtag, extraType) <= 0) return false;

  return true;
}
