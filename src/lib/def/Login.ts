import cookie from 'cookie';

/**
 * 通过请求事件获取其中的用户token
 * @param event 请求事件
 * @returns 请求事件中包含的用户token
 */
export const getUserTokenByRequest = ({ request }: { request: Request }): string | null => {
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  return (cookie.parse(raw) || {})[login_key];
};

/** cookie中state键 */
export const state_key = 'oauth2_state';

/** cookie中登录令牌键 */
export const login_key = 'YLUS-usr-token';
