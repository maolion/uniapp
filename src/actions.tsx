import * as React from 'react';
import * as Villa from 'villa';
import { 
    Component, 
    PureComponent, 
    HTMLAttributes, 
    HTMLProps 
} from 'react';
import * as Immutable from 'immutable';

import { 
    HashMap, 
    ActionHandlerOptions
} from './types';

import * as Store from './store';
import { PureRender } from './mixins';
import {
    STORE_OVERWRITE,
    STORE_UPDATE,
    STORE_REMOVE
} from './constants';

const actionTypeMap: HashMap<string> = {
    overwrite: STORE_OVERWRITE,
    update: STORE_UPDATE,
    remove: STORE_REMOVE
};

export type ActionHandler = <T>(data?: any) => Promise<T>;

export interface ActionModalProps {
    type: "loading" | "error";
    message: string;
}

export abstract class ActionModal extends PureComponent<ActionModalProps, any> {
}

export function pack(
    actions: ActionHandler[],
    options?: {
        params?: HashMap<any>;
        actionModalClass: React.ClassicComponentClass<ActionModalProps>;
        components?: {
            loading: JSX.Element;
            error: JSX.Element;
        };
    }
): any {
    return function(target: any): any {
        class ActionDecorator extends Component<any, any> {
            constructor(props: any, context: any) {
                super(props, context);

                this.state = {
                    loading: true,
                    errorMsg: null
                };
            }

            
            shouldComponentUpdate(nextProps: any, nextState: any) {
                return PureRender.shouldComponentUpdate.call(this, nextProps, nextState);
            }

            componentWillMount() {
                const params: HashMap<any> = options.params || this.props.params;
                Villa.each(actions, async action => {
                    try {
                        await action<any>(params);
                        this.setState({ loading: false });
                    } catch (reason) {
                        this.setState({ 
                            loading: false,
                            errorMsg: reason && reason.message || reason || 'Invoke action handler failed!'
                        });
                    }
                });
            }
            
            render() {
                let renderComponent: JSX.Element;
                let ActionModal = options.actionModalClass;

                if (!this.state.loading && !this.state.errorMsg) {
                    if (target.prototype instanceof Component) {
                        renderComponent = (React.createElement(target, {}))
                    } else {
                        renderComponent = target;
                    }
                } else {
                    if (this.state.loading) {
                        renderComponent = options.components  && options.components.loading 
                            ? options.components.loading
                            : <ActionModal type="loading" message="loading..." />
                        ;
                    } else {
                        renderComponent = options.components  && options.components.error 
                            ? React.cloneElement(
                                options.components.error, 
                                { errorMsg: this.state.errorMsg }
                            )
                            : <ActionModal type="error" message={this.state.errorMsg} />
                        ;
                    }
                }

                return renderComponent;
            }
        }

        if (target.prototype instanceof Component) {
            return ActionDecorator;
        } else {
            return <ActionDecorator />;
        }
    }
}

export function _mount(actions: HashMap<any>) {
    let target = exports;

    for (let key of Object.keys(actions)) {
        let part: typeof Store.ActionHandlers = actions[key];
        if (!(part.prototype instanceof Store.ActionHandlers)) {
            continue;
        }
        for (let action of part.__$qmox_actions__) {
            _actionHandlerWrapper(part, action);
        }

        target[key] = part;
    }

    delete exports._mount;

    return target;
}

function _actionHandlerWrapper(target: any, action: ActionHandlerOptions) {
    target[action.name] = function () {
        const args = arguments;
        return action.actionHandler.apply(target, args)
            .then((ret: any) => {
                if (action.storeKey) {
                    const param: any = {};
                    
                    for (let i = 0, l = args.length; i < l; i++) {
                        param['$' + i] = args[i];
                    }

                    Store.dispatch({
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