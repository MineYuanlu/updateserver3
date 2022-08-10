import { browser } from '$app/env';

/**
 * 判断元素是否在可视范围内
 *
 * 在服务器端永远返回false
 * @param element  元素
 */
export const inWindow = (element: HTMLElement | undefined) => {
  if (!browser || !element) return false;
  // https://blog.csdn.net/qq_41548644/article/details/120980410
  const eh = element.clientHeight;
  const wh = document.documentElement.clientHeight;
  const wt = document.documentElement.scrollTop;

  let ele: HTMLElement | null = element;
  let et = 0;
  do {
    et += ele.offsetTop;
    ele = ele.offsetParent as any;
  } while (ele && ele !== document.body);
  return wt <= et + eh && wt >= et - wh;
};
