import { getUserById, getVersionById, useVersion } from '$db/Prisma';
import { getLoginTokenInfo } from '$db/User';
import { getUserTokenByRequest } from '$def/Login';
import { PageLevel } from '$def/MenuList';
import type { RequestHandler } from '@sveltejs/kit';
import { getProjectInfo } from '../index';
/**
 * 依据ID获取对应版本的数据
 */
export const GET: RequestHandler = async (event) => {
  const { type, name, id } = event.params;

  const uinfo = await getLoginTokenInfo(getUserTokenByRequest(event));
  if (!uinfo) return { status: 401 };

  const project = await getProjectInfo(type, name);
  if (!project) return { status: 404, body: 'Project Not Found' };

  if (project.owner !== uinfo.u) {
    const user = await getUserById(uinfo.u, ['lvl']);
    if (!((user ? user.lvl : NaN) >= PageLevel.admin)) return { status: 403 };
  }

  const version = await getVersionById(project.id, id);
  if (!version) return { status: 404, body: 'Version Not Found' };

  const resp = await useVersion(version);

  return { body: resp };
};
