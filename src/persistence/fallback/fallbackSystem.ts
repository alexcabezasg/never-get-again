import MongoFallbackSystem from "./mongoFallbackSystem";

export interface FallbackSystem {
    save(store: string, entities: string[]): Promise<void>;
    recover(store: string): Promise<string[]>;
}

const FALLBACKS = new Map<string, FallbackSystem>([
    ['mongo', new MongoFallbackSystem()],
]);

export const FallbackSystemFactory = {
    get(fallbackType: string | undefined): FallbackSystem | undefined {
        if (!fallbackType) {
            console.error(`[NGA] No fallback type specified`);
            return undefined;
        }

        const fallbackSystem = FALLBACKS.get(fallbackType.toLowerCase());
        if (!fallbackSystem) {
            console.error(`[NGA] Fallback system not found for ${fallbackType}`);
            return undefined;
        }
        return fallbackSystem;
    }
}