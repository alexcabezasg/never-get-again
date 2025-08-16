import { NGALoader, NGAHttpLoader } from "./loader";

export abstract class NGAConfig {
    name: string
    mapper: NGAMapperConfig
    loader: NGALoader
    refreshInterval: number

    constructor(name: string, mapper: NGAMapperConfig) {
        this.name = name;
        this.mapper = mapper;
        this.refreshInterval = 1000;
    }
}

export class NGAMapperConfig {
    klass: new () => any
    key: string

    constructor(klass: new () => any, key: string) {
        this.klass = klass;
        this.key = key;
    }
}

export class NGAHttpConfig extends NGAConfig {
    url: string

    constructor(name: string, url: string, mapper: NGAMapperConfig, refreshInterval: number) {
        super(name, mapper);
        this.url = url;
        this.loader = new NGAHttpLoader(this);
        this.refreshInterval = refreshInterval;
    }
}