import { NGACacheManager } from "./util/cacheManager";
import { NGADefaultCache, NGAIndexCache } from "./cache";

export const NGARepository = {
    get<T>(klass: any, id: string): T | undefined {
        try {
            const cache = NGACacheManager.getInstance().get<Record<string, unknown>>(klass.name);
            return cache.get(id) as T;
        } catch (error) {
            console.error(`[NGA] Cache ${klass.name} not found`);
            return undefined;
        }
    },

    all<T>(klass: any): T[] | undefined {
        try {
            const cache = NGACacheManager.getInstance().get<Record<string, unknown>>(klass.name) as NGADefaultCache;
            return cache.all() as T[];
        } catch (error) {
            console.error(`[NGA] Cache ${klass.name} not found`);
            return undefined;
        }
    },

    findByIndex<T>(klass: any, index: string, value: string): T[] | undefined {
        try {
            const indexCache = NGACacheManager.getInstance().get<string[]>(`${klass.name}-${index}`);
            const keys = indexCache.get(value);
            if (!keys) {
                return undefined;
            }
            return keys.map(key => this.get(klass, key)).filter((item): item is T => item !== undefined);
        } catch (error) {
            console.error(`[NGA] Index ${index} not found`);
            return undefined;
        }
    }
}