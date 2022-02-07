export * from './fetch';
export { Response } from 'node-fetch';

import extendFetch from './fetch';
import type { RequestInfo, RequestInit } from 'node-fetch';

type RequestInitEx = Omit<RequestInit, 'body'> & {
    body?: any;
    timeout?: number;
    json?: boolean;
};
export type { RequestInitEx as RequestInit };

const fetch = extendFetch((url: RequestInfo, init: RequestInit) =>
    import('node-fetch').then((it) => it.default(url, init)),
) as <T>(url: RequestInfo, initEx?: RequestInitEx) => Promise<T>;

export { fetch };
export default fetch;
