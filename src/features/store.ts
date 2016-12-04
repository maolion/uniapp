import * as Immutable from 'immutable';
import * as Villa from 'villa';

import { 
    createStore,
    combineReducers
} from 'redux';

import * as Utils from '../utils';

import { 
    ActionHandlerOptions,
    StoreAction,
    HashMap 
} from '../types';

import {
    STORE_OVERWRITE,
    STORE_REMOVE,
    STORE_UPDATE,
    IMMUTABLE_DATA,
    ORIGIN_DATA
} from '../constants';


let store: Redux.Store<any>;

/**
 * 创建一个 redux store 扩展对象，主要强制绑定了一个 appData Reducer
 */
export default class Store implements Redux.Store<any> {
    private _origin: Redux.Store<any>;

    constructor(
        reducerMapping: HashMap<Redux.Reducer<any>>, 
        preloadedState: any, 
        enhancer: Redux.StoreEnhancer<any>
    ) {
        if (reducerMapping && reducerMapping['appData']) {
            console.warn('qmox mount store:: Ignore "appData" reducer!');
        }

        this._origin = createStore(
            combineReducers(Object.assign({}, reducerMapping, { appData: appDataReducer })),
            preloadedState,
            enhancer
        );
    }

    /** @overwrite */
    getState() {
        return this._origin.getState();
    }

    /** @overwrite */
    dispatch(action: any) {
        return this._origin.dispatch(action);
    }

    /** @overwrite */
    subscribe(listener: () => void) {
        return this._origin.subscribe(listener);
    };

    /** @overwrite */
    replaceReducer(nextReducer: Redux.Reducer<any>) {
        return this._origin.replaceReducer(nextReducer);
    }

    get(keyPath: string | string[]) {
        let fixedKeyPath = typeof keyPath === 'string' ? Utils.String.format(keyPath, {}).split(".") : keyPath.join('.');
        return this._getLeafObject(fixedKeyPath).value;
    }

    private _getLeafObject(keyPath: string[]) {
        let safKeyPath = keyPath.slice();
        let leafKey = safKeyPath.pop();

        let obj = this.getState();

        if (safKeyPath[0] && safKeyPath[0].charAt(0) === '~') {
            safKeyPath[0] = safKeyPath[0].slice(1);
            obj = this.getState().appData;
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
