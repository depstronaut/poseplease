import * as Colyseus from 'colyseus.js';

export function getServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    let url = process.env.NEXT_PUBLIC_SERVER_URL.trim().replace(/\/+$/, '');
    if (url.startsWith('http://')) {
      url = 'ws://' + url.slice(7);
    } else if (url.startsWith('https://')) {
      url = 'wss://' + url.slice(8);
    }
    return url;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:2567`;
  }
  return 'ws://localhost:2567';
}

let clientInstance: Colyseus.Client | null = null;

export function getColyseusClient(): Colyseus.Client {
  if (!clientInstance) {
    clientInstance = new Colyseus.Client(getServerUrl());
  }
  return clientInstance;
}

export function saveSessionToken(roomCode: string, token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`pose_reconnect_${roomCode}`, token);
  } catch (err) {
    console.warn('Could not save reconnect token', err);
  }
}

export function getSessionToken(roomCode: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(`pose_reconnect_${roomCode}`);
  } catch {
    return null;
  }
}

export function clearSessionToken(roomCode: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`pose_reconnect_${roomCode}`);
  } catch {}
}
