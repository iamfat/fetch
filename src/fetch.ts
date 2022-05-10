class ResponseError extends Error {
    private response: Response;
    code: number;
    constructor(r: Response) {
        super(r.statusText);
        this.code = r.status;
        this.response = r;
    }

    json() {
        return this.response.json();
    }

    text() {
        return this.response.text();
    }

    blob() {
        return this.response.blob();
    }

    buffer() {
        return this.response.arrayBuffer();
    }
}

type RequestInitEx = Omit<RequestInit, 'body'> & {
    body?: any;
    timeout?: number;
    json?: boolean;
    blob?: boolean;
    buffer?: boolean;
};

let overrideHTTPMethod = false;

function enableHTTPMethodOveride(enable: boolean) {
    overrideHTTPMethod = enable;
}

export { enableHTTPMethodOveride, ResponseError };

export default (fetch: (url: any, init?: any) => Promise<any>) => {
    function isPlainObject(obj: any) {
        if (typeof obj !== 'object' || obj === null) return false;

        let proto = obj;
        while (Object.getPrototypeOf(proto) !== null) {
            proto = Object.getPrototypeOf(proto);
        }

        return Object.getPrototypeOf(obj) === proto;
    }

    return function fetchEx<T>(url: RequestInfo, initEx?: RequestInitEx): Promise<T> {
        const { timeout = 5000, json = true, blob, buffer, ...init } = { headers: {}, ...initEx };
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

        if (isPlainObject(init.body)) {
            init.body = JSON.stringify(init.body);
        }

        return new Promise((resolve, reject) => {
            let timeoutHandler: any;
            if (timeout > 0) {
                timeoutHandler = setTimeout(() => {
                    reject(new Error(`Fetch ${url} timeout for ${timeout}ms.`));
                }, timeout);
            }
            fetch(url, init)
                .then((r) => {
                    if (!r.ok) {
                        reject(new ResponseError(r));
                        return;
                    }
                    return json ? r.json() : blob ? r.blob() : buffer ? r.arrayBuffer() : r.text();
                })
                .then((r) => {
                    if (timeoutHandler) clearTimeout(timeoutHandler);
                    resolve(r as T);
                })
                .catch(reject);
        });
    };
};
