import { EventEmitter } from 'events';
import { ApplicationConfiguration } from '../types';
import Plugin from './plugin';

abstract class Application extends EventEmitter {
    private _store: Redux.Store<any>;
    private _plugins: Plugin[];

    constructor(config: ApplicationConfiguration) {
        super();
        this._store = config.store;
        this._plugins = config.plugins;
    }

    get store() {
        return this._store;
    }

    get plugins() {
        return this._plugins;
    }
}


export default Application;