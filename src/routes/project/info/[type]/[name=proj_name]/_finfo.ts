import type { Project } from '$lib/def/Project';
import type { UserInfoPublic } from '$lib/def/User';
import type { VersionInfo } from '$lib/def/Version';

type proj = Project<UserInfoPublic, VersionInfo>;
/**字段数据, 包括名称、是否可编辑、是否正在编辑、数据翻译*/
export const finfo: {
  [key in keyof proj]: {
    name: string;
    canEdit: boolean | 'bool' | 'pass' | 'version';
    trans?: (data: proj[key]) => any;
  };
} = {
  id: { name: '内部编号', canEdit: false },
  name: { name: '项目名称', canEdit: false },
  type: { name: '项目类型', canEdit: false },
  owner: {
    name: '所有者',
    canEdit: false,
    trans: (u) => (u!.nick ? (u!.name ? `${u!.nick} (${u!.name})` : u!.nick) : u!.name),
  },
  cmpWithId: { name: '优先比较版本ID', canEdit: 'bool' },
  v_nor: {
    name: '稳定版',
    canEdit: 'version',
    trans: (v) =>
      v
        ? `${v.version || ''}&nbsp;${
            v.version ? (v.version_id ? `(id: ${v.version_id})` : `id: ${v.version_id}`) : ``
          }`
        : '&nbsp;-&nbsp;',
  },
  v_pre: {
    name: '预览版',
    canEdit: 'version',
    trans: (v) =>
      v
        ? `${v.version || ''}&nbsp;${
            v.version ? (v.version_id ? `(id: ${v.version_id})` : `id: ${v.version_id}`) : ``
          }`
        : '&nbsp;-&nbsp;',
  },
  v_ext: { name: '额外版本串', canEdit: true },
  v_filename: { name: '文件名格式', canEdit: true },
  token: { name: '更新令牌', canEdit: true },
};
type keys = Expand<keyof typeof finfo>;
/**
 * 获取一个字段数据
 * @param field 字段
 * @param type 获取的类型
 * @param def 默认值
 */
export const Finfo = <K extends keys, T extends keyof typeof finfo[K]>(
  field: K,
  type: T,
  def?: typeof finfo[K][T],
) => (finfo[field] || {})[type] || def;
/**
 * 翻译数据
 * @param field 字段
 * @param data 数据
 */
export const transData = <T extends keys>(field: T, data: proj[T]): any =>
  Finfo(field, 'trans', (x: proj[T]): any => x)!(data);

export const featureNames: Record<string, string> = {
  versions: '版本',
  status: '统计数据',
  hook: '更新钩子',
  api: '接口信息',
};
