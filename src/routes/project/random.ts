import { getProjectOverviewRandom } from '$lib/db/Prisma';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 列出服务器列表内容
 */
export const GET: RequestHandler = async () => {
  const project = await getProjectOverviewRandom();
  if (project)
    return {
      status: 302,
      headers: {
        Location: `/project/info/${project.type}/${project.name}`,
      },
    };
  else
    return {
      status: 404,
      body: 'Can not found any project',
    };
};

/**
 * 列出服务器列表内容
 */
export const POST: RequestHandler = async () => {
  const project = await getProjectOverviewRandom();
  if (project)
    return {
      status: 200,
      body: {
        success: true,
        id: project.id,
        type: project.type,
        name: project.name,
      },
    };
  else
    return {
      status: 404,
      body: {
        success: false,
        err: 'Can not found any project',
      },
    };
};
