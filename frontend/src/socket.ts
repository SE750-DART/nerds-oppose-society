import io from "socket.io-client";

// const URL = "http://localhost:42069";
const socket = io({
  autoConnect: false,
});

export default socket;
