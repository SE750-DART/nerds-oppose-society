import dotenv from "dotenv";
import express, {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import {Server as IOServer, Socket} from "socket.io";

dotenv.config();


// Setup Environment Variables
if (!process.env.PORT) {
    console.error("ERROR: Environment variable \"PORT\" not set");
    process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);


// Setup Express
const app = express();

app.use(helmet());
app.use(cors());

app.get("/", async (req: Request, res: Response) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 100));

        res.status(200).send("Hello world!");
    } catch (e) {
        res.status(500).send("Something went wrong :/");
    }
});


// Activate Server
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});


// Setup Socket.IO
const io = new IOServer(server, {
    cors: {
        origin: true
    }
});

io.on("connection", async (socket: Socket) => {
    console.log("client connected!");
    socket.emit("hello", "world!");
})
