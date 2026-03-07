# Mhenga Media

> Bold, professional media services — recognized as the leading media provider at **The Co-operative University of Kenya (CUK)**.

Mhenga Media is a full-stack website showcasing photoshoot, graphic design, media-coverage, and podcast services. The public-facing site is built with plain HTML, CSS, and vanilla JavaScript, while a Node.js/Express backend powers the admin dashboard for managing bookings, portfolio content, and contact messages.

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home — hero, featured services, and portfolio preview |
| `services.html` | Full breakdown of Photoshoots, Graphic Design, Media Coverage & Podcast |
| `portfolio.html` | Gallery/portfolio filtered by category |
| `media.html` | Podcast and video media page |
| `contact.html` | Inquiry form (Netlify Forms) and direct-contact options |
| `admin/login.html` | Admin login (JWT authentication) |
| `admin/dashboard.html` | Admin dashboard — bookings, content, messages & settings |

---

## Tech stack

### Frontend
- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, responsive grid/flex layout (`styles.css`, `admin/admin.css`)
- **Vanilla JavaScript** — scroll-reveal animations, mobile nav toggle (`main.js`, `media.js`)
- **Google Fonts** — Inter & Space Grotesk
- **Netlify Forms** — serverless form handling on the Contact page

### Backend (`backend/`)
- **Node.js + Express** — REST API server
- **MongoDB + Mongoose** — database and ODM
- **JWT** — admin authentication
- **Multer** — image uploads (10 MB limit; jpeg, png, gif, webp, svg)
- **Helmet** — security headers
- **express-rate-limit** — login rate limiting (200 req / 15 min)
- **bcryptjs** — password hashing
- **express-validator** — request validation

---

## API routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | — | Health check |
| `/api/auth/login` | POST | — | Admin login |
| `/api/auth/change-password` | POST | JWT | Change password |
| `/api/content` | GET | — | List all CMS content |
| `/api/content/:sectionName` | GET | — | Get content by section |
| `/api/content` | POST | JWT | Create content (multipart) |
| `/api/content/:id` | PUT | JWT | Update content |
| `/api/content/:id` | DELETE | JWT | Delete content |
| `/api/bookings` | GET | JWT | List all bookings |
| `/api/bookings/stats` | GET | JWT | Total & pending counts |
| `/api/bookings` | POST | JWT | Create booking |
| `/api/bookings/:id` | PUT | JWT | Update booking |
| `/api/bookings/:id` | DELETE | JWT | Delete booking |
| `/api/messages` | POST | — | Submit contact message |
| `/api/messages` | GET | JWT | List all messages |
| `/api/messages/stats` | GET | JWT | Total & unread counts |
| `/api/messages/:id/read` | PATCH | JWT | Mark message as read |
| `/api/messages/:id` | DELETE | JWT | Delete message |

---

## Project structure

```
Mhenga-media/
├── Assets/                # Images used across all pages
├── index.html             # Home page
├── services.html          # Services page
├── portfolio.html         # Portfolio page
├── media.html             # Podcast / media page
├── contact.html           # Contact page
├── styles.css             # Global stylesheet
├── main.js                # Shared JS (nav toggle, scroll-reveal, footer year)
├── media.js               # Media / podcast page JS
├── vercel.json            # Vercel frontend config (cache headers)
│
├── admin/
│   ├── login.html         # Admin login page
│   ├── login.js           # Login logic (JWT)
│   ├── dashboard.html     # Admin dashboard
│   ├── dashboard.js       # Dashboard logic (CRUD for bookings, content, messages)
│   └── admin.css          # Admin panel styles
│
└── backend/
    ├── package.json
    └── src/
        ├── server.js      # Express entry point
        ├── seed.js         # Seed admin user
        ├── config/
        │   ├── db.js       # MongoDB connection
        │   └── upload.js   # Multer config
        ├── controllers/    # Route handlers
        ├── middleware/      # JWT auth & validation
        ├── models/         # Mongoose schemas (AdminUser, Booking, Content, Message)
        ├── routes/         # Express routers
        └── uploads/        # Uploaded images
```

---

## Running locally

### Frontend

Open the site with any local HTTP server:

```bash
# Python 3
python -m http.server 8080

# or Node.js
npx serve .
```

Visit `http://localhost:8080`.

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mhenga_media
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://localhost:8080
```

Start the server:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

Seed the admin user:

```bash
npm run seed
```

---

## Deployment

| Component | Platform |
|-----------|----------|
| Frontend (HTML/CSS/JS) | **Vercel** — static hosting, no build step |
| Backend API | **Render** — Node.js service |
| Database | **MongoDB Atlas** — cloud database (free M0 tier) |
| Contact form | **Netlify Forms** — serverless form handling |

See [DEPLOY.md](DEPLOY.md) for step-by-step deployment instructions.

### Environment variables (backend)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `2h`) |
| `CORS_ORIGIN` | Allowed origin for CORS |

---

## Customisation

To rebrand the site, update the following values across the HTML files:

| What | Where |
|------|-------|
| Brand name | `<div class="brand-name">` in every page |
| Phone number | `href="tel:..."` and `href="https://wa.me/..."` links |
| Email address | `href="mailto:..."` links |
| YouTube channel | `href="https://www.youtube.com/@..."` links |
| Logo image | `src="Assets/..."` in the `<img class="brand-logo">` tag |
| API base URL | `API_BASE` in `admin/dashboard.js` and `admin/login.js` |

---

## Contact

| Channel | Details |
|---------|---------|

| YouTube | [@mhengagee](https://www.youtube.com/@mhengagee) |

---

© Mhenga Media. All rights reserved.
