import * as React from 'react';
import * as Villa from 'villa';
import { Component, PureComponent, HTMLAttributes, HTMLProps } from 'react';
import * as Immutable from 'immutable';

import { HashMap } from './types';
import * as Store from './store';

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
                // 以下代码逻辑来自： https://zhuanlan.zhihu.com/p/2029597 @camsong

                const currentProps = this.props;
                const currentState = this.state;
                
                if (Object.keys(currentProps).length != Object.keys(nextProps).length ||
                    Object.keys(currentState).length != Object.keys(nextState).length
                ) {
                    return true;
                }

                for (const key in nextProps) {
                    if (currentProps[key] !== nextProps[key] || 
                        !Immutable.is(currentProps[key], nextProps[key])
                    ) {
                        return true;
                    }
                }

                for (const key in nextState) {
                    if (currentState[key] !== nextState[key] || 
                        !Immutable.is(currentState[key], nextState[key])
                    ) {
                        return true;
                    }
                }

                return false;
            }

            componentWillMount() {
                const params: HashMap<any> = options.params || this.props.params;
                Villa.each(actions, async (action) => {
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
                            : <options.actionModalClass type="loading" message="loading..." />
                    } else {
                        renderComponent = options.components  && options.components.error 
                            ? React.cloneElement(
                                options.components.error, 
                                { errorMsg: this.state.errorMsg }
                            )
                            : <options.actionModalClass type="error" message={this.state.errorMsg} />;
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