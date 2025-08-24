export interface NGALoader {
    load() : Promise<Record<string, any>[]>
}

export class NGAHttpLoader implements NGALoader {
    constructor(private url: string) {}

    load() : Promise<Record<string, any>[]> {
        return fetch(this.url).then(response => response.json());
    }
}