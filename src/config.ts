import { NGAHttpLoader, NGALoader } from "./loader"
import { NGAMapper } from "./mapper"
import { UserMapper } from "./test";

export interface NGAConfig {
    loader: NGALoader,
    mapper: NGAMapper
}

export class NGAConfigFetcher {
    configFromStoreName(store: string): NGAConfig {
        return {
            loader: new NGAHttpLoader(""),
            mapper: new UserMapper()
        };
    }
}