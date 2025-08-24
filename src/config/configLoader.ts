import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';
import { NGAConfig} from "./config";

export const NGAConfigLoader = {
    load(): NGAConfig {
        try {
            const configPath = join(process.cwd(), 'nga.yml');
            const yamlContent = readFileSync(configPath, 'utf8');
            const config = load(yamlContent) as NGAConfig;

            // Validate configuration
            if (!config || !config.stores) {
                throw new Error('Invalid configuration: missing stores');
            }

            return config;

        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }
}