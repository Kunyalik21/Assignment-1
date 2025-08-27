# Full-stack Node.js App (Express + MongoDB + Passport.js + Multer)

This app includes:
- Express backend with MongoDB (Mongoose)
- Session auth via Passport.js (local strategy)
- File uploads via Multer (disk storage)
- Static frontend (HTML/CSS/JS) calling API routes
- Render deployment config (`render.yaml`)

## Local setup

1) Copy env file and fill in values:

```
cp .env.example .env
```

Create `.env` with:

```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
SESSION_SECRET=please_change_me
CORS_ORIGIN=http://localhost:8080
```

2) Install Node 18+ then dependencies:

```
npm install
```

3) Start the server:

```
npm run dev
```

Open `http://localhost:8080`

## API

- POST `/api/auth/register` { username, password }
- POST `/api/auth/login` { username, password }
- POST `/api/auth/logout`
- GET `/api/auth/me`
- POST `/api/upload` (form-data: file)
- GET `/api/files`

## Deploy on Render

- Push the repo to GitHub
- Create a new Web Service in Render from the repo
- Build Command: `npm install`
- Start Command: `node src/server.js`
- Set environment variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=...`
  - `SESSION_SECRET=...`
  - `CORS_ORIGIN=https://<your-app>.onrender.com`
- Deploy. Your URL will be `https://<service-name>.onrender.com`

Notes:
- Uploads are served from `/uploads`. For persistence in production, use S3 or a Render Disk.
- CORS allows credentials and cookies. Ensure `CORS_ORIGIN` matches your deployed origin.
# Muter-Hey_coach_Assignment
# Assignment-1
