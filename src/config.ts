import { NGAHttpLoader, NGALoader } from "./loader"
import { NGAMapper } from "./mapper"
import { UsersMapper } from "./test";
export interface NGAConfig {
    loader: NGALoader,
    mapper: NGAMapper
}

export const NGAConfigFetcher = {
    getConfig: (store: string): NGAConfig => {
        return {
            loader: new NGAHttpLoader(""),
            mapper: new UsersMapper()
        };
    }
}