import NGAEntity from "../entity";
import { NGAMapper } from "../mapper";
import NGARepository from "../repository";

class User extends NGAEntity {
    name: string
    surname: string

    constructor(id, name, surname) {
        super(id);
        this.name = name;
        this.surname = surname
    }
}

export class UsersMapper implements NGAMapper {
    fromRepoResponse(loaderResponse: any): User[] {
        return loaderResponse.map(entry => {
            return new User(entry.id, entry.name, entry.surname)
        });
    }
}

console.log(new NGARepository<User>("users").byId("1"));