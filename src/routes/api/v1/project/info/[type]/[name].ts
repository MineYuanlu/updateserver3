import { getProjectByName } from '$lib/db/Prisma';
import { getLoginTokenInfo } from '$lib/db/User';
import { getUserTokenByRequest } from '$lib/def/Login';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 列出服务器列表内容
 */
export const GET: RequestHandler = async (event) => {
  /**项目类型 */
  const type = event.params['type'];
  /**项目名称 */
  const name = event.params['name'];
  /**用户token */
  const token = getUserTokenByRequest(event);
  /**用户ID */
  const userId = (token ? await getLoginTokenInfo(token) : {})?.u;

  const project = await getProjectByName(type, name, userId);
  return {
    status: project ? 200 : 404,
    body: project,
  };
};
