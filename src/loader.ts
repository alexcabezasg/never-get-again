import { NGAHttpConfig } from "./config";

export interface NGALoader {
    load() : Promise<Record<string, any>[]>
}

export class NGAHttpLoader implements NGALoader {
    constructor(private config: NGAHttpConfig) {}

    load() : Promise<Record<string, any>[]> {
        return fetch(this.config.url).then(response => response.json());
    }
}