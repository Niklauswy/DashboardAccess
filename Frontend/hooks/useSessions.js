import {useEffect, useState} from 'react';

export function useSessions() {
  const [sessions, setSessions] = useState({ active_sessions: [], completed_sessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Function to fetch sessions data
  const fetchSessions = async (showRefreshing = true) => {
    try {
      // Set appropriate loading state
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Clear previous errors
      setError(null);

      // Make API request
      const response = await fetch('/api/sessions');
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the fetch timestamp for calculating elapsed time later
      const fetchTime = Date.now();
      
      // Add local_start_timestamp for client-side duration calculation
      const processedData = {
        active_sessions: (data.active_sessions || []).map(session => ({
          ...session,
          local_start_timestamp: fetchTime - (Number(session.duration) * 1000),
          status: 'active'
        })),
        completed_sessions: (data.completed_sessions || []).map(session => ({
          ...session,
          status: 'completed'
        }))
      };
      
      setSessions(processedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(`Error al cargar datos de sesiones: ${err.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSessions(false);
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => fetchSessions(true), 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Update active session durations every second
  useEffect(() => {
    if (sessions.active_sessions.length === 0) return;
    
    const timer = setInterval(() => {
      setSessions(prev => ({
        ...prev,
        active_sessions: prev.active_sessions.map(session => {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - session.local_start_timestamp) / 1000);
          return {
            ...session,
            client_duration: elapsedSeconds,
            client_duration_formatted: formatDuration(elapsedSeconds)
          };
        })
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [sessions.active_sessions]);

  return {
    sessions,
    loading,
    error,
    isRefreshing,
    lastUpdated,
    refreshSessions: () => fetchSessions(true),
    formatDuration
  };
}
