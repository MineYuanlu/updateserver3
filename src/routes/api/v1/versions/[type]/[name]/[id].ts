import { getVersionById } from '$db/Prisma';
import { b2n } from '$def/Tool';
import type { RequestHandler } from '@sveltejs/kit';
import { getProjectId } from './index';

export const GET: RequestHandler = async (event) => {
  const { type, name, id } = event.params;

  const project = await getProjectId(type, name);
  if (!project) return { status: 404, body: 'Project Not Found' };
  const version = await getVersionById(project, id);
  if (!version) return { status: 404, body: 'Version Not Found' };
  return { body: { ...version, downloadCount: b2n(version.downloadCount) } };
};
