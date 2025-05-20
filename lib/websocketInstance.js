// lib/websocketInstance.js
class WebSocketInstance {
  constructor() {
    this.connections = new Map();
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

  broadcast(message, excludeUserId = null) {
    this.connections.forEach((socket, userId) => {
      if (userId !== excludeUserId) {
        socket.send(JSON.stringify(message));
      }
    });
  }

  sendToUser(userId, message) {
    const socket = this.getConnection(userId);
    if (socket) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const websocketInstance = new WebSocketInstance();

export default websocketInstance;
