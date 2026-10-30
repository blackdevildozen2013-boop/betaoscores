BETTAO MATCH CENTER — INSTALLATION
===================================
1. Extract the ZIP file.
2. Open your GitHub Pages repository, in the folder where index.html lives.
3. Upload all files from the ZIP (replace same-name files) and Commit changes.
4. Visit https://betaoscores.com/match-center.html
5. The homepage now links to Match Center and shows a dismissible floating card after scrolling.

WORKING FEATURES
- Real external sports scoreboard iframes (provider availability required).
- Match tracker: editable team names, score from goal events, event timeline, undo, clear, JSON export.
- Stats comparison: manual input, proportional bars, saved state, clipboard summary.
- Sports quiz: 10 randomly chosen questions per round, explanations, local best score.
- Browser-local persistence using localStorage; no account, server, or payment required.
- Responsive desktop and mobile layouts.

IMPORTANT
The external scoreboards do not expose their data to our JavaScript. Personal tracking and comparison require manual input. They are not automatically populated from the live score widgets. There are no fabricated live predictions. Storage may be cleared when the app/browser deletes website data or uses private mode. In WKWebView, localStorage is per app web data store; it does not automatically sync with Safari or other devices. To keep it across app launches, use WKWebsiteDataStore.default() (persistent data store).

SWIFTUI / WKWEBVIEW
Use WKWebView with URL https://betaoscores.com/match-center.html .
This web experience adds interactive tools, but App Store review evaluates the entire app. A WebView alone is not a guarantee of approval. Keep meaningful native features in the SwiftUI app.

PRESERVED
- Existing site pages, branding, contact form (Formspree ID xwlvrzkl), privacy policy, and Intelligence concept page.
- No paid subscriptions or backend have been added.
