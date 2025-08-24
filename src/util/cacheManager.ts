import { NGACache } from "../cache";

export class NGACacheManager {
    private static instance: NGACacheManager;
    private readonly caches: Map<string, NGACache<any>> = new Map();

    private constructor() {}

    public static getInstance(): NGACacheManager {
        if (!NGACacheManager.instance) {
            NGACacheManager.instance = new NGACacheManager();
        }
        return NGACacheManager.instance;
    }

    add<T>(cacheName: string, cache: NGACache<T>) {
        this.caches.set(cacheName, cache);
    }

    get<T>(cacheName: string): NGACache<T> {
        const cache = this.caches.get(cacheName);
        if (!cache) {
            throw new Error(`Cache not found for ${cacheName}`);
        }
        return cache as NGACache<T>;
    }
}