import NGAScheduler from "./scheduler";
import NGAMapper from "./mapper";
import NGACache from "./cache";
import { NGAConfigLoader } from "./config/configLoader";
import { NGAConfig, NGAStoreConfig } from "./config/config";
import { NGACacheManager } from "./cacheManager";
import { NGALoaderFactory } from "./config/loaderFactory";

const NGA = {
    start: async () => {
        try {

            console.log('[NGA] Starting data load...');

            const configs: NGAConfig = NGAConfigLoader.load();
            const loadResults = await Promise.all(configs.stores.map(async (config) => {
                NGAScheduler.schedule(config.refreshInterval, () => NGA.load(config));
                return await NGA.load(config);
            }));

            const successful = loadResults.filter(r => r.success);
            const failed = loadResults.filter(r => !r.success);
            console.log(`[NGA] ✓ Successfully loaded: ${successful.length} configurations`);
            if (failed.length > 0) {
                console.log(`[NGA] ✗ Failed to load: ${failed.length} configurations`);
                failed.forEach(f => console.log(`[NGA]   - ${f.name}`));
            }

        } catch (error) {
            console.error('Fatal error during startup:', error);
            throw error;
        }
    },

    load: async (config: NGAStoreConfig) => {
        try {
            const data = await NGALoaderFactory.create(config).load();
            const entities = await NGAMapper.map(config.mapper.class, data);
            const cache = new NGACache(config.mapper.key, entities);
            NGACacheManager.getInstance().add(config.mapper.class, cache);
            console.log(`[NGA] ✓ Successfully loaded: ${config.name}`);
            return { success: true, name: config.name };
        } catch (error) {
            console.error(`[NGA] ✗ Failed to load: ${config.name}`);
            return { success: false, name: config.name, error };
        }
    }
}

export default NGA.start;