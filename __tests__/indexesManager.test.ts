import { NGAIndexesManager } from '../src/util/indexesManager';
import { NGACacheManager } from '../src/util/cacheManager';
import { NGAIndexConfig } from '../src/config/config';
import { NGAIndexCache } from '../src/cache';

// Mock CacheManager
jest.mock('src/util/cacheManager');

describe('NGAIndexesManager', () => {
  // Test data
  const testEntities: Record<string, unknown>[] = [
    { id: '1', category: 'electronics', name: 'Laptop', price: 1000 },
    { id: '2', category: 'books', name: 'TypeScript Guide', price: 50 },
    { id: '3', category: 'electronics', name: 'Phone', price: 800 },
    { id: '4', category: 'books', name: 'Jest Manual', price: 40 },
    { id: '5', category: 'electronics', name: 'Tablet', price: 600 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup CacheManager mock
    (NGACacheManager.getInstance as jest.Mock).mockReturnValue({
      add: jest.fn()
    });
  });

  describe('createIndex', () => {
    it('should create index by specified field', () => {
      const indexConfig: NGAIndexConfig = {
        key: 'byCategory',
        field: 'category'
      };

      NGAIndexesManager.createIndex('Product', 'id', indexConfig, testEntities);

      // Verify cache manager was called correctly
      expect(NGACacheManager.getInstance().add).toHaveBeenCalledWith(
        'Product-byCategory',
        expect.any(NGAIndexCache)
      );

      // Get the created cache from the mock call
      const call = (NGACacheManager.getInstance().add as jest.Mock).mock.calls[0];
      const cache = call[1] as NGAIndexCache;

      // Verify index contents
      expect(cache.get('electronics')).toEqual(['1', '3', '5']);
      expect(cache.get('books')).toEqual(['2', '4']);
    });

    it('should handle empty entities array', () => {
      const indexConfig: NGAIndexConfig = {
        key: 'byCategory',
        field: 'category'
      };

      NGAIndexesManager.createIndex('Product', 'id', indexConfig, []);

      expect(NGACacheManager.getInstance().add).toHaveBeenCalledWith(
        'Product-byCategory',
        expect.any(NGAIndexCache)
      );

      const call = (NGACacheManager.getInstance().add as jest.Mock).mock.calls[0];
      const cache = call[1] as NGAIndexCache;
      expect(cache.get('any')).toBeUndefined();
    });

    it('should handle entities without index field', () => {
      const entitiesWithoutField: Record<string, unknown>[] = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' }
      ];

      const indexConfig: NGAIndexConfig = {
        key: 'byCategory',
        field: 'category'
      };

      NGAIndexesManager.createIndex('Product', 'id', indexConfig, entitiesWithoutField);

      const call = (NGACacheManager.getInstance().add as jest.Mock).mock.calls[0];
      const cache = call[1] as NGAIndexCache;
      expect(cache.get('undefined')).toEqual(['1', '2']);
    });

    it('should handle multiple values for same index', () => {
      const indexConfig: NGAIndexConfig = {
        key: 'byPrice',
        field: 'price'
      };

      const entitiesWithSamePrice: Record<string, unknown>[] = [
        { id: '1', price: 100, name: 'Product 1' },
        { id: '2', price: 100, name: 'Product 2' },
        { id: '3', price: 200, name: 'Product 3' }
      ];

      NGAIndexesManager.createIndex('Product', 'id', indexConfig, entitiesWithSamePrice);

      const call = (NGACacheManager.getInstance().add as jest.Mock).mock.calls[0];
      const cache = call[1] as NGAIndexCache;
      expect(cache.get('100')).toEqual(['1', '2']);
      expect(cache.get('200')).toEqual(['3']);
    });

    it('should handle entities without id field', () => {
      const entitiesWithoutId: Record<string, unknown>[] = [
        { category: 'A', name: 'Product 1' },
        { category: 'B', name: 'Product 2' }
      ];

      const indexConfig: NGAIndexConfig = {
        key: 'byCategory',
        field: 'category'
      };

      NGAIndexesManager.createIndex('Product', 'id', indexConfig, entitiesWithoutId);

      const call = (NGACacheManager.getInstance().add as jest.Mock).mock.calls[0];
      const cache = call[1] as NGAIndexCache;
      expect(cache.get('A')).toEqual([undefined]);
      expect(cache.get('B')).toEqual([undefined]);
    });

    it('should handle large number of entities', () => {
      const largeEntities: Record<string, unknown>[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `id${i}`,
        category: `category${i % 10}`, // 10 different categories
        name: `Product ${i}`
      }));

      const indexConfig: NGAIndexConfig = {
        key: 'byCategory',
        field: 'category'
      };

      NGAIndexesManager.createIndex('Product', 'id', indexConfig, largeEntities);

      const call = (NGACacheManager.getInstance().add as jest.Mock).mock.calls[0];
      const cache = call[1] as NGAIndexCache;

      // Each category should have 100 products
      for (let i = 0; i < 10; i++) {
        const ids = cache.get(`category${i}`);
        expect(ids).toHaveLength(100);
      }
    });
  });
});
