import { Store as ReduxStore, createStore } from 'redux';

import { Application } from './modules/application';
import Plugin from './modules/plugin';
import { Constructor } from './types';

/**
 * APP 配置数据被限定类型的属性
 */
export interface ConfigurationProps {
  store?: ReduxStore<any>;
  onReady?: (app: Application) => void;
  onLaunch?: (app: Application) => void;
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
  /** 挂载在应用程序上的插件集合 */
  plugins: Plugin[];
  userConfig(): ConfigurationProps;
  onReady(app: Application): void;
  onLaunch(app: Application): void;
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
    private _stores: ReduxStore<any>[] = [];
    private _plugins: Plugin[] = [];
    private _userConfig: ConfigurationProps;

    constructor() {
      let userConfig: any = new Target();

      this._userConfig = userConfig;

      if (userConfig.store) {
        this.stores.push(userConfig.store);
      }

      // 取出 配置数据里的所有 Pligun 实例，加载到 _plugins 属性上
      for (let propName of Object.keys(userConfig)) {
        let prop = userConfig[propName];

        if (propName === 'store' || !prop) {
          continue;
        }

        if (prop instanceof Plugin) {
          this._plugins.push(prop);
        }
      }
    }

    get stores() {
      return this._stores;
    }

    get plugins() {
      return this._plugins;
    }

    get userConfig() {
      return this._userConfig;
    }

    onReady(app: Application) {
      if (this._userConfig.onReady) {
        this._userConfig.onReady(app);
      }
    }

    onLaunch(app: Application) {
      if (this._userConfig.onLaunch) {
        this._userConfig.onLaunch(app);
      }
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

  // (可选) 事件
  onReady(app: Application) {
    // ....
  }

  onLaunch(app: Application) {
    // ...
  }
}
*/
