BETÃO SCORES — STATIC WEBSITE
=============================
Website: betaoscores.com
App: Betão Scores
Developer: OLEKSANDR PLACHYNDA
Platform focus: Apple App Store

WHAT IS INCLUDED
----------------
index.html       Homepage, interactive live sports scores, studio presentation
contact.html     Contact form, compact live scores, email-draft / copy workflow
privacy.html     App-specific privacy policy (no score widget)
styles.css       Responsive styling and reduced-motion support
main.js          Navigation, score tabs, contact form validation, scroll reveals
stadium.webp     Original hero artwork
football.webp    Original football artwork
basketball.webp  Original basketball artwork
favicon.svg      Local vector favicon

DEPLOY TO GITHUB PAGES
----------------------
1. Extract every file into the root of your repository (one directory only).
2. On GitHub, open Settings > Pages.
3. Select Deploy from a branch > main > /(root) and save.
4. Once published, point betaoscores.com at the Pages site via your DNS provider
   and configure the custom domain in GitHub Pages.
5. Confirm https://betaoscores.com/privacy.html loads publicly and add that URL
   in App Store Connect for the Betão Scores app.

LIVE SPORTS SCORE INTEGRATION
-----------------------------
Provider: Realtime Sports API, https://www.realtimesportsapi.com/widgets
Free embedded scoreboards; no API key required.
Supported tabs: Premier League football, NBA basketball, NHL hockey.
The provider says scores refresh every ~60 seconds, and may be delayed.
If no match is currently live, upcoming and recent results may appear.
Requires an internet connection. Third-party availability, limits, content and
terms may change. The embed is external by design; all essential site artwork
and code remain local. Do not remove provider attribution.

CONTACT FORM: ACTION REQUIRED BEFORE PUBLISHING
------------------------------------------------
No verified support email was provided. To enable an addressed email draft:
Open main.js and set CONTACT_EMAIL = 'your-verified-address@example.com';
using a real inbox that you control. The default form validates inputs and
opens an email draft with NO recipient; the user must add a recipient and send.
The COPY MESSAGE button works without a backend. Neither action automatically
sends or stores a message. Do not claim otherwise.

PRIVACY POLICY: VERIFY BEFORE APP STORE SUBMISSION
---------------------------------------------------
The policy names the correct app and developer, and describes the known website
embed and contact behavior. Actual iOS app data handling, third-party SDKs,
analytics, advertising, identifiers, push notifications, retention, legal
jurisdictions and support channels were not supplied. These facts MUST be
verified and the policy revised as needed before using it as a definitive
App Store disclosure. App Store Connect's App Privacy answers must accurately
match the actual app and third-party code.
Apple's guidance: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/

TECHNICAL
---------
Plain HTML5, CSS3 and vanilla JavaScript. No build step, no npm, no backend.
All paths are relative for GitHub Pages subpaths. Images are local WebP.
Live scores require the external provider, and email drafts require a mail app.


BRAND UPDATE (14 October 2026)
------------------------------
The design now uses the official app icon supplied by the site owner and the supplied
orange/yellow Betão Scores promotional banner. The website includes optimized local
assets: app-icon.webp, promo-banner.webp, favicon.png, apple-touch-icon.png.
The icon appears in the header, footer, about section and privacy page. The promotional
banner appears on the homepage and contact page. The colors and buttons are adapted
to the supplied red-orange, golden-yellow and warm-white palette.

The original uploaded files remain the owner's assets; no licensing rights are asserted.

The mobile homepage also includes promo-mobile.webp, an optimized stacked composition
made exclusively from the supplied promotional banner for narrow screens.
