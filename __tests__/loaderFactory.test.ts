import { NGALoaderFactory } from '../src/config/loaderFactory';
import { NGAHttpLoader } from '../src/loader';
import { NGAStoreConfig } from '../src/config/config';

describe('NGALoaderFactory', () => {
    describe('create', () => {
        it('should create an HTTP loader with correct configuration', () => {
            const config: NGAStoreConfig = {
                name: 'test-store',
                type: 'http',
                refreshInterval: 5000,
                mapper: {
                    class: 'TestClass',
                    key: 'id'
                },
                config: {
                    url: 'http://test.com/api'
                }
            };

            const loader = NGALoaderFactory.create(config);

            expect(loader).toBeInstanceOf(NGAHttpLoader);
            // Access private url property for testing
            expect((loader as any).url).toBe('http://test.com/api');
        });

        it('should handle case-insensitive type (HTTP)', () => {
            const config: NGAStoreConfig = {
                name: 'test-store',
                type: 'HTTP',
                refreshInterval: 5000,
                mapper: {
                    class: 'TestClass',
                    key: 'id'
                },
                config: {
                    url: 'http://test.com/api'
                }
            };

            const loader = NGALoaderFactory.create(config);
            expect(loader).toBeInstanceOf(NGAHttpLoader);
        });

        it('should handle case-insensitive type (Http)', () => {
            const config: NGAStoreConfig = {
                name: 'test-store',
                type: 'Http',
                refreshInterval: 5000,
                mapper: {
                    class: 'TestClass',
                    key: 'id'
                },
                config: {
                    url: 'http://test.com/api'
                }
            };

            const loader = NGALoaderFactory.create(config);
            expect(loader).toBeInstanceOf(NGAHttpLoader);
        });

        it('should throw error for unsupported loader type', () => {
            const config: NGAStoreConfig = {
                name: 'test-store',
                type: 'unsupported',
                refreshInterval: 5000,
                mapper: {
                    class: 'TestClass',
                    key: 'id'
                },
                config: {
                    url: 'http://test.com/api'
                }
            };

            expect(() => NGALoaderFactory.create(config))
                .toThrow('Unsupported storage type: unsupported');
        });

        it('should throw error for empty loader type', () => {
            const config: NGAStoreConfig = {
                name: 'test-store',
                type: '',
                refreshInterval: 5000,
                mapper: {
                    class: 'TestClass',
                    key: 'id'
                },
                config: {
                    url: 'http://test.com/api'
                }
            };

            expect(() => NGALoaderFactory.create(config))
                .toThrow('Unsupported storage type:');
        });

        it('should throw error for invalid configuration', () => {
            const invalidConfig = {
                name: 'test-store',
                type: 'http',
                // Missing required fields
            } as NGAStoreConfig;

            expect(() => NGALoaderFactory.create(invalidConfig))
                .toThrow();
        });
    });
});
