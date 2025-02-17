export interface NGALoaderResponse {
    content: any
}

export interface NGALoader {
    getResource() : NGALoaderResponse
}

export class NGAHttpLoader implements NGALoader {
    readonly url: string

    constructor(url: string) {
        this.url = url;
    }

    getResource() : NGALoaderResponse {
        return {
            content: [
            {
                id: "1",
                name: "Alejandro",
                surname: "Cabezas"
            }
        ]
    }};
}