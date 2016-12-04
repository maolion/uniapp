import * as Villa from 'villa';
import * as Immutable from 'immutable';

import { 
    HashMap, 
    ActionHandlerOptions
} from '../types';

import * as Store from './store';
import { PureRender } from '../mixins';
import {
    STORE_OVERWRITE,
    STORE_UPDATE,
    STORE_REMOVE
} from '../constants';

const actionTypeMap: HashMap<string> = {
    overwrite: STORE_OVERWRITE,
    update: STORE_UPDATE,
    remove: STORE_REMOVE
};

/**
 * 根据提交的 action配置结构信息 创建对应的 redux action 便捷调用函数
 */
export default class Actions {
    private _store: Redux.Store<any>;

    constructor(actionMap: any, store: Redux.Store<any>) {
        this._store = store;
        
        return this._mapping(actionTypeMap);
    }

    private _mapping(target: any) {
        let dest: any = {};

        for (let pathName of Object.keys(target)) {
            let part = target[pathName];
            if (!part) {
                continue;
            }

            if (part.__$qmox_actions__ && part.__$qmox_actions__.length) {
                for (let action of part.__$qmox_actions__) {
                    dest[pathName] = this._actionHandlerWrapper(part, action);
                }
            }

            if (typeof part === 'object') {
                dest[pathName] = this._mapping(part);
            }
        }

        return dest;
    }
    
    private _actionHandlerWrapper(target: any, action: ActionHandlerOptions) {
        let store = this._store;
        target[action.name] = function () {
            const args = arguments;
            return action.actionHandler.apply(target, args)
                .then((ret: any) => {
                    if (action.storeKey) {
                        const param: any = {};
                        
                        for (let i = 0, l = args.length; i < l; i++) {
                            param['$' + i] = args[i];
                        }

                        store.dispatch({
                            type: actionTypeMap[action.method],
                            error: null,
                            meta: {
                                storeKey: action.storeKey,
                                param
                            },
                            payload: ret
                        });
                    }
                    
                    return ret;
                });
        };
    }
}
