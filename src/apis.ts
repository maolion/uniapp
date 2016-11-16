import App, { Options as AppOptions } from './components/app/index';
import fetch from './libs/fetch';

export function initAPIs(options: AppOptions, app: App) {
    const apis: any = {};
    const apiMap = options.apiMap;
    const apiHost = options.config.apiHost.replace(/\/$/, '');
    
    for (let partName of Object.keys(apiMap)) {
        let part = apiMap[partName];
        let obj: any = apis[partName] = {};
        for (let apiName of Object.keys(part)) {
            obj[apiName] = getApiHandler(part[apiName]);
        }
    }

    return apis;
    function getApiHandler(apiInfo: any) {
        apiInfo.url = (apiInfo.url||'').charAt(0) == '/' ? apiInfo.url : '/' + apiInfo.url;
        return function(data?: any) {
            return fetch(`${apiHost}${apiInfo.url}`, {
                method: apiInfo.method,
                body: data,
                rapConfig: (options.config||{} as any).RAP
            });
        };
    }
}