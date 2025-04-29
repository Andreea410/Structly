import { Server } from "socket.io";
import { setIO } from "../../lib/websocketInstance.js";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.io...");
    const io = new Server(res.socket.server, {
      path: "/api/socket", 
    });

    setIO(io); 

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  res.end();
}
