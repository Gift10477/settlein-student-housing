# 🏡 SettleIn - Student Housing Marketplace

![SettleIn Banner](https://via.placeholder.com/1200x400/2563EB/FFFFFF?text=SettleIn+-+Student+Housing+Made+Easy)

**SettleIn** is a comprehensive, student-focused accommodation marketplace designed to streamline the process of finding suitable housing near universities in Kenya. It connects students with verified property managers through a secure, transparent, and user-friendly platform.

---

## ✨ Key Features

- 🎓 **Student-Centric Design**: Modern, intuitive interface tailored for university students.
- 🌓 **Light & Dark Mode**: Built-in theme management for a comfortable viewing experience.
- 🏢 **Landlord Portal**: Dedicated interface for property managers to manage listings and track applications.
- 🔐 **Mock Authentication**: Custom sign-in and sign-up flows for students and landlords.
- 🔍 **Advanced Filtering**: Search and filter properties by price, location, number of rooms, and amenities.
- ⚡ **Custom Routing**: Fast, lightweight custom routing built entirely in React state (no external router dependencies).
- 💾 **Local Data Store**: Fully functional mock database utilizing the browser's Local Storage for persistence.

---

## 🚀 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Pure, modular Vanilla CSS (Custom properties, Flexbox/Grid)
- **State Management**: React Hooks + Local Storage mock DB
- **Icons**: Inline SVG / CSS

*(Note: This project relies on vanilla CSS and custom React logic rather than heavy frameworks like Tailwind or React Router, ensuring a deeply customized and lightweight architecture.)*

---

## 📂 Project Structure

The project follows a feature-based directory structure:

```text
app/
├── src/
│   ├── assets/       # Static assets and images
│   ├── components/   # UI components grouped by feature (auth, detail, home, landlord, etc.)
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
