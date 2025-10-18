import { FallbackSystemFactory } from "./fallbackSystem";

export const NGAFallback = {
    async save<T>(store: string, fallbackType: string | undefined, entities: T[]): Promise<void> {
        const fallbackSystem = FallbackSystemFactory.get(fallbackType);
        if (fallbackSystem) {
            const jsonEntities = entities.map(entity => JSON.stringify(entity));
            await fallbackSystem.save(store, jsonEntities);
        }
        else {
            console.log('[NGA] No fallback specified. Skipping fallback save.');
        }
    },

    async recover<T>(store: string, fallbackType: string | undefined): Promise<T[]> {
        const fallbackSystem = FallbackSystemFactory.get(fallbackType);
        if (fallbackSystem) {
            const jsonEntities = await fallbackSystem.recover(store);
            return jsonEntities.map(entity => JSON.parse(entity)) as T[];
        }
        else {
            console.log('[NGA] No fallback specified. Skipping fallback recover.');
        }
        return [];
    }
}