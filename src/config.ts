import { NGALoader } from "./loader"
import { NGAMapper } from "./mapper"

export interface NGAConfig {
    loader: NGALoader,
    mapper: NGAMapper
}