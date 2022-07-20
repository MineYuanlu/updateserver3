/** GitLu 地址 */
export const gitlu = 'https://git.yuanlu.bid';
/** 项目地址 */
export const self = `${gitlu}/yuanlu/UpdateServer`;

/** 相关项目 */
export interface AboutProject {
  name: string;
  description: string;
  href: string;
}

/** 相关项目 */
export const projects: AboutProject[] = [
  {
    name: 'UpdaterClient-core',
    description: 'Java 版的更新客户端核心',
    href: `${gitlu}/yuanlu/UpdaterClient-core`,
  },
  {
    name: 'UpdaterClient-bukkit',
    description: 'Minecraft Bukkit Plugin 版的更新客户端',
    href: `${gitlu}/yuanlu/UpdaterClient-bukkit`,
  },
];

/** 相关作者 */
export interface AboutAuthor {
  name: string;
  href: string;
}

/** 相关作者 */
export const authors: AboutAuthor[] = [
  {
    name: 'yuanlu',
    href: `${gitlu}/yuanlu`,
  },
  {
    name: 'Msv777',
    href: `${gitlu}/msv`,
  },
  {
    name: 'soy_bottle',
    href: `${gitlu}/soy_bottle`,
  },
];
