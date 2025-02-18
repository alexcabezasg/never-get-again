import NGAEntity from "./entity";
import NGAStore from "./store";

export default class NGARepository<T extends NGAEntity> {
    private store: NGAStore<T>;

    constructor(store: string) {
        this.store = new NGAStore<T>(store);
    }

    all(): T[] {
        return this.store.getCache().all();
    }

    byId(id: string): T {
        return this.store.getCache().byId(id);
    }
}