export interface NGALoader {
    load() : Promise<Record<string, any>[]>
}

export class NGAHttpLoader implements NGALoader {
    constructor(private url: string) {}

    async load(): Promise<Record<string, any>[]> {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
}