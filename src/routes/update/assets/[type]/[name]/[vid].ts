import { VersionDownloadCount } from '$lib/Counter';
import { getProjectInternalByName, getVersionById } from '$lib/db/Prisma';
import type { Assets } from '$lib/def/Version';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 获取版本资源
 * @returns
 */
export const GET: RequestHandler = async (event) => {
  const params = event.params || {};
  const info = await getProjectInternalByName(params.type, params.name, 'id', 'v_filename');
  if (!info)
    return {
      status: 404,
      body: { success: false, err: '找不到项目' },
    };

  const reg = matcher2regex(info.v_filename, '/', '/');
  if (!reg) return { status: 423, body: 'project not configured' };

  const vid = params.vid;
  if (isNaN(vid as any)) return { status: 400, body: 'NaN vid: ' + vid };

  const version = await getVersionById(info.id, parseInt(vid), true);
  if (!version) return { status: 404, body: 'Not Found Version' };
  if (!version.assets) return { status: 500, body: 'Null Assets' };

  VersionDownloadCount.use(version);

  const results: Assets = {};
  for (const name in version.assets) {
    const match = name.match(reg);
    if (!match) continue;
    const bad = Object.keys(match.groups || {}).findIndex((k) => {
      const query = event.url.searchParams.get(k);
      return query && query.toLowerCase().indexOf(match.groups![k].toLowerCase()) < 0; //指定了匹配但不包含
    });
    if (bad < 0) results[name] = version.assets[name]; //符合要求
  }
  return {
    status: 200,
    body: {
      data: results,
      filename: info.v_filename,
      reg: reg.source,
    },
  };
};

/**
 * 将匹配字符串转换为正则表达式
 * 匹配字符串型如 <type>_<name>_someText
 * 将start 与 end 分别设置为 '<' 和 '>' 即可得到如下正则表达式
 * /(?<type>.*?)_(?<name>.*?)_someText/
 * @param matcher 匹配字符串
 * @param start 匹配开始
 * @param end 匹配结束
 * @return regExp
 * */
const matcher2regex = (matcher: string | null, start: string, end: string): RegExp | null => {
  if (!matcher) return null;
  let i: number,
    J: number,
    j = -end.length;
  let reg = '';
  while (true) {
    i = matcher.indexOf(start, (J = j + end.length));
    if (i < 0) {
      reg += matcher.substring(J);
      break;
    }
    j = matcher.indexOf(end, i + start.length);
    if (j < 0) {
      reg += matcher.substring(J);
      break;
    }
    const name = matcher.substring(i + start.length, j);
    reg += matcher.substring(J, i);
    reg += `(?<${name}>.*?)`;
  }
  try {
    return new RegExp(`^${reg}$`, 'i');
  } catch (err) {
    return null;
  }
};
