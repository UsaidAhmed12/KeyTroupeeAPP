require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const User = require("./models/user");
const Progress = require("./models/progress");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
app.use(express.json());
app.use(cors());

// Serve the website (HTML/CSS/JS/images) from the browser.
app.use("/tempelate", express.static(path.join(__dirname, "tempelate")));
app.use("/style", express.static(path.join(__dirname, "style")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));

// Opening http://localhost:3000 lands you on the home page.
app.get("/", (req, res) => res.redirect("/tempelate/Home.html"));

// --- Auth routes -----------------------------------------------------------

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required." });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const hashed = await bcrypt.hash(password, 10);
        await new User({ name, email, password: hashed }).save();
        res.status(201).json({ message: "Account created successfully." });
    } catch (err) {
        res.status(500).json({ message: "Could not create account: " + err.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        res.json({ message: "Login successful", name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ message: "Login failed: " + err.message });
    }
});

// --- Typing progress routes ------------------------------------------------

app.post("/progress", async (req, res) => {
    const { username, wpm, accuracy, mistakes, difficulty } = req.body;

    if (!username) {
        return res.status(400).json({ message: "A logged-in user is required to save progress." });
    }

    try {
        await new Progress({
            username,
            wpm: Number(wpm) || 0,
            accuracy: Number(accuracy) || 0,
            mistakes: Number(mistakes) || 0,
            difficulty: difficulty || "unknown"
        }).save();
        res.status(201).json({ message: "Progress saved." });
    } catch (err) {
        res.status(500).json({ message: "Could not save progress: " + err.message });
    }
});

app.get("/progress/:username", async (req, res) => {
    try {
        const results = await Progress.find({ username: req.params.username }).sort({ timestamp: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Could not load progress: " + err.message });
    }
});

// --- Startup ---------------------------------------------------------------

async function startServer() {
    // Always start the web server so the pages load in the browser, even if the
    // database isn't configured yet.
    app.listen(PORT, () => {
        console.log("[KeyTroupee] App running. Open this in your browser:");
        console.log(`[KeyTroupee]    http://localhost:${PORT}`);
    });

    if (!MONGODB_URI || MONGODB_URI.startsWith("PASTE")) {
        console.warn(
            "\n[KeyTroupee] No database configured yet. The site will load, but sign up /\n" +
            "[KeyTroupee] login / save progress won't work until you paste your MongoDB Atlas\n" +
            "[KeyTroupee] connection string into the .env file.\n"
        );
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("[KeyTroupee] Connected to MongoDB.");
    } catch (err) {
        console.error("[KeyTroupee] Could not connect to MongoDB Atlas:", err.message);
    }
}

// Start automatically when run directly (`node server.js`); when required by
// Electron's main process we export startServer() and let it call us.
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
