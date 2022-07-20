import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import fetch from 'node-fetch';
import { getLoginType } from '../../types';
import { login_key, state_key } from '$lib/def/Login';
import { findOrCreate, summonToken } from '$lib/db/User';
import type { user } from '@prisma/client';
import { makeUrl } from '$lib/def/Tool';
/**
 * OAuth2回调部分, 处理临时code, 兑换令牌, 然后兑换用户数据
 */
export const GET: RequestHandler = async (event) => {
  /** OAuth类型 */
  const type = event.params['type'];
  /** 登录数据 */
  const data = await getLoginType(type);
  if (data === null) {
    return {
      status: 404,
      body: `Unknown Login Type: ${type}!`,
    };
  }

  /** 校验码: 客户端 */
  const stateClient = cookie.parse(event.request.headers.get('Cookie') || '')[state_key];
  /** 校验码: 回调 */
  const stateUrl = event.url.searchParams.get('state');
  if (stateClient !== stateUrl) {
    return {
      status: 401,
      body: 'UNAUTHORIZED REQUEST!',
    };
  }

  /** 临时code */
  const code = event.url.searchParams.get('code');

  /** 令牌响应 */
  const tokenResp = await fetch(data.tokenURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: data.clientID,
      client_secret: data.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${event.url.origin}${event.url.pathname}`,
    }),
  }).catch((err) => {
    console.error(`[login/callback] Can not get Token from ${data.tokenURL}:`, err);
    return null;
  });
  if (tokenResp === null)
    return {
      status: 500,
      body: `Unable to access authentication server: Can not get Token`,
    };
  else if (tokenResp.status !== 200)
    return {
      status: 400,
      body: `Validation failed: ${code}`,
    };

  /** 令牌响应数据 */
  const token: any | null = await tokenResp.json().catch((err: any) => {
    console.error(`[login/callback] Can not parse Token Info from ${data.tokenURL}:`, err);
    return null;
  });
  if (!token)
    return {
      status: 500,
      body: `Unable to access authentication server: Can not parse Token Info`,
    };

  /** 访问令牌 */
  const access_token = token.access_token;

  /** 资源响应 */
  const resourceResp = await fetch(
    makeUrl(data.resourceURL, {
      token: access_token,
      access_token: access_token,
    }),
    {
      headers: {
        Authorization: `token ${access_token}`,
      },
    },
  ).catch((err) => {
    console.error(`[login/callback] Can not get User Info from ${data.resourceURL}:`, err);
    return null;
  });
  if (resourceResp === null)
    return {
      status: 500,
      body: `Unable to access authentication server: Can not get User Info`,
    };

  /** 用户数据 */
  const profile = await resourceResp.json().catch((err: any) => {
    console.error(`[login/callback] Can not parse User Info from ${data.resourceURL}:`, err);
    return null;
  });
  if (profile === null)
    return {
      status: 500,
      body: `Unable to access authentication server: Can not parse User Info`,
    };

  /** 本地用户 */
  const user: user | null = await findOrCreate(profile, data.emailField).catch((err) => {
    console.error('[login/callback] Can not summon User Token: ', err);
    return null;
  });
  if (!user)
    return {
      status: 500,
      body: `Unable to access authentication server: Can summon User Token`,
    };
  /** 用户token */
  const userToken = summonToken({ u: user.id, t: type });

  return {
    status: 302,
    headers: {
      Location: '/usr',
      'set-cookie': cookie.serialize(login_key, userToken, {
        httpOnly: true,
        path: '/',
      }),
    },
  };
};
