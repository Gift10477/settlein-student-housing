# SettleIn

Student accommodation search, landlord listing review, reservation and mock payment system. Built with React, Vite, Express and MySQL/MariaDB.

Students search with combined filters, reserve rooms, pay a mock booking fee within 24 hours, track decisions, update profiles and review approved stays. Landlords submit listings with selectable amenities. Administrators review/publish/reject listings, record payments, manage applications and roles, resolve support messages, inspect audit logs and generate filtered branded CSV/PDF reports. Approval consumes a vacancy atomically; cancellation restores it. Optional authenticator 2FA protects sign-in.

## Database

Development uses **settlein_se_db** to protect the original database. Production may use a hosted provider's database name. The active schema has foreign keys, normalized amenities and payment receipts, and an archive of repaired legacy references. No live payment processor is configured.

Install Node.js 24 and MySQL/MariaDB. Create an empty database named `settlein_se_db`, copy `server/.env.example` to `server/.env`, and enter the local database connection settings. Run `setup.ps1` in PowerShell (or the commands below). The installer preserves existing configuration and prepares/migrates the database. An optional `db:copy` command imports the old project's source database only when the target does not already exist.

```sh
npm ci --prefix server
npm ci --prefix app
cd server
npm run db:prepare
```

Use `npm.cmd` instead of `npm` if PowerShell blocks `npm.ps1`. Never import into the original project's database. Back up before migrations; legacy rows/fields are preserved in `migration_archive` before normalization.

## Administrator setup

This checkout has a local admin account. Its private credentials are in `server/admin-access.local.txt`, excluded from Git. Sign in and select **Admin portal**.

On another machine, set ADMIN_EMAIL and ADMIN_PASSWORD (8–128 characters) privately, then run `npm run admin:create` from `server`. It refuses to overwrite existing accounts. Remove these bootstrap settings afterward. Public registration supports students and landlords only.

## Run

Start MySQL, then run `npm start` in `server` (port 5001). In another terminal run `npm run dev` in `app`. Open the URL Vite prints, normally http://localhost:5173. Database credentials stay on the server. Sessions expire after one hour or backend restart. Help is available in the navigation. GitHub Pages and Render settings are prepared, but cloud deployment is deferred.

## Checks and limits

Frontend checks: `npm run lint`, `npm test`, `npm run build` in `app`. Backend tests: `npm test` in `server`. With the local database available, `npm run verify:workflow` exercises the real API/database using temporary accounts and records, then removes them. `node scripts/verify-listing-review.cjs` checks the running backend's publication and filters.

The original deliverables PDF is retained. Self-service forgot-password recovery is intentionally excluded. Payment remains explicitly mocked/manual; no money is charged. Sessions support one backend instance. Administrators must review overdue applications; rejection is not automatic. Real-world presentation, audibility and punctuality require the presenter to rehearse.

## Documentation

- [User manual](docs/USER_MANUAL.md)
- [Database diagram, entities and attributes](docs/DATABASE.md)
- [GitHub Pages / Render deployment](docs/DEPLOYMENT.md)
- [Presentation and assessment guide](docs/PRESENTATION.md)

Uploaded photos, local secrets and database backups are excluded from source control. Back them up securely, including the 2FA encryption key. Never commit `server/admin-access.local.txt`, `.env` files or `server/security-key.local.txt`.
