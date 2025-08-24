import NGAStart from '../nga';
import { NGAConfigLoader } from '../config/configLoader';
import NGAScheduler from '../util/scheduler';
import NGAMapper from '../mapper';
import { NGALoaderFactory } from '../config/loaderFactory';
import { NGACacheManager } from '../util/cacheManager';
import { NGAConfig, NGAStoreConfig } from '../config/config';

// Mock all dependencies
jest.mock('../config/configLoader');
jest.mock('../util/scheduler');
jest.mock('../mapper');
jest.mock('../config/loaderFactory');
jest.mock('../util/cacheManager');

// Mock console methods to avoid cluttering test output
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
console.log = mockConsoleLog;
console.error = mockConsoleError;

describe('NGA', () => {
  // Sample test data
  const testConfig: NGAConfig = {
    stores: [
      {
        name: 'TestStore1',
        refreshInterval: 60000,
        type: 'http',
        config: { url: 'http://test1.com' },
        mapper: { class: 'TestEntity1', key: 'id' }
      },
      {
        name: 'TestStore2',
        refreshInterval: 120000,
        type: 'http',
        config: { url: 'http://test2.com' },
        mapper: { class: 'TestEntity2', key: 'id' }
      }
    ]
  };

  const mockLoader = {
    load: jest.fn()
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (NGAConfigLoader.load as jest.Mock).mockReturnValue(testConfig);
    (NGALoaderFactory.create as jest.Mock).mockReturnValue(mockLoader);
    (NGAMapper.map as jest.Mock).mockImplementation((_, data) => Promise.resolve(data));
    (NGACacheManager.getInstance as jest.Mock).mockReturnValue({
      add: jest.fn()
    });
    mockLoader.load.mockResolvedValue([{ id: '1', name: 'Test' }]);
  });

  describe('start', () => {
    it('should successfully start and load all stores', async () => {
      const result = await NGAStart();

      expect(NGAConfigLoader.load).toHaveBeenCalled();
      expect(NGAScheduler.schedule).toHaveBeenCalledTimes(2);
      expect(mockConsoleLog).toHaveBeenCalledWith('[NGA] Starting data load...');

      // Verify results
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ success: true, name: 'TestStore1' });
      expect(result[1]).toEqual({ success: true, name: 'TestStore2' });
    });

    it('should handle configuration loading errors', async () => {
      const error = new Error('Config load failed');
      (NGAConfigLoader.load as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(NGAStart()).rejects.toThrow('Config load failed');
      expect(mockConsoleError).toHaveBeenCalledWith('Fatal error during startup:', error);
    });

    it('should continue if some stores fail to load', async () => {
      // Make the first store fail
      const error = new Error('Load failed');
      mockLoader.load
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce([{ id: '2', name: 'Test2' }]);

      const result = await NGAStart();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ success: false, name: 'TestStore1', error });
      expect(result[1]).toEqual({ success: true, name: 'TestStore2' });
    });
  });

  describe('load', () => {
    it('should successfully load data for a store', async () => {
      const testData = [{ id: '1', name: 'Test' }];
      mockLoader.load.mockResolvedValue(testData);

      const result = await NGAStart();

      expect(NGALoaderFactory.create).toHaveBeenCalled();
      expect(NGAMapper.map).toHaveBeenCalled();
      expect(NGACacheManager.getInstance().add).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successfully loaded 1 entities')
      );
      expect(result[0].success).toBe(true);
    });

    it('should handle loader errors', async () => {
      const error = new Error('Load failed');
      mockLoader.load.mockRejectedValue(error);

      const result = await NGAStart();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load: TestStore1')
      );
      expect(result[0]).toEqual({
        success: false,
        name: 'TestStore1',
        error
      });
    });

    it('should handle mapper errors', async () => {
      const error = new Error('Mapping failed');
      (NGAMapper.map as jest.Mock).mockRejectedValue(error);

      const result = await NGAStart();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load: TestStore1')
      );
      expect(result[0]).toEqual({
        success: false,
        name: 'TestStore1',
        error
      });
    });
  });
});
