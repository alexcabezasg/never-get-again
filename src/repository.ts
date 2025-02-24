import { NGAConfig } from "./config";
import NGAEntity from "./entity";
import { NGALoaderResponse } from "./loader";
import NGACache from "./cache";

export default class NGARepository<T extends NGAEntity> {
    protected cache: NGACache<T>;

    constructor(config: NGAConfig) {
        const loaderResponse: NGALoaderResponse = config.loader.getResource();
        if(!loaderResponse) {
            throw new Error(`Error loading store for ${this}: loader failed`);
        }

        const entities: T[] = config.mapper.toEntity(loaderResponse.content) as T[];
        this.cache = new NGACache<T>(entities);
    }

    all(): T[] {
        return this.cache.all();
    }

    byId(id: string): T | undefined {
        return this.cache.byId(id);
    }
}