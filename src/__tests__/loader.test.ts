import { NGAHttpLoader } from '../loader';

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('NGAHttpLoader', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    it('should create a loader with the provided URL', () => {
      const url = 'https://api.example.com/data';
      const loader = new NGAHttpLoader(url);
      expect(loader).toBeInstanceOf(NGAHttpLoader);
    });
  });

  describe('load', () => {
    const url = 'https://api.example.com/data';
    let loader: NGAHttpLoader;

    beforeEach(() => {
      loader = new NGAHttpLoader(url);
    });

    it('should fetch data from the provided URL', async () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await loader.load();

      expect(mockFetch).toHaveBeenCalledWith(url);
      expect(result).toEqual(mockData);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await loader.load();

      expect(mockFetch).toHaveBeenCalledWith(url);
      expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
      const errorMessage = 'Network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(loader.load()).rejects.toThrow(errorMessage);
      expect(mockFetch).toHaveBeenCalledWith(url);
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(loader.load()).rejects.toThrow('Invalid JSON');
      expect(mockFetch).toHaveBeenCalledWith(url);
    });

    it('should handle non-200 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not found' })
      });

      await expect(loader.load()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledWith(url);
    });
  });
});
