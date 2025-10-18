import { FallbackSystem } from "./fallbackSystem";
import * as mongoDB from "mongodb";
import { ObjectId } from "mongodb";
import * as dotenv from "dotenv";

export default class MongoFallbackSystem implements FallbackSystem {
    async recover(store: string): Promise<string[]> {
        dotenv.config();

        const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL || "");
        await client.connect();

        const db = client.db(process.env.MONGO_DB);
        const collection = db.collection(process.env.MONGO_COLLECTION || "");

        const fallback = (await collection.findOne({ store })) as MongoEntity;
        if (!fallback) {
            return [];
        }

        return JSON.parse(Buffer.from(fallback.encodedEntities, "base64").toString("utf-8"));
    }

    async save(store: string, entities: string[]): Promise<void> {
        const existingEntities = await this.recover(store);
        if (existingEntities.length > 0) {
            return;
        }

        dotenv.config();

        const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL || "");
        await client.connect();

        const db = client.db(process.env.MONGO_DB);
        const collection = db.collection(process.env.MONGO_COLLECTION || "");

        const encodedEntities = Buffer.from(JSON.stringify(entities)).toString("base64");
        const mongoEntity = new MongoEntity(store, encodedEntities, new ObjectId());
        await collection.insertOne(mongoEntity);

        client.close();
        console.log(`[NGA] Saving ${entities.length} entities to mongo fallback system for store ${store}`);
    }
}

class MongoEntity {
    constructor(public store: string, public encodedEntities: string, public _id: ObjectId) {}
}