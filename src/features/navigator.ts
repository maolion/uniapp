/**
 * 路由导航控制器
 */
export abstract class Navigator {
    abstract new (routeMap: any): Navigator;
    abstract go(route: string, replace?: boolean): void;
    abstract back(): void;
    abstract forward(): void;
}

export default Navigator;

