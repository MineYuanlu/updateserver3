type Is<T extends U, U> = T;
type Enum_<T extends readonly string[], Acc extends readonly string[] = []> = T extends readonly [
  Is<infer First, string>,
  ...Is<infer Rest, string[]>,
]
  ? Record<First, Acc['length']> & Enum_<Rest, [...Acc, First]>
  : Record<never, never>;
type Enum<T extends readonly string[]> = Enum_<T>;

/**
 * 创建枚举
 * @param name 枚举名称
 * @returns 枚举映射
 */
export const createEnum = <T extends readonly string[]>(...name: T): Enum<T> => {
  const data: any = {};
  name.forEach((v, i) => (data[v] = i));
  return data;
};
export const expand = <T>(t: T): Expand<T> => t as any;

/**Number最大值 */
const V_MAX = BigInt(Number.MAX_SAFE_INTEGER);
/**Number最小值 */
const V_MIN = BigInt(Number.MIN_SAFE_INTEGER);
/**
 * bigint转number或string
 *
 * 对于number和string, 将会按原样返回. 对于bigint,如果在Number的安全范围内, 则会转为number返回, 否则会转换为string返回. 对于其它值, 则会抛出错误
 * @param v 输入数据
 * @returns 输出数据
 */
export function b2n(v: bigint | number | string) {
  switch (typeof v) {
    case 'number':
    case 'string':
      return v;
    case 'bigint':
      return V_MIN <= v && v <= V_MAX ? Number(v) : v.toString();
    default:
      throw new Error('Bad type: ' + typeof v);
  }
}
/**
 * 简单的将所有number/bigint转为bigint返回
 * @param v 输入数据
 * @returns 输出数据
 */
export function n2b(v: bigint | number): bigint {
  return typeof v === 'bigint' ? v : BigInt(v);
}
/**
 * 翻译数据
 * @param data 原始数据
 * @param func 翻译器
 * @returns 新的数据(与data无关)
 */
export function trans<K extends string | number | symbol, V1, V2>(
  data: Record<K, V1>,
  func: (v: V1) => V2,
): Record<K, V2> {
  const obj: Record<K, V2> = {} as any;
  for (const k in data) obj[k as K] = func(data[k as K]);
  return obj;
}

export const keys = <K extends string>(data: Record<K, any>) => Object.keys(data) as K[];

/**
 * 简易的url构造器
 * @param arg 路径
 * @returns url
 */
export function makeUrl(...arg: [...(readonly string[])]): string;
/**
 * 简易的url构造器
 * @param arg 路径+参数
 * @returns url
 */
export function makeUrl(
  ...arg: [...(readonly string[]), Record<string, string | number | boolean | undefined>]
): string;
export function makeUrl(
  ...arg: (string | Record<string, string | number | boolean | undefined>)[]
): string {
  if (!(arg?.length > 0)) return '';
  const searchParams =
    typeof arg[arg.length - 1] === 'string'
      ? undefined
      : (arg.pop() as Record<string, string | number | boolean | undefined>);
  if (arg.length && arg[0] === '/') arg[0] = '';
  const search = searchParams
    ? Object.keys(searchParams)
        .filter((k) => searchParams[k] !== undefined)
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(searchParams[k] as string)}`)
        .join('&')
    : '';
  return arg.join('/') + (search && '?' + search);
}
