import { NGAConfigFetcher } from "./config";
import NGAEntity from "./entity";
import { NGALoaderResponse } from "./loader";

export default class NGAStore<T extends NGAEntity> {
    private data: Map<string, T> = new Map();

    constructor(store: string) {
        const config = new NGAConfigFetcher().configFromStoreName(store);
        if(!config) {
            throw new Error(`Error loading store ${store}: configuration not defined or not correct`);
        }

        const loaderResponse: NGALoaderResponse = config.loader.getResource();
        if(!loaderResponse) {
            throw new Error(`Error loading store ${store}: loader failed`);
        }

        const entities: T[] = config.mapper.fromRepoResponse(loaderResponse.content) as T[];
        entities.forEach(e => this.data.set(e.getId(), e));
    }

    getData(): Map<string, T> {
        return this.data;
    }
}