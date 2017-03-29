import {
  Store as ReduxStore,
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
 * (可能是个BUG定时炸弹)
 */
export default class MixStore implements ReduxStore<any> {

  private _isDispatching: boolean;
  private _nextListeners: SubscribeHandler[];
  private _currentListeners: SubscribeHandler[];
  private _currentState: HashMap<any>;
  private _stateChanged: boolean;

  constructor(
    private _stores: ReduxStore<any>[]
  ) {

    this._nextListeners =
      this._currentListeners = [];

    // 代理 所有 store 的状态订阅
    this._initStoresSubscribe();
  }

  dispatch<A extends Redux.Action>(action: A): A {
    // 广播给所有 store, 给能处理 reducer 的处理
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
    // MixStore的replaceReducer 并不考虑此操作的安全性，因为它假设它包含的store会自己
    // 处理好这个问题
    for (let store of this._stores) {
      store.replaceReducer(nextReducer);
    }
  }

  getState() {
    if (this._currentState && !this._stateChanged) {
      // 状态数据未改变的情况，直接使用缓存数据
      return this._currentState;
    }

    let currentState = this._currentState || {};
    let nextState: HashMap<any> = {};

    // 将所有 store 的 state 混合一起
    for (let store of this._stores) {
      let state = store.getState();

      for (let key of Object.keys(state)) {
        let value = state[key];

        // 避免新的状态数据被后面的老数据覆盖掉
        if (nextState[key] && currentState[key] === value) {
          continue;
        }

        nextState[key] = state[key];
      }
    }

    this._stateChanged = false;

    return currentState = nextState;
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

    // 标记状态数据可能已改变
    this._stateChanged = true;

    for (let listener of listeners) {
      listener();
    }
  }
}

/*
// MixStore 使用说明

let store = new MixStore([
  createStore(...),
  // safeStore 会屏蔽掉 replaceReducer 的作用
  safeStore(createStore(...)),
  safeStore(createStore(...)),
  safeStore(createStore(...))
]);

// 像普通 redux store对象一样使用 MixStore的实例
store.getState();
store.dispatch({});
store.subscribe(() => {})
*/
