import http from 'http';
import express from 'express';
import cors from 'cors';
import colyseus from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { PoseRoom } from './rooms/PoseRoom.ts';

const { Server } = colyseus;

const app = express();
const port = Number(process.env.PORT || 2567);

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
    pingInterval: 5000,
    pingMaxRetries: 3,
  }),
});

// Register the authoritative multiplayer pose room with roomCode filter
gameServer.define('pose_room', PoseRoom).filterBy(['roomCode']).enableRealtimeListing();

await gameServer.listen(port);
console.log(`🎮 [PosePlease Server] Colyseus running on http://localhost:${port} (ws://localhost:${port})`);
