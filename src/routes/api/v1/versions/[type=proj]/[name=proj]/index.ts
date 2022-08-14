import { getProjectInternalByName, listVersion, type SubBox } from '$db/Prisma';
import { getCursor, getPerPage } from '$def/pageable';
import type { RequestHandler } from '@sveltejs/kit';

import { stdTTL } from '$lib/def/Config';
import NodeCache from 'node-cache';
import { checkProjectTypeName } from '$def/Project';
import type { project } from '@prisma/client';
import { b2nObj } from '$def/Tool';

/**
 * 列出一个项目的版本列表
 */
export const GET: RequestHandler = async (event) => {
  const { type, name } = event.params;
  const per_page = getPerPage(event.url.searchParams.get('per_page'));
  const cursor = getCursor(event.url.searchParams.get('cursor'));

  const project = await getProjectInfo(type, name);
  if (!project) return { status: 404, body: 'Project Not Found' };
  const versions = await listVersion(project.id, per_page, cursor);
  return { body: versions && versions.map(b2nObj) };
};

/**
 * 带有缓存的项目ID获取
 */
export const getProjectInfo = (() => {
  const cache = new NodeCache({ stdTTL });
  return async (type: string, name: string): Promise<SubBox<project, 'id' | 'owner'> | null> => {
    if (!checkProjectTypeName(type, name)) return null;
    const key = `${type}/${name}`;

    const data = cache.get(key);
    if (data) return data as any;

    const project = await getProjectInternalByName(type, name, 'id', 'owner');
    if (project) cache.set(key, project);
    return project;
  };
})();
