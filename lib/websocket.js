import { Server } from 'socket.io';

let io = null;
let wsInstance = null;

class WebSocketManager {
  constructor() {
    this.connections = new Map();
  }

  initialize(server) {
    if (io) return io;

    io = new Server(server, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("🔌 Client connected");

      const userId = socket.handshake.query.userId;
      if (userId) {
        this.addConnection(userId, socket);
      }

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected");
        if (userId) {
          this.removeConnection(userId);
        }
      });
    });

    return io;
  }

  addConnection(userId, socket) {
    this.connections.set(userId, socket);
  }

  removeConnection(userId) {
    this.connections.delete(userId);
  }

  getConnection(userId) {
    return this.connections.get(userId);
  }

  hasConnection(userId) {
    return this.connections.has(userId);
  }

  broadcast(event, data, excludeUserId = null) {
    if (io) {
      io.emit(event, data);
    }
    
    this.connections.forEach((socket, userId) => {
      if (userId !== excludeUserId) {
        socket.emit(event, data);
      }
    });
  }

  sendToUser(userId, event, data) {
    const socket = this.connections.get(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }
}

// Export a singleton instance
export function getWebSocketManager() {
  if (!wsInstance) {
    wsInstance = new WebSocketManager();
  }
  return wsInstance;
}

export function getIO() {
  return io;
} 