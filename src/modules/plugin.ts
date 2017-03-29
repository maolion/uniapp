import Application from './application';

abstract class Plugin {
  /** 应用程序初始配置完成, 准备运行时 的调用钩子 */
  appOnReadyHook(app: Application) {

  }

  /** 应用程序完成运行时 的调用钩子 */
  appOnLaunchHook(app: Application) {

  }
}

export default Plugin;
