import dotenv from 'dotenv';
dotenv.config();

export const NAME = process.env.NAME || '更新管理中心';
export const stdTTL = getInt(process.env.stdTTL, 2 * 60, 1);
export const saveTime = getInt(process.env.saveTime, 5 * 60, 1);

function getInt(v: string | undefined, def: number, min: number): number {
  const v0 = parseInt((v || NaN) as string);
  return v0 >= min ? v0 : def;
}
