import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';
import { ClassLoader } from "./classLoader";
import { NGAConfig, NGAHttpConfig, NGAMapperConfig } from "./config";

interface NGAYamlConfig {
    storage: Array<NGAYamlStorageConfig>;
}

interface NGAYamlStorageConfig {
    name: string;
    type: string;
    url: string;
    refreshInterval: number;
    mapper: {
        class: string;
        key: string;
    };
}

export const NGAConfigLoader = {
    async load(): Promise<NGAConfig[]> {
        try {
            // Read and parse YAML file
            const configPath = join(process.cwd(), 'nga.yml');
            const yamlContent = readFileSync(configPath, 'utf8');
            const config = load(yamlContent) as NGAYamlConfig;

            // Convert YAML config to NGAConfig objects
            const configPromises = config.storage.map(async storage => {
                try {
                    const klass = await ClassLoader.getInstance().findClass(storage.mapper.class);
                    return NGAConfigFactory.create(storage, klass);
                } catch (error) {
                    console.error(`Error loading class ${storage.mapper.class}:`, error);
                    throw error;
                }
            });

            return await Promise.all(configPromises);
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }
}

const NGAConfigFactory = {
    create(storage: NGAYamlStorageConfig, klass: new () => any): NGAConfig {
        switch (storage.type.toLowerCase()) {
            case 'http':
                return new NGAHttpConfig(storage.name, storage.url, new NGAMapperConfig(klass, storage.mapper.key), storage.refreshInterval);
            default:
                throw new Error(`Unsupported storage type: ${storage.type}`);
        }
    }
}