/**
 * Thanks for Liang Jingfan
 * https://gitee.com/wtto00/badge
 * 2021-09-28
 * */
const chars: Record<string, number> = {
  a: 66,
  b: 69,
  c: 57,
  d: 69,
  e: 66,
  f: 39,
  g: 69,
  h: 70,
  i: 30,
  j: 38,
  k: 65,
  l: 30,
  m: 110,
  n: 70,
  o: 67,
  p: 69,
  q: 69,
  r: 47,
  s: 57,
  t: 43,
  u: 70,
  v: 65,
  w: 90,
  x: 65,
  y: 65,
  z: 58,
  A: 75,
  B: 75,
  C: 77,
  D: 85,
  E: 70,
  F: 63,
  G: 85,
  H: 83,
  I: 46,
  J: 50,
  K: 76,
  L: 61,
  M: 93,
  N: 82,
  O: 87,
  P: 66,
  Q: 87,
  R: 76,
  S: 75,
  T: 68,
  U: 81,
  V: 75,
  W: 110,
  X: 75,
  Y: 68,
  Z: 75,
  ' ': 39,
  '!': 43,
  '"': 50,
  '%': 120,
  $: 70,
  '#': 90,
  '&': 80,
  "'": 30,
  '(': 50,
  ')': 50,
  '*': 70,
  '+': 90,
  ',': 40,
  '-': 50,
  '/': 50,
  ':': 50,
  ';': 50,
  '<': 90,
  '=': 90,
  '>': 90,
  '?': 60,
  '@': 110,
  '[': 50,
  '\\': 50,
  ']': 50,
  '^': 90,
  _: 70,
  '`': 70,
  '{': 70,
  '|': 50,
  '}': 70,
  '~': 90,
  '0': 70,
  '.': 40,
};
export const colors: Record<string, string> = {
  blue: '#08c',
  cyan: '#1bc',
  green: '#3c1',
  yellow: '#db1',
  orange: '#f73',
  red: '#e43',
  pink: '#e5b',
  purple: '#94e',
  grey: '#999',
  black: '#2a2a2a',
};
export type Option = {
  scale?: string | number;
  subject?: string;
  status?: string;
  color?: string;
  labelColor?: string;
};
/**
 * 获取字符串的宽度
 * @param {string} text 字符串
 * @return 宽度
 */
const getTextLength = (text: string): number => {
  let width = 0;
  for (const t of `${text}`) {
    if (t >= '0' && t <= '9') {
      width += 70;
    } else if (t >= ' ' && t <= '~') {
      width += chars[t] || 0;
    } else {
      width += 110;
    }
  }
  return width;
};
/**
 * 处理请求
 * @param {Option} query 请求选项
 * @return 处理结果
 * */
const handleQuery = (query: Option) => {
  for (const key in query) {
    const value = query[key as keyof Option];
    if (key === 'label') {
      query.subject = typeof value === 'number' ? `${value}` : value;
    } else if (key === 'list') {
      query.status = query.status!.replace(/,/g, ` ${value} `);
    } else {
      query[key as keyof Option] = value as any;
    }
  }
  return query;
};
/**
 * 获取svg元素
 * @param {Option} query
 * @return {string} svg
 */
function getSvg(query: Option): string {
  const subjectLength = getTextLength(query.subject!);
  const statusLength = getTextLength(query.status!);
  const color = query.color!.startsWith('#') ? query.color : colors[query.color!] || colors.blue;
  const labelColor = colors[query.labelColor!] || '#555';
  const textPosition = subjectLength === 0 ? 12 : 60;
  let width = (subjectLength + statusLength + 140 + textPosition) / 10,
    height = 20;
  if (!isNaN(query.scale as any)) {
    width *= Number(query.scale);
    height *= Number(query.scale);
  }

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${
    subjectLength + statusLength + 140 + textPosition
  } 200" xmlns="http://www.w3.org/2000/svg">
   <linearGradient id="badge" x2="0" y2="100%">
     <stop offset="0" stop-opacity=".1" stop-color="#EEE"/>
     <stop offset="1" stop-opacity=".1"/>
   </linearGradient>
   <mask id="mask"><rect width="${
     subjectLength + statusLength + 140 + textPosition
   }" height="200" rx="30" fill="#FFF"/></mask>
   <g mask="url(#mask)">
     <rect width="${subjectLength + 40 + textPosition}" height="200" fill="${labelColor}"/>
     <rect width="${statusLength + 100}" height="200" fill="${color}" x="${
    subjectLength + 40 + textPosition
  }"/>
     <rect width="${
       subjectLength + statusLength + 140 + textPosition
     }" height="200" fill="url(#badge)"/>
   </g>
   <g fill="#fff" text-anchor="start" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
     <text x="${textPosition}" y="148" textLength="${subjectLength}" fill="#000" opacity="0.25">${
    query.subject
  }</text>
     <text x="${textPosition - 10}" y="138" textLength="${subjectLength}">${query.subject}</text>
     <text x="${
       subjectLength + 95 + textPosition
     }" y="148" textLength="${statusLength}" fill="#000" opacity="0.25">${query.status}</text>
     <text x="${subjectLength + 85 + textPosition}" y="138" textLength="${statusLength}">${
    query.status
  }</text>
   </g>
 </svg>`;
}
export { handleQuery, getSvg };
