import { FrameworkConfiguration } from './types';
import fetch from './libs/fetch';

/** 
 * 安装 api, 内部接口
 */
export function _mount(apiMap: any, apiRequestHandler = fetch) {
    const apis: any = exports;

    for (let partName of Object.keys(apiMap)) {
        let part = apiMap[partName];
        let obj: any = apis[partName] = {};
        for (let apiName of Object.keys(part)) {
            obj[apiName] = getApiHandler(part[apiName]);
        }
    }

    delete exports._mount;

    return apis;

    function getApiHandler(apiInfo: { url: string; method: any }) {
        return function(data?: any) {
            return apiRequestHandler(apiInfo.url, {
                method: apiInfo.method,
                body: data
            });
        };
    }
}