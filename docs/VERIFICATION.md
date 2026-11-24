# Local verification

Verified on 17–18 November 2026 against the local application and MySQL/MariaDB copy.

| Check | Result |
| --- | --- |
| Backend unit/API tests | 48 passed across 6 suites |
| Frontend service/filter/report tests | 9 passed |
| ESLint | Passed, no warnings |
| Vite production build | Passed |
| GitHub Pages base-path + external API build | Passed using a placeholder API URL solely for build verification |
| Real database workflow | Passed: login/authorization, listing publication, reservation, mock payment, approval, duplicate decision protection, cancellation and capacity restoration |
| New persistent features | Passed: review save/read, profile update/read, support submit/resolve/read |
| Authenticator security | Passed: enrollment, session revocation, password-only denial, fresh-code login and replay rejection |
| Clean database installation | Passed in a disposable database; schema, FK rejection and repeatable migrations verified |
| Local database compatibility | Amenities aggregation uses a query supported by the installed MariaDB version; public listing reads and combined amenity filters verified |

The integration scripts delete only their temporary fixtures. Migration archives preserve legacy records; no original-project database was replaced. Two existing reservation rows with missing parent links were preserved and repaired to nullable historical references.

Run backend tests and integration verification from `server`:

```sh
npm test
npm run verify:workflow
npm run verify:schema
```

`verify:schema` requires local permission to create/drop its own temporary `settlein_verify_*` database and refuses production mode. Do not point local verification at a live customer database.

Run frontend checks from `app`:

```sh
npm run lint
npm test
npm run build
```

Cloud deployment, real payment processing, end-to-end checks on a hosted MySQL provider, and a human presentation are not claimed by these results. The report's PDF output uses the browser print dialog; review its preview before submitting a printed report.
