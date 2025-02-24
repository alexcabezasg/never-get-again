import NGAEntity from "../entity";
import { NGAHttpLoader } from "../loader";
import { NGADefaultMapper } from "../mapper";
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

class UsersRepository extends NGARepository<User> {
    constructor() {
        super({
            loader: new NGAHttpLoader({
                url: "http://localhost:3000/users"
            }),
            mapper: new NGADefaultMapper(User)
        });
    }

    getByName(name: string): User | undefined {
        return this.all().find(user => user.name == name);
    }
}

const repository = new UsersRepository();

console.log(repository.byId("1"));
console.log(repository.getByName("Fernando"));