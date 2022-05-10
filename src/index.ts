export * from './fetch';

import extendFetch, { RequestInit } from './fetch';
import type { RequestInfo, RequestInit as NodeRequestInit } from 'node-fetch';

export type { RequestInit };

const fetch = extendFetch((url: RequestInfo, init: NodeRequestInit) =>
    import('node-fetch').then((it) => it.default(url, init)),
) as <T>(url: RequestInfo, initEx?: RequestInit) => Promise<T>;

export { fetch };
export default fetch;
