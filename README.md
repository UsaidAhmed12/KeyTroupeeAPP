# KeyTroupee

A browser-based typing-and-piano practice web app built with a
**Node.js + Express + MongoDB Atlas** backend.

## Architecture

```
Web browser  ──fetch──▶  Express server (localhost:3000)  ──▶  MongoDB Atlas (cloud)
                              (server.js)                          (users, progress)
```

One Node server (`server.js`) does two jobs: it serves the web pages (HTML/CSS/JS) to
your browser **and** provides the API that connects to a cloud MongoDB Atlas database.
There is **no local database to install or start** — everything comes up with one command.

## One-time setup

1. Install [Node.js](https://nodejs.org) (LTS version).
2. Install the dependencies:
   ```
   npm install
   ```
3. Create your database settings file: copy `.env.example` to a new file named `.env`,
   then choose **one** of the two database options below.

**Option A — Local MongoDB (simplest for one computer):**
Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and make
sure it's running, then put this in your `.env`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/keytroupeeDB
```

**Option B — MongoDB Atlas (free cloud, works anywhere):**
Create a free cluster at https://www.mongodb.com/atlas, get its connection string
(Database → Connect → Drivers), and put it in your `.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/keytroupeeDB?retryWrites=true&w=majority
```

## Running the app

```
npm start
```

Then open **http://localhost:3000** in your web browser.

Watch the terminal — you should see `Connected to MongoDB` and the
`http://localhost:3000` link to open.

> Note: the project was originally an Electron desktop app. It is now browser-based,
> so `main.js` and `preload.js` are no longer used and can be ignored.

## API endpoints

| Method | Route                  | Purpose                          |
|--------|------------------------|----------------------------------|
| POST   | `/signup`              | Create an account (password hashed with bcrypt) |
| POST   | `/login`               | Authenticate a user              |
| POST   | `/progress`            | Save a typing result             |
| GET    | `/progress/:username`  | List a user's saved results      |
