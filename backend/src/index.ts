import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server as IOServer } from "socket.io";
import config from "./config";
import { Connection, Auth } from "./handlers";
import routes from "./routes";
import mongoose from "mongoose";
import path from "path";

// Init DB
// Connect to local running instance of mongodb, on telosdatabase db
// useNewUrlParser recommended set to true, but must specify a port (using the default 27017)
// useUnifiedTopology recommended set to true (uses mongodb new connection management engine)
mongoose.connect(config.mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Callbacks to verify we have connected correctly, or when a connection error occurs
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to local database");
});

// Setup Express
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.origin,
  })
);
app.use(routes);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err.message);
  res.status(500).send("Server Error");
  next();
});

// if (process.env.NODE_ENV == 'production') {
app.use(express.static(path.resolve(__dirname, "../src/build/")));

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../src/build/", "index.html"));
});

// Activate Server
const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});

// Setup Socket.IO
const io = new IOServer(server, {
  cors: {
    origin: config.origin,
  },
});

io.use(Auth);

io.on("connection", async (socket) => {
  await Connection(io, socket);
});
