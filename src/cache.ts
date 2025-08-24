import NodeCache from "node-cache";

export default class NGACache {
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