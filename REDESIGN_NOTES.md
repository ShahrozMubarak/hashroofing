# Auren Roofing — Redesign Notes

## What changed
- Replaced the generic contractor-template layout with an editorial, architectural visual direction.
- Introduced a more visible forest-green identity alongside the supplied `#0779B3` blue and warm cream.
- Increased headline scale and simplified homepage/About copy.
- Replaced repeated bordered rectangular cards with asymmetrical image-led service layouts, arch crops, open typography and full-bleed color/image sections.
- Added real scroll-triggered reveals using IntersectionObserver, hero entrance motion, image reveal, moving service ticker, process-line animation, card hover motion, mobile drawer transition and a top scroll-progress indicator.
- Added reduced-motion support.
- Improved responsive navigation and the fixed mobile estimate action.
- Added browser history paths for `/`, `/about` and `/contact`.
- Converted all five large JPGs to optimized WebP assets (about 4.7 MB total source images reduced to about 1.0 MB).
- Added an SVG favicon.
- Updated contact delivery so the API reports success only after Resend accepts the email. Missing email settings return an explicit pending response instead of a false success.

## Main design choices
- Display font: Instrument Serif.
- Interface/body font: DM Sans.
- Forest green: `#183F34` and deeper `#102F28`.
- Signature blue: `#0779B3`.
- Warm cream: `#F3F0E7`.
- Soft ivory: `#FBFAF6`.

## Before launch
- Confirm the final business name and domain. “Auren Roofing Co.” is still a working name and has not been cleared for trademark/domain use.
- Enter the real phone, email, service states and cities in `client/src/config/siteConfig.js`.
- Verify all licensing/insurance statements and only publish accurate credentials.
- Configure Resend in `server/.env` with a verified sender domain.
- Configure hosting rewrites for `/about` and `/contact`; an Apache `.htaccess` fallback is included in `client/public/`.
- Test the live form, mobile sticky contact bar, reduced-motion setting and target browsers.

## Validation performed
- All 11 JavaScript/JSX source files passed TypeScript transpile parsing.
- Express server source passed `node --check`.
- All local image references resolve to included WebP assets.
- A full Vite production build was not run in this environment because dependency installation timed out; run `npm install` then `npm run build` in `client/` on the development machine.
