/**
 * 路由导航控制器
 */
export interface Navigator {
    go(route: any, replace?: boolean): void;
    back(): void;
    forward(): void;
}

export default Navigator;

