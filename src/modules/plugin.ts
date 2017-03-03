import { ApplicationConfiguration } from '../types';
import Application from './application';

abstract class _Plugin {
    /**
     * 在 app初始化前被调用
     */
    appWillInitializationHook(config: ApplicationCache) {
        
    }

    /**
     * 在 app初始化完成之后被调用
     */
    appDidInitializationHook(app: Application) {

    }
}

export default _Plugin;




