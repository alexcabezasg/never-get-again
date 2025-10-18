import MongoFallbackSystem from '../src/persistence/fallback/mongoFallbackSystem';
import { MongoClient, Collection, Db } from 'mongodb';
import * as dotenv from 'dotenv';

jest.mock('mongodb');
jest.mock('dotenv');

describe('MongoFallbackSystem', () => {
    let mongoFallbackSystem: MongoFallbackSystem;
    let mockCollection: jest.Mocked<Collection>;
    let mockDb: Partial<Db>;
    let mockClient: jest.Mocked<MongoClient>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup MongoDB mocks
        mockCollection = {
            findOne: jest.fn(),
            insertOne: jest.fn(),
        } as unknown as jest.Mocked<Collection>;

        mockDb = {
            collection: jest.fn().mockReturnValue(mockCollection),
        };

        mockClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            db: jest.fn().mockReturnValue(mockDb),
            close: jest.fn(),
        } as unknown as jest.Mocked<MongoClient>;

        // Mock MongoClient constructor
        (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);

        // Mock environment variables
        process.env.MONGO_URL = 'mongodb://test';
        process.env.MONGO_DB = 'testdb';
        process.env.MONGO_COLLECTION = 'testcollection';

        mongoFallbackSystem = new MongoFallbackSystem();
    });

    describe('recover', () => {
        it('should return empty array when no fallback exists', async () => {
            mockCollection.findOne.mockResolvedValue(null);

            const result = await mongoFallbackSystem.recover('testStore');

            expect(result).toEqual([]);
            expect(mockCollection.findOne).toHaveBeenCalledWith({ store: 'testStore' });
        });

        it('should decode and return entities when fallback exists', async () => {
            const testEntities = ['entity1', 'entity2'];
            const encodedEntities = Buffer.from(JSON.stringify(testEntities)).toString('base64');
            mockCollection.findOne.mockResolvedValue({
                store: 'testStore',
                encodedEntities,
                _id: 'test-id'
            });

            const result = await mongoFallbackSystem.recover('testStore');

            expect(result).toEqual(testEntities);
            expect(mockCollection.findOne).toHaveBeenCalledWith({ store: 'testStore' });
        });

        it('should handle connection errors', async () => {
            mockClient.connect.mockRejectedValue(new Error('Connection failed'));

            await expect(mongoFallbackSystem.recover('testStore')).rejects.toThrow('Connection failed');
        });
    });

    describe('save', () => {
        it('should not save if entities already exist', async () => {
            const existingEntities = ['existing1', 'existing2'];
            const encodedExisting = Buffer.from(JSON.stringify(existingEntities)).toString('base64');
            mockCollection.findOne.mockResolvedValue({
                store: 'testStore',
                encodedEntities: encodedExisting,
                _id: 'test-id'
            });

            await mongoFallbackSystem.save('testStore', ['new1', 'new2']);

            expect(mockCollection.insertOne).not.toHaveBeenCalled();
        });

        it('should save new entities when none exist', async () => {
            mockCollection.findOne.mockResolvedValue(null);
            const newEntities = ['new1', 'new2'];

            await mongoFallbackSystem.save('testStore', newEntities);

            expect(mockCollection.insertOne).toHaveBeenCalled();
            const savedEntity = (mockCollection.insertOne as jest.Mock).mock.calls[0][0];
            expect(savedEntity.store).toBe('testStore');

            // Verify the encoded entities can be decoded back
            const decodedEntities = JSON.parse(Buffer.from(savedEntity.encodedEntities, 'base64').toString('utf-8'));
            expect(decodedEntities).toEqual(newEntities);
        });

        it('should close connection after saving', async () => {
            mockCollection.findOne.mockResolvedValue(null);

            await mongoFallbackSystem.save('testStore', ['new1']);

            expect(mockClient.close).toHaveBeenCalled();
        });

        it('should handle connection errors during save', async () => {
            mockClient.connect.mockRejectedValue(new Error('Connection failed'));

            await expect(mongoFallbackSystem.save('testStore', ['new1'])).rejects.toThrow('Connection failed');
        });
    });
});
