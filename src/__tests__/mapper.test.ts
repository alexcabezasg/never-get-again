import NGAMapper from '../mapper';
import { ClassLoader } from '../util/classLoader';

// Mock the ClassLoader - needs to be before any test code
jest.mock('../util/classLoader');

// Mock class for testing
class TestUser {
  id: number = 0;
  name: string = '';
  email: string = '';
}

// Setup the mock implementation after the class is defined
beforeAll(() => {
  (ClassLoader.getInstance as jest.Mock).mockReturnValue({
    findClass: jest.fn().mockResolvedValue(TestUser)
  });
});

describe('NGAMapper', () => {
  describe('create', () => {
    it('should create an instance of a class with provided data', () => {
      const data = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = NGAMapper.create(TestUser, data);

      expect(result).toBeInstanceOf(TestUser);
      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should ignore properties that are not in the class', () => {
      const data = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        extraField: 'should be ignored'
      };

      const result = NGAMapper.create(TestUser, data);

      expect(result).toBeInstanceOf(TestUser);
      expect((result as any).extraField).toBeUndefined();
    });
  });

  describe('map', () => {
    it('should map an array of entities to class instances', async () => {
      const entities = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
      ];

      const results = await NGAMapper.map<TestUser>('TestUser', entities);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(TestUser);
      expect(results[1]).toBeInstanceOf(TestUser);
      expect(results[0].name).toBe('John Doe');
      expect(results[1].name).toBe('Jane Doe');
    });
  });
});
