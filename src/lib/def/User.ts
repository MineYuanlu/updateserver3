import type { SubBox } from '$lib/db/Prisma';
import type { user, login_types } from '@prisma/client';
import type { JwtPayload } from 'jsonwebtoken';
/**
 * 用户基础数据
 *
 * 用于模糊匹配等
 */
export type UserData = SubBox<user, 'email' | 'name' | 'nick'>;

/**
 * 一个用户
 */
export type User = user;

/**
 * 用户信息字段
 *
 * 这些字段的数据可以显示, 被所有者本人和管理员查看
 */
export const infoField = ['id', 'name', 'nick', 'email', 'lvl'] as const;
export type UserInfo = SubBox<user, typeof infoField[number]>;
/**
 * 用户信息字段
 *
 * 这些字段的数据可以公开, 在任意位置传播
 */
export const infoPublicField = ['id', 'name', 'nick', 'lvl'] as const;
export type UserInfoPublic = SubBox<user, typeof infoPublicField[number]>;

/**
 * 登录token信息
 */
export type LoginTokenInfo = JwtPayload & {
  /**用户ID */
  u: number;
  /** 登录平台 */
  t: string;
};

/**
 * 登录类型的信息字段
 */
export const loginTypeInfoField = [
  'name',
  'authorizationURL',
  'tokenURL',
  'resourceURL',
  'clientID',
  'callbackURL',
  'emailField',
] as const;
export type LoginTypeInfo = SubBox<login_types, typeof loginTypeInfoField[number]>;
