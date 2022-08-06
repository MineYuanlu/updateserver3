import type { FetchFunction } from '$lib/def/FetchFunction.type';
import type { LoginTypeInfo } from '$lib/def/User';

/**
 * 列出登录类型
 * @param f fetch
 * @returns 登录类型
 */
export const listLoginTypes = async (f: FetchFunction): Promise<string[]> => {
  const resp = await f('/usr/login/types');
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  return resp.json();
};

/**
 * 获取登录类型的信息(only admin)
 * @param f fetch
 * @param type 登录类型名称
 * @returns 登录类型信息
 */
export const getLoginTypeInfo = async (
  f: FetchFunction,
  type: string,
): Promise<LoginTypeInfo | null> => {
  if (!type) throw new Error('Bad type: ' + type);
  const resp = await f(`/usr/login/admin/info/${type}`);
  if (!resp.ok) throw new Error(`${resp.status} - ${await resp.text()}`);
  return resp.json();
};
