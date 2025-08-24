import { ClassLoader } from "./util/classLoader";

const NGAMapper = {
    async map<T>(klassName: string, entities: Record<string, any>[]): Promise<T[]> {
        const klass = await ClassLoader.getInstance().findClass(klassName);
        return entities.map(entity => {
            return this.create(klass, entity);
        });
    },

    create<T>(klass: new () => T, data: Record<string, any>): T {
        const obj = new klass();

        // Get properties from the static properties getter
        const properties = Object.keys(obj);

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