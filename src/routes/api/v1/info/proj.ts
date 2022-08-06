import { ProjectsCount, UserProjectCount } from '$lib/Counter';
import { getLoginTokenInfo } from '$lib/db/User';
import type { InfoProj } from '$lib/def/api/v1/info';
import { getUserTokenByRequest } from '$lib/def/Login';
import { b2n, trans } from '$lib/def/Tool';
import type { RequestHandler } from '@sveltejs/kit';
/**@returns 项目信息 */
export const GET: RequestHandler = async (event) => {
  const user = await getLoginTokenInfo(getUserTokenByRequest(event));
  const body: Record<keyof InfoProj, string | bigint | number> = {
    ProjectsCount: await ProjectsCount(),
    UserProjectCount: user ? await UserProjectCount(user.u) : '--',
  };
  return {
    body: trans(body, b2n),
  };
};
