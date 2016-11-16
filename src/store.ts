import App from './components/app/index';

export interface ActionOptions {
    name?: string;
    storeKey?: string;
    method?: "overwrite"|"update"|"remove";
    actionHandler?: (data: any) => any;
    flushState?: boolean;
}

export class ActionHandlers {
    static __actions__: ActionOptions[];
}

interface ActionContext {
    name: string,
    context?: ActionContext
}

let appInstance: App;

/** @internal */
export function bind(app: App) {
    if (!appInstance) {
        appInstance = app;
    }
    return appInstance;
}

export function get<T>(ns: string): T {
    return appInstance.store.get<T>(ns);
}

export function action(options?: ActionOptions) {
    options = options || {};
    return function(target: any, name: string) {
        target.__actions__ = target.__actions__ || [];
        target.__actions__.push({
            name,
            actionHandler: target[name],
            method: options.method || (options.storeKey && 'overwrite' || null),
            flushState: options.flushState,
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