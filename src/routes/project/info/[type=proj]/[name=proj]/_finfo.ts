import type { Project } from '$lib/def/Project';
import type { UserInfoPublic } from '$lib/def/User';
import type { VersionInfo } from '$lib/def/Version';

type proj = Project<UserInfoPublic, VersionInfo>;
/**字段数据, 包括名称、是否可编辑、是否正在编辑、数据翻译*/
export const finfo: {
  [key in keyof proj]: {
    /**显示名称 */
    name: string;
    /** 是否可以编辑 (或编辑类型) */
    canEdit: boolean | 'pass';
    /** 对于其他用户是否隐藏(其他普通用户, 不包括owner和admin) */
    hideOther?: boolean;
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
  v_nor: {
    name: '稳定版',
    canEdit: false,
    trans: (v) => (v ? v.version || '' : '&nbsp;-&nbsp;'),
  },
  v_pre: {
    name: '预览版',
    canEdit: false,
    trans: (v) => (v ? v.version || '' : '&nbsp;-&nbsp;'),
  },
  v_ext: { name: '额外版本串', canEdit: true },
  v_filename: { name: '文件名格式', canEdit: true },
  token: { name: '更新令牌', canEdit: true, hideOther: true },
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

export const featureNames: Record<string, { title: string; ownerOnly: boolean }> = {
  versions: { title: '版本', ownerOnly: false },
  status: { title: '统计数据', ownerOnly: false },
  hook: { title: '更新钩子', ownerOnly: true },
  api: { title: '接口信息', ownerOnly: false },
};
