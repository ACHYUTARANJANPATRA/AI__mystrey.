import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useCaseStore } from '../store/useCaseStore';

export function useInterrogationSocket(caseId, sessionId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stressLevels, setStressLevels] = useState({});

  const { activeCase, selectedSuspectId } = useCaseStore();

  // Load existing history when suspect changes or case loads
  useEffect(() => {
    if (activeCase?.session?.interrogationHistory && selectedSuspectId) {
      const history = activeCase.session.interrogationHistory.find(
        h => String(h.suspectId) === String(selectedSuspectId)
      );
      if (history && history.messages) {
        setMessages(history.messages);
      } else {
        setMessages([]);
      }
    }
  }, [selectedSuspectId, activeCase]);

  useEffect(() => {
    if (!caseId) return;

    const socket = io('/', {
      query: { caseId, sessionId: sessionId || 'default-session' },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected to interrogation channel');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('suspect_typing', (data) => {
      if (String(data.suspectId) === String(selectedSuspectId)) {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('suspect_message', (data) => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'suspect',
          content: data.content,
          timestamp: data.timestamp,
          cracked: data.cracked
        }
      ]);

      if (data.stressLevel !== undefined) {
        setStressLevels(prev => ({
          ...prev,
          [data.suspectId]: data.stressLevel
        }));
      }
    });

    socket.on('interrogation_error', (data) => {
      setIsTyping(false);
      console.warn('[Socket Error]', data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [caseId, sessionId, selectedSuspectId]);

  const sendMessage = useCallback((text, presentedEvidenceId = null) => {
    if (!socketRef.current || !selectedSuspectId || !text.trim()) return;

    const newMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);

    socketRef.current.emit('interrogate_suspect', {
      suspectId: selectedSuspectId,
      message: text,
      presentedEvidenceId
    });
  }, [selectedSuspectId]);

  return {
    isConnected,
    isTyping,
    messages,
    stressLevels,
    sendMessage
  };
}
