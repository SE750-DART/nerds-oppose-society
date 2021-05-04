import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server as IOServer } from "socket.io";
import config from "./config";
import { Connection, Auth } from "./handlers";

// Setup Express
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.origin,
  })
);

app.get("/", async (req: Request, res: Response) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    res.status(200).send("Hello world!");
  } catch (e) {
    res.status(500).send("Something went wrong :/");
  }
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
