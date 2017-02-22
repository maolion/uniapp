import Actions from './features/actions';
import Store from './features/store';
import Apis from './features/apis';
import Cache from './features/cache';
import Navigator from './features/navigator';

export default class App {
    private _actions: Actions;
    private _store: Store;
    private _cache: Cache;
    private _navigator: Navigator;

    public set actions(actions: Actions) {

    }

    public get actions(): Actions {
        return this._actions;
    }
    
}

