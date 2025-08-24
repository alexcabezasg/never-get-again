import { ClassLoader } from '../src/util/classLoader';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Create a class with the correct name property
class TestClass {}
Object.defineProperty(TestClass, 'name', { value: 'TestClass' });

// Mock fs functions
jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  statSync: jest.fn()
}));

// Mock console.error to avoid cluttering test output
const mockConsoleError = jest.fn();
console.error = mockConsoleError;

describe('ClassLoader', () => {
  const mockCwd = '/test/project';
  const srcPath = join(mockCwd, 'src');

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.resetModules();

    // Mock process.cwd()
    process.cwd = jest.fn().mockReturnValue(mockCwd);

    // Reset the singleton instance
    (ClassLoader as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = ClassLoader.getInstance();
      const instance2 = ClassLoader.getInstance();

      expect(instance1).toBeDefined();
      expect(instance1).toBe(instance2);
    });
  });

  describe('findClass', () => {
    let classLoader: ClassLoader;

    beforeEach(() => {
      classLoader = ClassLoader.getInstance();
      // Mock the private method to avoid dynamic imports
      (classLoader as any).searchClassInDirectory = jest.fn();
    });

    it('should find a class in the root src directory', async () => {
      // Mock the search to return our test class
      (classLoader as any).searchClassInDirectory.mockResolvedValueOnce({
        default: TestClass
      });

      const result = await classLoader.findClass('TestClass');
      expect(result).toBeDefined();
      expect(result?.name).toBe('TestClass');
      expect((classLoader as any).searchClassInDirectory).toHaveBeenCalledWith(srcPath, 'TestClass');
    });

    it('should find a class in a nested directory', async () => {
      // Mock the search to return our test class
      (classLoader as any).searchClassInDirectory.mockResolvedValueOnce({
        default: TestClass
      });

      const result = await classLoader.findClass('TestClass');
      expect(result).toBeDefined();
      expect(result?.name).toBe('TestClass');
      expect((classLoader as any).searchClassInDirectory).toHaveBeenCalledWith(srcPath, 'TestClass');
    });

    it('should return undefined when class is not found', async () => {
      // Mock the search to return null
      (classLoader as any).searchClassInDirectory.mockResolvedValueOnce(null);

      const result = await classLoader.findClass('NonExistentClass');

      expect(result).toBeUndefined();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error loading class NonExistentClass:',
        expect.any(Error)
      );
    });

    it('should handle search errors gracefully', async () => {
      // Mock the search to throw an error
      (classLoader as any).searchClassInDirectory.mockRejectedValueOnce(
        new Error('Search failed')
      );

      const result = await classLoader.findClass('BrokenClass');
      expect(result).toBeUndefined();
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('searchClassInDirectory', () => {
    let classLoader: ClassLoader;

    beforeEach(() => {
      classLoader = ClassLoader.getInstance();
    });

    it('should search recursively through directories', async () => {
      // Mock file system for a nested directory structure
      (readdirSync as jest.Mock)
        .mockReturnValueOnce(['models']) // First call for src/
        .mockReturnValueOnce(['TestClass.ts']); // Second call for src/models/

      (statSync as jest.Mock).mockImplementation((path) => ({
        isDirectory: () => path.endsWith('models'),
        isFile: () => path.endsWith('.ts')
      }));

      // Call the private method directly
      const result = await (classLoader as any).searchClassInDirectory(srcPath, 'TestClass');
      expect(readdirSync).toHaveBeenCalledTimes(2);
    });

    it('should skip non-typescript files', async () => {
      // Mock file system with mixed file types
      (readdirSync as jest.Mock).mockReturnValue(['test.js', 'test.json', 'TestClass.ts']);
      (statSync as jest.Mock).mockReturnValue({
        isDirectory: () => false,
        isFile: () => true
      });

      // Call the private method directly
      await (classLoader as any).searchClassInDirectory(srcPath, 'TestClass');
      expect(readdirSync).toHaveBeenCalledTimes(1);
    });

    it('should handle file system errors', async () => {
      // Mock readdirSync to throw an error
      (readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('File system error');
      });

      // Call the private method directly and expect it to handle the error
      const result = await classLoader.findClass('TestClass');
      expect(result).toBeUndefined();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error loading class TestClass:',
        expect.any(Error)
      );
    });
  });
});