import { afterOther, initFinish, startWaiter } from './def/initer';
import type { User } from './def/User';
import type { Version } from './def/Version';
import NodeCache from 'node-cache';
import { v4 as UUID } from '@lukeed/uuid';
import { exitHook } from './def/procexit';
import {
  addVersionDownloadAmount,
  countUserProject,
  getTableCount,
  getVersionDownloadAmount,
  loadCounter,
  setCounter,
} from './db/Prisma';
import type { MaybePromise } from '@sveltejs/kit/types/internal';
import { n2b } from './def/Tool';
import { saveTime, stdTTL } from './def/Config';

/**获取今日日期*/
const getDay = () => (Date.now() / 1000 / 60 / 60 / 24) | 0;

/**保存队列*/
const saveBus = (() => {
  type saveFunc = () => void | Promise<void>;
  const bus: saveFunc[] = [];
  const reg = (func: saveFunc) => func && func instanceof Function && bus.push(func);
  reg.save = async () => {
    for (const i in bus) {
      const func = bus[i];
      try {
        if (func.constructor.name === 'AsyncFunction') await func();
        else func();
      } catch (err) {
        console.error('无法处理 Counter 保存: ', err);
      }
    }
  };
  let loading: Set<string> | undefined = new Set<string>(); //加载中
  let loadingCount = 0;
  reg.loader = (name?: string) => {
    if (name) {
      if (!loading) throw new Error('[Counter Init] Loading Bus has gone!');
      if (!loading.has(name)) return loadingCount++, loading.add(name);
      else loading.delete(name);
    }
    if (loading && loading.size > 0) return;
    setTimeout(() => {
      //完成
      if (!loading || loading.size) return;
      loading = undefined;
      console.log('Counter', `已加载计数器`);
      exitHook(reg.save, 1, '计数器');
      initFinish('Counter');
    }, 1);
  };
  return reg;
})();

/**
 * 构建缓存器
 * @param keyTrans 键翻译
 * @param getter 实际获取
 * @param def 键无效时的默认值
 * @param ttl 缓存失效时长(s,>0)
 * @returns 缓存器
 */
const cacher = function <rawK, K extends string | number, V, U extends V | undefined>(
  keyTrans: (rawK: rawK) => K | undefined,
  getter: (key: K) => Promise<V>,
  def: U,
  ttl: number = stdTTL,
) {
  const cache = new NodeCache({ stdTTL: Math.max(ttl, 1) }); //1 hour
  const undef = new Object();
  return async (rawK: rawK): Promise<V | U> => {
    const k = keyTrans(rawK);
    if (k === undefined) return def;
    let v: V | undefined = cache.get(k);
    if (v === undef) return undefined as any;
    if (v !== undefined) return v;
    v = await getter(k);
    cache.set(k, v === undefined ? undef : v);
    return v;
  };
};

/**
 * 每日记录
 * @param name 记录名称
 * @reutrn-func days:add(adder); 增加或减少计数器
 * @return-func.get count:get(getAll); 获取今日/全部记录数
 * @return-func.getDay day:getDay(); 获取天数
 * */
const DailyCount = (name: string): DailyCounter => {
  const uid = `DC-${name}-${UUID()}-${Date.now()}`;
  let daily = 0n; //今日
  let all = 0n; //全部
  let date = getDay(); //当前日期
  let hasMod = false; //是否有修改
  let checkDay = true; //是否需要日期检查
  setInterval(() => (checkDay = true), 1000); //每秒使日期检查失效
  const r: DailyCounter = {
    add: function (adder?: number) {
      hasMod = true;
      if (checkDay) {
        const now = getDay();
        if (date !== now) (date = now), (daily = 0n);
        checkDay = false;
      }
      if (adder === undefined) daily++, all++;
      else (daily += n2b(adder | 0)), (all += n2b(adder | 0));
      return date;
    },
    get: (ALL: boolean | any): bigint => {
      if (checkDay) {
        const now = getDay();
        if (date !== now) (date = now), (daily = 0n);
        checkDay = false;
      }
      return ALL ? all : daily;
    },
    getDay: getDay,
    uid: uid,
    name: name,
  };
  saveBus.loader(uid);
  setTimeout(async () => {
    const start = getDay(); //bug: sql查询跨天...
    const r = await loadCounter(name);
    daily +=
      getDay() == start && r.day ? (typeof r.daily === 'number' ? BigInt(r.daily) : r.daily) : 0n;
    all += r.value;
    saveBus(async () => {
      if (!hasMod) return;
      const resp = await setCounter(name, daily, all);
      daily = resp.daily;
      all = resp.value;
      hasMod = false;
    });
    saveBus.loader(uid);
  }, 1);
  return r;
};

/**版本下载记录*/
export const VersionDownloadCount: VersionDownloadCounter = (() => {
  let data: { [key: number]: number } = {};
  const cache = cacher<
    number,
    number,
    Awaited<ReturnType<typeof getVersionDownloadAmount>>,
    undefined
  >(
    (k) => k,
    async (id) => await getVersionDownloadAmount(id),
    undefined,
  );
  const counter = {
    use: (version: Version | number) => {
      const id = typeof version === 'number' ? version : version.id;
      if (!(id > 0)) throw new Error('Unknown Version');
      data[id] = (data[id] || 0) + 1;
    },
    save: () => {
      const count = data;
      data = {};
      for (const id in count) addVersionDownloadAmount(parseInt(id), count[id]);
    },
    get: (version: Version | number): Promise<bigint | null> => {
      return new Promise(async (r) => {
        const id = typeof version === 'number' ? version : version.id;
        if (!(id > 0)) throw new Error('Unsaved Version');

        const res = await cache(id);
        if (!res) return null;
        r(res.downloadCount + n2b(data[id] || 0));
      });
    },
  };
  saveBus(counter.save);
  return counter;
})();

/**用户项目数统计*/
export const UserProjectCount = cacher<number | User, number, number, 0>(
  (user) => (typeof user === 'number' ? user : user?.id),
  async (id) => await countUserProject(id),
  0,
);

/**
 * 通用统计
 * @param getter 实际统计器
 * @return 获取统计结果
 * @return add 不全部刷新的增加或减少统计
 * @return flush 强制刷新
 * */
export const CurrencyCount = (
  getter: undefined | null | (() => MaybePromise<number | bigint>),
): CurrencyCounter => {
  const Threshold = 600; //缓存失效阈值,秒
  let count = 0n;
  if (getter === undefined) getter = () => 0;
  else if (getter === null) {
    const get = async () => count;
    get.add = (adder: number | bigint) => (count += n2b(adder));
    get.flush = async () => count;
    return get;
  }
  if (!(getter instanceof Function)) throw new Error('need a Func/AsyncFunc/null/undefined');
  let last = Number.MIN_SAFE_INTEGER;
  const get: CurrencyCounter = async () =>
    process.uptime() - last >= Threshold ? await get.flush() : count;

  get.flush = async () => {
    last = process.uptime();
    return (count = n2b(await getter!()));
  };

  get.add = (adder: number | bigint) => (count += n2b(adder));
  return get;
};

/**项目数统计*/
export let ProjectsCount: CurrencyCounter;

/*类型数统计*/
export let TypesCount: CurrencyCounter;
/**版本数统计*/
export let VersionsCount: CurrencyCounter;
/**资源数统计*/
export let AssetsCount: CurrencyCounter;
/**用户数统计*/
export let UsersCount: CurrencyCounter;

/**更新查询次数统计*/
export let UpdateCheckCount: DailyCounter;
/**更新推送次数统计*/
export let UpdatePushCount: DailyCounter;
/**更新推送次数统计*/
export let HttpReqCount: DailyCounter;

/** 保存 */
export let save: () => void;

/**
 * 通用计数器
 */
export interface CurrencyCounter {
  /** 获取统计结果 */
  (): Promise<bigint>;
  /** 强制刷新 */
  flush: () => Promise<bigint>;
  /** 不全部刷新的增加或减少统计 */
  add: (adder: number | bigint) => bigint;
}

/**
 * 每日记录器
 *
 * 会记录今日值和全部值
 */
export interface DailyCounter {
  /**
   * 增加计数
   * @param {number} adder 增加值
   * @return 当前日期
   */
  add(adder?: number | bigint): number;
  /**
   * 获取当前计数
   * @param {boolean} all 获取全部/今日计数
   * @return 计数
   */
  get(all: boolean): bigint;
  /** @return 当前日期 */
  getDay: () => number;
  /** 每日记录唯一标识符, 用于saveBus */
  uid: string;
  /** 记录名称(数据库同步) */
  name: string;
}
/**
 * 版本下载计数器
 */
export interface VersionDownloadCounter {
  /** 使用一次版本(即增加一次计数器) */
  use: (version: Version | number) => void;
  /** 保存 */
  save: () => void;
  /** 获取版本下载次数 */
  get: (version: Version | number) => Promise<bigint | null>;
}

(async () => {
  await startWaiter;
  await afterOther('db');

  ProjectsCount = CurrencyCount(async () => await getTableCount('project'));
  TypesCount = CurrencyCount(async () => await getTableCount('types'));
  VersionsCount = CurrencyCount(async () => await getTableCount('versions'));
  AssetsCount = CurrencyCount(async () => await getTableCount('assets'));
  UsersCount = CurrencyCount(async () => await getTableCount('user'));
  UpdateCheckCount = DailyCount('update-check');
  UpdatePushCount = DailyCount('update-push');
  HttpReqCount = DailyCount('http-req');
  save = saveBus.save;

  setInterval(save, saveTime * 1000);
  saveBus.loader();
})();
