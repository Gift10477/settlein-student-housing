# 🏡 SettleIn - Student Housing Marketplace

![SettleIn Banner](https://via.placeholder.com/1200x400/2563EB/FFFFFF?text=SettleIn+-+Student+Housing+Made+Easy)

**SettleIn** is a comprehensive, student-focused accommodation marketplace designed to streamline the process of finding suitable housing near universities in Kenya. It connects students with verified property managers through a secure, transparent, and user-friendly platform.

---

## ✨ Key Features & User Journeys

The platform is divided into two primary experiences tailored for students seeking housing and landlords managing properties.

### 🎓 For Students (Tenants)
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

## 🛠️ Architecture & Core Systems

- **🌓 Light & Dark Mode**: Built-in theme management via React hooks and CSS data attributes for a comfortable viewing experience.
- **🔐 Mock Authentication**: Custom sign-in and sign-up flows that conditionally render portal access and protect sensitive property details.
- **⚡ Custom Routing**: Fast, lightweight custom routing built entirely in React state (`activeView`), avoiding external router dependencies.
- **💾 Local Data Store**: Fully functional mock database utilizing the browser's Local Storage (`db.js`) to persist users, listings, reviews, and pending submissions.

---

## 🚀 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Pure, modular Vanilla CSS (Custom properties, Flexbox/Grid architecture)
- **State Management**: React Hooks + Local Storage DB
- **Icons**: Inline SVG / CSS

*(Note: This project relies on vanilla CSS and custom React logic rather than heavy frameworks like Tailwind or React Router, ensuring a deeply customized and lightweight architecture.)*

---

## 📂 Project Structure

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

## 🏃 Getting Started

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

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

---

## 👥 Team Members

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
