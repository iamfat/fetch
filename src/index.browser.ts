export * from './fetch';
import extendFetch, { RequestInit } from './fetch';

const fetch = extendFetch(window.fetch) as <T>(url: RequestInfo, initEx?: RequestInit) => Promise<T>;
export type { RequestInit };
export { fetch };
export default fetch;
