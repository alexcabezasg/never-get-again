import { NGAFallback } from '../src/persistence/fallback/fallback';
import { FallbackSystemFactory } from '../src/persistence/fallback/fallbackSystem';
import type { FallbackSystem } from '../src/persistence/fallback/fallbackSystem';

jest.mock('../src/persistence/fallback/fallbackSystem');

describe('NGAFallback', () => {
    let mockFallbackSystem: jest.Mocked<FallbackSystem>;

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();

        mockFallbackSystem = {
            save: jest.fn(),
            recover: jest.fn(),
        };

        (FallbackSystemFactory.get as jest.Mock).mockImplementation((type: string) => {
            return type === 'mock' ? mockFallbackSystem : undefined;
        });
    });

    describe('save', () => {
        it('should save entities using fallback system', async () => {
            const entities = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }];

            await NGAFallback.save('testStore', 'mock', entities);

            expect(mockFallbackSystem.save).toHaveBeenCalledWith(
                'testStore',
                entities.map(e => JSON.stringify(e))
            );
        });

        it('should handle undefined fallback system', async () => {
            const entities = [{ id: 1, name: 'test' }];

            await NGAFallback.save('testStore', 'unknown', entities);

            expect(mockFallbackSystem.save).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('[NGA] No fallback specified. Skipping fallback save.');
        });

        it('should handle empty entities array', async () => {
            await NGAFallback.save('testStore', 'mock', []);

            expect(mockFallbackSystem.save).toHaveBeenCalledWith('testStore', []);
        });
    });

    describe('recover', () => {
        it('should recover and parse entities from fallback system', async () => {
            const entities = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }];
            mockFallbackSystem.recover.mockResolvedValue(
                entities.map(e => JSON.stringify(e))
            );

            const result = await NGAFallback.recover('testStore', 'mock');

            expect(result).toEqual(entities);
            expect(mockFallbackSystem.recover).toHaveBeenCalledWith('testStore');
        });

        it('should handle undefined fallback system', async () => {
            const result = await NGAFallback.recover('testStore', 'unknown');

            expect(result).toEqual([]);
            expect(mockFallbackSystem.recover).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('[NGA] No fallback specified. Skipping fallback recover.');
        });

        it('should handle empty entities array from fallback', async () => {
            mockFallbackSystem.recover.mockResolvedValue([]);

            const result = await NGAFallback.recover('testStore', 'mock');

            expect(result).toEqual([]);
        });

        it('should handle malformed JSON in recovered entities', async () => {
            mockFallbackSystem.recover.mockResolvedValue(['invalid json']);

            await expect(NGAFallback.recover('testStore', 'mock')).rejects.toThrow();
        });
    });
});
