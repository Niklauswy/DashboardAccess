'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, RefreshCw, ArrowLeft, Search, Clock, UserCheck, 
  Calendar, MonitorSmartphone, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function SessionsPage() {
  // States for data, UI
  const [sessions, setSessions] = useState({ active_sessions: [], completed_sessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start_timestamp', direction: 'desc' });
  const [activeTab, setActiveTab] = useState('all');

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
      setError(null); // Clear previous errors
      
      // Define API URL with fallback
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sessions`;
      console.log(`Fetching sessions from: ${apiUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' } 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the fetch timestamp for calculating elapsed time later
      const fetchTime = Date.now();
      
      // Add local_start_timestamp for client-side duration calculation
      const processedData = {
        active_sessions: (data.active_sessions || []).map(session => ({
          ...session,
          local_start_timestamp: fetchTime - (session.duration * 1000),
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
      if (err.name === 'AbortError') {
        setError('Connection timeout. The server is not responding.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to the server. Please check if the backend service is running.');
      } else {
        setError(`Failed to load sessions data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSessions();
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(fetchSessions, 60000);
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

  // Combine and filter sessions based on search and active tab
  const filteredSessions = useMemo(() => {
    // Combine both session types if showing 'all'
    let combinedSessions = [];
    
    if (activeTab === 'all' || activeTab === 'active') {
      combinedSessions = [...combinedSessions, ...sessions.active_sessions];
    }
    
    if (activeTab === 'all' || activeTab === 'completed') {
      combinedSessions = [...combinedSessions, ...sessions.completed_sessions];
    }
    
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      combinedSessions = combinedSessions.filter(session => 
        session.username?.toLowerCase().includes(searchLower) ||
        session.ip?.toLowerCase().includes(searchLower)
      );
    }

    // Sort the sessions
    const sortedSessions = [...combinedSessions].sort((a, b) => {
      // Handle duration special case
      if (sortConfig.key.includes('duration')) {
        // For active sessions, use client_duration if available
        const aValue = a.status === 'active' ? (a.client_duration || a.duration) : a.duration;
        const bValue = b.status === 'active' ? (b.client_duration || b.duration) : b.duration;
        
        if (sortConfig.direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
      
      // For other fields
      if (sortConfig.key === 'start_timestamp' || sortConfig.key === 'end_timestamp') {
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      }

      // Text-based sorting for other fields
      const aValue = String(a[sortConfig.key] || '').toLowerCase();
      const bValue = String(b[sortConfig.key] || '').toLowerCase();

      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return sortedSessions;
  }, [sessions, searchTerm, sortConfig, activeTab]);

  // Handle sorting
  const requestSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Get sort direction for a column
  const getSortDirection = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header with navigation and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href="/logs">
            <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">User Sessions</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
          {lastUpdated && (
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-300 hover:bg-gray-100"
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

      {/* Error display */}
      {error && (
        <Card className="bg-red-50 border-red-200 mb-4">
          <CardContent className="p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && !filteredSessions.length ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <span className="text-gray-600">Loading session data...</span>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border border-gray-200">
          <CardContent className="p-0">
            {/* Search and filter controls */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search username, IP..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Tabs 
                  defaultValue="all" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full md:w-auto"
                >
                  <TabsList className="bg-gray-100 w-full">
                    <TabsTrigger value="all" className="flex-1 md:flex-initial">
                      All Sessions
                      <Badge className="ml-2 bg-gray-200 text-gray-700">
                        {sessions.active_sessions.length + sessions.completed_sessions.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex-1 md:flex-initial">
                      Active Only
                      <Badge className="ml-2 bg-green-100 text-green-700">
                        {sessions.active_sessions.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 md:flex-initial">
                      Completed
                      <Badge className="ml-2 bg-blue-100 text-blue-700">
                        {sessions.completed_sessions.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={sortConfig.key} onValueChange={(value) => requestSort(value)}>
                      <DropdownMenuRadioItem value="username">Username</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="ip">IP Address</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="start_timestamp">Start Time</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="duration">Duration</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Sessions table */}
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead onClick={() => requestSort('status')} className="cursor-pointer w-24">
                      Status {getSortDirection('status')}
                    </TableHead>
                    <TableHead onClick={() => requestSort('username')} className="cursor-pointer">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-2" /> 
                        Username {getSortDirection('username')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('ip')} className="cursor-pointer">
                      <div className="flex items-center">
                        <MonitorSmartphone className="h-4 w-4 mr-2" /> 
                        IP Address {getSortDirection('ip')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('start_timestamp')} className="cursor-pointer">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> 
                        Start Time {getSortDirection('start_timestamp')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('end_timestamp')} className="cursor-pointer">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> 
                        End Time {getSortDirection('end_timestamp')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('duration')} className="cursor-pointer">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" /> 
                        Duration {getSortDirection('duration')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No sessions found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session, index) => (
                      <TableRow 
                        key={`session-${index}`} 
                        className={
                          session.status === 'active' 
                            ? 'hover:bg-green-50 bg-green-50/30' 
                            : 'hover:bg-blue-50 bg-white'
                        }
                      >
                        <TableCell>
                          {session.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              <CheckCircle className="h-3 w-3 mr-1" /> 
                              Completed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {session.username}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-gray-600 text-sm">{session.ip}</span>
                        </TableCell>
                        <TableCell>
                          {formatDate(session.start_time)}
                        </TableCell>
                        <TableCell>
                          {session.status === 'active' ? (
                            <span className="text-gray-400 italic">Active</span>
                          ) : (
                            formatDate(session.end_time)
                          )}
                        </TableCell>
                        <TableCell>
                          {session.status === 'active' ? (
                            <span className="text-green-600 font-mono font-medium animate-pulse">
                              {session.client_duration_formatted || session.duration_formatted}
                            </span>
                          ) : (
                            <span className="font-mono font-medium">{session.duration_formatted}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Stats footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between items-center text-sm text-gray-600">
              <div>
                Showing <span className="font-semibold">{filteredSessions.length}</span> of{' '}
                <span className="font-semibold">{sessions.active_sessions.length + sessions.completed_sessions.length}</span> sessions
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Active: <span className="font-semibold ml-1">{sessions.active_sessions.length}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                  Completed: <span className="font-semibold ml-1">{sessions.completed_sessions.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
