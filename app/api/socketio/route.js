import { NextResponse } from 'next/server';
import { getWebSocketManager } from '../../../lib/websocket';

export async function GET(req) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new NextResponse('Expected Upgrade: websocket', { status: 426 });
  }

  try {
    const wsManager = getWebSocketManager();
    const io = wsManager.initialize(req.socket.server);
    
    return new NextResponse('Websocket connection established', { status: 101 });
  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new NextResponse('Failed to setup WebSocket', { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 