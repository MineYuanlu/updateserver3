import type { RequestHandler } from '@sveltejs/kit';
import { getAllTypes } from '$lib/db/Project';
/** @returns 所有类型 */
export const GET: RequestHandler = async () => {
  return { body: await getAllTypes() };
};
