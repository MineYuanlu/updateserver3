import { state_key } from '$lib/def/Login';
import { makeUrl } from '$lib/def/Tool';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { getLoginType } from '../../types';
/**
 * OAuth2入口, 跳转至指定的 OAuth 提供者
 */
export const GET: RequestHandler = async (event) => {
  /** OAuth类型 */
  const { type } = event.params;
  const data = await getLoginType(type);
  if (data === null) {
    return {
      status: 404,
      body: `Unknown Login Type: ${type}`,
    };
  }

  const state: string = Math.random().toString(36).substring(1);
  const url: string = makeUrl(data.authorizationURL, {
    response_type: 'code',
    redirect_uri: data.callbackURL || `${event.url.origin}${event.url.pathname}/callback`,
    client_id: data.clientID,
    state: state,
  });

  return {
    status: 302,
    headers: {
      Location: url,
      'set-cookie': cookie.serialize(state_key, state, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60,
      }),
    },
  };
};
