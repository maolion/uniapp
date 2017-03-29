import * as Immutable from 'immutable';
import { Store, createStore } from 'redux';

/**
 * 判断一个对象，是否为 Immutable 数据对象
 * @param {any} obj - 目标对象
 * @return {boolean}
 */
export function isImmutableData(obj: any) {
  return !!obj && (
    obj instanceof Immutable.Map ||
    obj instanceof Immutable.List ||
    obj instanceof Immutable.Set ||
    obj instanceof Immutable.Seq ||
    obj instanceof Immutable.Record ||
    obj instanceof Immutable.Stack ||
    obj instanceof Immutable.OrderedMap ||
    obj instanceof Immutable.OrderedSet ||
    obj instanceof Immutable.Seq.Indexed ||
    obj instanceof Immutable.Iterable
  );
}

/**
 * 屏蔽 redux store 对象的 replaceReducer 接口
 * @param {Redux.Store<any>} store - 目标 redux store对象
 * @return {Redux.Store<any>}
 */
export function safeStore<T>(store: Store<any>) {
  return {
    getState: store.getState,
    subscribe: store.subscribe,
    dispatch: store.dispatch,
    replaceReducer: noop
  } as Store<T>;
}

/**
 * 空函数
 */
export function noop() {
}
