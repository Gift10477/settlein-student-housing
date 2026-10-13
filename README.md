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
- **Mock Authentication**: Custom sign-in and sign-up flows that conditionally render portal access and protect sensitive property details.
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

The API is available at [http://localhost:5000](http://localhost:5000). The
`localhost` URL is accessible only from the computer running the server; it is
not a public or remotely accessible deployment URL.

### Backend access

The five partner endpoints are publicly callable without authentication while
the app is in development mode. They match the OpenAPI contract in
[`openapi.yaml`](./openapi.yaml).

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/users/{id}/residence-area` | GET | Student estate name and campus proximity |
| `/api/v1/properties/{id}/study-amenities` | GET | Wi-Fi, desk space, and quiet-hours details |
| `/api/v1/users/{id}/lease-timeline` | GET | Lease start, move-in, and relocation window |
| `/api/v1/users/{id}/public-profile` | GET | Verified student identity and university info |
| `/api/v1/properties/group-inquiries` | POST | Submit a shared-housing co-living inquiry |

### API documentation

Once the server is running, open **[http://localhost:5000/docs](http://localhost:5000/docs)**
to browse the full interactive API reference (rendered by Redoc).

The rendered documentation is also committed as a standalone HTML file, so it
can be opened without running the frontend, backend, or MySQL:

- Open [`docs/index.html`](./docs/index.html) directly from the cloned
  repository.
- On Windows, double-click
  `docs\index.html`, or open that file in a browser.

The standalone page contains the rendered OpenAPI contract and does not fetch
the specification from the local API. The interactive "Try it" requests still
require a reachable API server.

You can also fetch the raw contract:

```bash
curl http://localhost:5000/openapi.yaml
```

### Partner tests (Part C — Shamba Direct)

The Shamba Direct contract-based tests are in
`server/__tests__/shamba_direct.test.js`. Once Team 14 provides a running
base URL, set `SHAMBA_API_URL` and any valid resource IDs, then run:

```powershell
$env:SHAMBA_API_URL="https://their-api-url.example.com"
npm test -- shamba_direct --runInBand
```

To run just our own endpoint tests (no upstream dependency):

```powershell
npm test -- --runInBand --forceExit
```

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
