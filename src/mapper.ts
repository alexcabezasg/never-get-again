import NGAEntity from "./entity";

export interface NGAMapper {
    fromRepoResponse(loaderResponse: any): NGAEntity[]
}