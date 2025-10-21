# PostCrossing Mock — Backend, Web UI, and Firefox Extension

A working mock of the PostCrossing system with:
- MongoDB data model and reciprocity logic
- Node.js/Express APIs (Mongoose)
- Simple HTML UI to exercise the flow
- Firefox WebExtension to sort PostCrossing tabs by postcard number

This project is intentionally small, easy to run locally, and suitable for demos or assignments.

## Project structure

- server/
  - Node.js + Express + Mongoose backend
  - Seeds example users and preloads receive credits
  - Hosts the simple web UI (from ../web)
- web/
  - Static HTML page that calls the backend endpoints
- extension/
  - Firefox Manifest V3 extension (background service worker)
  - Sorts PostCrossing tabs in current window by the numeric part of their code

## Prerequisites

- Node.js 18 or newer
- MongoDB 5.x+ running locally (or a reachable URI)
- Firefox 109+ (for loading the MV3 extension)

## Quick start (local)

1) Start MongoDB locally (default URI: mongodb://localhost:27017)

2) Install server dependencies:
- cd server
- npm install

3) Seed the database:
- npm run seed

The seed prints the created user IDs (e.g., alice/bruno/cami/dave). You will use those IDs as x-user-id.

4) Start the backend:
- npm start

The server listens on:
- http://localhost:4000

It also serves the web UI statically at:
- http://localhost:4000/index.html

If you prefer to open the HTML file from the file system, your browser may enforce CORS. Serving via the Node server avoids CORS issues.

## Environment variables

Create server/.env (optional):

- MONGODB_URI=mongodb://localhost:27017/postcrossing_mock
- PORT=4000
- CORS_ORIGIN=*

Defaults are used when not set.

## Using the simple web UI

Open:
- http://localhost:4000/index.html

Steps:
1) Paste one of the seeded user IDs into the "User ID (x-user-id)" field (from the seed output in the terminal).
2) Click “Health Check” to confirm connectivity.
3) Click “Request Address” to get a postcard assignment (creates a traveling postcard and returns a code like US-1).
4) The “Postcard Code” field will auto-fill with the last code. Click “Register Received” to simulate the card being registered. This grants a receive credit to the sender, which the next requester consumes from a FIFO pool.
5) Try “List Traveling” and “Get My Stats” to inspect state changes.

## API summary

Base URL: http://localhost:4000

- POST /api/users/register
  - Body: { username, email, countryCode, fullName, line1, line2?, city, postalCode }
  - Returns: { ok, userId }

- POST /api/postcards/request
  - Headers: x-user-id: <userId>
  - Returns: { ok, postcard }

- POST /api/postcards/register-received
  - Body: { code: "US-1" }
  - Returns: { ok, postcard }

- GET /api/postcards/traveling
  - Headers: x-user-id: <userId>
  - Returns: { ok, items: Postcard[] }

- GET /api/postcards/stats
  - Headers: x-user-id: <userId>
  - Returns: { ok, stats: { sent, received, traveling, expired, maxSlots } }

- GET /api/meta/health
  - Returns: { ok, ts, service, env }

Notes on reciprocity:
- When a recipient registers a postcard as received, the original sender’s address gets one entry in the receive_pool.
- Requests for addresses draw from receive_pool first (FIFO). If empty, a random eligible recipient is picked.

## Quick cURL examples

Replace USER_ID and CODE as appropriate (from seed or previous responses).

- Health:
- curl -s http://localhost:4000/api/meta/health | jq

- Request address (creates traveling postcard):
- curl -s -H "x-user-id: USER_ID" -X POST http://localhost:4000/api/postcards/request | jq

- List traveling:
- curl -s -H "x-user-id: USER_ID" http://localhost:4000/api/postcards/traveling | jq

- Register received:
- curl -s -X POST http://localhost:4000/api/postcards/register-received -H "Content-Type: application/json" -d '{"code":"CODE"}' | jq

- My stats:
- curl -s -H "x-user-id: USER_ID" http://localhost:4000/api/postcards/stats | jq

## Firefox extension (tab sorter)

This MV3 background extension sorts tabs in the current Firefox window by postcard number, based on codes in tab titles (e.g., CL-34269, CN-4087990, US-11797804).

Load temporarily in Firefox:
1) Open about:debugging#/runtime/this-firefox
2) Click “Load Temporary Add-on…”
3) Select extension/manifest.json
4) Open a few PostCrossing pages with titles containing codes.
5) Click the toolbar button or use Alt+Shift+S to sort the tabs.

Sorting rules:
- Tabs with recognizable codes come first, ordered by numeric part ascending (and by country code when numbers tie).
- Tabs without codes remain at the end, in original order.
- Pinned tabs are not moved.

## GitHub: create repo and push

If this directory is not yet a git repo:

- git init
- git add .
- git commit -m "Initial commit: PostCrossing mock backend, web UI, and Firefox extension"
- git branch -M main

Create a repository on GitHub (via the website) and copy its URL (either HTTPS or SSH). Then:

Using HTTPS:
- git remote add origin https://github.com/USERNAME/REPO.git
- git push -u origin main

Using SSH:
- git remote add origin git@github.com:USERNAME/REPO.git
- git push -u origin main

Subsequent pushes:
- git add -A
- git commit -m "Your message"
- git push

## Troubleshooting

- MongoDB connection fails
  - Ensure mongod is running locally or set MONGODB_URI to a reachable instance.
- CORS errors when opening web/index.html as a file
  - Use the server-hosted version at http://localhost:4000/index.html (already configured for permissive CORS).
- No recipients available
  - Run npm run seed to preload receive credits. Registering received cards also replenishes credits via the reciprocity pool.
- Extension doesn’t sort
  - Ensure the tab titles include codes in the format [A-Z]{2}-\d+ (case-insensitive). Pinned tabs are intentionally not moved.

## License

This project is provided for educational/demo purposes. You can adapt it for your use case as needed.
