import { NGADefaultCache, NGAIndexCache } from 'src/cache';

describe('NGADefaultCache', () => {
  // Test data
  const testEntities = [
    { id: '1', name: 'Entity 1', value: 100 },
    { id: '2', name: 'Entity 2', value: 200 },
    { id: '3', name: 'Entity 3', value: 300 }
  ];

  describe('constructor', () => {
    it('should initialize cache with provided entities', () => {
      const cache = new NGADefaultCache('id', testEntities);
      expect(cache).toBeInstanceOf(NGADefaultCache);
    });

    it('should initialize empty cache when no entities provided', () => {
      const cache = new NGADefaultCache('id', []);
      expect(cache).toBeInstanceOf(NGADefaultCache);
      expect(cache.all()).toHaveLength(0);
    });
  });

  describe('get', () => {
    let cache: NGADefaultCache;

    beforeEach(() => {
      cache = new NGADefaultCache('id', testEntities);
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
    let cache: NGADefaultCache;

    beforeEach(() => {
      cache = new NGADefaultCache('id', testEntities);
    });

    it('should return all cached entities', () => {
      const entities = cache.all();
      expect(entities).toHaveLength(testEntities.length);
      expect(entities).toEqual(expect.arrayContaining(testEntities));
    });

    it('should return empty array for empty cache', () => {
      const emptyCache = new NGADefaultCache('id', []);
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
      const cache = new NGADefaultCache('customId', entitiesWithDifferentId);
      expect(cache.get('1')).toEqual(entitiesWithDifferentId[0]);
    });

    it('should gracefully handle entities without specified id field', () => {
      const entitiesWithoutId = [
        { name: 'Entity 1' },
        { name: 'Entity 2' }
      ];
      expect(() => new NGADefaultCache('id', entitiesWithoutId)).not.toThrow();
      const cache = new NGADefaultCache('id', entitiesWithoutId);
      expect(cache.all()).toHaveLength(0);
    });
  });
});

describe('NGAIndexCache', () => {
  // Test data
  const testEntities = [
    { id: '1', category: 'A', name: 'Entity 1' },
    { id: '2', category: 'B', name: 'Entity 2' },
    { id: '3', category: 'A', name: 'Entity 3' },
    { id: '4', category: 'C', name: 'Entity 4' },
    { id: '5', category: 'B', name: 'Entity 5' }
  ];

  describe('constructor', () => {
    it('should initialize index cache with provided indexes', () => {
      const indexes = new Map<string, string[]>([
        ['A', ['1', '3']],
        ['B', ['2', '5']],
        ['C', ['4']]
      ]);
      const cache = new NGAIndexCache(indexes);
      expect(cache).toBeInstanceOf(NGAIndexCache);
    });

    it('should initialize empty index cache when no indexes provided', () => {
      const cache = new NGAIndexCache(new Map());
      expect(cache).toBeInstanceOf(NGAIndexCache);
      expect(cache.get('any')).toBeUndefined();
    });
  });

  describe('get', () => {
    let cache: NGAIndexCache;
    const indexes = new Map<string, string[]>([
      ['A', ['1', '3']],
      ['B', ['2', '5']],
      ['C', ['4']]
    ]);

    beforeEach(() => {
      cache = new NGAIndexCache(indexes);
    });

    it('should return ids by index value', () => {
      const aIds = cache.get('A');
      expect(aIds).toEqual(['1', '3']);

      const bIds = cache.get('B');
      expect(bIds).toEqual(['2', '5']);

      const cIds = cache.get('C');
      expect(cIds).toEqual(['4']);
    });

    it('should return undefined for non-existent index value', () => {
      const ids = cache.get('non-existent');
      expect(ids).toBeUndefined();
    });

    it('should handle empty index arrays', () => {
      const emptyIndexes = new Map<string, string[]>([
        ['empty', []]
      ]);
      const emptyCache = new NGAIndexCache(emptyIndexes);
      const ids = emptyCache.get('empty');
      expect(ids).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of indexes', () => {
      const largeIndexes = new Map<string, string[]>();
      for (let i = 0; i < 1000; i++) {
        largeIndexes.set(`index${i}`, [`id${i}`]);
      }
      const cache = new NGAIndexCache(largeIndexes);
      expect(cache.get('index500')).toEqual(['id500']);
    });

    it('should handle large number of ids per index', () => {
      const manyIds = Array.from({ length: 1000 }, (_, i) => `id${i}`);
      const largeIndexes = new Map<string, string[]>([
        ['large', manyIds]
      ]);
      const cache = new NGAIndexCache(largeIndexes);
      const ids = cache.get('large');
      expect(ids).toHaveLength(1000);
      expect(ids).toEqual(manyIds);
    });
  });
});