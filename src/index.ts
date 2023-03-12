export { enableHTTPMethodOveride, ResponseError } from './fetch';

import extendFetch, { RequestInit } from './fetch';
import type { RequestInfo, RequestInit as NodeRequestInit } from 'node-fetch';

export type { RequestInit };

const fetchEx = extendFetch((url: RequestInfo, init: NodeRequestInit) => {
    const abortController = new AbortController();
    const promise: any = import('node-fetch').then((it) =>
        it.default(url, { ...init, signal: abortController.signal }),
    );
    promise.abort = () => abortController.abort();
    return promise;
}) as <T>(url: RequestInfo, initEx?: RequestInit) => Promise<T> & { abort: () => void };

export { fetchEx as fetchEx };
export default fetchEx;
