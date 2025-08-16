const NGAMapper = {
    map<T>(klass: new () => T, entities: Record<string, any>[]): T[] {
        return entities.map(entity => {
            return this.create(klass, entity);
        });
    },

    create<T>(klass: new () => T, data: Record<string, any>): T {
        const obj = new klass();

        // Get properties from the static properties getter
        const properties = (klass as any).properties || [];

        // Set the values using the internal properties
        properties.forEach(key => {
            if (key in data) {
                const internalKey = `_${key}`;
                (obj as any)[internalKey] = data[key];
            }
        });

        return obj;
    }
}

export default NGAMapper;