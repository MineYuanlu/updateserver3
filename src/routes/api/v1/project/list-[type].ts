import { getCursor, getPerPage } from '$def/pageable';
import { getProjectList, getProjectOverviewList } from '$lib/db/Prisma';
import { getLoginTokenInfo } from '$lib/db/User';
import { getUserTokenByRequest } from '$lib/def/Login';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * 列出服务器列表内容
 */
export const GET: RequestHandler = async (event) => {
  /** 类型,me或all */
  const type = event.params['type'];
  const params = event.url.searchParams;

  const index = getCursor(params.get('index'));
  const amount = getPerPage(params.get('amount'));
  switch (type) {
    case 'me': {
      const userId = (await getLoginTokenInfo(getUserTokenByRequest(event)))?.u;
      if (userId) {
        const projects = await getProjectList(index, amount, userId);
        return { status: 200, body: projects as any };
      } else return { status: 401, body: 'Please log in to a user first' };
    }
    case 'overview': {
      const userId = (await getLoginTokenInfo(getUserTokenByRequest(event)))?.u;
      if (userId) {
        const projects = await getProjectOverviewList(userId);
        return { status: 200, body: projects as any };
      } else return { status: 401, body: 'Please log in to a user first' };
    }
    case 'all': {
      const projects = await getProjectList(index, amount);
      return { status: 200, body: projects as any };
    }
    default: {
      return { status: 404, body: `Unknown type: ${type}` };
    }
  }
};
