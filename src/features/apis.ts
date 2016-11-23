import { FrameworkConfiguration } from '../types';
import fetch from '../libs/fetch';
import {
    HashMap,
    RESTfulHttpMethod
} from '../types';

export interface ApiInfo {
    url: string;
    method: RESTfulHttpMethod;
    schema?: any;
}

/**
 * APIs 功能模块, 根据 api 配置数据 生成 对应的可执行 api请求接口
 */
export default class APIs {
    private _apiRequestHandler = fetch;
    
    constructor(apiMap: any, apiRequestHandler = fetch) {
        this._apiRequestHandler = apiRequestHandler;
        return this._mapping(apiMap);
    }

    private _mapping(target: any) {
        let apis: any = {};

        for (let pathName of Object.keys(target)) {
            let apiInfo = target[pathName];
            if (!apiInfo) {
                continue;
            }

            if (apiInfo.method && apiInfo.url) {
                apis[pathName] = this._getApiHandler(apiInfo);
            }

            if (typeof apiInfo === 'object') {
                apis[pathName] = this._mapping(apiInfo);
            }
        }

        return apis;
    }

    private _getApiHandler(apiInfo: ApiInfo) {
        return (data?: any) => {
            return this._apiRequestHandler(apiInfo.url, {
                method: apiInfo.method,
                body: data
            });
        };
    }
}