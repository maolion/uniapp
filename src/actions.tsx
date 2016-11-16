import * as React from 'react';
import * as Villa from 'villa';
import { Component } from 'react';

import { HashMap } from './types/index.d';
import * as Store from './store';

export type ActionHandler = <T>(data?: any) => Promise<T>;

export function pack(
    actions: ActionHandler[],
    options?: {
        params?: HashMap<any>;
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
                            : (
                                <View 
                                    style={[
                                        styles.container,
                                        styles.loadingContainer
                                    ]}>
                                    <Text>loading...</Text>
                                </View>
                            );
                    } else {
                        renderComponent = options.components  && options.components.error 
                            ? React.cloneElement(
                                options.components.error, 
                                { errorMsg: this.state.errorMsg }
                            )
                            : (
                                <View 
                                    style={[
                                        styles.container,
                                        styles.errorContainer
                                    ]}>
                                    <Text>{this.state.errorMsg}</Text>
                                </View>
                            );
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    } as ViewStyle,
    loadingContainer: {

    },
    errorContainer: {
        backgroundColor: "red",
        color: "white"
    } as ViewStyle
});

