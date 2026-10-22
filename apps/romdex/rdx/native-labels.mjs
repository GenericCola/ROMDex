import {ensure} from './limits.mjs';
export const contentTitle=r=>'[RDX '+r.kind+'] '+(r.current.payload.overrides?.displayName||r.current.payload.name);
export function contentName(summary,kind){const prefix=summary.match(/^\[RDX(?: ([a-z]+))?\] /);if(prefix?.[1])ensure(prefix[1]===kind,'REVIEW_REQUIRED','The Native Kind Label Disagrees With the Content Record.');return prefix?summary.slice(prefix[0].length):summary;}
