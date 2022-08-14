import type { ParamMatcher } from '@sveltejs/kit';
const int = /^-?[0-9]+$/;
export const match: ParamMatcher = (param) => {
  return int.test(param);
};
