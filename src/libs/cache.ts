export abstract class Cache {
    abstract get(key: string): any;
    abstract set(key: string, value: string): any;
}

export default Cache;