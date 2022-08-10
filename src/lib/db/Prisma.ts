import { dev } from '$app/env';
import { initFinish, startWaiter } from '$lib/def/initer';
import { PageLevel } from '$lib/def/MenuList';
import { exitHook } from '$lib/def/procexit';
import {
  checkProjectTypeName,
  type Project,
  type ProjectInfo,
  type ProjectInfoList,
  type ProjectOverview,
  type ProjectOverviewList,
} from '$lib/def/Project';
import {
  infoField,
  infoPublicField,
  loginTypeInfoField,
  type LoginTypeInfo,
  type User,
  type UserInfo,
  type UserInfoPublic,
} from '$lib/def/User';
import { VersionInfoField, type Assets, type Version, type VersionInfo } from '$lib/def/Version';
import type model from '.prisma/client';
import { PrismaClient } from '@prisma/client';
import sqlstring from 'sqlstring';
export type SubBox<box, field extends keyof box> = { [k in field]: box[k] };

let prisma: PrismaClient;
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}
/**
 * 获取登录类型(OAuth2)
 * @param {string} name 登录类型的名称
 * @returns 登录数据
 */
export function getLoginType(name: string): Promise<model.login_types | null> {
  return prisma.login_types.findFirst({ where: { name } });
}

/**
 * 获取所有的登录类型名称(OAuth2)
 * @returns 登录类型名称列表
 */
export async function getLoginTypes(): Promise<string[]> {
  const datas = await prisma.login_types.findMany({ select: { name: true } });
  return datas.map((type) => type.name);
}
/**
 * 获取登录类型的信息(OAuth2)
 * @param {string} name 登录类型的名称
 * @returns 登录数据
 */
export function getLoginTypeInfo(name: string): Promise<LoginTypeInfo | null> {
  return prisma.login_types.findFirst({ where: { name }, select: loginTypeInfoField0 });
}
const loginTypeInfoField0 = transSelect(loginTypeInfoField);

/**
 * 通过给定的数据创建一个用户
 * @param data 用户数据
 * @returns 用户信息
 */
export async function createUser(data: model.Prisma.userCreateInput, all: true): Promise<User>;

/**
 * 通过给定的数据创建一个用户
 * @param data 用户数据
 * @returns 用户ID
 */
export async function createUser(data: model.Prisma.userCreateInput, all?: false): Promise<number>;

export async function createUser(
  data: model.Prisma.userCreateInput,
  all?: boolean,
): Promise<User | number> {
  if (all) return await prisma.user.create({ data });
  return (await prisma.user.create({ select: { id: true }, data })).id;
}

/**
 * 通过用户ID获取用户数据
 * @param id 用户ID
 * @returns 用户
 */
export async function getUserById(id: number | string): Promise<User | null>;

/**
 * 通过用户ID获取用户数据
 * @param id 用户ID
 * @param field 要获取的域
 * @returns 用户的部分数据
 */
export async function getUserById<Type extends readonly (keyof User)[]>(
  id: number | string,
  field: Type,
): Promise<{ [k in typeof field[number]]: User[k] } | null>;

export async function getUserById<Type extends readonly (keyof User)[]>(
  id: number | string,
  field?: Type,
) {
  id = typeof id === 'number' ? id : parseInt(id);
  if (!(id > 0)) return null;
  if (field) return await prisma.user.findFirst({ where: { id }, select: transSelect(field) });
  else return await prisma.user.findFirst({ where: { id } });
}

/**
 * 通过用户邮箱获取用户数据
 * @param email 用户邮箱
 * @returns 用户
 * @see User
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) return null;
  return await prisma.user.findFirst({ where: { email } });
}

/**
 * 通过用户ID获取用户信息
 *
 * 不包括敏感数据, 其字段在 {@link infoField} 中定义
 * @param id 用户ID
 * @returns 用户
 */
export async function getUserInfoById(id: number | string): Promise<UserInfo | null> {
  id = typeof id === 'number' ? id : parseInt(id);
  if (!(id > 0)) return null;
  return await prisma.user.findFirst({ where: { id }, select: infoField0 });
}
const infoField0 = transSelect(infoField);

/**
 * 通过用户ID获取用户信息
 *
 * 可公开数据, 其字段在 {@link infoPublicField} 中定义
 * @param id 用户ID
 * @returns 用户
 * @see User
 */
export async function getUserInfoPublicById(id: number | string): Promise<UserInfoPublic | null> {
  id = parseInt(id as any);
  if (!(id > 0)) return null;
  return await prisma.user.findFirst({ where: { id }, select: infoPublicField0 });
}
const infoPublicField0 = transSelect(infoPublicField);

/**
 * 获取全部类型
 * @returns 类型(无缓存)
 */
export async function getAllTypes() {
  const obj: Record<string, string> = {};
  const data = await prisma.types.findMany({ select: { notes: true, name: true } });
  data.forEach((x) => (obj[x.name] = x.notes));
  return obj;
}

/**
 * 随机地获取一个项目概览
 *
 * @returns 项目概览/null: 找不到任何项目
 */
export async function getProjectOverviewRandom(): Promise<ProjectOverview | null> {
  const data: ProjectOverview[] =
    await prisma.$queryRaw`select p.id,p.type,p.name from project p join(select ROUND((rand()*(select max(id)from project)-(select min(id)from project))+(select min(id)from project))as id)p2 where p.id >=p2.id limit 1;`;
  return data.length > 0 ? data[0] : null;
}

/**
 * 获取项目概览信息
 *
 * 将会按照规则获取一些项目, 并且过滤掉重复的内容
 * @param userId 用户ID
 * @returns 项目列表
 */
export async function getProjectOverviewList(userId: number): Promise<ProjectOverviewList> {
  const data: ProjectOverviewList = { news: [], rand: [], olds: [] };
  userId = parseInt(userId as any);
  if (!(userId > 0)) return data;

  const limit = 5;
  const all = await prisma.project.findMany({
    where: { owner: userId },
    select: { id: true, type: true, name: true },
  });
  data.news = all.splice(0, limit);
  data.olds = all.splice(all.length - limit, limit);
  data.rand = all.sort(() => (Math.random() > 0.5 ? 1 : -1)).splice(0, limit);
  return data;
}
/**
 * 获取项目列表
 *
 * 如果包含用户ID, 则会仅获取属于用户的项目列表
 * @param index 开始序号
 * @param amount 获取数量
 * @param userId 用户ID
 * @returns 项目列表
 */
export async function getProjectList(
  index: number | null,
  amount: number,
  userId: number | undefined = undefined,
): Promise<ProjectInfoList | null> {
  index = index === null ? null : parseInt(index as any);
  amount = parseInt(amount as any);
  userId = parseInt(userId as any);
  if (index !== null && !(index >= 0)) return null;
  if (!(amount > 0)) return null;
  if (!(userId > 0)) userId = undefined;

  const data = (
    await prisma.project.findMany({
      select: {
        id: true,
        type: true,
        name: true,
        user: userId === undefined ? undefined : { select: { name: true } },
        v_useId: true,
        versions_project_v_norToversions: { select: VersionInfoField0 },
        versions_project_v_preToversions: { select: VersionInfoField0 },
      },
      where: { owner: userId },
      cursor: index == null ? undefined : { id: index },
      skip: index == null ? 0 : 1,
      take: amount,
    })
  ).map(
    (val): ProjectInfo<string, VersionInfo> => ({
      id: val.id,
      type: val.type,
      name: val.name,
      owner: val.user.name,
      v_nor: val.versions_project_v_norToversions,
      v_pre: val.versions_project_v_preToversions,
    }),
  );
  return {
    list: data,
    end: data.length < amount,
    nextIndex: data.length ? data[data.length - 1].id : -1,
  };
}
const VersionInfoField0 = transSelect(VersionInfoField);

/**
 * 通过项目类型+项目名称获取一个项目数据。
 *
 * 如果查询者为项目所有者，或查询者为管理员，则返回项目的全部信息，否则仅返回项目公开信息。
 * @param type 项目类型
 * @param name 项目名称
 * @param who 查询者ID
 */
export async function getProjectByName(
  type: string,
  name: string,
  who?: number | string,
): Promise<Project<UserInfoPublic, VersionInfo> | null> {
  if (!checkProjectTypeName(type, name)) return null;
  who = parseInt(who as any);

  const val = await prisma.project.findFirst({
    where: { type, name },
    select: {
      id: true,
      name: true,
      type: true,
      user: { select: infoPublicField0 },
      v_useId: true,
      token: true,
      v_extra: true,
      v_filename: true,
      versions_project_v_norToversions: { select: VersionInfoField0 },
      versions_project_v_preToversions: { select: VersionInfoField0 },
    },
  });
  if (!val) return null;
  let backAll = who === val.user.id;
  if (!backAll && who > 0) {
    const user = await getUserInfoPublicById(who as number);
    if (user && user.lvl >= PageLevel.admin) backAll = true;
  }

  return {
    id: val.id,
    name: val.name,
    type: val.type,
    owner: val.user,
    token: backAll ? val.token : null,
    v_ext: val.v_extra,
    v_filename: val.v_filename,
    v_nor: val.versions_project_v_norToversions,
    v_pre: val.versions_project_v_preToversions,
  };
}
/**
 * 通过项目类型+项目名称获取一个项目数据。
 *
 * 内部使用
 * @param type 项目类型
 * @param name 项目名称
 */
export async function getProjectInternalByName(
  type: string,
  name: string,
): Promise<Project<UserInfoPublic, model.versions> | null>;
/**
 * 通过项目类型+项目名称获取一个项目数据。
 *
 * 内部使用
 * @param type 项目类型
 * @param name 项目名称
 * @param field 要获取的列
 */
export async function getProjectInternalByName<Type extends keyof model.Prisma.projectSelect>(
  type: string,
  name: string,
  ...field: readonly Type[]
): Promise<Expand<
  Awaited<ReturnType<typeof prisma.project.findFirst<{ select: Record<Type, true> }>>>
> | null>;
export async function getProjectInternalByName<Type extends keyof model.Prisma.projectSelect>(
  type: string,
  name: string,
  ...field: readonly Type[]
) {
  if (!checkProjectTypeName(type, name)) return null;
  if (field && field.length) {
    const data = await prisma.project.findFirst({
      where: { type, name },
      select: transSelect(field),
    });
    return data;
  }

  const val = await prisma.project.findFirst({
    where: { type, name },
    select: {
      id: true,
      name: true,
      type: true,
      token: true,
      user: { select: infoPublicField0 },
      v_useId: true,
      v_extra: true,
      v_filename: true,
      versions_project_v_norToversions: true,
      versions_project_v_preToversions: true,
    },
  });
  if (!val) return null;

  return {
    id: val.id,
    name: val.name,
    type: val.type,
    token: val.token,
    owner: val.user,
    cmpWithId: val.v_useId,
    v_ext: val.v_extra,
    v_filename: val.v_filename,
    v_nor: val.versions_project_v_norToversions,
    v_pre: val.versions_project_v_preToversions,
  };
}

/**
 * 通过ID获取一个版本数据, 附带资源文件信息
 * @param owner 所有者(验证是否属于此项目)
 * @param id 版本ID
 * @param withAssets 附带资源文件信息
 * @returns 版本/null
 */
export async function getVersionById(
  owner: number,
  id: number | string,
  withAssets: true,
): Promise<Version | null>;
/**
 * 通过ID获取一个版本数据
 * @param owner 所有者(验证是否属于此项目)
 * @param id 版本ID
 * @param withAssets 不附带资源文件信息
 * @returns 版本/null
 */
export async function getVersionById(
  owner: number,
  id: number | string,
  withAssets?: false,
): Promise<model.versions | null>;

export async function getVersionById(
  owner: number,
  id: number | string,
  withAssets: boolean = false,
): Promise<Version | model.versions | null> {
  owner = parseInt(owner as any);
  id = parseInt(id as any);
  if (!(owner > 0) || !(id > 0)) return null;

  const v: Version | null = await prisma.versions.findFirst({ where: { id, owner } });
  if (v && withAssets) v.assets = await getAssetsById(id);
  return v;
}

/**
 * 保存版本
 * @param owner 所属项目id
 * @param version 版本号
 * @param prerelease 是否是预览版
 * @param platform 所属平台
 * @returns 保存的数据
 */
export async function saveVersion(
  owner: number | string,
  version: string,
  prerelease: boolean,
  platform: string,
) {
  owner = parseInt(owner as any);
  prerelease = !!prerelease;
  return await prisma.versions.create({
    data: { owner, version, prerelease, platform, time: new Date() },
  });
}

/**
 * 使用版本
 *
 * 使项目使用某一个版本作为当前版本
 * @param version 版本数据
 */
export async function useVersion(version: SubBox<model.versions, 'id' | 'owner' | 'prerelease'>) {
  const data: SubBox<model.Prisma.projectUncheckedUpdateInput, 'v_nor' | 'v_pre'> = {};
  data[version.prerelease ? 'v_pre' : 'v_nor'] = version.id;
  return await prisma.project.update({
    where: { id: version.owner },
    data,
    select: { v_nor: !version.prerelease, v_pre: version.prerelease },
  });
}

/**
 * 列出版本
 * @param owner 所属的项目ID
 * @returns 版本列表
 */
export async function listVersion(
  owner: number | string,
  per_page: number | string,
  cursor: number | string | null,
): Promise<VersionInfo[] | null> {
  owner = parseInt(owner as any);
  per_page = parseInt(per_page as any);
  cursor = cursor === null ? null : parseInt(cursor as any);
  if (!(owner > 0) || !(per_page > 0)) return null;
  if (cursor !== null && !(cursor >= 0)) return null;
  return await prisma.versions
    .findMany({
      where: { owner },
      orderBy: { time: 'desc' },
      cursor: cursor == null ? undefined : { id: cursor },
      skip: cursor == null ? 0 : 1,
      take: per_page,
      select: VersionInfoField0,
    })
    .then((vs) =>
      vs.map((v) => {
        console.log(v.time);
        // v.time = v.time.getTime();
        return v;
      }),
    );
}

/**
 *通过版本ID获取一个版本的所有资源
 * @param vid 版本ID
 * @returns 版本/null
 */
export async function getAssetsById(vid: number): Promise<Assets | null> {
  vid = parseInt(vid as any);
  if (!(vid > 0)) return null;

  const arr = await prisma.assets.findMany({
    select: { name: true, url: true },
    where: { version_id: vid },
  });

  const assets: Assets = {};
  arr.forEach((a) => (assets[a.name] = a.url));
  return assets;
}

/**
 * 保存资源地址
 * @param version_id 版本ID
 * @param assets 资源数据
 */
export async function saveAssets(version_id: number, assets: Assets) {
  version_id = parseInt(version_id as any);
  if (!(version_id > 0)) return null;

  const data: model.Prisma.assetsCreateManyInput[] = [];
  for (const name in assets) data.push({ version_id, name, url: assets[name] });

  return await prisma.assets.createMany({ data });
}

/**
 * 获取某个表的字段数量
 * @param table 表名
 * @return amount数量
 * */
export async function getTableCount(table: model.Prisma.ModelName): Promise<bigint | number> {
  if (!table || table.indexOf('`') >= 0) return 0;
  const data = await prisma.$queryRawUnsafe<{ count: bigint | number }[]>(
    `SELECT count(1)AS count FROM ${sqlstring.escapeId(table)}`,
  );
  return data[0].count;
}

/**
 * 获取用户所持有的项目数量
 * @param user 用户
 * @return 用户所持有的项目数量
 * */
export async function countUserProject(
  user: number | User | UserInfo | UserInfoPublic,
): Promise<number> {
  const owner = typeof user === 'number' ? user : (user || {}).id;
  if (!(owner > 0)) return 0;
  return await prisma.project.count({ where: { owner } });
}

/**
 * 写入统计版本下载次数
 * @param id 版本ID
 * @param increment 增加数量
 * */
export async function addVersionDownloadAmount(id: number, increment: number): Promise<void> {
  increment = parseInt(increment as any);
  id = parseInt(id as any);
  if (!increment || !(id > 0)) return;

  await prisma.$queryRaw`UPDATE versions SET downloadCount=downloadCount+${increment} WHERE id=${id};`;
}

/**
 * 获取统计版本下载次数
 * @param id 版本ID
 * @return amount数量
 * */
export async function getVersionDownloadAmount(id: number) {
  id = parseInt(id as any);
  if (!(id > 0)) return null;

  return await prisma.versions.findFirst({
    select: { downloadCount: true, prerelease: true },
    where: { id },
  });
}

/**
 * 加载计数器
 * @param key 计数器名称
 * @return 总值
 * */
export async function loadCounter(key: string) {
  await prisma.$executeRaw`INSERT IGNORE INTO \`counter\`(\`key\`) VALUES(${key});`;
  const [count] = await prisma.$queryRaw<
    [Record<'value' | 'daily' | 'day', bigint>]
  >`SELECT \`value\`,daily,(TO_DAYS(date)=TO_DAYS(now()))AS\`day\` FROM counter WHERE \`key\`=${key} LIMIT 1;`;
  return { ...count, day: !!count.day };
}

/**
 * 设置计数器
 * @param key 计数器名称
 * @param daily 计数器今日值
 * @param all 计数器总值
 * @returns 数据库返回值
 * */
export async function setCounter(key: string, daily: bigint | number, all: bigint | number) {
  return await prisma.counter.update({
    select: { value: true, daily: true },
    data: { value: all, daily },
    where: { key },
  });
}

(async (/**加载基础数据*/) => {
  await startWaiter;

  prisma = global.prisma || new PrismaClient(dev ? { log: ['query'] } : undefined);
  if (dev) global.prisma = prisma;
  await prisma.$connect();
  exitHook(() => prisma.$disconnect(), -10, '数据库');

  initFinish('db');
})();

/**
 * 将 选择域数组 转换为 选择域对象
 * @param data 选择域数组
 * @returns 选择域对象
 */
function transSelect<T extends readonly string[]>(data: T) {
  const obj: { [k in typeof data[number]]: true } = {} as any;
  data.forEach((x) => (obj[x as typeof data[number]] = true));
  return obj;
}
