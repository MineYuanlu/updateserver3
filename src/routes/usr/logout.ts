import { login_key } from '$lib/def/Login';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const GET: RequestHandler = async (event) => {
  const go = event.url.searchParams.get('go')!;
  return {
    status: 302,
    headers: {
      Location: (go || '').startsWith('/') ? go : '/usr',
      'set-cookie': cookie.serialize(login_key, '', {
        path: '/',
        httpOnly: true,
      }),
    },
  };
};
