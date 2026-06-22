const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const mongoPort = 27017;
const mongoHost = "127.0.0.1";
const mongodPath = path.join(root, "local-mongodb", "MongoDB", "Server", "8.3", "bin", "mongod.exe");
const mongoDataPath = path.join(root, "mongo-data");
const mongoLogPath = path.join(root, "mongo-logs", "mongod.log");

function canConnect(port, host) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ port, host });
        socket.once("connect", () => {
            socket.destroy();
            resolve(true);
        });
        socket.once("error", () => resolve(false));
        socket.setTimeout(1000, () => {
            socket.destroy();
            resolve(false);
        });
    });
}

async function waitForMongo() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        if (await canConnect(mongoPort, mongoHost)) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error("MongoDB did not start within 15 seconds.");
}

async function ensureMongo() {
    if (await canConnect(mongoPort, mongoHost)) {
        console.log("[KeyTroupee] MongoDB is already running.");
        return;
    }

    if (!fs.existsSync(mongodPath)) {
        throw new Error(`MongoDB server was not found at ${mongodPath}`);
    }

    fs.mkdirSync(path.dirname(mongoLogPath), { recursive: true });
    fs.mkdirSync(mongoDataPath, { recursive: true });

    console.log("[KeyTroupee] Starting local MongoDB...");
    const mongo = spawn(mongodPath, [
        "--dbpath", mongoDataPath,
        "--bind_ip", mongoHost,
        "--port", String(mongoPort),
        "--logpath", mongoLogPath,
        "--logappend"
    ], {
        detached: true,
        stdio: "ignore",
        windowsHide: true
    });

    mongo.unref();
    await waitForMongo();
    console.log("[KeyTroupee] MongoDB started.");
}

ensureMongo()
    .then(() => require("../server").startServer())
    .catch((err) => {
        console.error("[KeyTroupee] Startup failed:", err.message);
        process.exit(1);
    });
