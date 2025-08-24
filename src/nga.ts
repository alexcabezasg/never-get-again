import NGAScheduler from "./util/scheduler";
import NGAMapper from "./mapper";
import { NGADefaultCache } from "./cache";
import { NGAConfigLoader } from "./config/configLoader";
import { NGAConfig, NGAStoreConfig } from "./config/config";
import { NGACacheManager } from "./util/cacheManager";
import { NGALoaderFactory } from "./config/loaderFactory";
import { NGAIndexesManager } from "./indexesManager";

const NGA = {
    start: async () => {
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
    },

    load: async (config: NGAStoreConfig) => {
        try {
            const data = await NGALoaderFactory.create(config).load();
            const entities = await NGAMapper.map(config.mapper.class, data);
            const cache = new NGADefaultCache(config.mapper.key, entities);
            NGACacheManager.getInstance().add(config.mapper.class, cache);

            config.indexes.forEach((index) => {
                NGAIndexesManager.createIndex(config.mapper.class, config.mapper.key, index, entities);
            });

            console.log(`[NGA] ✓ Successfully loaded ${entities.length} entities of type ${config.mapper.class}`);
            return { success: true, name: config.name };
        } catch (error) {
            console.error(`[NGA] ✗ Failed to load: ${config.name}`);
            return { success: false, name: config.name, error };
        }
    }
}

export default NGA.start;