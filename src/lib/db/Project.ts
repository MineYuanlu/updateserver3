import { stdTTL } from '$lib/def/Config';
import NodeCache from 'node-cache';
import { getAllTypes as getAllTypes0 } from './Prisma';

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
