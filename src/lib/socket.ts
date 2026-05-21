import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  const token = localStorage.getItem("postgramToken");
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  if (!token) return null;

  if (!socket) {
    socket = io(baseURL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
