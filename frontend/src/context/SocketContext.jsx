import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket]           = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const socketInstance = io(SOCKET_URL, {
      transports:       ['websocket', 'polling'],
      reconnection:     true,
      reconnectionDelay: 1500,
      reconnectionAttempts: 5,
      autoConnect:      true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Access the socket context.
 * Must be used within <SocketProvider>.
 */
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a <SocketProvider>');
  }
  return ctx;
};

export default SocketContext;
