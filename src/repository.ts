import { NGACacheManager } from "./util/cacheManager";
import { NGADefaultCache, NGAIndexCache } from "./cache";

export const NGARepository = {
    get<T>(klass: any, id: string): T | undefined {
        const cache = NGACacheManager.getInstance().get(klass.name) as NGADefaultCache;
        if (!cache) {
            console.error(`[NGA] Cache ${klass.name} not found`);
            return undefined;
        }
        return cache.get(id) as T;
    },

    all<T>(klass: any): T[] | undefined {
        const cache = NGACacheManager.getInstance().get(klass.name) as NGADefaultCache;
        if (!cache) {
            console.error(`[NGA] Cache ${klass.name} not found`);
            return undefined;
        }
        return cache.all() as T[];
    },

    findByIndex<T>(klass: any, index: string, value: string): T[] | undefined {
        const indexCache = NGACacheManager.getInstance().get(`${klass.name}-${index}`) as NGAIndexCache;
        if (!indexCache) {
            console.error(`[NGA] Index ${index} not found`);
            return undefined;
        }
        return indexCache.get(value)
            .map(key => this.get(klass, key)) as T[];
    }
}