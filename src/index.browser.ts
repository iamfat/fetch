export * from './fetch';
import extendFetch, { RequestInit } from './fetch';

const fetch = extendFetch((url: RequestInfo, init: RequestInit) => {
    const abortController = new window.AbortController();
    const promise: any = window.fetch(url, { ...init, signal: abortController.signal });
    promise.abort = () => abortController.abort();
    return promise;
}) as <T>(url: RequestInfo, initEx?: RequestInit) => Promise<T> & { abort: () => void };

export type { RequestInit };
export { fetch };
export default fetch;
