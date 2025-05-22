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

  hasConnection(userId) {
    return this.connections.has(userId);
  }

  broadcast(event, data, excludeUserId = null) {
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
const websocketInstance = new WebSocketInstance();
export default websocketInstance; 