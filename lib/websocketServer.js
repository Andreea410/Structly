import { WebSocketServer } from 'ws';
import { generateFakeDataStructures } from '../utils/generateFakeData';

let wsManagerInstance = null;

class WebSocketManager {
  constructor(server) {
    this.clients = new Set();
    this.generationInterval = null;
    this.isGenerating = false;
    
    this.wss = new WebSocketServer({ noServer: true });
    
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('New client connected');

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Client disconnected');
      });
    });

    server.on('upgrade', (request, socket, head) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });
  }

  startGenerating(interval = 2000) {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    this.generationInterval = setInterval(() => {
      const newEntity = generateFakeDataStructures(1)[0];
      this.broadcast({
        type: 'NEW_ENTITY',
        data: newEntity
      });
    }, interval);
  }

  stopGenerating() {
    if (!this.isGenerating) return;
    
    clearInterval(this.generationInterval);
    this.isGenerating = false;
  }

  broadcast(message) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export function getWebSocketManager() {
  return wsManagerInstance;
}

export function setupWebSocket(server) {
  if (!wsManagerInstance) {
    wsManagerInstance = new WebSocketManager(server);
  }
  return wsManagerInstance;
}