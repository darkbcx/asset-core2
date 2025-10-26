# AssetCore Database Directory

Welcome to the AssetCore database management documentation.

## Quick Navigation

- **[📖 README.md](./README.md)** - Main database documentation
- **[🚀 QUICK_START.md](./QUICK_START.md)** - Quick setup guide
- **[📚 SCRIPTS.md](./SCRIPTS.md)** - Complete scripts reference
- **[🔧 Scripts Documentation](./scripts/README.md)** - Scripts details

## Quick Start

Get up and running in 3 steps:

```bash
# 1. Interactive database setup
npm run db:init

# 2. View database status
DB_PASSWORD=yourpass npm run db:status

# 3. Start developing!
```

## Directory Structure

```
database/
├── migrations/              # SQL migration files
├── seeds/                   # Sample data
├── scripts/                 # TypeScript utilities
│   ├── init-db.ts          # Interactive setup
│   ├── db-utils.ts         # Operations (migrate, seed, reset, etc.)
│   └── README.md
├── README.md               # Main documentation
├── QUICK_START.md          # Quick setup guide
├── SCRIPTS.md              # Scripts reference
└── index.md                # This file
```

## Common Commands

```bash
# Interactive setup (recommended)
npm run db:init

# Run migrations
DB_PASSWORD=pass npm run db:migrate

# Seed data
DB_PASSWORD=pass npm run db:seed

# Reset database
DB_PASSWORD=pass npm run db:reset

# Show status
DB_PASSWORD=pass npm run db:status
```

## Need Help?

- Check [QUICK_START.md](./QUICK_START.md) for setup instructions
- See [SCRIPTS.md](./SCRIPTS.md) for all available commands
- Review [README.md](./README.md) for detailed documentation
