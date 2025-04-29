import { Server } from "socket.io";

export let io = null;

export function setupWebSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected");

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });
}
