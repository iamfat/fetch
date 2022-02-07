export class ResponseError extends Error {
    code: number;
    constructor(r: Response) {
        super(r.statusText);
        this.code = r.status;
    }
}

export type RequestInitEx = Omit<RequestInit, 'body'> & {
    body: BodyInit | string | object;
    timeout?: number;
    json?: boolean;
};

let overrideHTTPMethod = false;

export const enableHTTPMethodOveride = (enable: boolean) => {
    overrideHTTPMethod = enable;
};

function fetchEx<T>(url: RequestInfo, initEx?: RequestInitEx): Promise<T> {
    const { timeout, json, ...init } = { timeout: 5000, json: true, ...(initEx || {}) };
    if (init.method) {
        const method = init.method.toUpperCase();
        if (['PUT', 'PATCH', 'DELETE'].includes(method) && overrideHTTPMethod) {
            init.headers = { ...init.headers, 'X-HTTP-Method-Override': method };
            init.method = 'POST';
        }
    }

    if (json) {
        init.headers['Content-Type'] = 'application/json';
    }

    if (init.body !== undefined && typeof init.body !== 'string') {
        init.body = JSON.stringify(init.body);
    }
    return new Promise((resolve, reject) => {
        let timeoutHandler: number;
        const { setTimeout, clearTimeout } = window;
        if (timeout > 0) {
            timeoutHandler = setTimeout(() => {
                reject(new Error(`Fetch ${url} timeout for ${timeout}ms.`));
            }, timeout);
        }
        fetch(url, init as RequestInit)
            .then((r) => {
                if (!r.ok) reject(new ResponseError(r));
                return json ? r.json() : r.text();
            })
            .then((r) => {
                if (timeoutHandler) clearTimeout(timeoutHandler);
                resolve(r as T);
            })
            .catch(reject);
    });
}

export { fetchEx as fetch };
export default fetchEx;
