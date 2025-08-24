import { NGAConfigLoader } from '../config/configLoader';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';
import { NGAConfig } from '../config/config';

// Mock dependencies
jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

jest.mock('js-yaml', () => ({
  load: jest.fn()
}));

// Mock console.error to avoid cluttering test output
const mockConsoleError = jest.fn();
console.error = mockConsoleError;

describe('NGAConfigLoader', () => {
  const mockCwd = '/test/project';
  const configPath = join(mockCwd, 'nga.yml');

  // Sample valid configuration
  const validConfig: NGAConfig = {
    stores: [
      {
        name: 'users',
        type: 'http',
        refreshInterval: 5000,
        mapper: {
          class: 'User',
          key: 'id'
        },
        config: {
          url: 'http://localhost:3000/users'
        }
      }
    ]
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.resetModules();

    // Mock process.cwd()
    process.cwd = jest.fn().mockReturnValue(mockCwd);
  });

  describe('load', () => {
    it('should load and parse valid configuration', () => {
      // Mock file content
      const yamlContent = `
stores:
  - name: users
    type: http
    refreshInterval: 5000
    mapper:
      class: User
      key: id
    config:
      url: http://localhost:3000/users
`;

      // Mock dependencies
      (readFileSync as jest.Mock).mockReturnValue(yamlContent);
      (load as jest.Mock).mockReturnValue(validConfig);

      const config = NGAConfigLoader.load();

      expect(config).toEqual(validConfig);
      expect(readFileSync).toHaveBeenCalledWith(configPath, 'utf8');
      expect(load).toHaveBeenCalledWith(yamlContent);
    });

    it('should handle file not found error', () => {
      // Mock file not found error
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => NGAConfigLoader.load()).toThrow('ENOENT: no such file or directory');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error loading configuration:',
        expect.any(Error)
      );
    });

    it('should handle invalid YAML syntax', () => {
      // Mock invalid YAML content
      const invalidYaml = `
stores:
  - name: users
    type: http
    refreshInterval: 5000
    mapper:
      class: User
      key: id
    config:
      url: http://localhost:3000/users
  - invalid yaml syntax here
`;

      (readFileSync as jest.Mock).mockReturnValue(invalidYaml);
      (load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML syntax');
      });

      expect(() => NGAConfigLoader.load()).toThrow('Invalid YAML syntax');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error loading configuration:',
        expect.any(Error)
      );
    });

    it('should handle empty configuration file', () => {
      // Mock empty file
      (readFileSync as jest.Mock).mockReturnValue('');
      (load as jest.Mock).mockReturnValue(null);

      expect(() => NGAConfigLoader.load()).toThrow();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle configuration with no stores', () => {
      // Mock config with empty stores array
      const emptyConfig = {
        stores: []
      };

      (readFileSync as jest.Mock).mockReturnValue('stores: []');
      (load as jest.Mock).mockReturnValue(emptyConfig);

      const config = NGAConfigLoader.load();
      expect(config).toEqual(emptyConfig);
      expect(config.stores).toHaveLength(0);
    });

    it('should handle multiple stores in configuration', () => {
      // Mock config with multiple stores
      const multiStoreConfig: NGAConfig = {
        stores: [
          {
            name: 'users',
            type: 'http',
            refreshInterval: 5000,
            mapper: {
              class: 'User',
              key: 'id'
            },
            config: {
              url: 'http://localhost:3000/users'
            }
          },
          {
            name: 'products',
            type: 'http',
            refreshInterval: 10000,
            mapper: {
              class: 'Product',
              key: 'sku'
            },
            config: {
              url: 'http://localhost:3000/products'
            }
          }
        ]
      };

      const yamlContent = `
stores:
  - name: users
    type: http
    refreshInterval: 5000
    mapper:
      class: User
      key: id
    config:
      url: http://localhost:3000/users
  - name: products
    type: http
    refreshInterval: 10000
    mapper:
      class: Product
      key: sku
    config:
      url: http://localhost:3000/products
`;

      (readFileSync as jest.Mock).mockReturnValue(yamlContent);
      (load as jest.Mock).mockReturnValue(multiStoreConfig);

      const config = NGAConfigLoader.load();
      expect(config).toEqual(multiStoreConfig);
      expect(config.stores).toHaveLength(2);
      expect(config.stores[0].name).toBe('users');
      expect(config.stores[1].name).toBe('products');
    });
  });
});
