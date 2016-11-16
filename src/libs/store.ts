/**
 * 框架数据存储层
 * @author lion
 * @email maolion.j@gmail.com
 */
import * as Redux from 'redux';
import reduxThunk from 'redux-thunk';

export default class Store {

    public static OVERWRITE = "STORE_OVERWRITE_APP_TARGET_DATA";
    public static UPDATE = "STORE_UPDATE_APP_TARGET_DATA";
    public static REMOVE = "STORE_REMOVE_APP_TARGET_DATA";
     
    private _store: Redux.Store<any>;

    constructor() {
        this._store = this._createStore();
    }

    public get store() {
        return this._store;
    }

    public get<T>(ns: string): T {
        let nsChain = ns.split('.').reverse();
        let data = this._store.getState().appReducer;

        while (nsChain.length) {
            data  = data[nsChain.pop()];
            if (!data) {
                break;
            }
        }

        return data;
    }

    public dispatch(action: StoreAction) {
        this._store.dispatch(action);
    }

    private _createStore() {
        const middlewares: Redux.Middleware[] = [
            reduxThunk
        ];

        // if ((global as any).__DEV__) {
        //     //middlewares.push((ReduxLogger as any).default());
        //     middlewares.push(logger);
        // }

        const reduxNativeDevTools: any = (global as any).reduxNativeDevTools;

        const enhancer = Redux.compose(
            Redux.applyMiddleware(...middlewares),
            reduxNativeDevTools ? reduxNativeDevTools() : nope => nope
        );

        return Redux.createStore<any>(this._getRootReducer(), {
            appReducer: {}
        }, enhancer);
    }

    private _getRootReducer() {
        return Redux.combineReducers({
            routerReducer,
            appReducer
        });
    }
}

function getLeafObject(obj: any, ns: string, param: any) {
    let nsChain = Helpers.foramt(ns, param).split(".");
    let leafKey = nsChain.pop();
    obj = obj || {};
    nsChain.reverse();

    while (nsChain.length) {
        let key = nsChain.pop();
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

function appReducer(state: any = {}, action: StoreAction) {
    switch (action.type) {

        case Store.OVERWRITE: {
            const target = getLeafObject(
                state, 
                action.meta.storeKey, 
                action.meta.param
            );
            target.parent[target.key] = action.payload;
            break;
        }

        case Store.UPDATE: {
            const target = getLeafObject(
                state, 
                action.meta.storekey, 
                action.meta.param
            );
            target.parent[target.key] = Object.assign(
                target.value || {}, 
                action.payload
            );
            break;
        }

        case Store.REMOVE: {
            const target = getLeafObject(
                state,
                action.meta.storeKey,
                action.meta.param
            );
            delete target.parent[target.key];
            break;
        }
    }

    return state;
}
