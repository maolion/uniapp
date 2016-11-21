import * as MockJS from 'mockjs';

import { HashMap } from '../types';
import * as cache from '../cache';

interface CacheItem {
    rap: RAP;
    request: Promise<Response>;
}

const RAPInstacheCacheMapping: HashMap<Promise<RAP>> = {}; 

const PARAM_REG = /\/:[^\/]*/g;

/** 不拦截任何请求 */
export const DISABLED = 0;
/** 拦截全部请求 */
export const BLOCK_ALL = 1;
/** 黑名单中的项不拦截 */
export const BLOCK_WITHOUT_BLACK_LIST = 2;
/** 仅拦截白名单中的项 */
export const BLOCK_ONLY_WHITE_LIST = 3;

export class RAP {
    private _option: any;
    public whiteList: any[];
    public blackList: any[];
    public mode: number;
    public projectId: number;
    public prefix: string;

    constructor(option: { host: string; id: number, whiteList: any[], mode: number }) {
        this._option = option;
        this.projectId = option.id;
        this.blackList = [];
        this.whiteList = option.whiteList || [];
        this._initWhiteList();
        this.prefix = `${option.host}/mockjs/${this.projectId}`;
        this.mode = option.mode;
        console.log('RAP: 已安装');
        console.log(`RAP: 工作模式: ${['不拦截任何请求', '拦截全部请求', '除黑名单之外的都拦截', '仅拦截白名单内的'][option.mode]}`);
        console.log('RAP: 白名单', this.whiteList);
        console.log('RAP: 嘿名单', this.blackList);
    }

    public router(url: string) {
        if (url && url.indexOf('?') !== -1) {
            url = url.substring(0, url.indexOf('?'));
        }
        url = convertUrlToRelative(url);

        if (!url || typeof url !== 'string') {
            console.warn('Illegal url:', url);
            return false;
        }
        
        switch (this.mode) {
            case DISABLED: return false;
            case BLOCK_ALL: return true;
            case BLOCK_WITHOUT_BLACK_LIST:
            case BLOCK_ONLY_WHITE_LIST:
                const blackMode = this.mode === BLOCK_WITHOUT_BLACK_LIST;
                const list = blackMode ? this.blackList : this.whiteList;

                for (let i = 0, l = list.length; i < l; i++) {
                    const cUrl = convertUrlToRelative(url);
                    if ( typeof cUrl === 'string' 
                      && (url.indexOf(cUrl) >= 0 || cUrl.indexOf(url) >= 0)
                    ) {
                        return !blackMode;
                    } else if (
                        typeof cUrl === 'object' && cUrl instanceof RegExp && cUrl.test(url)
                    ) {
                        return !blackMode;
                    }
                }

                return blackMode;
        }

        return false;
    }

    public isInWhiteList(url: string) {
        const whiteList = this.whiteList; 
        let o: any;
        url = convertUrlToRelative(url);
        for (let i = 0, l = whiteList.length; i < l; i++) {
            o = whiteList[i];
            if (typeof o === 'string' && 
                new RegExp(o.replace(/^([^?#]+)\?.*\{_method}=([^#&]+)/i, '$1(?:\\?_method=$2|\\?.*&_method=$2)')).test(url)) {
                return true;
            } else if (typeof o === 'object' && o instanceof RegExp && o.test(url)) {
                return true;
            }
        }
        
        return false;
    }

    private _initWhiteList() {
        const whiteList: any[] = this.whiteList;

        for (let i = 0, l = whiteList.length; i < l; i++) {
            let item = whiteList[i];
            if (typeof item === 'string') {
                if (PARAM_REG.test(item)) {
                    item = new RegExp(item.replace(PARAM_REG, '/\\d+'));
                    whiteList[i] = item;
                } else if (item.indexOf('reg:') !== -1) {
                    item = item.replace('reg:', '');
                    item = new RegExp(item);
                    whiteList[i] = item;
                }
            }
        }

        this.whiteList = whiteList;
    }
}

export async function getModel(host: string, projectId: number, mode: number) {
    const url = `${host}/mock/getWhiteList.do?projectId=${projectId}#mode=${mode}`;

    if (RAPInstacheCacheMapping[url]) {
        return RAPInstacheCacheMapping[url];
    }

    const ret = RAPInstacheCacheMapping[url] = _getModel(url, host, projectId, mode);
    return await ret;
}

async function _getModel(url: string, host: string, projectId: number, mode: number) {
    let requestPromise: any;
    let fromCache: boolean;
    let cachekey = encodeURIComponent(url);

    let whiteList: any[];

    try {
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        whiteList = await response.json();
    } catch (e) {
        whiteList = JSON.parse(await cache.get(cachekey));
        fromCache = true;
        console.log("get rap whiteList from local cache.");
    }

    if (!fromCache) {
        cache.set(cachekey, JSON.stringify(whiteList));
    }

    return new RAP({host, id: projectId, whiteList, mode });
}

export function convertUrlToRelative(url: any) {
    if (url instanceof RegExp) {
        return url;
    }
    if (!url) {
        throw Error('Illegal url:' + url);
    }
    if (url.indexOf('http://') > -1) {
        url = url.substring(url.indexOf('/', 7) + 1);
    } else if (url.indexOf('https://') > -1) {
        url = url.substring(url.indexOf('/', 8) + 1);
    }
    if (url.charAt(0) != '/') {
        url = '/' + url;
    }
    return url;
}


export function checkerHandler(response: { data: any; url: string }, mockData: any) {
    mockData = MockJS.mock(mockData);
    if (mockData.__root__) {
        mockData = mockData.__root__;
    }
    let realData = response.data;
    let validator = new StructureValidator(realData, mockData);
    let result = validator.getResult();
    let realDataResult = result.left;
    let rapDataResult = result.right;
    var log: string[] = [];
    var error = false;

    if (realDataResult.length === 0 && rapDataResult.length === 0) {
        log.push('接口结构校验完毕，未发现问题。');
    } else {
        error = true;
        if (response.url) {
            log.push('在校验接口' + response.url + '时发现错误:');
        }
        for (let i = 0, l = realDataResult.length; i < l; i++) {
            log.push(StructureValidator.validatorResultLog(realDataResult[i]));
        }
        for (let i = 0, l = rapDataResult.length; i < l; i++) {
            log.push(StructureValidator.validatorResultLog(rapDataResult[i], true));
        }
    }

    console.info(log.join('\n'));
    if (error === true) {
        console.log('真实数据:');
        console.dir(response.data);
    }
}



const LOST = "LOST";
const EMPTY_ARRAY = "EMPTY_ARRAY";
const TYPE_NOT_EQUAL = "TYPE_NOT_EQUAL";

class StructureValidator {
    public o1: any;
    public o2: any;
    public left: any;
    public right: any;
    public url: string;
    
    constructor(o1: any, o2: any, leftName?: string, rightName?: string) {
        if (typeof o1 === 'string') {
            try {
                o1 = JSON.parse(o1);
            } catch (ex) {
            }
        }

        if (typeof o2 === 'string') {
            try {
                o2 = JSON.parse(o2);
            } catch (ex) {
            }
        }

        if (!leftName) {
            leftName = 'obj';
        }
        if (!rightName) {
            rightName = 'obj';
        }
        
        this.o1 = o1;
        this.o2 = o2;
        this._check(o2, o1, 'left', leftName, true);
        this._check(o1, o2, 'right', rightName);
    }

    getResult() {
        return {
            left: this.left,
            right: this.right
        };
    }

    getResultStr() {
        let result = this.getResult();
        let left = result.left;
        let right = result.right;
        let log: string[] = [];

        if (left.length === 0 && right.length === 0) {
            log.push('接口结构校验完毕，未发现问题。');
        } else {
            if (this.url) {
                log.push('在校验接口' + this.url + '时发现错误:');
            }
            for (let i = 0, l = left.length; i < l; i++) {
                log.push(StructureValidator.validatorResultLog(left[i]));
            }
            for (let i = 0, l = right.length; i < l; i++) {
                log.push(StructureValidator.validatorResultLog(right[i], true));
            }
        }

        return log.join("\n");

    }

    private _check(o1: any, o2: any, key: any, keyName: any, isReverseCheck?: any) {
        let result: any = [];

        function typeEqual(a: any, b: any) {
            if (typeof a != typeof b) {
                return false;
            }

            let m = {}.toString;

            if (m.apply(a) != m.apply(b)) {
                return false;
            }
            return true;
        }

        function isObject(o: any) {
            return o && typeof o === 'object';
        }

        function isArrayObject(o: any) {
            return isObject(o) && {}.toString.apply(o) === "[object Array]";
        }

        function checkStructure(oa: any, ob: any, ns: any, ret?: any) {
            let p: any;
            let l: any;
            let r: any;
            
            for (p in oa) {
                if (oa.hasOwnProperty(p)) {
                    if (!ob.hasOwnProperty(p)) {
                        result.push({
                            type: LOST,
                            property: p,
                            namespace: ns
                        });
                    } else if (!typeEqual(oa[p], ob[p])) {
                        if (!isReverseCheck) {
                            result.push({
                                type: TYPE_NOT_EQUAL,
                                property: p,
                                namespace: ns
                            });
                        }
                    } else if (isArrayObject(oa[p]) && isArrayObject(ob[p])) {
                        var la = oa[p];
                        var lb = ob[p];

                        var length = la.length > lb.length ? la.length : lb.length;


                        for (var i = 0; i < length; i++) {
                            // if la[i] is null, using the first element instead
                            l = la[i] ? la[i] : la[0];
                            r = lb[i] ? lb[i] : lb[0];
                            if (l && r && isObject(l) && isObject(r)) {
                                checkStructure(l, r, ns + '.' + p + '[' + i + ']');
                            } else if (l && !r) {
                                result.push({
                                    type: EMPTY_ARRAY,
                                    property: p,
                                    namespace: ns
                                });
                            }
                        }

                    } else if (isObject(oa[p]) && isObject(ob[p])) {
                        checkStructure(oa[p], ob[p], ns + '.' + p);
                    }
                }
            }
        }

        checkStructure(o1, o2, keyName, result);
        (this as any)[key] = result;
    }


    static validatorResultLog(item: any, isReverse?: boolean) {
        let eventName: any;
        if (item.type === LOST) {
            eventName = isReverse ? '未在接口文档中未定义。' : '缺失';
        } else if (item.type === EMPTY_ARRAY) {
            eventName = '数组为空，无法判断其内部的结构。';
            return; // 暂时忽略此种情况
        } else if (item.type === TYPE_NOT_EQUAL) {
            eventName = '数据类型与接口文档中的定义不符';
        }
        return '参数 ' + item.namespace + "." + item.property + ' ' + eventName;
    }
}
