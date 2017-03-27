import {
    combineReducers,
    createStore
} from 'redux';

import * as Utils from '../utils';

import {
    HashMap
} from '../types';

export interface SubscribeHandler {
    (): void;
}

/**
 * redux store 多合一处理
 */
export default class Store implements Redux.Store<any> {

    private _stores: Redux.Store<any>[];
    private _storeMapping: HashMap<Redux.Store<any>>;
    private _isDispatching: boolean;
    private _nextListeners: SubscribeHandler[];
    private _currentListeners: SubscribeHandler[];

    constructor(
        private _mainStore: Redux.Store<any>,
        private _auxStores: HashMap<Redux.Store<any>>
    ) {
        this._stores = [ this._mainStore ];
        this._storeMapping = {
            main: this._mainStore
        };

        for (let key of Object.keys(this._auxStores)) {
            let store = this._auxStores[key];
            this._storeMapping[key] = store;
            this._stores.push(store);
        }

        this._nextListeners =
        this._currentListeners = [];
    }

    dispatch<A extends Redux.Action>(action: A): A {
        for (let store of this._stores) {
            store.dispatch(action);
        }

        return action;
    }

    subscribe(listener: SubscribeHandler) {
        if (typeof listener !== 'function') {
            throw new Error('Expected listener to be a function.');
        }

        let isSubscribed = true;

        this._ensureCanMutateNextListeners();
        this._nextListeners.push(listener);

        return () => {
            if (!isSubscribed) {
                return;
            }

            isSubscribed = false;

            this._ensureCanMutateNextListeners();

            let index = this._nextListeners.indexOf(listener);
            this._nextListeners.splice(index, 0);
        };
    }

    replaceReducer(nextReducer: Redux.Reducer<any>) {
        this._mainStore.replaceReducer(nextReducer);
    }

    getState() {
        let currentState: any = {};
    }

    getStore(key?: string) {
        if (!key) {
            return this._mainStore;
        }

        return this._storeMapping[key];
    }

    private _ensureCanMutateNextListeners() {
        if (this._nextListeners === this._currentListeners) {
            this._nextListeners = this._currentListeners.slice();
        }
    }

    private _initStoresSubscribe() {
        let listener = this._notifyListeners.bind(this);

        for (let store of this._stores) {
            store.subscribe(listener);
        }
    }

    private _notifyListeners() {
        let listeners = this._currentListeners = this._nextListeners;

        for (let listener of listeners) {
            listener();
        }
    }
}
