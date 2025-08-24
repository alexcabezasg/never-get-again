import { NGARepository } from '../src/repository';
import { NGACacheManager } from '../src/util/cacheManager';

// Mock the CacheManager
jest.mock('src/util/cacheManager');

// Test class
class TestEntity {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

describe('NGARepository', () => {
  let mockCache: jest.Mocked<any>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock cache
    mockCache = {
      get: jest.fn(),
      all: jest.fn(),
    };

    // Setup CacheManager mock
    const mockGetInstance = jest.fn().mockReturnValue({
      get: jest.fn(),
    });
    (NGACacheManager.getInstance as jest.Mock).mockImplementation(mockGetInstance);
  });

  describe('get', () => {
    it('should return entity when cache exists', () => {
      const testEntity: Record<string, unknown> = { id: '1', name: 'Test Entity' };
      mockCache.get.mockReturnValue(testEntity);

      // Setup cache manager to return our mock cache
      (NGACacheManager.getInstance().get as jest.Mock).mockReturnValue(mockCache);

      const result = NGARepository.get<TestEntity>(TestEntity, '1');

      expect(result).toBe(testEntity);
      expect(NGACacheManager.getInstance().get).toHaveBeenCalledWith('TestEntity');
      expect(mockCache.get).toHaveBeenCalledWith('1');
    });

    it('should return undefined and log error when cache does not exist', () => {
      // Mock console.error to avoid cluttering test output
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // Setup cache manager to return undefined (no cache)
      (NGACacheManager.getInstance().get as jest.Mock).mockReturnValue(undefined);

      const result = NGARepository.get<TestEntity>(TestEntity, '1');

      expect(result).toBeUndefined();
      expect(NGACacheManager.getInstance().get).toHaveBeenCalledWith('TestEntity');
      expect(mockConsoleError).toHaveBeenCalledWith('[NGA] Cache TestEntity not found');
    });

    it('should return undefined when entity does not exist in cache', () => {
      mockCache.get.mockReturnValue(undefined);
      (NGACacheManager.getInstance().get as jest.Mock).mockReturnValue(mockCache);

      const result = NGARepository.get<TestEntity>(TestEntity, 'non-existent');

      expect(result).toBeUndefined();
      expect(mockCache.get).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('all', () => {
    it('should return all entities when cache exists', () => {
      const testEntities: Record<string, unknown>[] = [
        { id: '1', name: 'Test Entity 1' },
        { id: '2', name: 'Test Entity 2' }
      ];
      mockCache.all.mockReturnValue(testEntities);
      (NGACacheManager.getInstance().get as jest.Mock).mockReturnValue(mockCache);

      const result = NGARepository.all<TestEntity>(TestEntity);

      expect(result).toBe(testEntities);
      expect(NGACacheManager.getInstance().get).toHaveBeenCalledWith('TestEntity');
      expect(mockCache.all).toHaveBeenCalled();
    });

    it('should return undefined and log error when cache does not exist', () => {
      // Mock console.error to avoid cluttering test output
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // Setup cache manager to return undefined (no cache)
      (NGACacheManager.getInstance().get as jest.Mock).mockReturnValue(undefined);

      const result = NGARepository.all<TestEntity>(TestEntity);

      expect(result).toBeUndefined();
      expect(NGACacheManager.getInstance().get).toHaveBeenCalledWith('TestEntity');
      expect(mockConsoleError).toHaveBeenCalledWith('[NGA] Cache TestEntity not found');
    });

    it('should return empty array when cache is empty', () => {
      mockCache.all.mockReturnValue([]);
      (NGACacheManager.getInstance().get as jest.Mock).mockReturnValue(mockCache);

      const result = NGARepository.all<TestEntity>(TestEntity);

      expect(result).toEqual([]);
      expect(mockCache.all).toHaveBeenCalled();
    });
  });
});