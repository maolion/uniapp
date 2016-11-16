declare module 'mockjs' {
    interface Map<T> {
        [key: string]: T
    }
    
    export function mock(template: Map<any>): any;
    export function mock(rulr: RegExp, template: Map<any>): any;
    export function mock(rulr: RegExp, rtype: string, template: Map<any>): any;
    export function mock(rulr: RegExp, rtype: string, template: (options: any) => any): any;
}