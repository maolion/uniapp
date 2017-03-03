import Plugin from '../modules/plugin';

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

/** 项目配置参数 */
export interface ApplicationConfiguration {
    /** redux store 实例 */
    store?: Redux.Store<any>;
    /** app 插件列表 */
    plugins: Plugin[];
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