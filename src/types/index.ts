import { Store } from 'redux';

export interface HashMap<T> {
    [key: string]: T;
}

export interface ApplicationConfiguration {
    store: Store<any>;

}

export interface Constructor<T> {
    new(...args: any[]): T;
}
