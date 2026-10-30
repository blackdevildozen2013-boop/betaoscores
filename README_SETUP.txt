BETTAO SCORES — AUTOMATIC MATCH CENTER (NO OWN SERVER)
====================================================
1. Unzip and upload ALL files/folders to the ROOT of your GitHub Pages repository.
   IMPORTANT: keep the .github/workflows/refresh-matches.yml folder; hidden .github may be omitted by some file managers.
2. In GitHub: repository -> Settings -> Secrets and variables -> Actions -> New repository secret.
   Name: REALTIME_SPORTS_API_KEY
   Value: your API key from the Realtime Sports API dashboard. NEVER paste it into public JS or commit it.
3. In GitHub: Actions -> Refresh Bettao match data -> Run workflow (once).
4. Wait for the workflow to finish, then open https://betaoscores.com/match-center.html.
   GitHub Pages may take several minutes to publish the data.
5. Ensure Settings -> Actions -> General -> Workflow permissions allows read/write if the commit step is denied.

IMPORTANT LIMITATIONS
- Free API plan: 125 requests/month, 1 request/second (verify plan in dashboard).
- Three league calls daily (NFL/NBA/MLB), up to 93 calls in a 31-day month.
  Safety cap 115; manual runs and retries consume additional requests.
- This is a DAILY SNAPSHOT, NOT live real-time data. WebSockets require Pro/Enterprise.
- No guarantee that the provider supplies soccer/Premier League/Champions League through this API.
- No fabricated player statistics or predictions; details show only returned data.
- The API key is held in GitHub Actions Secrets, not sent to site visitors.
- The site remains on GitHub Pages; GitHub Actions executes the scheduled fetch.
- Provider redistribution/display rights and commercial usage must be checked in its terms.
- Favorite games are saved in browser localStorage on that device only.
- The initial data/matches.json is empty until the workflow succeeds.
- GitHub scheduled jobs can be delayed/skipped, especially on inactive repositories.
- If workflow has 401/403, check key/plan; if no games appear, inspect logs.
- Your existing embedded scoreboard widgets are separate from the new API data.

Files changed: match-center.html, match-center.js.
Files added: match-center-api.js, match-center-api.css, data/matches.json,
 data/request-ledger.json, scripts/fetch_matches.py, .github/workflows/refresh-matches.yml.
