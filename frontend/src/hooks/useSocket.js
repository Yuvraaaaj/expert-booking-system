import { useEffect, useRef, useCallback } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';

/**
 * useSocket — connects to a socket.io room and listens to events.
 *
 * @param {string|null} room  — room name to join (e.g. expertId, bookingId)
 * @param {object} handlers  — map of { eventName: callbackFn }
 *
 * @example
 * useSocket('expert_123', {
 *   slot_booked:    (data) => console.log('Slot booked:', data),
 *   slot_cancelled: (data) => console.log('Slot cancelled:', data),
 * });
 */
const useSocket = (room, handlers = {}) => {
  const { socket, isConnected } = useSocketContext();
  const handlersRef = useRef(handlers);

  // Keep handlers ref fresh without re-running effect
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!socket || !room) return;

    // Join the room
    socket.emit('join_room', room);

    // Register all event handlers
    const registeredEvents = Object.keys(handlersRef.current);
    registeredEvents.forEach((event) => {
      socket.on(event, (...args) => handlersRef.current[event]?.(...args));
    });

    return () => {
      // Leave room and remove listeners on cleanup
      socket.emit('leave_room', room);
      registeredEvents.forEach((event) => socket.off(event));
    };
  }, [socket, room]);

  /**
   * Emit an event to the server.
   */
  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    [socket, isConnected]
  );

  return { emit, isConnected };
};

export default useSocket;
