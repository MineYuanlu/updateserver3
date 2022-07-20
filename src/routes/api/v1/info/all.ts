import {
  AssetsCount,
  HttpReqCount,
  ProjectsCount,
  TypesCount,
  UpdateCheckCount,
  UpdatePushCount,
  UserProjectCount,
  UsersCount,
  VersionsCount,
} from '$lib/Counter';
import { getLoginTokenInfo } from '$lib/db/User';
import type { InfoAll } from '$lib/def/api/v1/info';
import { getUserTokenByRequest } from '$lib/def/Login';
import { b2n, trans } from '$lib/def/Tool';
import type { RequestHandler } from '@sveltejs/kit';

/**@returns 全部信息*/
export const GET: RequestHandler = async (event) => {
  const token = getUserTokenByRequest(event);
  const user = token && (await getLoginTokenInfo(token));
  const body: Record<keyof InfoAll, string | bigint | number> = {
    ProjectsCount: await ProjectsCount(),
    VersionsCount: await VersionsCount(),
    AssetsCount: await AssetsCount(),
    TypesCount: await TypesCount(),
    UsersCount: await UsersCount(),
    UpdateCheckCount: UpdateCheckCount.get(true),
    UpdatePushCount: UpdatePushCount.get(true),
    HttpReqCount: HttpReqCount.get(true),
    UpdateCheckCountDaily: UpdateCheckCount.get(false),
    UpdatePushCountDaily: UpdatePushCount.get(false),
    HttpReqCountDaily: HttpReqCount.get(false),
    UserProjectCount: user ? await UserProjectCount(user.u) : '--',
  };
  return { body: trans(body, b2n) };
};
