
/**
 * 键值对 数值对象
 */
export interface HashMap<T> {
  [key: string]: T;
}

/**
 * 构造器函数
 */
export interface Constructor<T> {
  new (...args: any[]): T;
}
