/**
 * 路由导航控制器
 */
export abstract class Navigator {
    abstract go(route: any, replace?: boolean): void;
    abstract back(): void;
    abstract forward(): void;
}

export default Navigator;
