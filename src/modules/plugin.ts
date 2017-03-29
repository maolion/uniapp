import Application from './application';

abstract class Plugin {
  /**
   * 应用程序初始配置完成, 准备运行时 的调用钩子
   * @param {Application} app - 挂载插件的目标应用程序
   */
  appOnReadyHook(app: Application) {

  }

  /**
   * 应用程序完成运行时 的调用钩子
   * @param {Application} app - 挂载插件的目标应用程序
   */
  appOnLaunchHook(app: Application) {

  }
}

export default Plugin;
