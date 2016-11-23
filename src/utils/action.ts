import { 
    ActionHandlerOptions
} from '../types';

import {
    STORE_OVERWRITE,
    STORE_REMOVE,
    STORE_UPDATE,
    IMMUTABLE_DATA,
    ORIGIN_DATA
} from '../constants';

interface ActionContext {
    name: string,
    context?: ActionContext
}

export function dispatch() {
    
}

/**
 * action方法 装饰器
 */
export function handler(options?: ActionHandlerOptions) {
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