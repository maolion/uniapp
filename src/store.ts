import * as Immutable from 'immutable';

import { 
    createStore,
    combineReducers
} from 'redux';

import * as Utils from './utils';

import { 
    ActionHandlerOptions,
    StoreAction,
    HashMap 
} from './types';

import {
    STORE_OVERWRITE,
    STORE_REMOVE,
    STORE_UPDATE,
    IMMUTABLE_DATA,
    ORIGIN_DATA
} from './constants';

interface ActionContext {
    name: string,
    context?: ActionContext
}

let store: Redux.Store<any>;

export class ActionHandlers {
    static __$qmox_actions__: ActionHandlerOptions[];
}

/**
 * action方法 装饰器
 */
export function action(options?: ActionHandlerOptions) {
    options = options || {};

    return function(target: any, name: string) {
        target.__$qmox_actions__ = target.__$qmox_actions__ || [];
        target.__$qmox_actions__.push({
            name,
            actionHandler: target[name],
            method: options.method || (options.storeKey && 'overwrite' || null),
            dataType: options.dataType || IMMUTABLE_DATA,
            storeKey: options.storeKey ? 
                resolveStoreKey(options.storeKey, {
                    name: target.name
                }) : 
                null
        });
    }
}

export function getState() {
    return store.getState();
}

export function get(keyPath: string | string[]) {
    let fixedKeyPath = typeof keyPath === 'string' ? Utils.String.format(keyPath, {}).split(".") : keyPath.join('.');
    return getLeafObject(fixedKeyPath).value;
}

export function dispatch(action: any) {
    return store.dispatch(action);
}

/**
 * 安装store 内部接口
 */
export function _mount(
    reducerMapping: HashMap<Redux.Reducer<any>>, 
    preloadedState: any, 
    enhancer: Redux.StoreEnhancer<any>
) {
    if (reducerMapping && reducerMapping['appData']) {
        console.warn('qmox mount store:: Ignore "appData" reducer!');
    }

    store = createStore(
        combineReducers(Object.assign({}, reducerMapping, { appData: appDataReducer })),
        preloadedState,
        enhancer
    );

    delete exports._mount;

    return store;
}

function resolveStoreKey(key: string, context: ActionContext) {
    let topKeys: string[] = [];
   
    while (context) {
        topKeys.push(context.name);
        context = context.context;
    }
    
    if (key.charAt(0) == '~') {
        topKeys.length = 0;
        topKeys.push(key.slice(1));
    } else {
        topKeys.reverse().push(key);
    }

    return topKeys.join('.');
}

function getLeafObject(keyPath: string[]) {
    let safKeyPath = keyPath.slice();
    let leafKey = safKeyPath.pop();

    let obj = store.getState();

    if (safKeyPath[0] && safKeyPath[0].charAt(0) === '~') {
        safKeyPath[0] = safKeyPath[0].slice(1);
        obj = store.getState().appData;
    }

    safKeyPath.reverse();

    while (safKeyPath.length) {
        let key = safKeyPath.pop();

        if (Utils.isImmutableData(obj)) {
            obj = obj.get(key);
            continue;
        }

        if (!obj[key] || typeof obj[key] != 'object') {
            obj = obj[key] = {};
        } else {
            obj = obj[key];
        }
    }

    return {
        key: leafKey,
        value: obj[leafKey],
        parent: obj
    };
}

function appDataReducer(state: Immutable.Map<string, any> = Immutable.fromJS({}), action: StoreAction) {
    let keyPath = Utils.String.format(action.meta.storeKey, action.meta.param).split(".");
    let data = action.payload;
    
    switch (action.type) {
        case STORE_OVERWRITE:
        case STORE_UPDATE:
            if (action.meta.dataType === IMMUTABLE_DATA && !Utils.isImmutableData(action.payload)) {
                data = Immutable.fromJS(data);
            }

            return state.setIn(keyPath, data);

        case STORE_REMOVE: 
            return state.removeIn(keyPath);
    }

    return state;
}

