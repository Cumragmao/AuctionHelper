# AuctionHelper Platform

This project contains a simple Node.js/Express server and a web client for displaying item metrics from the Turtle WoW auction house. The server proxies data from external sources and serves the static client.

## Setup

1. Install Node.js dependencies:
   ```bash
   cd server
   npm install
   ```
2. Run the server in development mode:
   ```bash
   npm run dev
   ```
   or start normally with `npm start`.

The client is served from `/client` and will be accessible at `http://localhost:3000` by default.
