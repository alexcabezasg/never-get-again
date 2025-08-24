export interface NGAConfig {
    stores: NGAStoreConfig[];
}

export interface NGAStoreConfig {
    name: string;
    type: string;
    config: NGALoaderConfig;
    mapper: NGAMapperConfig;
    refreshInterval: number;
}

export interface NGAMapperConfig {
    class: string;
    key: string;
}

export interface NGAHttpConfig {
    url: string;
}

export type NGALoaderConfig = NGAHttpConfig;