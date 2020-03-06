export interface ICache {
    set(key: string, val: any);
    get(key: string): any;
    del(key: string);
}

export default ICache;
