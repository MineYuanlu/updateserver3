import { getProjectInternalByName, listVersion } from '$db/Prisma';
import { getCursor, getPerPage } from '$def/pageable';
import type { RequestHandler } from '@sveltejs/kit';

import { stdTTL } from '$lib/def/Config';
import NodeCache from 'node-cache';
import { checkProjectTypeName } from '$def/Project';

export const GET: RequestHandler = async (event) => {
  const { type, name } = event.params;
  const per_page = getPerPage(event.url.searchParams.get('per_page'));
  const cursor = getCursor(event.url.searchParams.get('cursor'));

  const project = await getProjectId(type, name);
  if (!project) return { status: 404, body: 'Project Not Found' };
  const versions = await listVersion(project, per_page, cursor);
  return { body: versions };
};

/**
 * 带有缓存的项目ID获取
 */
export const getProjectId = (() => {
  const cache = new NodeCache({ stdTTL });
  const undef = 'undef';
  return async (type: string, name: string) => {
    if (!checkProjectTypeName(type, name)) return null;
    const key = `${type}/${name}`;

    const data: typeof undef | number | undefined = cache.get(key);
    if (data === undef) return null;
    if (typeof data === 'number') return data;

    const project = await getProjectInternalByName(type, name, 'id');
    cache.set(key, project ? project.id : undef);
    return project ? project.id : null;
  };
})();
