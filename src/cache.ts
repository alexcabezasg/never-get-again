import NodeCache from "node-cache";

export interface NGACache {
    get(id: string): Object;
}

export class NGADefaultCache implements NGACache {
    private readonly cache: NodeCache = new NodeCache();

    constructor(entityId: string, entities: Object[]) {
        if (entities.length > 0) {
            const validEntities = entities.filter(e => e[entityId] !== undefined);
            if (validEntities.length > 0) {
                this.cache.mset(validEntities.map(e => ({ key: e[entityId], val: e })));
            }
        }
    }

    get(id: string): Object {
        return this.cache.get(id);
    }

    all(): Object[] {
        return this.cache.keys().map(key => this.cache.get(key));
    }
}

export class NGAIndexCache implements NGACache {
    private readonly cache: NodeCache = new NodeCache();

    constructor(indexes: Map<string, string[]>) {
        this.cache.mset(Array.from(indexes.entries()).map(e => ({ key: e[0], val: e[1] })));
    }

    get(index: string): string[] {
        return this.cache.get(index);
    }
}