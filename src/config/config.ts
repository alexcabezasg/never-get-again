export interface NGAConfig {
    stores: NGAStoreConfig[];
}

export interface NGAStoreConfig {
    name: string;
    type: string;
    config: NGALoaderConfig;
    mapper: NGAMapperConfig;
    refreshInterval: number;
    indexes: NGAIndexConfig[];
    fallback?: string;
}

export interface NGAIndexConfig {
    key: string;
    field: string;
}

export interface NGAMapperConfig {
    class: string;
    key: string;
}

export interface NGAHttpConfig {
    url: string;
}

export type NGALoaderConfig = NGAHttpConfig;