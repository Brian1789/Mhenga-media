# Mhenga Media

> Bold, professional media services — recognized as the leading media provider at **The Co-operative University of Kenya (CUK)**.

Mhenga Media is a static website showcasing photoshoot, graphic design, and event media-coverage services. It is built with plain HTML, CSS, and vanilla JavaScript and is ready to deploy on any static host (e.g. Netlify).

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home page — hero, featured services, and portfolio preview |
| `services.html` | Full breakdown of Photoshoots, Graphic Design, and Media Coverage |
| `portfolio.html` | Gallery/portfolio filtered by category |
| `media.html` | Podcast and video media page |
| `contact.html` | Inquiry form (Netlify Forms) and direct-contact options |

---

## Tech stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, responsive grid/flex layout (`styles.css`)
- **Vanilla JavaScript** — scroll-reveal animations, mobile nav toggle (`main.js`, `media.js`)
- **Google Fonts** — Inter & Space Grotesk
- **Netlify Forms** — serverless form handling on the Contact page

No build step or package manager is required.

---

## Project structure

```
Mhenga-media/
├── Assets/          # Images used across all pages
├── index.html       # Home page
├── services.html    # Services page
├── portfolio.html   # Portfolio page
├── media.html       # Podcast / media page
├── contact.html     # Contact page
├── styles.css       # Global stylesheet
├── main.js          # Shared JS (nav toggle, scroll-reveal, footer year)
└── media.js         # Media / podcast page JS
```

---

## Running locally

Because all assets are served from relative paths, you can open the site with any local HTTP server:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## Deployment

The site is designed for **Netlify**:

1. Connect the repository to a Netlify project.
2. Set the **Publish directory** to `.` (repo root) — no build command needed.
3. Netlify Forms will automatically detect the `data-netlify="true"` attribute on the contact form.

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

---

## Contact

| Channel | Details |
|---------|---------|
| Email | glennaspin9@gmail.com |
| Phone / WhatsApp | +254 712 830 837 |
| YouTube | [@mhengagee](https://www.youtube.com/@mhengagee) |

---

© Mhenga Media. All rights reserved.
