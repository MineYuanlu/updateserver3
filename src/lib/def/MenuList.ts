import { createEnum, expand } from './Tool';

/** 页面等级定义 */
export const PageLevel = expand(createEnum('anonymous', 'user', 'admin'));
export type PageLevel = typeof PageLevel[keyof typeof PageLevel];

/** 菜单元素 */
export interface MenuElement {
  /** 显示文字 */
  text: string;
  /** 图标名称 */
  icon?: string;
  /** 指向的链接 */
  href: string;
  /** 是否是隐藏的元素 */
  visible: boolean;
  /** 显示的最低等级 */
  lvl: PageLevel;
}
/** 菜单元素列表 */
export type MenuElements = MenuElement[];
/** 所有的菜单元素 */
export const AllMenuElements: MenuElements = [
  {
    text: '概况',
    icon: 'gaikuang',
    href: '/',
    visible: true,
    lvl: 0,
  },
  {
    text: '项目',
    icon: 'liebiao',
    href: '/project',
    visible: true,
    lvl: 1,
  },
  {
    text: '个人中心',
    icon: 'geren',
    href: '/usr',
    visible: true,
    lvl: 0,
  },
  {
    text: '关于',
    icon: 'guanyu',
    href: '/about',
    visible: true,
    lvl: 0,
  },
];
/** 按 {@link PageLevel} 过滤的菜单元素 */
export const LvlMenuElements: MenuElements[] = (() => {
  /**
   * 获取菜单元素
   * @param lvl 目标页面等级
   * @returns 所有符合等级的页面元素
   */
  function getMenuElements(lvl: PageLevel): MenuElements {
    const arr: MenuElements = [];
    AllMenuElements.filter((x) => x.lvl <= lvl).forEach((x) => arr.push(x));
    return arr;
  }
  const start = PageLevel.anonymous;
  const end = PageLevel.admin;
  const mes: MenuElements[] = new Array(end - start + 1);

  for (let i = start; i <= end; i++) mes[i] = getMenuElements(i);
  return mes;
})();
