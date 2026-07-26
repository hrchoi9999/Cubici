# Cubici DB Workspace

Database conversion workspace for MySQL legacy to PostgreSQL reproduction.

## Directories

- `mysql_legacy/`: legacy schema inventory and local-only source dump references
- `postgres/schema/`: PostgreSQL schema drafts
- `postgres/migrations/`: ordered PostgreSQL migration files
- `migration/`: conversion scripts and verification tooling

Do not commit raw SQL dumps or original data exports.

