# Backup and Recovery Procedures

## Database Backup Strategy
- Automated daily snapshots via PostgreSQL provider (Neon/Supabase/Cloud SQL).
- Point-in-time recovery (PITR) enabled.

## File Uploads Backup
- Store uploads in S3-compatible object storage with versioning and cross-region replication.

## Disaster Recovery Objective
- **RPO (Recovery Point Objective)**: < 1 hour
- **RTO (Recovery Time Objective)**: < 2 hours
