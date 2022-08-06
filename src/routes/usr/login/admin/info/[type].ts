import { getUserById, getLoginTypeInfo } from '$lib/db/Prisma';
import { getLoginTokenInfo } from '$lib/db/User';
import { getUserTokenByRequest } from '$lib/def/Login';
import { PageLevel } from '$lib/def/MenuList';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  const { type } = event.params;
  if (!type) return { status: 400 };

  const tokenInfo = await getLoginTokenInfo(getUserTokenByRequest(event));
  if (!tokenInfo) return { status: 401 };

  const user = await getUserById(tokenInfo.u, ['lvl']);
  if (!user || !(user.lvl >= PageLevel.admin)) return { status: 403 };

  return { body: await getLoginTypeInfo(type) };
};
