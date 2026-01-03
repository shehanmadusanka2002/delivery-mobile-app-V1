// ⚠️ IMPORTANT: Change only this IP address when your computer's IP changes
const SERVER_IP = '192.168.8.101';
const SERVER_PORT = '8080';

// API Configuration - Used by all pages
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

// WebSocket Configuration - Used for real-time features
export const WS_BASE_URL = `ws://${SERVER_IP}:${SERVER_PORT}`;

// Full API URL with /api path
export const API_URL = `${API_BASE_URL}/api`;

// Full WebSocket URL with /ws path
export const WS_URL = `${WS_BASE_URL}/ws`;

// Full uploads URL for images
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;

export default {
  API_BASE_URL,
  WS_BASE_URL,
  API_URL,
  WS_URL,
  UPLOADS_URL
};
