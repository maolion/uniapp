/**
 * 路由导航控制器
 */
export abstract class Navigator {
  /**
   * 路由跳转
   * @param {string} uri - 路由地址
   * @param {boolean} replace - 是否使用替换当前页面, 默认 false
   */
  abstract go(uri: string, replace?: boolean): void;

  /** 返回前一个路由 */
  abstract back(): void;
}

export default Navigator;
