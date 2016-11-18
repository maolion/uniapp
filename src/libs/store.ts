/**
 * 框架数据存储层
 * @author lion
 * @email maolion.j@gmail.com
 */
import * as Redux from 'redux';
import reduxThunk from 'redux-thunk';

import { StoreAction } from '../types';
import * as Utils from '../utils';

abstract class Store<T> {

    public static OVERWRITE = "STORE_OVERWRITE_APP_TARGET_DATA";
    public static UPDATE = "STORE_UPDATE_APP_TARGET_DATA";
    public static REMOVE = "STORE_REMOVE_APP_TARGET_DATA";
     
    private _store: Redux.Store<any>;

    constructor() {
        this._store = this.createStore();
    }

    public get store() {
        return this._store;
    }

    public get<T>(ns: string, root: any): T {
        if (!root) {
            return;
        }

        let nsChain = ns.split('.').reverse();
        let data = root;

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

    protected abstract createStore(): Redux.Store<any>;
}

export default Store;

function getLeafObject(obj: any, ns: string, param: any) {
    let nsChain = Utils.String.foramt(ns, param).split(".");
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

export function dataReducer(state: any = {}, action: StoreAction) {
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
