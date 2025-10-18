import NGAScheduler from "./util/scheduler";
import NGAMapper from "./mapper";
import { NGADefaultCache } from "./cache";
import { NGAConfigLoader } from "./config/configLoader";
import { NGAConfig, NGAStoreConfig } from "./config/config";
import { NGACacheManager } from "./util/cacheManager";
import { NGALoaderFactory } from "./config/loaderFactory";
import { NGAIndexesManager } from "./util/indexesManager";
import { NGAFallback } from "./persistence/fallback/fallback";

interface LoadResult {
    success: boolean;
    name: string;
    error?: unknown;
}

export class NGA {
    public static async start(): Promise<LoadResult[]> {
        try {
            console.log('[NGA] Starting data load...');

            const configs: NGAConfig = NGAConfigLoader.load();
            return await Promise.all(configs.stores.map(async (config) => {
                NGAScheduler.schedule(config.refreshInterval, () => NGA.load(config));
                return await NGA.load(config);
            }));
        } catch (error) {
            console.error('Fatal error during startup:', error);
            throw error;
        }
    }

    public static async load(config: NGAStoreConfig): Promise<LoadResult> {
        try {
            const rawData = await NGALoaderFactory.create(config).load();
            const entities = await NGAMapper.map(config.mapper.class, rawData);
            const cache = new NGADefaultCache(config.mapper.key, entities);
            NGACacheManager.getInstance().add(config.mapper.class, cache);

            if (config.indexes) {
                config.indexes.forEach((index) => {
                    NGAIndexesManager.createIndex(config.mapper.class, config.mapper.key, index, entities);
                });
            }

            await NGAFallback.save(config.name, config.fallback, entities);

            console.log(`[NGA] ✓ Successfully loaded ${entities.length} entities of type ${config.mapper.class}`);
            return { success: true, name: config.name };
        } catch (error) {
            console.error(`[NGA] ✗ Failed to load: ${config.name}: ${error}`);
            await recoverFromFallback(config);
            return { success: false, name: config.name, error };
        }
    }
}

async function recoverFromFallback(config: NGAStoreConfig): Promise<void> {
    const recoveredEntities = await NGAFallback.recover(config.name, config.fallback);
    const cache = new NGADefaultCache(config.mapper.key, recoveredEntities);
    NGACacheManager.getInstance().add(config.mapper.class, cache);

    if (config.indexes) {
        config.indexes.forEach((index) => {
            NGAIndexesManager.createIndex(config.mapper.class, config.mapper.key, index, recoveredEntities);
        });
    }

    console.log(`[NGA] ✓ Successfully recovered ${recoveredEntities.length} entities of type ${config.mapper.class}`);
}

export default NGA;