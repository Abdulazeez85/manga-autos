# MANGA AUTOS — Premium Automotive Marketplace

> Abuja's most trusted luxury automotive dealership platform. A full-stack, production-ready digital showroom built for the Nigerian premium automotive market.

![Manga Autos](https://img.shields.io/badge/Manga_Autos-Premium_Automotive-C9A84C?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=for-the-badge&logo=javascript)

---

## Overview

Manga Autos is a **complete premium automotive marketplace platform** built for a luxury car dealership based in Abuja, Nigeria. The platform functions as:

- 🏎️ **Premium Automotive Marketplace** — curated luxury vehicle inventory
- 🎯 **Lead Generation Engine** — WhatsApp-driven conversion system
- 🌐 **Modern Digital Showroom** — cinematic, mobile-first experience
- ⚙️ **Dealership Management System** — full admin CRUD dashboard
- 📊 **Analytics & Booking System** — inspection and inquiry management

---

## Features

### Customer-Facing
| Feature | Description |
|---|---|
| 🏠 Homepage | Cinematic hero, featured inventory, stats, testimonials, loan calculator |
| 🚗 Inventory | Advanced filtering, real-time search, sort, grid/list toggle, pagination |
| 📄 Car Details | Gallery, full specs, financing calculator, inquiry form, related vehicles |
| ❤️ Wishlist | Save favorite vehicles via LocalStorage |
| ⇔ Comparison | Compare up to 3 vehicles side-by-side |
| 💳 Loan Calculator | Dynamic monthly payment estimator |
| 📅 Booking System | Inspection scheduling and pre-order requests |
| 🌙 Dark/Light Mode | Seamless theme switching |
| 📱 Mobile-First | Fully responsive, WhatsApp-optimized |
| 📞 WhatsApp CTAs | Direct inquiry links throughout the platform |

### Admin Dashboard
| Feature | Description |
|---|---|
| 📊 Dashboard | Live stats — vehicles, bookings, views |
| ➕ Add Vehicle | Full form with all vehicle attributes |
| ✏️ Edit Vehicle | In-place editing of any listing |
| 🗑️ Delete Vehicle | Confirmation-gated deletion |
| 📋 Bookings | View and manage all customer inquiries |
| 🔍 Search & Filter | Admin-side vehicle search |

### Pages
- `/` — Homepage
- `/inventory` — Full inventory with filters
- `/details?id=XXX` — Individual vehicle page
- `/about` — Brand story, team, CAC registration
- `/contact` — Contact form, map, FAQ
- `/admin` — Admin dashboard

---

## Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Google Fonts (Cormorant Garamond + Outfit + Space Mono)
- Font Awesome 6 (icons)
- Custom design system with CSS custom properties

**Backend**
- Node.js 18+
- Express.js 4.x
- JSON file-based database (zero dependencies)

**Architecture**
- Modular JavaScript (no frameworks)
- REST API (`/api/*`)
- LocalStorage for wishlist/comparison persistence
- IntersectionObserver for scroll animations
- Debounced search

---

## Installation

### Prerequisites
- Node.js v18 or higher
- npm v8 or higher

### Quick Start

```bash
# 1. Clone or extract the project
cd manga-autos

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

### Production Start
```bash
npm start
```

---

## Project Structure

```
manga-autos/
├── client/                     # Frontend (static files served by Express)
│   ├── css/
│   │   └── main.css            # Master design system & all styles
│   ├── js/
│   │   └── core.js             # Core JS — API, Utils, Theme, Wishlist, etc.
│   ├── index.html              # Homepage
│   ├── inventory.html          # Inventory page with filters
│   ├── details.html            # Vehicle details page
│   ├── about.html              # About page
│   ├── contact.html            # Contact page
│   └── admin.html              # Admin dashboard
│
├── server/
│   ├── data/
│   │   ├── vehicles.json       # Vehicle inventory database
│   │   ├── bookings.json       # Bookings/inquiries database
│   │   └── testimonials.json   # Client testimonials
│   ├── uploads/                # (Future) image upload storage
│   └── server.js               # Express server & all API routes
│
├── package.json
└── README.md
```

---

## API Routes

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List vehicles with filters/pagination |
| `GET` | `/api/vehicles/:id` | Get single vehicle (increments views) |
| `POST` | `/api/vehicles` | Create new vehicle |
| `PUT` | `/api/vehicles/:id` | Update vehicle |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle |

**GET /api/vehicles Query Parameters:**
```
brand         — Filter by brand name
condition     — Filter by condition (Foreign Used, Brand New, etc.)
fuelType      — Filter by fuel type
transmission  — Filter by transmission type
minPrice      — Minimum price filter
maxPrice      — Maximum price filter
search        — Full-text search
sort          — latest | price_asc | price_desc | year_desc | views
page          — Page number (default: 1)
limit         — Results per page (default: 12)
featured      — Filter featured only (true/false)
```

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create booking/inquiry |
| `GET` | `/api/bookings` | List all bookings (admin) |

### Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/testimonials` | Get client testimonials |
| `GET` | `/api/stats` | Get platform statistics |

---

## Vehicle Data Schema

```json
{
  "id": "v001",
  "name": "Mercedes-Benz GLE 450",
  "brand": "Mercedes-Benz",
  "model": "GLE 450",
  "year": 2023,
  "price": 95000000,
  "mileage": 12000,
  "transmission": "Automatic",
  "fuelType": "Petrol",
  "condition": "Foreign Used",
  "location": "Abuja",
  "engine": "3.0L Inline-6 Turbocharged",
  "horsepower": 362,
  "drivetrain": "4MATIC AWD",
  "exteriorColor": "Obsidian Black Metallic",
  "interiorColor": "Macchiato Beige",
  "description": "...",
  "features": ["Panoramic Sunroof", "Burmester Sound System"],
  "images": ["gle450-1.jpg", "gle450-2.jpg"],
  "featured": true,
  "views": 847,
  "createdAt": "2024-11-01T10:00:00Z"
}
```

---

## Design System

The platform uses a custom CSS design system defined in `client/css/main.css`:

### Color Tokens
```css
--bg-primary: #0a0a0a       /* Main background */
--bg-card: #161616           /* Card surfaces */
--gold: #c9a84c             /* Primary accent */
--gold-gradient: linear-gradient(135deg, #c9a84c, #e8c97a, #c9a84c)
--text-primary: #f0ece4      /* Primary text */
--text-secondary: #a09a8e    /* Secondary text */
```

### Typography
- **Display/Headers**: Cormorant Garamond (serif elegance)
- **Body/UI**: Outfit (modern sans-serif)
- **Data/Codes**: Space Mono (monospace)

### Theme System
Dark mode (default) and light mode via `data-theme` attribute on `<html>`. Toggle with `Theme.toggle()`. Persisted to localStorage.

---

## Customization

### Update Contact Details
In each HTML file, search and replace:
- `+2348012345678` → Your WhatsApp/phone number
- `hello@mangaautos.ng` → Your email
- `15 Gana Street, Maitama` → Your address

### Add Real Images
Replace SVG placeholders in `details.html` `renderGallery()` function with actual `<img>` tags pointing to your hosted images.

### Connect Real Database
The JSON file system is designed for easy migration to MongoDB:
1. Install `mongoose`
2. Replace `readData()`/`writeData()` helpers in `server.js` with Mongoose model calls
3. Same API contract — zero frontend changes needed

---

## Deployment

### Option 1: VPS (DigitalOcean, AWS, Contabo)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server/server.js --name manga-autos

# Enable startup
pm2 startup
pm2 save
```

### Option 2: Railway / Render
1. Push to GitHub
2. Connect repo on Railway or Render
3. Set start command: `node server/server.js`
4. Deploy

### Option 3: Heroku
```bash
# Add Procfile
echo "web: node server/server.js" > Procfile
git add . && git commit -m "deploy"
heroku create manga-autos
git push heroku main
```

### Environment Variables
```env
PORT=3000
NODE_ENV=production
```

---

## Future Improvements

- [ ] **Image Upload** — Multer-based multi-image upload in admin
- [ ] **MongoDB Migration** — Replace JSON with MongoDB Atlas
- [ ] **Admin Authentication** — JWT-based login system
- [ ] **Email Notifications** — Nodemailer for booking confirmations
- [ ] **SEO Landing Pages** — Static pages for key search terms
- [ ] **WhatsApp API Integration** — Automated inquiry routing
- [ ] **Vehicle View Analytics** — Detailed analytics dashboard
- [ ] **Customer Portal** — Saved searches, purchase history
- [ ] **Live Chat Widget** — Tawk.to or custom chat integration
- [ ] **Mobile App** — React Native companion app

---

## WhatsApp Integration

The platform uses direct WhatsApp links throughout for conversion:

```javascript
// Format: https://wa.me/{number}?text={encoded_message}
const link = `https://wa.me/2348012345678?text=${encodeURIComponent(message)}`;
```

Key conversion points:
1. Floating WhatsApp button (all pages)
2. Nav "WhatsApp Us" CTA
3. Vehicle inquiry buttons (with vehicle details pre-filled)
4. Financing inquiry button
5. Vehicle sourcing request sidebar button

---

## Support

For technical support or customization inquiries:
- 📧 Email: hello@mangaautos.ng
- 💬 WhatsApp: +234 801 234 5678

---

*Built with precision for Manga Autos — Abuja's premium automotive experience.*
