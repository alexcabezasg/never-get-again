import NodeCache from "node-cache";

export interface NGACache<T = Record<string, unknown>> {
    get(id: string): T | undefined;
}

export class NGADefaultCache implements NGACache<Record<string, unknown>> {
    private readonly cache: NodeCache = new NodeCache();

    constructor(entityId: string, entities: unknown[]) {
        if (entities.length > 0) {
            const validEntities = entities.filter((e): e is Record<string, unknown> =>
                typeof e === 'object' && e !== null && entityId in e && (e as Record<string, unknown>)[entityId] !== undefined
            );
            if (validEntities.length > 0) {
                this.cache.mset(validEntities.map(e => ({ key: e[entityId] as string, val: e })));
            }
        }
    }

    get(id: string): Record<string, unknown> | undefined {
        return this.cache.get<Record<string, unknown>>(id);
    }

    all(): Record<string, unknown>[] {
        return this.cache.keys().map(key => this.cache.get<Record<string, unknown>>(key)).filter((item): item is Record<string, unknown> => item !== undefined);
    }
}

export class NGAIndexCache implements NGACache<string[]> {
    private readonly cache: NodeCache = new NodeCache();

    constructor(indexes: Map<string, string[]>) {
        this.cache.mset(Array.from(indexes.entries()).map(e => ({ key: e[0], val: e[1] })));
    }

    get(index: string): string[] | undefined {
        return this.cache.get<string[]>(index);
    }
}