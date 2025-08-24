import NGAStart, { NGA } from 'src/nga';
import { NGAConfigLoader } from 'src/config/configLoader';
import NGAScheduler from 'src/util/scheduler';
import NGAMapper from 'src/mapper';
import { NGALoaderFactory } from 'src/config/loaderFactory';
import { NGACacheManager } from 'src/util/cacheManager';
import { NGAConfig, NGAStoreConfig } from 'src/config/config';

// Mock all dependencies
jest.mock('src/config/configLoader');
jest.mock('src/util/scheduler');
jest.mock('src/mapper');
jest.mock('src/config/loaderFactory');
jest.mock('src/util/cacheManager');

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
        type: 'http',
        refreshInterval: 60000,
        mapper: { class: 'TestEntity1', key: 'id' },
        config: { url: 'http://test1.com' },
        indexes: []
      },
      {
        name: 'TestStore2',
        type: 'http',
        refreshInterval: 120000,
        mapper: { class: 'TestEntity2', key: 'id' },
        config: { url: 'http://test2.com' },
        indexes: []
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
      const result = await NGA.start();

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

      await expect(NGA.start()).rejects.toThrow('Config load failed');
      expect(mockConsoleError).toHaveBeenCalledWith('Fatal error during startup:', error);
    });

    it('should continue if some stores fail to load', async () => {
      // Make the first store fail
      const error = new Error('Load failed');
      mockLoader.load
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce([{ id: '2', name: 'Test2' }]);

      const result = await NGA.start();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ success: false, name: 'TestStore1', error });
      expect(result[1]).toEqual({ success: true, name: 'TestStore2' });
    });
  });

  describe('load', () => {
    it('should successfully load data for a store', async () => {
      const testData = [{ id: '1', name: 'Test' }];
      mockLoader.load.mockResolvedValue(testData);

      const result = await NGA.start();

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

      const result = await NGA.start();

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

      const result = await NGA.start();

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