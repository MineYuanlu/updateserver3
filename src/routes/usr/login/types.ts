import type { RequestHandler } from '@sveltejs/kit';
import { v4 as uuid } from '@lukeed/uuid';
import NodeCache from 'node-cache';
import { getLoginType as getLoginType0, getLoginTypes as getLoginTypes0 } from '$lib/db/Prisma';
import { stdTTL } from '$lib/def/Config';
import type { login_types } from '@prisma/client';

/** 所有登录类型的缓存键 */
const cacheTypesKey = `types:_list_${uuid()}`;
/** 类型缓存 */
const typeCache = new NodeCache({ stdTTL });

export const GET: RequestHandler = async () => {
  return { body: await getLoginTypes() };
};
/** 获取所有登录类型名称(带缓存) */
export const getLoginTypes = async (): Promise<string[]> => {
  let data: string[] | undefined = typeCache.get(cacheTypesKey);
  if (data !== undefined) return data;
  data = await getLoginTypes0();
  typeCache.set(cacheTypesKey, data);
  return data;
};
/** 获取登录类型(带缓存) */
export const getLoginType = async (name: string): Promise<login_types | null> => {
  if (!name) return null;
  let data: login_types | undefined | null = typeCache.get(name);
  if (data !== undefined) return data;
  data = await getLoginType0(name);
  typeCache.set(name, data);
  return data;
};
