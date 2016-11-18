import { FrameworkConfiguration } from './types';

export function initAPIs(options: FrameworkConfiguration) {
    const apis: any = {};
    const apiMap = options.apiMap;
    const apiHost = options.apiHost.replace(/\/$/, '');
    
    for (let partName of Object.keys(apiMap)) {
        let part = apiMap[partName];
        let obj: any = apis[partName] = {};
        for (let apiName of Object.keys(part)) {
            obj[apiName] = getApiHandler(part[apiName]);
        }
    }

    return apis;
    function getApiHandler(apiInfo: { url: string; method: any }) {
        apiInfo.url = (apiInfo.url||'').charAt(0) == '/' ? apiInfo.url : '/' + apiInfo.url;
        return function(data?: any) {
            return options.apiRequestHandler(apiHost + apiInfo.url, {
                method: apiInfo.method,
                body: data,
                rapConfig: options.RAP
            });
        };
    }
}