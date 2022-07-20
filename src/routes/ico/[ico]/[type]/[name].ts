import type {
  RequestEvent,
  RequestHandler,
  RequestHandlerOutput,
  ResponseBody,
} from '@sveltejs/kit';
import { handleQuery, getSvg } from '$lib/badge';
import { getProjectInternalByName } from '$lib/db/Prisma';
import type { versions } from '@prisma/client';
/**
 * 返回项目信息图标
 *
 * 兼容旧路径
 *
 * 路径: `/ico/[ico]/[type]/[name]?name&txt&c_none&c_pre&c_nor`
 *
 * 路径参数:
 *
 * `ico` 可以以`v`(`version`)或`d`(`download`)开头, 在`-`后为指定版本, 可以为`nor`,`pre`,或不指定.
 * 例如: `v`,`v-nor`,`d-pre`,`version`,`version-pre`
 *
 * `type`,`name` 项目的类型与名称
 *
 * 查询参数:
 *
 * `name`,`txt` 分别为返回徽章上的文字, 可以使用`{1}`与`{2}`代替相关变量
 *
 * `c_none`,`c_pre`,`c_nor` 分别为无版本、预览版、稳定版的颜色
 *
 */
export const GET: RequestHandler = async (event) => {
  const { ico, type, name } = event.params;
  const params = event.url.searchParams;

  //获取类型
  const icoType = ico.split('-');
  let isDownload: boolean;
  switch (icoType[0]) {
    case 'v':
    case 'version':
      isDownload = false;
      break;
    case 'd':
    case 'download':
      isDownload = true;
      break;
    default:
      return summon(event, 'Unknown Type', ico, 'grey');
  }

  //项目
  const subject = (params.get('name') || '{1}:{2}').replace(/\{1\}/g, type).replace(/\{2\}/g, name);

  const project = await getProjectInternalByName(
    type,
    name,
    'versions_project_v_norToversions',
    'versions_project_v_preToversions',
  );
  if (!project) {
    return summon(event, subject, 'Not Found', params.get('c_none') || 'grey');
  }

  const version = getVersion(project, icoType[1]);
  if (!version) {
    return summon(event, subject, 'No Version', params.get('c_none') || 'grey');
  }

  let status: string | undefined = params.get('txt') || undefined;
  if (isDownload) {
    //TODO cache
    const count = version.downloadCount;
    status = (status || 'Download | {1}')
      .replace(/\{1\}/g, changeUnit(count))
      .replace(/\{2\}/g, `${count}`);
  } else {
    status = (status || `{1}`)
      .replace(/\{1\}/g, `${version.version || version.version_id}`)
      .replace(/\{2\}/g, `${version.version}`)
      .replace(/\{3\}/g, `${version.version_id}`);
  }
  const color = version.prerelease
    ? params.get('c_pre') || 'yellow'
    : params.get('c_nor') || 'green';
  return summon(event, subject, status, color);
};
/**
 * 生成badge
 * @param event 请求
 * @param subject 主题
 * @param status 状态
 * @param color 颜色
 * @returns 响应
 */
function summon(
  event: RequestEvent<Record<string, string>>,
  subject: string,
  status: string,
  color?: string,
): RequestHandlerOutput<ResponseBody> {
  const etag = encodeURIComponent(`${subject}:${status}:${color}`);

  if (event.request.headers.get('if-none-match') === etag)
    return {
      status: 304,
      headers: {
        ETag: etag,
      },
    };

  const option = handleQuery({
    subject: subject,
    status: status,
    color: color,
  });
  return {
    headers: {
      'Content-Type': 'image/svg+xml',
      ETag: etag,
    },
    body: getSvg(option),
  };
}
/**
 * 此接口使用的项目类型
 */
type Project = NonNullable<
  Awaited<
    ReturnType<
      typeof getProjectInternalByName<
        'versions_project_v_norToversions' | 'versions_project_v_preToversions'
      >
    >
  >
>;
/**
 * 获取版本
 * @param project
 * @param type
 */
function getVersion(project: Project, type: string): versions | null {
  const v_nor = project.versions_project_v_norToversions;
  const v_pre = project.versions_project_v_preToversions;
  if (type) {
    if (type.startsWith('n')) return v_nor;
    if (type.startsWith('p')) return v_pre;
  }
  const nor = v_nor?.id;
  const pre = v_pre?.id;
  if (pre === undefined) return v_nor;
  if (nor === undefined) return v_pre;
  return nor >= pre ? v_nor : v_pre;
}
/**
 * 更换单位
 */
const changeUnit = (() => {
  const unit = { B: 1e9, M: 1e6, K: 1e3 };
  return (num: number | bigint) => {
    if (!num) return `${num}`;
    const u = [];
    while (true) {
      if (typeof num === 'bigint' && num < Number.MAX_SAFE_INTEGER) num = Number(num);
      const len = u.length;
      for (const k in unit)
        if (num >= unit[k as keyof typeof unit]) {
          if (typeof num === 'bigint') num /= BigInt(unit[k as keyof typeof unit]);
          else num /= unit[k as keyof typeof unit];
          u.unshift(k);
          break;
        }
      if (len < u.length) continue;
      if (typeof num === 'number') num = ((num * 100) | 0) / 100;
      return `${num}${u.join('')}`;
    }
  };
})();
