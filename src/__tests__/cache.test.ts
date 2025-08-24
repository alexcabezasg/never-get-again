import NGACache from '../cache';

describe('NGACache', () => {
  // Test data
  const testEntities = [
    { id: '1', name: 'Entity 1', value: 100 },
    { id: '2', name: 'Entity 2', value: 200 },
    { id: '3', name: 'Entity 3', value: 300 }
  ];

  describe('constructor', () => {
    it('should initialize cache with provided entities', () => {
      const cache = new NGACache('id', testEntities);
      expect(cache).toBeInstanceOf(NGACache);
    });

    it('should initialize empty cache when no entities provided', () => {
      const cache = new NGACache('id', []);
      expect(cache).toBeInstanceOf(NGACache);
      expect(cache.all()).toHaveLength(0);
    });
  });

  describe('get', () => {
    let cache: NGACache;

    beforeEach(() => {
      cache = new NGACache('id', testEntities);
    });

    it('should return entity by id', () => {
      const entity = cache.get('1');
      expect(entity).toEqual(testEntities[0]);
    });

    it('should return undefined for non-existent id', () => {
      const entity = cache.get('non-existent');
      expect(entity).toBeUndefined();
    });
  });

  describe('all', () => {
    let cache: NGACache;

    beforeEach(() => {
      cache = new NGACache('id', testEntities);
    });

    it('should return all cached entities', () => {
      const entities = cache.all();
      expect(entities).toHaveLength(testEntities.length);
      expect(entities).toEqual(expect.arrayContaining(testEntities));
    });

    it('should return empty array for empty cache', () => {
      const emptyCache = new NGACache('id', []);
      const entities = emptyCache.all();
      expect(entities).toHaveLength(0);
      expect(entities).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle entities with different id field names', () => {
      const entitiesWithDifferentId = [
        { customId: '1', name: 'Entity 1' },
        { customId: '2', name: 'Entity 2' }
      ];
      const cache = new NGACache('customId', entitiesWithDifferentId);
      expect(cache.get('1')).toEqual(entitiesWithDifferentId[0]);
    });

    it('should gracefully handle entities without specified id field', () => {
      const entitiesWithoutId = [
        { name: 'Entity 1' },
        { name: 'Entity 2' }
      ];
      expect(() => new NGACache('id', entitiesWithoutId)).not.toThrow();
      const cache = new NGACache('id', entitiesWithoutId);
      // Should skip entities without the specified id field
      expect(cache.all()).toHaveLength(0);
    });
  });
});
