import NGACache from "./cache";

export class NGACacheManager {
    private static instance: NGACacheManager;
    private readonly caches: Map<string, NGACache> = new Map();

    private constructor() {}

    public static getInstance(): NGACacheManager {
        if (!NGACacheManager.instance) {
            NGACacheManager.instance = new NGACacheManager();
        }
        return NGACacheManager.instance;
    }

    add(cacheName: string, cache: NGACache) {
        this.caches.set(cacheName, cache);
    }

    get(cacheName: string): NGACache {
        return this.caches.get(cacheName);
    }
}