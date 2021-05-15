import io from "socket.io-client";

const socket = io({
  autoConnect: false,
});

export default socket;
