export * from './fetch';
import extendFetch from './fetch';

type RequestInitEx = Omit<RequestInit, 'body'> & {
    body?: any;
    timeout?: number;
    json?: boolean;
};

const fetch = extendFetch(window.fetch) as <T>(url: RequestInfo, initEx?: RequestInitEx) => Promise<T>;
export type { RequestInitEx as RequestInit };
export { fetch };
export default fetch;
