import { getVersionById } from '$db/Prisma';
import { b2nObj } from '$def/Tool';
import type { RequestHandler } from '@sveltejs/kit';
import { getProjectInfo } from './index';
/**
 * 依据ID获取对应版本的数据
 */
export const GET: RequestHandler = async (event) => {
  const { type, name, id } = event.params;

  const project = await getProjectInfo(type, name);
  if (!project) return { status: 404, body: 'Project Not Found' };
  const version = await getVersionById(project.id, id);
  if (!version) return { status: 404, body: 'Version Not Found' };
  return { body: b2nObj(version) };
};
