class ResponseError extends Error {
    response: Response;
    body: any;
    code: number;

    constructor(r: Response, body?: any) {
        super(r.statusText);
        this.code = r.status;
        this.response = r;
        this.body = body;
    }
}

type RequestInitEx = Omit<RequestInit, 'body'> & {
    body?: any;
    timeout?: number;
    text?: boolean;
    json?: boolean;
    blob?: boolean;
    buffer?: boolean;
};

let overrideHTTPMethod = false;

function enableHTTPMethodOveride(enable: boolean) {
    overrideHTTPMethod = enable;
}

export { enableHTTPMethodOveride, ResponseError, RequestInitEx as RequestInit };

export default (fetch: (url: any, init?: any) => Promise<any> & { abort: () => void }) => {
    function isPlainObject(obj: any) {
        if (typeof obj !== 'object' || obj === null) return false;

        let proto = obj;
        while (Object.getPrototypeOf(proto) !== null) {
            proto = Object.getPrototypeOf(proto);
        }

        return Object.getPrototypeOf(obj) === proto;
    }

    return function fetchEx<T>(url: RequestInfo, initEx?: RequestInitEx): Promise<T> {
        const { timeout = 5000, json, text, blob, buffer, ...init } = { headers: {}, ...initEx };
        if (init.method) {
            const method = init.method.toUpperCase();
            if (['PUT', 'PATCH', 'DELETE'].includes(method) && overrideHTTPMethod) {
                init.headers = { ...init.headers, 'X-HTTP-Method-Override': method };
                init.method = 'POST';
            }
        }

        if (isPlainObject(init.body)) {
            init.headers['Content-Type'] = 'application/json;charset=UTF-8';
            init.body = JSON.stringify(init.body);
        }

        return new Promise((resolve, reject) => {
            let timeoutHandler: any;

            if (timeout > 0) {
                timeoutHandler = setTimeout(() => {
                    timeoutHandler = undefined;
                    promise.abort();
                    reject(new Error(`fetch ${url} timeout for ${timeout}ms.`));
                }, timeout);
            }

            const promise: Promise<Response> & { abort: () => void } = fetch(url, init);
            promise
                .then((r) => {
                    if (timeoutHandler) clearTimeout(timeoutHandler);
                    let method = blob ? 'blob' : buffer ? 'arrayBuffer' : json ? 'json' : text ? 'text' : undefined;
                    if (method === undefined) {
                        const [type] = (r.headers.get('Content-Type') || '').split(';');
                        const [majorType, minorType] = type.split('/');
                        if (majorType === 'application') {
                            if (minorType === 'json') {
                                method = 'json';
                            } else if (minorType === 'octet-stream') {
                                method = blob ? 'blob' : 'arrayBuffer';
                            } else {
                                method = 'text';
                            }
                        } else {
                            method = 'text';
                        }
                    }
                    return r[method]().then((body: any) => ({ r, body }));
                })
                .then(({ r, body }) => {
                    if (!r.ok) {
                        reject(new ResponseError(r, body));
                        return;
                    }
                    resolve(body as T);
                })
                .catch(reject);
        });
    };
};
