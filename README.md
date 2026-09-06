# KHAAS backend

Node.js + Express backend for the KHAAS site: accounts, the movie/show
catalog, video + poster uploads, and a real sign-in-gated video
stream. It also serves the frontend itself, so running this one
server gives you the whole working site.

## Setup

```bash
cd khaas-backend
npm install
cp .env.example .env      # then open .env and set JWT_SECRET
npm start
```

Open **http://localhost:4000** — that's the whole site. Sign up,
sign in, click a title, sit through the (placeholder) ad, and watch.
While signed in, open any title and you'll see "Upload video file" /
"Upload poster" buttons right in its detail view.

> Open it from `http://localhost:4000`, not by double-clicking
> `public/index.html` — the frontend talks to the API over
> same-origin `fetch()`, which only works when served by this server.

## How playback is gated

Clicking anything play-shaped (hero Play, a row card, the play button
in "More Info") goes through one flow:

1. **Not signed in** → the sign-in/sign-up modal opens and remembers
   what you were trying to watch. Finish signing in and it picks up
   where you left off.
2. **A 5-second unskippable ad** plays next — no close button, no
   Escape, no click-outside. This step always happens, signed in or
   not (see `AD_SECONDS` in `public/script.js` to change the length).
3. **The real video** loads.

Importantly, step 1 is enforced on the server too, not just hidden in
the UI. Uploaded video files live in `/media`, a folder nothing ever
serves statically — the only way to get bytes out of it is
`GET /api/stream/:filename`, which checks a valid token first. `<video>`
elements can't send an `Authorization` header, so the frontend passes
the token as `?token=...` on the stream URL instead (weaker than a
header — it can land in logs — a reasonable trade-off for a small
project, not for anything sensitive). Poster images are different:
they live in `/uploads` and stay public, since thumbnails should show
while browsing even signed out.

## Project structure

```
khaas-backend/
  server.js          entry point — wires everything together
  src/
    db.js             tiny JSON-file storage helper
    auth.js            signup / signin / me / requireAuth / verifyToken
    catalog.js          catalog CRUD + video + poster upload endpoints
    stream.js           the auth-gated video streaming route
  data/
    users.json         accounts (passwords stored as bcrypt hashes)
    catalog.json        the catalog — seeded with the 10 existing titles
  uploads/             poster/thumbnail images (public)
  media/               uploaded video files (never served statically)
  public/              the frontend (index.html, styles.css, script.js)
```

## API

All routes are prefixed with `/api`. Authenticated routes expect
`Authorization: Bearer <token>`.

| Method | Route                    | Auth? | Notes |
|--------|---------------------------|-------|---------------|
| POST   | `/auth/signup`            | —     | `{ name, email, password }` |
| POST   | `/auth/signin`            | —     | `{ email, password }` |
| GET    | `/auth/me`                | yes   | returns the signed-in user |
| GET    | `/catalog`                | —     | list everything |
| GET    | `/catalog/:id`            | —     | one title |
| POST   | `/catalog`                | yes   | `{ title, type, year, rating, meta, genres, description, trending, poster, posterGradient }` — `type` is `"movie"` or `"show"` |
| PUT    | `/catalog/:id`            | yes   | any subset of the same fields |
| DELETE | `/catalog/:id`            | yes   | also deletes its uploaded video + poster files |
| POST   | `/catalog/:id/video`      | yes   | `multipart/form-data`, field `video` → saved to `/media` |
| POST   | `/catalog/:id/poster`     | yes   | `multipart/form-data`, field `poster` → saved to `/uploads` |
| GET    | `/stream/:filename`       | yes*  | `*` via `Authorization` header or `?token=` query param |

## Adding videos and posters

Once signed in, open any title (click it, or "More Info" → the play
button) and use the two buttons under the description — "Upload video
file" and "Upload poster" — to pick a file straight from your device.
That's it; no editing JSON or restarting the server. The buttons
relabel themselves to "Replace…" once a title already has one.

If you'd rather do it by hand (e.g. scripting a bulk import), you can
also `curl` the endpoints above directly, or edit `data/catalog.json`
while the server is stopped.

## Managing the server

- **Start it**: `npm start` (runs until you stop it) or `npm run dev`
  (auto-restarts on file changes, via Node's `--watch`).
- **Stop it**: `Ctrl+C` in the terminal it's running in.
- **Logs**: it just prints to that terminal — there's no separate log
  file. Redirect it yourself if you want one: `npm start > server.log 2>&1`.
- **Keep it running after you close the terminal**: for a personal
  server, the simplest option is [pm2](https://pm2.keymetrics.io/)
  (`npm install -g pm2`, then `pm2 start server.js --name khaas`,
  `pm2 logs khaas`, `pm2 restart khaas`, `pm2 stop khaas`). For a real
  deployment, a systemd service or your host's process manager
  (Render, Railway, a VPS with systemd) is the more standard route.
- **After editing code**: restart the process (`npm run dev` does this
  for you automatically). Editing `data/*.json` directly does NOT need
  a restart — every route reads the file fresh on each request, so a
  browser refresh is enough.

## Data storage

Accounts and the catalog are plain JSON files in `data/` — no
database server to install, easy to open and inspect by hand. It
rewrites the whole file on every write, so it's fine for a small site,
not built for heavy concurrent traffic. If you outgrow it, swap
`src/db.js` for a real database (SQLite via `better-sqlite3`, or
Postgres) — `auth.js` and `catalog.js` only ever call `readJSON` /
`writeJSON`, so that's the one file that needs to change.

## About the ad banners

The two `<div class="ad-banner">` slots (in `public/index.html`,
between the rows) are clearly-labeled placeholders — there's no real
ad network wired in, so they don't earn anything on their own yet.

To actually run ads: sign up with a network (Google AdSense is the
usual starting point for a small site), get approved, and paste the
snippet they give you inside `.ad-banner-slot` in place of the
placeholder `<span>`. Two things worth knowing going in:
- Ad networks require a **live public domain** with real traffic —
  `localhost` won't qualify, and approval takes a review.
- Most networks (AdSense included) **won't approve a site whose main
  content is video you don't hold the rights to**. If everything
  hosted here is your own — your own uploads, your own creations —
  you're fine; a site built around uploading other people's movies/
  shows generally isn't eligible for ad monetization regardless of
  how it's built.

The pre-roll ad (`#adOverlay` in `public/script.js`) is the same
story — house/placeholder creative, not a real ad exchange. Wiring in
real video ads means integrating a VAST/VPAID tag from an ad network
in place of the static markup in `startAdGate()`.

## A note on how this was tested

I wrote and syntax-checked every file. `src/db.js`'s storage logic ran
for real (it only needs Node's built-in `fs`). I also served the
actual `public/` frontend over a local HTTP server and drove it with
a real browser, mocking just the `/api/*` responses — that confirmed
the sign-in gate, the unskippable ad, session restore on reload, and
the info/watch modal modes all behave correctly. What I couldn't do is
run the real Express server end-to-end — this sandbox has no internet
access, so I can't `npm install` here — so `auth.js`, `catalog.js`,
and `stream.js` are unverified in the sense that your `npm install &&
npm start` will be their first real run, though they follow standard,
well-documented Express/bcrypt/JWT/multer patterns. Let me know if
anything doesn't behave as expected on that first run.
