
export abstract class Cache {
    abstract get(key: string): Promise<string>;
    abstract set(key: string, value: string): any;
}


let _cacher: Cache;

export async function get(key: string) {
    if (!_cacher) {
        return;
    }

    return _cacher.get(key);
}

export async function set(key: string, value: string) {
    if (!_cacher) {
        return;
    }

    return _cacher.set(key, value);
}

export function mount(cacher: Cache) {
    _cacher = cacher;
}