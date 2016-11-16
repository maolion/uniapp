import * as MockJS from 'mockjs';
import { HashMap } from '../types/index.d';
import * as RAP from '../libs/rap';
import { GLOBAL, IS_DEV, IS_DEBUG } from '../constants';

export interface RequestOptions {
    /** 请求 HTTP方法 */
    method?: "GET" | "POST" | "PATCH" | "DELETE";

    /** 设置 HTTP头 */
    headers?: HashMap<string>;

    /** 指定 JSON数据的解析器 */
    JSONParser?: (res: any) => any;
    
    /** 发送的body内容 */
    body?: any;

    /** 请求失败时 可以指定 一个容错处理的逻辑, 类是 HTML5 离线储存里 fallback的用途 */
    fallback?: (url: string, method: string, isFormRAP: boolean) => Promise<any>;

    /** 请求完成之后 被调用  */
    complete?: (responseJSON: any, responseText: string, url: string, method: string, isFormRAP: boolean) => void;

    /** 如果使用到RAP, 这里可以配置相关连接参数 */
    rapConfig?: {
        host: string;
        projectId: number;
    };
}

/** 响应请求错误信息 */
export class ResponseError extends Error {
    constructor(public code: number, public message: string) {
        super(message);
    }
}

/**
 * fetch 用于处理http 网络请求
 */
export default async function fetch(
    url: string, 
    options: RequestOptions, 
) {
    options = Object.assign({
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    }, options);

    let data = options.body;

    if (/^GET|HEAD$/i.test(options.method)) {
        // 像 get 这类请求类型 需要把 提交的数据项目附加到 url里
        delete options.body;
        if (data) {
            console.log(data);
            const paramStr = dataToParamStr(data);
            url += (url.indexOf('?') > -1 ? '&' : '?') + paramStr;
        }
    } else if (typeof options.body !== 'string') {
        options.body = JSON.stringify(options.body);
    }

    let rapConfig = options.rapConfig;
    let originMethod = options.method.toLocaleLowerCase();
    let originUrl = url;

    url = fixMethodParam(url, originMethod);

    let rap: RAP.RAP;
    let isFromRAP = false;
    let pathname: string;

    if (rapConfig && RAP.getModel) {
        rap = await RAP.getModel(
            rapConfig.host,
            rapConfig.projectId, 
            IS_DEV ? RAP.BLOCK_ONLY_WHITE_LIST : RAP.DISABLED
        ); 
    }

    if (rap) {
        url = RAP.convertUrlToRelative(url);
        isFromRAP = !IS_DEBUG && rap.router(url);
        if (isFromRAP) {
            url = rap.prefix + url;
            options.method = 'GET';
            options.JSONParser = jsTypeJSONParser;
            console.log(`RAP: 请求 ${url} 提交的参数:`, data || {});
        } else {
            url = fixMethodParam(originUrl, originMethod);
        }
    }

    let responseText: any = null;
    let isFromRAPCache: boolean;

    try {
        responseText = await _fetch(url, options);
    } catch (e) {
        if (options.fallback) {
            await options.fallback(url, originMethod, isFromRAP);
        }
    }

    let responseJSON: any = null;

    if (isFromRAP) {
        responseJSON = MockJS.mock(responseText);
        console.log(`RAP: 请求 ${url} 返回的Mock数据:`, responseText);
    }

    if (options.complete) {
        options.complete(responseJSON, responseText, url, originMethod, isFromRAP);
    }

    if (!isFromRAP && rap && rap.isInWhiteList(url)) {
        const realData = responseJSON;
        url = RAP.convertUrlToRelative(url);

        const mockData = _fetch(
            url, 
            Object.assign(
                {}, 
                options, 
                { method: "GET", JSONParser: jsTypeJSONParser }
            )
        );

        RAP.checkerHandler({ data: realData, url }, mockData);
    }

    return responseJSON;
}

async function _fetch(url: string, options: RequestOptions) {
    const res = await fetch(url, options);
    const resText = await res.text();
    const resJSON = (options.JSONParser || defaultJSONPaser)(resText);

    if (resJSON.meta && resJSON.meta.code != 0) {
        throw new ResponseError(resJSON.meta.code, resJSON.meta.msg);
    }
    
    return resJSON;
}

const METHOD_PARAM_REGEXP = /_method=[^&#]+/i;
function fixMethodParam(url: string, method: string) {
    if (METHOD_PARAM_REGEXP.test(url)) {
        return url.replace(/_method=[^&#]+/i, `_method=${method}`);
    } else {
        return url + (url.indexOf('?') > -1 ? '&' : '?') + `_method=${method}`;
    }
}

function defaultJSONPaser(res: any) {
    return JSON.parse(res);
}

function jsTypeJSONParser(res: any) {
    return (new Function(`return (${res})`))();
}

function dataToParamStr(data: any) {
    const kv: string[] = [];
    for (let key of Object.keys(data)) {
        kv.push(`${key}=${encodeURIComponent(data[key])}`);
    }
    return kv.join('&');
}
