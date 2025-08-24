import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';
import { NGAConfig } from "./config";

export const NGAConfigLoader = {
    load(): NGAConfig {
        try {
            const configPath = join(process.cwd(), 'nga.yml');
            const yamlContent = readFileSync(configPath, 'utf8');
            return load(yamlContent) as NGAConfig;

        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }
}