# Mhenga Media Website

Welcome to the official repository for the **Mhenga Media** website. Mhenga Media is a leading media provider based at The Co-operative University of Kenya (CUK), specializing in high-quality photoshoots, graphic design, and full event media coverage.

## Project Overview

This project is a static website designed to showcase Mhenga Media's portfolio, services, and latest content. It features a modern, responsive design with smooth animations and integration with the MhengaGee Media YouTube channel to display the latest uploads automatically.

## Features

-   **Services Showcase:** Detailed pages for Photoshoots, Graphic Design, and Media Coverage.
-   **Dynamic Portfolio:** Filterable gallery of recent work (Photoshoots, Design, Coverage).
-   **YouTube Integration:** Automatically fetches and displays the latest video from the MhengaGee Media YouTube channel using the YouTube Data API.
-   **Responsive Design:** Fully optimized for mobile, tablet, and desktop devices.
-   **Contact Form:** Integrated contact form for booking inquiries (configured for Netlify Forms).
-   **Smooth Animations:** Reveal-on-scroll effects for a polished user experience.

## Technologies Used

-   **HTML5:** Semantic markup for structure and accessibility.
-   **CSS3:** Custom styling with Flexbox, CSS Grid, and CSS Variables for theming.
-   **JavaScript (ES6+):** Vanilla JS for interactivity, including the portfolio filter and YouTube API integration.
-   **Google Fonts:** Inter and Space Grotesk for typography.

## Project Structure

```
├── Assets/                 # Images and media files
├── index.html              # Homepage
├── services.html           # Services details
├── portfolio.html          # Portfolio gallery with filtering
├── media.html              # Podcast & Media page (YouTube integration)
├── contact.html            # Contact page with form
├── styles.css              # Main stylesheet
├── main.js                 # General site interactivity (navigation, animations)
└── media.js                # YouTube API fetch logic
```

## Setup & Installation

Since this is a static website, no build process or complex backend setup is required.

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mhenga-media.git
    cd mhenga-media
    ```

2.  **Run a local server:**
    You can use Python's built-in HTTP server or any other static file server.
    ```bash
    # Python 3
    python3 -m http.server
    ```

3.  **Open in your browser:**
    Navigate to `http://localhost:8000` to view the site.

### Deployment

The site is ready to be deployed on any static hosting service such as:
-   **Netlify** (Recommended for form handling support)
-   **GitHub Pages**
-   **Vercel**

## Usage

-   **Navigation:** Use the responsive menu to navigate between Home, Services, Portfolio, Media, and Contact pages.
-   **Portfolio:** On the Portfolio page, use the filter buttons ("All", "Photoshoots", "Graphic design", "Media coverage") to sort projects.
-   **Media:** The Media page will automatically load the latest video. Ensure you have an active internet connection to fetch data from YouTube.

## Contributing

Contributions are welcome! If you find a bug or want to suggest an improvement:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## Contact

**Mhenga Media**
*Leading media provider • The Co-operative University of Kenya*

-   **Email:** [glennaspin9@gmail.com](mailto:glennaspin9@gmail.com)
-   **Phone/WhatsApp:** [+254 712 830 837](https://wa.me/254712830837)
-   **YouTube:** [MhengaGee Media](https://www.youtube.com/@mhengagee)

---
© 2026 Mhenga Media. All rights reserved.
