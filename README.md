# Auren Roofing Co. — Premium Residential Roofing Website

A React + Vite + Tailwind frontend with a small Express contact API. The visual direction is architectural/editorial: warm cream, deep forest green, signature blue, large serif typography, image-led sections and restrained scroll motion.

## Project structure
- `client/` — React 18 + Vite + Tailwind frontend.
- `client/src/pages/HomePage.jsx` — homepage.
- `client/src/pages/AboutPage.jsx` — About page.
- `client/src/pages/ContactPage.jsx` — estimate/contact page.
- `client/src/components/shared/Reveal.jsx` — IntersectionObserver-based scroll reveal.
- `client/src/config/siteConfig.js` — central brand and owner-verified business details.
- `server/` — Express API with validation, honeypot, rate limiting and Resend email delivery.

## Run locally

Terminal 1 — API:
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Terminal 2 — frontend:
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Contact form email delivery

The API reports success only after Resend confirms that the email request was accepted. Configure all three variables in `server/.env`:
- `RESEND_API_KEY`
- `CONTACT_RECIPIENT_EMAIL`
- `RESEND_FROM_EMAIL` (must use a sender/domain verified in Resend)

If these are missing, the API returns an explicit integration-pending error. It does not claim that a message was delivered.

## Owner verification before launch

Update `client/src/config/siteConfig.js` with:
- Approved brand and legal business name.
- Registered domain.
- Real phone and email (including `tel:` and `mailto:` links).
- Confirmed states and cities served.
- Verified license/insurance wording.

Do not publish invented service areas, certifications, reviews, warranties, team biographies or project claims. The working brand name Auren Roofing Co. has not been cleared for trademark/domain use.

## Routing and hosting

The frontend supports `/`, `/about` and `/contact` with browser history. Configure the production host to serve `client/index.html` as the SPA fallback for those routes. Keep `/api/*` routed to the Express service.

## Motion and accessibility

- Scroll reveals use IntersectionObserver.
- Hero entrance, image reveal, marquee, process-line and card hover motions are CSS-driven.
- `prefers-reduced-motion` is respected.
- Test keyboard focus, color contrast and the mobile fixed contact action before production.
