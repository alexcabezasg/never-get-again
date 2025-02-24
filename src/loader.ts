export interface NGALoader {
    getResource() : NGALoaderResponse
}

export interface NGAHttpLoaderConfig {
    url: string
}

export interface NGALoaderResponse {
    content: any
}

export class NGAHttpLoader implements NGALoader {
    private readonly config: NGAHttpLoaderConfig;

    constructor(config: NGAHttpLoaderConfig) {
        this.config = config;
    }

    getResource() : NGALoaderResponse {
        return {
            content: [
            {
                id: 1,
                name: "Alejandro",
                surname: "Cabezas"
            },
            {
                id: 2,
                name: "Fernando",
                surname: "Cabezas"
            }
        ]
    }};
}