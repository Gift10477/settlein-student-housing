# Deployment: GitHub Pages + Render + hosted MySQL

Deployment is prepared but intentionally deferred. MongoDB cannot be used with this MySQL backend. No cloud resource has been created and no deployment is claimed.

## Components

| Component | Location/configuration |
| --- | --- |
| React static frontend | GitHub Pages; `.github/workflows/pages.yml` |
| Express API | Render Node web service; `render.yaml` |
| Relational database | A separate hosted MySQL service with TLS |
| Uploaded photos | Persistent disk at `/var/data/uploads` |

The Render blueprint uses a paid Starter service and a 1 GB disk because an ephemeral filesystem would lose uploads. Review the provider's current charges before creating resources. The blueprint does not provision MySQL. Its configuration follows [Render's Blueprint reference](https://render.com/docs/blueprint-spec) and [persistent disk guidance](https://render.com/docs/disks).

## 1. Provision and configure MySQL

Create an empty database through your MySQL provider. Obtain host, port, database name, username, password and CA certificate if required. Use a dedicated application account restricted to this database. Schema preparation requires CREATE/ALTER/INDEX/REFERENCES plus data permissions; after migration, a runtime account should have only SELECT/INSERT/UPDATE/DELETE. Keep backups and verify restoration before using real data.

Enter these **private environment variables in Render**, never in GitHub Pages build settings:

`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`, `DB_SSL_CA`, `SECURITY_KEY`.

`DB_SSL_CA` accepts PEM text (or escaped `\n` newlines); leave it empty only if the provider uses a publicly trusted certificate. TLS certificate verification stays enabled. Generate SECURITY_KEY once with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save that key securely. Losing/changing it prevents decrypting existing authenticator secrets. Local development stores a generated key in the ignored `server/security-key.local.txt` file. If transferring existing 2FA accounts, transfer that same key securely.

## 2. Deploy the API

Commit the reviewed project changes to the repository, excluding local credentials, uploads and backups. In Render, create a Blueprint from the repository and `render.yaml`. Fill in the private settings. Set `CORS_ORIGINS=https://gift10477.github.io` for this repository's Pages origin (no path). Change it if the site uses a custom domain. Render provides PORT. TRUST_PROXY is set to one proxy hop.

The build runs `npm ci --prefix server --omit=dev`. The start command runs `db:prepare` then `npm start`. For a fresh database, preparation imports `server/database/schema.sql` without personal/sample users, then runs repeatable migrations. Existing databases are migrated without being replaced. For a restricted runtime account, run preparation separately with migration credentials and change the start command to `cd server && npm start`.

Use the Render shell to run `npm run admin:create` from `server`, with temporary ADMIN_EMAIL and ADMIN_PASSWORD settings. Remove those two settings after successful creation. Verify `https://YOUR-SERVICE.onrender.com/health` returns `{"status":"ok"}`.

## 3. Publish the frontend

In GitHub repository settings:

1. **Pages → Source → GitHub Actions**.
2. **Secrets and variables → Actions → Variables**: set `VITE_API_BASE_URL=https://YOUR-SERVICE.onrender.com/data`.
3. Push to `main` or run **Test and publish SettleIn** manually. The workflow runs tests, lint and build before deployment. Deployment is skipped until the API variable is set.

The configured project base is `/settlein-student-housing/`. Expected Pages URL after a successful deployment: `https://gift10477.github.io/settlein-student-housing/`. This is a planned URL, not confirmation that the deployment exists. Upload URLs are resolved against the API host, not Pages. Routing is state-based, so this app does not require server-side history rewrites.

Reference: [Vite static deployment](https://vite.dev/guide/static-deploy) and [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 4. Acceptance checks and operations

Register one student and one landlord. Submit, reject and publish a listing. Reserve, mock-pay, approve, cancel and check vacancy restoration. Try a student request against the admin API and expect 403. Save/reload a support message and profile. Enable 2FA with a test account. Print a filtered report. Restart the API and verify listings, payments and uploaded photos remain. Sign in again after restart: sessions are memory-based and this configuration supports one API instance.

Before migrating real data, take a provider database backup and separately copy uploads and SECURITY_KEY. The migration archive preserves original inconsistent legacy references; it is not a substitute for a full backup. Restoration should be tested in a separate database before switching a live service. Do not disable TLS verification to solve a connection problem.
