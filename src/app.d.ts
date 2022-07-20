/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
  interface Locals {
    userid: string;
  }

  // interface Platform {}

  interface Session {
    /**网站标题 */
    WEB_NAME: string;
    /**用户数据(UserInfo) */
    user: any;
    /**登录平台, 仅在用户数据存在时存在 */
    type: string | undefined;
  }

  // interface Stuff {}
}
