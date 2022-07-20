import { nameLimit } from '$lib/def/Project';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return nameLimit.test(param);
};
