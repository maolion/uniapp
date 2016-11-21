export interface HashMap<T> {
    [key: string]: T;
}

/**
 * Flux Standard Action
 * @see https://github.com/acdlite/flux-standard-action
 */
export interface StoreAction {
    type: string,
    meta: any,
    error: boolean,
    payload: Object
}

/** 请求配置参数 */
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

/** 项目配置参数 */
export interface FrameworkConfiguration {
    appName: string;
    version: string;
    router: JSX.Element;
    actions: HashMap<any>;
    env: string;
}

/**
 * action handler 配置信息
 */
export interface ActionHandlerOptions {
    name?: string;
    storeKey?: string;
    method?: "overwrite"|"update"|"remove";
    actionHandler?: (data: any) => any;
    dataType?: "origin" | "immutable";
}