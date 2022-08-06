import type { LoginTokenInfo, User, UserData } from '$lib/def/User';
import { createUser, getUserByEmail } from './Prisma';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import type { MaybePromise } from '@sveltejs/kit/types/private';

/**
 * 将外部数据翻译为有效数据
 * @param {any} data 用户的外部数据
 * @param {string} emailField 邮箱字段, 通过指定邮箱字段, 防止错误识别
 * @return {UserData} 有效数据
 */
const transData = (() => {
  /**
   * 匹配数据映射
   *
   * 有效字段 -> 可能字段
   */
  const matchMap: { [k in keyof UserData]: string[] } = {
    email: ['email'],
    name: ['username', 'login', 'name'],
    nick: ['nick', 'full_name'],
  };
  return (data: any, emailField: string | null): UserData => {
    const usr: any = {};
    for (const k in matchMap) {
      const v = matchMap[k as keyof typeof matchMap] //
        .map((f) => data[f]) //
        .find((v) => !!v);
      if (v) usr[k] = v;
    }

    if (emailField) usr.email = data[emailField];

    return usr as UserData;
  };
})();

/**
 * 寻找或创建一个用户
 *
 * 首先会{@link transData 翻译用户数据}, 然后按照邮箱信息寻找一个匹配的用户, 如未匹配成功, 则会使用可用的数据创建一个新用户
 * @param data 用户数据
 * @returns 用户
 */
export const findOrCreate = async (data: any, emailField: string | null): Promise<User> => {
  const udata = transData(data, emailField);
  const user = await getUserByEmail(udata.email);
  if (user !== null) return user;
  return await createUser(udata, true);
};

/**
 * jwt密钥.
 *
 * 将会尝试读取已存在的jwt密钥文件内的数据, 如果不存在, 则使用某种随机方法生成一个随机字符串并保存.
 * 密钥文件、生成的密钥长度、密钥包含的字符均由内部指定
 */
const private_token: string = (() => {
  const file = 'jwt-secret.private';
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf-8');
  const len = 256;
  const chars = '!@#$%^&*()-=+.~;_[]{}'.split('');
  for (let i = 0; i <= 9; i++) chars.push(i.toString());
  const add = (s: string) => {
    for (let i = s.charCodeAt(0), z = s.charCodeAt(1); i <= z; i++)
      chars.push(String.fromCharCode(i));
  };
  add('az');
  add('AZ');
  let secret: string[] | string = new Array<string>(len);
  for (let i = 0; i < len; i++) {
    secret[i] = chars[(Math.random() * chars.length) | 0];
  }
  secret = secret.join('');
  fs.writeFileSync(file, secret, 'utf-8');
  return secret as string;
})();

/**
 * 生成带有用户信息的token
 * @param info 用户信息
 * @returns 用户token
 */
export const summonToken = (info: LoginTokenInfo): string => {
  return jwt.sign({ ...info }, private_token, {
    expiresIn: process.env.USER_TOEKN_TTL,
  });
};
/**
 * 通过用户token获取用户ID
 * @param token 用户token
 * @return {User} 用户ID
 * @return null: 验证失败
 */
export const getLoginTokenInfo = (token: string | null): MaybePromise<LoginTokenInfo | null> => {
  if (!token) return null;
  return new Promise((resolve) => {
    jwt.verify(token, private_token, (err, res) => {
      if (err) resolve(null);
      else resolve({ ...(<jwt.JwtPayload>res) } as LoginTokenInfo);
    });
  });
};
