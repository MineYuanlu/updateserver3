import { getProjectInternalByName } from '$db/Prisma';
import { newVersion } from '$db/Project';
import type { actions, platfroms } from '$def/hook';
import type { Project } from '$def/Project';
import type { UserInfoPublic } from '$def/User';
import type { Assets } from '$def/Version';
import type { versions } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { createHmac } from 'crypto';

/**
 * webhook
 */
export const POST: RequestHandler = async (event) => {
  const { platform, action, type, name } = event.params;

  /**平台信息 */
  const platformData = handlers[platform as typeof platfroms[number]];
  if (!platformData) return { status: 404, body: 'Unknown Platform' };

  /**操作信息 */
  const actionData = platformData.actions[action as typeof actions[number]];
  if (!actionData) return { status: 404, body: 'Unknown Action' };

  if (actionData.event != event.request.headers.get(platformData.eventHeader))
    return { status: 400, body: 'Bad Event' };

  /**请求原文 */
  let txt: string;
  /**请求体 */
  let body: any;
  try {
    txt = await event.request.text();
    body = JSON.parse(txt);
  } catch (err) {
    return { status: 400, body: 'Can not parse body' };
  }
  if (!body) return { status: 400, body: 'Empty body' };

  /**项目数据 */
  const project = await getProjectInternalByName(type, name);
  if (!project) return { status: 404, body: 'Project Not Found' };
  if (!project.token) return { status: 423, body: 'Project Not Configured' };
  if (!platformData.signature(txt, project.token, event))
    return { status: 403, body: 'Bad Signature' };

  return actionData.execute(body, project, platform);
};

type Platfrom = {
  /** 事件的header标识 */
  eventHeader: string;
  /**
   * 验证签名
   * @param body 正文内容原文
   * @param local_token 本地存储的密钥
   * @param event 请求事件
   * @returns 是否通过签名验证
   */
  signature: (body: string, local_token: string, event: Parameters<RequestHandler>[0]) => boolean;
  /** 所有操作 */
  actions: Record<typeof actions[number], Handler>;
};
/**
 * 处理器
 */
type Handler = {
  /** 指向事件 */
  event: string;
  /**
   * 执行处理
   * @param body 正文内容(解析后)
   * @param project 项目数据
   */
  execute: (
    body: any,
    project: Project<UserInfoPublic, versions>,
    platform: string,
  ) => ReturnType<RequestHandler>;
};
/**
 * 所有的处理器
 */
const handlers: Record<typeof platfroms[number], Platfrom> = {
  /**gitea相关 */
  gitea: {
    eventHeader: 'X-Gitea-Event',
    signature: (body, local_token, event) =>
      createHmac('sha256', local_token).update(body).digest('hex').toLowerCase() ===
      (event.request.headers.get('X-Gitea-Signature') || '').toLowerCase(),
    actions: {
      release: {
        event: 'release',
        async execute({ release }, project, platform) {
          if (!release) return { status: 400, body: 'Bad Body' };

          const assets: Assets | null = release.assets ? {} : null;
          if (assets && Array.isArray(release.assets)) {
            (release.assets as { name: string; browser_download_url: string }[]).forEach(
              ({ name, browser_download_url }) => {
                if (name && browser_download_url) assets[name] = browser_download_url;
              },
            );
          }

          const { tag_name, prerelease } = release;
          await newVersion(project, tag_name, prerelease, platform, assets);

          return { body: 'success' };
        },
      },
    },
  },
  /**github相关 */
  github: {
    eventHeader: 'X-GitHub-Event',
    signature: (body, local_token, event) =>
      createHmac('sha256', local_token).update(body).digest('hex').toLowerCase() ===
      (event.request.headers.get('X-Hub-Signature-256') || '')
        .toLowerCase()
        .replace(/^sha256=/, ''),
    actions: {
      release: {
        event: 'release',
        async execute({ release }, project, platform) {
          if (!release) return { status: 400, body: 'Bad Body' };

          const assets: Assets | null = release.assets ? {} : null;
          if (assets && Array.isArray(release.assets)) {
            (release.assets as { name: string; browser_download_url: string }[]).forEach(
              ({ name, browser_download_url }) => {
                if (name && browser_download_url) assets[name] = browser_download_url;
              },
            );
          }

          const { tag_name, prerelease } = release;
          await newVersion(project, tag_name, prerelease, platform, assets);

          return { body: 'success' };
        },
      },
    },
  },
};
