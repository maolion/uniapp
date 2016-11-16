import { Component, cloneElement } from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { Router, Route, Schema} from 'react-native-redux-router';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { ActionOptions, ActionHandlers } from '../../store';
import * as Actions from '../../actions';
import  Store from './store';

declare const module: any;

export interface Options {
    appName: string;
    version: string;
    router: JSX.Element;
    actions: HashMap<any>;
    apiMap: any;
    config: {
        env: string;
        apiHost: string;
        PSD: {
            density: number;
            minDesity: number;
        };
        RAP: {
            host: string;
            projectId: number;
        };
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        backgroundColor: "transparent"
    } as ViewStyle

});

const actionTypeMap: HashMap<string> = {
    overwrite: Store.OVERWRITE,
    update: Store.UPDATE,
    remove: Store.REMOVE
};

export default class App {
    public store: Store;
    public name: string;
    public actions: any;
    public routes: any;
    
    private _options: Options;
    private _appComponent: React.Component<any, any>;
    private _uid: number;

    constructor(options: Options) {
        this.store = new Store();
        this.name = options.appName;
        this.actions = Actions;
        this.routes = options.router.props.actions || {};
        this._options = options;
        this._uid = 0;

        this._registerAppComponet();
    }

    private _wrapActionsHandler() {
        const actions = this._options.actions;
        for (let key of Object.keys(actions)) {
            let part: typeof ActionHandlers = actions[key];
            if (!(part.prototype instanceof ActionHandlers)) {
                continue;
            }
            for (let action of part.__actions__) {
                this._actionHandlerWrapper(part, action);
            }
            
            this.actions[key] = part;
        }
    }

    private _actionHandlerWrapper(target: any, action: ActionOptions) {
        const _thiss = this;
        target[action.name] = async function () {
            const args = arguments;
            const ret = await action.actionHandler.apply(target, args);
            if (action.storeKey) {
                const param: any = {};
                
                for (let i = 0, l = args.length; i < l; i++) {
                    param['$' + i] = args[i];
                }

                _thiss.store.dispatch({
                    type: actionTypeMap[action.method],
                    error: null,
                    meta: {
                        storeKey: action.storeKey,
                        param
                    },
                    payload: ret
                });
                
                if (action.flushState) {
                    _thiss._flushState();
                }
            }
            
            return ret;
        };
    }

    private _registerApp(appComponent: Component<any, any>) {
        this._appComponent = appComponent;
    }

    private _flushState() {
        if (this._appComponent) {
            this._appComponent.setState({ uid: ++this._uid })
        }
    }
    
    private _registerAppComponet() {
        const _this = this;
        const options = _this._options;
        class App extends Component<any, any> {
            constructor(props: any, context: any) {
                super(props, context);
                (_this as any)._registerApp(this);
                this.state = {
                    uid: 0
                };
            }

            componentWillUnmount() {
                (_this as any).__appComponent = null;
            }

            render() {
                return (
                    <Provider store={_this.store.store}>
                        <View style={styles.container}>
                            {cloneElement(options.router, {
                                actions: _this.routes,
                                uid: this.state.uid
                            })}
                        </View>
                    </Provider>
                );
            }
        }

        this._wrapActionsHandler();
        AppRegistry.registerComponent(options.appName, () => App);
    }
}




