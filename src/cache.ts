import NodeCache from "node-cache";
import NGAEntity from "./entity";

export default class NGACache<T extends NGAEntity> {
    private readonly cache: NodeCache = new NodeCache();

    constructor(entities: T[]) {
        this.cache.mset(entities.map(e => ({ key: e.getId(), val: e })))
    }

    all(): T[] {
        return this.cache.keys().map(key => this.cache.get(key));
    }

    byId(id: string): T {
        return this.cache.get(id);
    }
}