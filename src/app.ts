import { Store as ReduxStore, createStore } from 'redux';

import { Application } from './modules/application';
import Plugin from './modules/plugin';
import { Constructor } from './types';

/**
 * APP 配置数据被限定类型的属性
 */
export interface ConfigurationProps {
  store?: ReduxStore<any>;
}

/**
 * APP 配置数据的成员构造定义
 * (app 装饰器装饰的目标类)
 */
export interface Configuration extends Constructor<ConfigurationProps> {
}

/**
 * APP 配置器的属性结构
 */
export interface ConfiguratorProps {
  /** 配置在应用程序上的所有redux store实例 */
  stores: ReduxStore<any>[];

  /** 应用程序框架使用者维护的 redux store实例 */
  store: ReduxStore<any>;

  /** 挂载在应用程序上的插件集合 */
  plugins: Plugin[];
}

/**
 * 配置器成员结构定义
 * (由app 装饰器创建)
 */
export interface Configurator extends Constructor<any> {
  __typeName: string;
  Configuration: Configuration;
}

/**
 * 包装应用程序初始配置
 * 注: 返回被包装后的配置器的实例对象 只能获取到原配置数据的 store 和 其他可能存在的
 * Plugin类实例属性
 */
export default function app<T extends Configurator>(Target: Configuration): T {
  return class {
    public stores: ReduxStore<any>[] = [];

    private _store: ReduxStore<any> | undefined;
    private _plugins: Plugin[] = [];

    constructor() {
      let config: any = new Target();

      this._store = config.store;

      if (this._store) {
        this.stores.push(this._store);
      }

      // 取出 配置数据里的所有 Pligun 实例，加载到 _plugins 属性上
      for (let propName of Object.keys(config)) {
        let prop = config[propName];

        if (propName === 'store' || !prop) {
          continue;
        }

        if (prop instanceof Plugin) {
          this._plugins.push(prop);
        }
      }
    }

    get store() {
      return this._store;
    }

    get plugins() {
      return this._plugins;
    }

    static __typeName = 'AppConfigurator';
    static Configuration = Target;
  } as T;
}

/*
// 使用说明

@app
class MyApp {
  // (可选) 设置 应用业务层（即框架使用者）维护的 redux store
  store = createStore(reducer, preloadState)

  // (可选) 需要使用的外部插件设置
  p1 = new Plugin1();
  p2 = new Plugin2();
}
*/
