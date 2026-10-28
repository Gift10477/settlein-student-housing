#  SettleIn - Student Housing Marketplace

![SettleIn Banner](https://via.placeholder.com/1200x400/2563EB/FFFFFF?text=SettleIn+-+Student+Housing+Made+Easy)

**SettleIn** is a comprehensive, student-focused accommodation marketplace designed to streamline the process of finding suitable housing near universities in Kenya. It connects students with verified property managers through a secure, transparent, and user-friendly platform.

---

##  Key Features & User Journeys

The platform is divided into two primary experiences tailored for students seeking housing and landlords managing properties.

###  For Students (Tenants)
- **Advanced Search & Filtering**: Browse listings by nearest university campus (Strathmore, UoN, KU, JKUAT) and filter by room type (Bedsitter, Hostel Room, Shared Apartment, Studio, 1 Bedroom).
- **Detailed Property Profiles**: View comprehensive details including pricing, distance to campus, furnishing status, gender policies, and Google Maps location links.
- **Transparent Cost Breakdown**: See exactly what you'll pay upfront. Listings break down monthly rent, security deposits, booking fees, and clearly state which utilities (Water, Wi-Fi, Garbage) are included.
- **Mock M-PESA Booking Integration**: Secure a room directly from the app via a simulated M-PESA STK push. The system tracks scarcity, warning users when units are selling out.
- **Community Reviews**: Read past experiences from other students, and leave your own star rating and comments after staying at a property.
- **Saved Contacts**: Landlord contact details (Phone/WhatsApp) are kept blurred and secure until a booking is initiated.

### 🏢 For Landlords (Property Managers)
- **Dedicated Landlord Portal**: A streamlined interface specifically for submitting and managing student housing listings.
- **Comprehensive Listing Creation**: Easily submit properties by detailing the name, room type, monthly rent, nearest campus, precise location, amenities, and a rich description of house rules and unique features.
- **Verification System**: To protect students from scams, all landlord submissions are placed in a "pending" state for admin review. Only verified properties receive the coveted "Verified" badge and appear in public searches.

---

##  Architecture & Core Systems

- ** Light & Dark Mode**: Built-in theme management via React hooks and CSS data attributes for a comfortable viewing experience.
- **API Authentication**: Backend requests require an API key; private user and booking routes also require the owner's login token. Browser UI state alone does not authorize backend access.
- ** Custom Routing**: Fast, lightweight custom routing built entirely in React state (`activeView`), avoiding external router dependencies.
- ** Local Data Store**: Fully functional mock database utilizing the browser's Local Storage (`db.js`) to persist users, listings, reviews, and pending submissions.

---

##  Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Pure, modular Vanilla CSS (Custom properties, Flexbox/Grid architecture)
- **State Management**: React Hooks + Local Storage DB
- **Icons**: Inline SVG / CSS

*(Note: This project relies on vanilla CSS and custom React logic rather than heavy frameworks like Tailwind or React Router, ensuring a deeply customized and lightweight architecture.)*

---

##  Project Structure

The project follows a feature-based directory structure:

```text
app/
├── src/
│   ├── assets/       # Static assets and images
│   ├── components/   # UI components grouped by feature (auth, detail, home, landlord, listings, etc.)
│   ├── hooks/        # Custom React hooks (e.g., useTheme.js)
│   ├── store/        # Data layer and mock database (db.js utilizing localStorage)
│   ├── styles/       # Modular CSS files (variables.css, pages.css, index.css)
│   ├── App.jsx       # Root Application Component (handles routing & theme)
│   └── main.jsx      # Application entry point
```

---

##  Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v16 or higher)
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gift10477/settlein-student-housing.git
   cd settlein-student-housing/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies and configure the database:**
   ```bash
   cd ../server
   npm install
   ```

   On PowerShell, create the environment file with:

   ```powershell
   Copy-Item .env.example .env
   ```

   Update `server/.env` with your local MySQL connection details and a set of
   distinct API keys for each consumer in the comma-separated `API_KEYS` setting.
   Send the consumer key in `X-API-Key`. No separate admin key is required.
   Private user routes also require the owner's login token. User and booking
   lists return only the logged-in user's records. See
   [the security audit and access instructions](SECURITY_AUDIT.md).
   Keep all keys in `server/.env` and never commit them to Git.

   Start MySQL locally and create a database named `settlein_db`, or update
   `server/.env` with the connection details for an existing MySQL database.
   Then create the tables and sample data by importing
   [`server/database/schema.sql`](./server/database/schema.sql):

   ```bash
   mysql -u root -p < server/database/schema.sql
   ```

   On Windows, the same file can be imported through phpMyAdmin by opening
   the **Import** tab for the `settlein_db` database and selecting
   `server/database/schema.sql`.

### Running the Application

Start the frontend in one terminal:

```bash
cd app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

Start the API in a second terminal:

```bash
cd server
npm start
```

The API is available locally at [http://localhost:5000](http://localhost:5000)
and publicly through the current ngrok tunnel at
[https://displease-startling-throwing.ngrok-free.dev](https://displease-startling-throwing.ngrok-free.dev).
The public URL remains available only while the ngrok tunnel and local server
are running.

### Backend access

Every API request must send `X-API-Key: <your-api-key>`. Configure accepted keys
in `API_KEYS` in your local `server/.env`; never commit or put real keys in this
README or frontend code. The contract is in [`openapi.yaml`](./openapi.yaml).

A valid request (replace the placeholder locally):

```powershell
curl.exe -i -H "X-API-Key: <your-api-key>" "http://localhost:5000/health"
```

Expected success:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok","timestamp":"2026-10-27T09:00:00.000Z"}
```

The timestamp changes on each request. A missing, invalid, or revoked API key
returns:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"message":"Missing or invalid API key"}
```

The rate limit is **100 requests per API key per 15 minutes**, shared across routes.
The window starts with the first authenticated request. Request 101
within that window returns:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json; charset=utf-8
Retry-After: 900

{"message":"Too many requests, please try again later."}
```

`Retry-After` is the number of seconds remaining; `900` is an example immediately
after the window starts. Authenticated requests that later return errors also
count. Missing/invalid keys are rejected before this limiter. Counters reset on
server restart. This strict threshold demonstrates throttling during development;
it is not a measured production allowance. See the rationale and limitations in
[`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md).

For private user/booking routes, log in at `POST /api/v1/users/login` with your
API key, email, and password. Send the returned one-hour token as
`Authorization: Bearer <your-login-token>` alongside `X-API-Key`. Only the
logged-in user's records are accessible. A missing/expired login token returns
`401` with `{"error":"User login required"}`; another user's ID returns `403`.
No separate admin key is required. Property writes and group inquiries currently
accept any valid consumer key.

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/users/{id}/residence-area` | GET | Student estate name and campus proximity |
| `/api/v1/properties/{id}/study-amenities` | GET | Wi-Fi, desk space, and quiet-hours details |
| `/api/v1/users/{id}/lease-timeline` | GET | Lease start, move-in, and relocation window |
| `/api/v1/users/{id}/public-profile` | GET | Verified student identity and university info |
| `/api/v1/users` | POST | Create a user account |
| `/api/v1/users/login` | POST | Sign in a user |
| `/api/v1/users/{id}` | PUT | Update a user |
| `/api/v1/users/{id}` | DELETE | Delete a user |
| `/api/v1/properties` | POST | Create a property listing |
| `/api/v1/properties/{id}` | PUT | Update a property listing |
| `/api/v1/properties/{id}` | DELETE | Delete a property listing |
| `/api/v1/properties/group-inquiries` | POST | Submit a shared-housing co-living inquiry |
| `/api/v1/bookings` | POST | Create a property booking and calculate lease dates |
| `/api/v1/market-prices` | GET | Read partner market prices for a monthly food-cost estimate |

### Shamba food and living cost widget

Accommodation detail pages include an editable monthly food basket. Each crop's
monthly cost is `price_per_kg × kilograms entered`; the total adds monthly rent
and any other monthly costs entered by the student. Quantities start empty so no
diet or budget is invented. Deposits, booking fees, delivery charges, and expenses
not entered are excluded. Changing the market county clears the food basket.

The area filter shows only prices from the selected county, so the estimate
never combines different counties by default. It preselects an explicitly known
property county, or an exact county component in an address such as
`Madaraka, Nairobi`. Otherwise the student chooses the county. It does not guess
an estate's county from its name. Unknown-county prices are excluded from local
estimates; missing prices for an area show a message instead of another area's
prices. Equivalent case/whitespace and a trailing `County` label are normalized.

The browser requests `/api/market-prices`; SettleIn calls Shamba on the server and
returns only crop name, price per kg, county, and retrieval metadata. There is no
sample-price fallback. Missing configuration, an empty result, or a partner
failure produces a clear widget message without hiding accommodation details.

See [WEEK10_GUIDE.md](WEEK10_GUIDE.md) for the handout checklist,
exact URL/key activation steps, failure/recovery checks, debugging,
downstream support, and submission steps. Record actual results in
[INTEGRATION_LOG.md](INTEGRATION_LOG.md); live results remain pending.

Configure locally in `server/.env` (never commit actual keys):

```env
SHAMBA_API_URL=https://<partner-host>/api
SHAMBA_API_KEY=
SHAMBA_API_KEY_HEADER=X-API-Key
SHAMBA_API_KEY_PREFIX=
SETTLEIN_WEB_API_KEY=<your-api-key>
```

The partner URL may include or omit its final `/api`. The latest saved Shamba
contract allows unauthenticated reads, so leave `SHAMBA_API_KEY` empty unless
Team 14 enables `X-API-Key`; any configured key stays on the backend. Numeric
`price_per_kg` is treated as KES per the needs statement. Confirm currency and
the live base URL with Team 14 before claiming live integration works. A county
may be missing; the widget labels it as unspecified. No live call was verified.
If Team 14 specifies a different key header or a Bearer prefix, the two optional
auth settings above allow that change without editing the request code.

Start the backend and Vite frontend as usual. Vite's server/preview proxy forwards
`/api` to the backend and injects `SETTLEIN_WEB_API_KEY` from the server environment
(or the first configured `API_KEYS` value if omitted). Neither key is exposed via
`VITE_*` or bundled into JavaScript. Restart Vite and the backend after changing
configuration. The same 100-request per 15-minute quota still applies to this key.

This proxy is for local development/preview. A production deployment must provide
its own same-origin server gateway for `/api`; static hosting alone does not run
the Vite proxy. Do not expose a general credential-injecting gateway publicly
without appropriate user/session authorization for its write routes.

Automated integration tests stub the partner's response and cover successful
prices, malformed data, partner HTTP failures, missing configuration, failure and
recovery. These are not evidence of a live Shamba call. Week 10 still requires a
live data/down/recovery demo and a log of the actual results.

### API documentation

The `/docs` and `/openapi.yaml` routes also require `X-API-Key` and count toward
the limit. A normal browser address-bar navigation cannot attach this header.
Fetch the HTML with your key, then open the saved file, or open the committed
[`docs/index.html`](./docs/index.html) directly. The public
documentation URL is
[https://displease-startling-throwing.ngrok-free.dev/docs](https://displease-startling-throwing.ngrok-free.dev/docs).

The rendered documentation can be opened without running the frontend, backend,
or MySQL:

- Open [`docs/index.html`](./docs/index.html) directly from the cloned
  repository.
- On Windows, double-click
  `docs\index.html`, or open that file in a browser.

The standalone page contains the rendered OpenAPI contract. The interactive
"Try it" requests still require a reachable API server.

The page embeds the contract and loads the Redoc renderer from its CDN, so
internet access is needed to render it. After editing `openapi.yaml`, regenerate
the page from `server` with `npm run docs:build`.

You can also fetch the raw contract:

```bash
curl.exe -H "X-API-Key: <your-api-key>" "http://localhost:5000/openapi.yaml"
```

### Partner tests (Part C — Shamba Direct)

The Shamba Direct contract-based tests are in
`server/__tests__/shamba_direct.test.js`. Once Team 14 provides a running
base URL, set `SHAMBA_API_URL` and any valid resource IDs, then run:

```powershell
$env:SHAMBA_API_URL="https://their-api-url.example.com"
npm test -- shamba_direct --runInBand
```

To run the Week 7 contract tests and API-key tests (database fixtures are mocked;
the real Express routes, authentication, and rate limiter run):

```powershell
npm test -- users.test.js properties.test.js partner_access.test.js auth.test.js
```

Each test gets a fresh app and test-only key, so the 100-request limit does not
leak between tests. These tests do not prove connectivity to a live MySQL server.
Run `npm test` for all tests; Shamba Direct tests are skipped unless
`SHAMBA_API_URL` is configured.

---


##  Team Members

This project was developed by:

| Student ID | Name |
| :--- | :--- |
| **193923** | Githaka, Gift Gicheru |
| **220259** | Kungu, Ian Gachigua |
| **220982** | Abdi, Yahya Ahmed |
| **221126** | Olale, Tiffany Akello |

---

<div align="center">
  Built with ❤️ by the SettleIn Team
</div>
