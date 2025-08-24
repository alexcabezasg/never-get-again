import { ClassLoader } from "./util/classLoader";

const NGAMapper = {
    async map<T>(klassName: string, entities: unknown[]): Promise<T[]> {
        const klass = await ClassLoader.getInstance().findClass(klassName);
        return entities.map(entity => {
            if (typeof entity !== 'object' || entity === null) {
                throw new Error('Entity must be an object');
            }
            return this.create(klass, entity as Record<string, unknown>);
        });
    },

    create<T>(klass: new () => T, data: Record<string, unknown>): T {
        const obj = new klass();

        // Get properties from the static properties getter
        const properties = Object.keys(obj as object);

        // Set the values using the internal properties
        properties.forEach(key => {
            if (key in data) {
                (obj as any)[key] = data[key];
            }
        });

        return obj;
    }
}

export default NGAMapper;