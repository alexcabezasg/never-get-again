# Never Get Again! A Data Replicator

[![npm version](https://img.shields.io/npm/v/never-get-again.svg)](https://www.npmjs.com/package/never-get-again)
[![npm downloads](https://img.shields.io/npm/dm/never-get-again.svg)](https://www.npmjs.com/package/never-get-again)
[![CI](https://github.com/alexcabezasg/never-get-again/actions/workflows/ci.yml/badge.svg)](https://github.com/alexcabezasg/never-get-again/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<p align="center">
  <img src="https://raw.githubusercontent.com/alexcabezasg/never-get-again/main/assets/logo.png" alt="Never Get Again Logo" width="200"/>
</p>

A flexible and efficient data replication system that fetches data from various sources and maintains it in local caches, improving application performance and reducing external service load.

🚀 **Perfect for:**
- Caching API responses
- Real-time data synchronization
- Offline-first applications
- High-performance data access
- Type-safe data management

## Features

- 🔄 **Automatic Data Synchronization**: Keep your data fresh with configurable refresh intervals
- 🎯 **Type-Safe**: Full TypeScript support with automatic type inference
- 📑 **Smart Indexing**: Create custom indexes for faster data lookups
- 🔌 **Extensible**: Easy to add new data sources and caching strategies
- 🚀 **Performance Focused**: Local caching for fast data access
- ⚡ **Lightweight**: Zero external runtime dependencies
- 🛠️ **Configurable**: Simple YAML configuration for all your data sources

## Installation

Using npm:
```bash
npm install never-get-again
```

Using yarn:
```bash
yarn add never-get-again
```

Using pnpm:
```bash
pnpm add never-get-again
```

### Requirements
- Node.js >= 14.0.0
- TypeScript >= 4.5.0 (for TypeScript users)

### Bundle Size

| Package | Size (minified) | Size (gzipped) |
|---------|----------------|----------------|
| never-get-again | ~12KB | ~4KB |

### Dependencies

This package has minimal dependencies:
- `js-yaml`: For YAML configuration parsing
- `node-cache`: For efficient in-memory caching

All dependencies are carefully chosen to maintain a small footprint while providing robust functionality.

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
    # Optional: Define indexes for faster lookups
    indexes:
      - key: byRole      # Index name
        field: role      # Field to index by
      - key: byCountry
        field: country

  - name: products
    type: http
    refreshInterval: 60000  # 1 minute
    mapper:
      class: Product
      key: sku
    config:
      url: http://api.example.com/products
    indexes:
      - key: byCategory
        field: category
      - key: byPrice
        field: price
```

2. Define your entity classes (empty constructor is required):

```typescript
// user.ts
export class User {
    id: string;
    name: string;
    email: string;
    role: string;
    country: string;

    constructor() {
        this.id = '';
        this.name = '';
        this.email = '';
        this.role = '';
        this.country = '';
    }
}

// product.ts
export class Product {
    sku: string;
    name: string;
    price: number;
    category: string;

    constructor() {
        this.sku = '';
        this.name = '';
        this.price = 0;
        this.category = '';
    }
}
```

3. Initialize the replicator:

```typescript
import { NGAStart } from 'never-get-again';
import { User } from './user';
import { Product } from './product';

// Start the replication system
await NGAStart();

// Your application code...
```

4. Use the repository to access your data:

```typescript
import { NGARepository } from 'never-get-again';
import { User } from './user';
import { Product } from './product';

// Get a single entity
const user = NGARepository.get<User>(User, 'user-123');

// Get all entities
const products = NGARepository.all<Product>(Product);

// Get entities by index
const adminUsers = NGARepository.getByIndex<User>(User, 'byRole', 'admin');
const usProducts = NGARepository.getByIndex<User>(User, 'byCountry', 'US');
const laptops = NGARepository.getByIndex<Product>(Product, 'byCategory', 'laptops');
const expensiveProducts = NGARepository.getByIndex<Product>(Product, 'byPrice', '1000');
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
| indexes | array | Optional array of index configurations |
| indexes[].key | string | Unique identifier for the index |
| indexes[].field | string | Entity field to index by |

### Supported Data Sources

Currently supported data source types:
- `http`: Fetch data from HTTP/HTTPS endpoints

## Advanced Usage

### Custom Data Sources

You can extend the system with custom data sources by implementing the `NGALoader` interface:

```typescript
import { NGALoader } from 'never-get-again';

export class CustomLoader implements NGALoader {
    async load(): Promise<Record<string, any>[]> {
        // Your custom loading logic here
        return data;
    }
}
```

### Using Indexes

Indexes provide fast lookups for entities based on specific fields:

```typescript
// Get all products in a specific category
const gamingProducts = NGARepository.getByIndex<Product>(Product, 'byCategory', 'gaming');

// Get all users with a specific role
const moderators = NGARepository.getByIndex<User>(User, 'byRole', 'moderator');

// Get products in a price range (note: values are converted to strings)
const premiumProducts = NGARepository.getByIndex<Product>(Product, 'byPrice', '1000');
```

Index features:
- Automatic index creation and maintenance
- Fast lookups by indexed fields
- Support for any field type (values are converted to strings)
- Multiple indexes per entity
- Automatic index updates when data refreshes

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