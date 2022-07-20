import { UpdateCheckCount } from '$lib/Counter';
import { getProjectInternalByName } from '$lib/db/Prisma';
import type { VersionExtra } from '$lib/def/Project';
import { b2n } from '$lib/def/Tool';
import type { UpdateInfo, Version } from '$lib/def/Version';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 获取版本状态
 * @returns
 */
export const GET: RequestHandler = async (event) => {
  const params = event.params || {};
  const info = await getProjectInternalByName(params.type, params.name);
  if (!info)
    return {
      status: 404,
      body: { success: false, err: '找不到项目' },
    };
  UpdateCheckCount.add();

  const id = parseInt(event.url.searchParams.get('id') || '');
  const tag = event.url.searchParams.get('tag') || null;
  const extra: VersionExtra = info.v_ext ? JSON.parse(info.v_ext as string) : undefined;

  const update: UpdateInfo & { success: true } = { success: true };
  if (checkVersion(id, tag, info.v_nor, extra)) {
    update.normal = info.v_nor || undefined;
    if (update.normal) update.normal.downloadCount = b2n(update.normal.downloadCount) as any;
  }
  if (checkVersion(id, tag, info.v_pre, extra)) {
    update.prerelease = info.v_pre || undefined;
    if (update.prerelease)
      update.prerelease.downloadCount = b2n(update.prerelease.downloadCount) as any;
  }

  return { status: 200, body: update as any };
};
/**
 * 检查版本
 * @param cid 客户端版本ID
 * @param ctag 客户端版本串
 * @param version 服务器版本
 */
function checkVersion(
  cid: number | typeof NaN,
  ctag: string | null,
  version: Version | null,
  extraType?: VersionExtra,
): boolean {
  if (!version || !version.id) return false; //不存在版本

  const vid = version.version_id; //匹配ID
  if (typeof cid === 'number' && typeof vid === 'number' && vid <= cid) return false;

  const vtag = version.version; //匹配tag
  if (ctag && vtag && compareVersion(ctag, vtag, extraType) <= 0) return false;

  return true;
}

/**
 * 比较两个版本
 * @param v1 版本1
 * @param v2 版本2
 * @param extra 额外版本别称
 * @return 0 版本一致, 1 v2较新, -1 v1较新
 * */
const compareVersion = (v1: string, v2: string, extra?: VersionExtra | string[]): 0 | 1 | -1 => {
  if (!v1) throw new Error('v1 can not be ' + v1);
  if (!v2) throw new Error('v2 can not be ' + v2);
  (v1 = v1.toString()), (v2 = v2.toString());

  let offset = 0;
  let extraType: string[];
  if (!extra) extraType = [];
  else if (extra instanceof Array) extraType = [...extra];
  else if (extra.arr instanceof Array && !isNaN(extra.offset)) {
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
