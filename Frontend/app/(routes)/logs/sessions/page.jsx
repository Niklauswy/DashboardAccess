'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SessionsPage() {
  const [sessions, setSessions] = useState({ active_sessions: [], completed_sessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to fetch sessions data
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sessions`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the fetch timestamp for calculating elapsed time later
      const fetchTime = Date.now();
      
      // Add local_start_timestamp for client-side duration calculation
      const processedData = {
        active_sessions: data.active_sessions.map(session => ({
          ...session,
          local_start_timestamp: fetchTime - (session.duration * 1000),
        })),
        completed_sessions: data.completed_sessions
      };
      
      setSessions(processedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSessions();
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/logs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Logs
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Active and Completed Sessions</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSessions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && !sessions.active_sessions.length ? (
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading session data...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Active Sessions
                  <Badge variant="default" className="ml-2 bg-green-500">
                    {sessions.active_sessions.length}
                  </Badge>
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.active_sessions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No active sessions</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.active_sessions.map((session, index) => (
                        <TableRow key={`active-${index}`} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{session.username}</TableCell>
                          <TableCell>{session.ip}</TableCell>
                          <TableCell>{new Date(session.start_time).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="text-green-600 font-mono">
                              {session.client_duration_formatted || session.duration_formatted}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Completed Sessions
                  <Badge variant="default" className="ml-2 bg-blue-500">
                    {sessions.completed_sessions.length}
                  </Badge>
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.completed_sessions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No completed sessions</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.completed_sessions.map((session, index) => (
                        <TableRow key={`completed-${index}`} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{session.username}</TableCell>
                          <TableCell>{session.ip}</TableCell>
                          <TableCell>{new Date(session.start_time).toLocaleString()}</TableCell>
                          <TableCell>{new Date(session.end_time).toLocaleString()}</TableCell>
                          <TableCell className="font-mono">{session.duration_formatted}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
