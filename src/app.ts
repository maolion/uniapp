import { Store, createStore } from 'redux';

import Plugin from './modules/plugin';
import { Constructor } from './types';

export interface ConfigurationProps {
    store?: Store<any>;
}

export interface Configuration extends Constructor<ConfigurationProps> {

}

export interface ConfiguratorProps {
    store: Store<any>;
    plugins: Plugin[];
}

export interface Configurator extends Constructor<any> {
    __typeName: string;
    Configuration: Configuration;
}

/**
 * 包装应用程序初始配置
 * 注: 返回被包装后的配置器的实例对象 只能获取到原配置数据的 store 和 其他可能存在的
 * Plugin类实例
 *
 * @param {Configuration} Target - 配置数据
 */
export default function app<T extends Configurator>(Target: Configuration): T {
    return class {
        private _store: Store<any> | undefined;
        private _plugins: Plugin[] = [];

        constructor() {
            let config: any = new Target();

            this._store = config.store;

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
