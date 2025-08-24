import { NGAIndexConfig } from "../config/config";
import { NGACacheManager } from "./cacheManager";
import { NGAIndexCache } from "../cache";

export const NGAIndexesManager = {
    createIndex: (className: string, keyName: string, index: NGAIndexConfig, entities: any[]) => {
        const byIndex = entities.reduce((acc, entity) => {
            const id = entity[keyName];
            const indexValue = entity[index.field]?.toString() ?? 'undefined';
            const idList = acc.get(indexValue);
            if (!idList) {
                acc.set(indexValue, [id]);
            } else {
                idList.push(id);
                acc.set(indexValue, idList);
            }
            return acc;
        }, new Map<string, string[]>());

        NGACacheManager.getInstance().add(`${className}-${index.key}`, new NGAIndexCache(byIndex));
    }
}