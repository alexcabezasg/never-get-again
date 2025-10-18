import { FallbackSystemFactory } from '../src/persistence/fallback/fallbackSystem';
import MongoFallbackSystem from '../src/persistence/fallback/mongoFallbackSystem';

jest.mock('../src/persistence/fallback/mongoFallbackSystem');

describe('FallbackSystemFactory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
    });

    it('should return undefined when no fallback type is specified', () => {
        const result = FallbackSystemFactory.get('');

        expect(result).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith('[NGA] No fallback type specified');
    });

    it('should return undefined for unknown fallback type', () => {
        const result = FallbackSystemFactory.get('unknown');

        expect(result).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith('[NGA] Fallback system not found for unknown');
    });

    it('should return MongoFallbackSystem for mongo type', () => {
        const result = FallbackSystemFactory.get('mongo');

        expect(result).toBeInstanceOf(MongoFallbackSystem);
    });

    it('should be case insensitive', () => {
        const result = FallbackSystemFactory.get('MONGO');

        expect(result).toBeInstanceOf(MongoFallbackSystem);
    });
});
