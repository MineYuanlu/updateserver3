import * as dotenv from 'dotenv';
dotenv.config();
import cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
import type { GetSession, Handle } from '@sveltejs/kit';
import '$lib/db/Prisma';
import '$lib/Counter';
import type { UserInfo } from '$lib/def/User';
import { finishWaiter, initStart } from '$lib/def/initer';
import { getUserTokenByRequest } from '$lib/def/Login';
import { HttpReqCount } from '$lib/Counter';
import { getUserInfoById } from '$lib/db/Prisma';
import { getLoginTokenInfo } from '$lib/db/User';
import { NAME } from '$lib/def/Config';
import { prerendering } from '$app/env';

export const handle: Handle = async ({ event, resolve }) => {
  //启动初始化等待
  if (!prerendering) {
    initStart();
    await finishWaiter;
  }

  //计数器
  HttpReqCount && HttpReqCount.add(1);

  const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  event.locals.userid = cookies.yluid || uuid();

  const response = await resolve(event);

  if (!cookies.yluid) {
    // if this is the first time the user has visited this app,
    // set a cookie so that we recognise them when they return
    response.headers.set(
      'set-cookie',
      cookie.serialize('yluid', event.locals.userid, {
        path: '/',
        httpOnly: true,
      }),
    );
  }

  return response;
};

export const getSession: GetSession = async (event): Promise<App.Session> => {
  const token = getUserTokenByRequest(event);
  let user: UserInfo | null | undefined = undefined;
  let type: string | undefined = undefined;
  if (token) {
    const info = await getLoginTokenInfo(token);
    if (info) {
      user = await getUserInfoById(info.u);
      if (user) type = info.t;
    }
  }
  return { WEB_NAME: NAME, user, type };
};
