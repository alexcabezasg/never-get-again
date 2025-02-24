import NGAEntity from "./entity";

export interface NGAMapper {
    toEntity(loaderResponse: any[]): NGAEntity[]
}

export class NGADefaultMapper implements NGAMapper {
    private type: {new(...args: any[]) : NGAEntity;}

    constructor(type: {new(...args: any[]) : NGAEntity;}) {
        this.type = type;
    }

    toEntity(content: any[]): NGAEntity[] {
        return content.map(entry => {
            return new this.type(...Object.values(entry));
        });
    }
}