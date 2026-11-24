# SettleIn frontend

React student portal and administrator dashboard. Run `npm.cmd install` and `npm.cmd run dev` here after starting the backend and MySQL. Open http://localhost:5173.

See [project setup](../README.md) and the [user manual](../docs/USER_MANUAL.md). The navigation includes student reservations, landlord submission, administrator management, profile/security and help pages. Access is enforced on the API.

Run `npm.cmd run lint`, `npm.cmd test` and `npm.cmd run build`. Local API requests use the Vite proxy. Hosted builds use `VITE_API_BASE_URL` and `VITE_BASE_PATH`; neither setting should contain a secret. See [deployment instructions](../docs/DEPLOYMENT.md).
