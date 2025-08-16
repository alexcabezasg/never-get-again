import { NGACacheManager } from "./cacheManager";

export const NGARepository = {
    get<T>(klass: any, id: string): T | undefined {
        const cache = NGACacheManager.getInstance().get(klass.name);
        if (!cache) {
            console.error(`[NGA] Cache ${klass.name} not found`);
            return undefined;
        }
        return cache.get(id) as T;
    },

    all<T>(klass: any): T[] | undefined {
        const cache = NGACacheManager.getInstance().get(klass.name);
        if (!cache) {
            console.error(`[NGA] Cache ${klass.name} not found`);
            return undefined;
        }
        return cache.all() as T[];
    }
}