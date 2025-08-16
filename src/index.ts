import NGA from "./nga";
import { NGARepository } from "./repository";
import User from "./user";

async function main() {
    console.log('Starting NGA data replication...\n');
    await NGA();
    setInterval(() => {
        const user: User | undefined = NGARepository.get(User, "1");
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log(user);
    }, 1000);
}

main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
