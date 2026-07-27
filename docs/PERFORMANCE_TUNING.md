# Performance Tuning Guide

- **Caching**: In-memory TTL caching for frequently read store configurations and catalogue data.
- **Database Indexing**: Optimized Prisma schema indexes on foreign keys and lookup fields.
- **Asset Compression**: Gzip/Brotli compression enabled via Express middleware.
- **Bundle Optimization**: Vite code-splitting and esbuild server bundling for fast cold starts.
