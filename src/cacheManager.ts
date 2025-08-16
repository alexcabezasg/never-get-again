import NGACache from "./cache";

export class NGACacheManager {
    private static instance: NGACacheManager;
    private readonly cache: Map<string, NGACache> = new Map();

    private constructor() {}

    public static getInstance(): NGACacheManager {
        if (!NGACacheManager.instance) {
            NGACacheManager.instance = new NGACacheManager();
        }
        return NGACacheManager.instance;
    }

    add(cacheName: string, cache: NGACache) {
        this.cache.set(cacheName, cache);
    }

    get(cacheName: string): NGACache {
        return this.cache.get(cacheName);
    }
}