import { Server } from "socket.io";
import websocketInstance from "../../lib/websocketInstance";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.io...");
    const io = new Server(res.socket.server, {
      path: "/api/socket", 
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected");
      
      // Add the connection to our instance
      const userId = socket.handshake.query.userId;
      if (userId) {
        websocketInstance.addConnection(userId, socket);
      }

      socket.on("disconnect", () => {
        console.log("Client disconnected");
        if (userId) {
          websocketInstance.removeConnection(userId);
        }
      });
    });
  }
  res.end();
}
