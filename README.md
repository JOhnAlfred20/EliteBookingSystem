

EliteReserve is a high-performance, B2B SaaS platform engineered specifically for elite sports clubs, private facilities, and luxury concierges. Built with an aerospace-inspired "Obsidian & Gold" aesthetic, it prioritizes speed, telemetry-style data visualization, strict security, and a seamless cross-platform user experience.

---

## 🚀 Key Features

### 🏢 Member Portal
*   **Mission Dashboard:** Real-time overview of active reservations, financial status, and club announcements.
*   **Precision Booking:** High-fidelity facility selection matrix with interactive time slots and type-specific imagery.
*   **Smart Access Key:** Encrypted digital verification system (QR/Barcode) for physical facility entry.
*   **Notification Matrix:** Global, real-time alert system for booking confirmations, cancellations, and administrative updates.

### 🛡️ Command Center (Admin)
*   **Telemetry Dashboard:** Advanced financial, capacity, and utilization metrics powered by Recharts.
*   **Venue Management:** Full CRUD operations for facilities with instant status toggles and capacity controls.
*   **Member Oversight:** Tiered access control, role-based security, and member status management.
*   **Data Export:** Generate mission-critical reports and manifests in Excel and PDF formats.

---

## ⚡ Performance Engineering

This platform has been rigorously optimized to meet the highest Core Web Vital standards:
*   **LCP Optimization:** Reduced Largest Contentful Paint from `44.6s` to `<1.2s` through aggressive code-splitting and asset preloading.
*   **Bundle Strategy:** The `1.9MB` monolithic payload was reduced to a `~22KB` initial load using Vite manual chunks and lazy-loaded components.
*   **Asset Delivery:** All imagery converted to highly optimized WebP formats with `fetchPriority` handling.
*   **Critical Path:** Zero render-blocking unused fonts; aerospace-grade D-DIN typography optimized with `font-display: swap`.

---

## 🛠️ Architecture & Technology Stack

EliteReserve is built on a modern, decoupled architecture ensuring massive scalability and fault tolerance.

### Frontend (Telemetry Interface)
*   **Core:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS (Custom "SpaceX" Design System)
*   **State & Fetching:** TanStack Query (React Query), Zustand
*   **UI/UX:** Framer Motion, Recharts, FullCalendar, Lucide React

### Backend (Command Center API)
*   **Core:** ASP.NET Core 8 Web API
*   **Database:** Entity Framework Core 8, Microsoft SQL Server
*   **Security:** JWT Authentication, Role-Based Access Control (RBAC), BCrypt Password Hashing
*   **Integrations:** Stripe Payment Gateway

---

## ⚙️ Installation & Deployment

### 1. Backend Setup
Ensure you have [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) and SQL Server installed.

```bash
cd Backend/SportBooking.API

# Restore dependencies
dotnet restore

# Apply Entity Framework migrations
dotnet ef database update

# Launch the API server
dotnet run
```
*The API will be accessible at `http://localhost:5000` (or `https://localhost:5001`).*

### 2. Frontend Setup
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

```bash
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The interface will be accessible at `http://localhost:5173`.*

---

## 🔐 System Credentials

For local development and testing, use the following provisioned credentials:

*   **Admin Access:** `admin@sportbooking.com`
*   **Admin Password:** `Admin@123`
*   **Admin Security Gate PIN:** `141120`

---

## 📐 Design Philosophy

*   **Canvas:** Deep `#000000` Space Black.
*   **Accents:** Electric Blue (`#4d9bff`) & Spectral White (`#F9FAFB`).
*   **Typography:** D-DIN (Aerospace Grade).
*   **UX Principles:** Ghost-style components, high contrast accessibility, and GPU-accelerated micro-animations.

---

