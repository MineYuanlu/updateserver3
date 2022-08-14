import { getProjectByName } from '$lib/db/Prisma';
import { getLoginTokenInfo } from '$lib/db/User';
import { getUserTokenByRequest } from '$lib/def/Login';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 获取项目信息
 */
export const GET: RequestHandler = async (event) => {
  const { type, name } = event.params;
  /**用户ID */
  const userId = (await getLoginTokenInfo(getUserTokenByRequest(event)))?.u;

  const project = await getProjectByName(type, name, userId);
  return {
    status: project ? 200 : 404,
    body: project,
  };
};
