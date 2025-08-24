import { NGAStoreConfig } from "./config";
import { NGAHttpLoader, NGALoader } from "../loader";

export const NGALoaderFactory = {
    create(store: NGAStoreConfig): NGALoader {
        switch (store.type.toLowerCase()) {
            case 'http':
                return new NGAHttpLoader(store.config.url);
            default:
                throw new Error(`Unsupported storage type: ${store.type}`);
        }
    }
}