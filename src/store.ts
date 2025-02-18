import { NGAConfigFetcher } from "./config";
import NGAEntity from "./entity";
import { NGALoaderResponse } from "./loader";
import NGACache from "./cache";

export default class NGAStore<T extends NGAEntity> {
    private cache: NGACache<T>;

    constructor(store: string) {
        const config = NGAConfigFetcher.getConfig(store);
        if(!config) {
            throw new Error(`Error loading store ${store}: configuration not defined or not correct`);
        }

        const loaderResponse: NGALoaderResponse = config.loader.getResource();
        if(!loaderResponse) {
            throw new Error(`Error loading store ${store}: loader failed`);
        }

        const entities: T[] = config.mapper.fromRepoResponse(loaderResponse.content) as T[];
        this.cache = new NGACache<T>(entities);
    }

    getCache(): NGACache<T> {
        return this.cache;
    }
}