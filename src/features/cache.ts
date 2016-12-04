import Cache from '../libs/cache';

let _cache: Cache;

export default Cache;

export async function get(key: string) {
    if (!_cache) {
        return;
    }

    return _cache.get(key);
}

export async function set(key: string, value: string) {
    if (!_cache) {
        return;
    }

    return _cache.set(key, value);
}

/**
 * 初始化 cache 功能模块
 */
export function init(cache: Cache) {
    _cache = cache;
}