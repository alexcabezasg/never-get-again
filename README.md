# Data Replicator

[![CI](https://github.com/alexcabezas0/data-replicator/actions/workflows/ci.yml/badge.svg)](https://github.com/alexcabezas0/data-replicator/actions/workflows/ci.yml)

A flexible and efficient data replication system that fetches data from various sources and maintains it in local caches, improving application performance and reducing external service load.

## Features

- 🔄 **Automatic Data Synchronization**: Keep your data fresh with configurable refresh intervals
- 🎯 **Type-Safe**: Full TypeScript support with automatic type inference
- 🔌 **Extensible**: Easy to add new data sources and caching strategies
- 🚀 **Performance Focused**: Local caching for fast data access
- ⚡ **Lightweight**: Zero external runtime dependencies
- 🛠️ **Configurable**: Simple YAML configuration for all your data sources

## Installation

```bash
npm install data-replicator
```

## Quick Start

1. Create a configuration file `nga.yml`:

```yaml
stores:
  - name: users
    type: http
    refreshInterval: 5000  # 5 seconds
    mapper:
      class: User
      key: id
    config:
      url: http://api.example.com/users

  - name: products
    type: http
    refreshInterval: 60000  # 1 minute
    mapper:
      class: Product
      key: sku
    config:
      url: http://api.example.com/products
```

2. Define your entity classes:

```typescript
// user.ts
export class User {
    id: string;
    name: string;
    email: string;
}

// product.ts
export class Product {
    sku: string;
    name: string;
    price: number;
}
```

3. Initialize the replicator:

```typescript
import { NGAStart } from 'data-replicator';
import { User } from './user';
import { Product } from './product';

// Start the replication system
await NGAStart();

// Your application code...
```

4. Use the repository to access your data:

```typescript
import { NGARepository } from 'data-replicator';
import { User } from './user';
import { Product } from './product';

// Get a single entity
const user = NGARepository.get<User>(User, 'user-123');

// Get all entities
const products = NGARepository.all<Product>(Product);
```

## Configuration

### Store Configuration

| Field | Type | Description |
|-------|------|-------------|
| name | string | Unique identifier for the store |
| type | string | Data source type (e.g., 'http') |
| refreshInterval | number | Milliseconds between data refreshes |
| mapper | object | Entity mapping configuration |
| mapper.class | string | Entity class name |
| mapper.key | string | Primary key field name |
| config | object | Source-specific configuration |
| config.url | string | (For HTTP) Data source URL |

### Supported Data Sources

Currently supported data source types:
- `http`: Fetch data from HTTP/HTTPS endpoints

## Advanced Usage

### Custom Data Sources

You can extend the system with custom data sources by implementing the `NGALoader` interface:

```typescript
import { NGALoader } from 'data-replicator';

export class CustomLoader implements NGALoader {
    async load(): Promise<Record<string, any>[]> {
        // Your custom loading logic here
        return data;
    }
}
```

### Error Handling

The system includes built-in error handling and logging:

```typescript
try {
    await NGAStart();
} catch (error) {
    // Handle startup errors
}

// Individual store errors don't crash the system
// Failed stores will retry on next refresh interval
```

### Type Safety

The repository methods are fully typed:

```typescript
// TypeScript will enforce correct types
const user = NGARepository.get<User>(User, 'user-123');
if (user) {
    // user is typed as User
    console.log(user.name);
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
