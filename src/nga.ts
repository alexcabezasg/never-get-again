import NGAScheduler from "./scheduler";
import NGAMapper from "./mapper";
import NGACache from "./cache";
import { NGAConfigLoader } from "./configLoader";
import { NGAConfig } from "./config";
import { NGACacheManager } from "./cacheManager";

const NGA = {
    start: async () => {
        try {
            const configs: NGAConfig[] = await NGAConfigLoader.load();

            console.log('[NGA] Starting data load...');

            const loadResults = await Promise.all(configs.map(async (config) => {
                NGAScheduler.schedule(config.refreshInterval, () => NGA.load(config));
                return await NGA.load(config);
            }));

            const successful = loadResults.filter(r => r.success);
            const failed = loadResults.filter(r => !r.success);
            console.log(`[NGA] ✓ Successfully loaded: ${successful.length} configurations`);
            if (failed.length > 0) {
                console.log(`[NGA] ✗ Failed to load: ${failed.length} configurations`);
                failed.forEach(f => console.log(`[NGA]   - ${f.name}: ${f.error}`));
            }

        } catch (error) {
            console.error('Fatal error during startup:', error);
            throw error;
        }
    },

    load: async (config: NGAConfig) => {
        try {
            const data = await config.loader.load();
            const entities = NGAMapper.map(config.mapper.klass, data);
            const cache = new NGACache(config.mapper.key, entities);
            NGACacheManager.getInstance().add(config.mapper.klass.name, cache);
            console.log(`[NGA] ✓ Successfully loaded: ${config.name}`);
            return { success: true, name: config.name };
        } catch (error) {
            console.error(`[NGA] ✗ Failed to load: ${config.name}`);
            return { success: false, name: config.name, error };
        }
    }
}

export default NGA.start;