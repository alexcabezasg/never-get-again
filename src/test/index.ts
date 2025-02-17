import NGAEntity from "../entity";
import { NGAMapper } from "../mapper";
import NGAStore from "../store";

class User extends NGAEntity {
    name: string
    surname: string

    constructor(id, name, surname) {
        super(id);
        this.name = name;
        this.surname = surname
    }
}

export class UserMapper implements NGAMapper {
    fromRepoResponse(loaderResponse: any): User[] {
        return loaderResponse.map(entry => {
            return new User(entry.id, entry.name, entry.surname)
        });
    }
}

class UserRepository {
    private userStore: NGAStore<User> = new NGAStore<User>("users");

    byId(id: string): User {
        return this.userStore.getData().get(id);
    }
}

console.log(new UserRepository().byId("1"))