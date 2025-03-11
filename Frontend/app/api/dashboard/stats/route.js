import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Changed endpoint to match the backend's new endpoint
        const res = await fetch('http://localhost:5000/api/stats', {
            cache: 'no-store',
        });
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        
        // Return mock data on error
        const mockData = {
            activeSessions: 7,
            activeUsers: 5,
            activeComputers: 12,
            averageSessionTime: "1h 30m",
            hourlyActivity: Array.from({length: 24}, (_, i) => ({
                hour: `${String(i).padStart(2, '0')}:00`,
                count: Math.floor(Math.random() * 10)
            })),
            osDistribution: [
                {name: "Windows 10", value: 15},
                {name: "Windows 11", value: 8},
                {name: "Linux", value: 5}
            ],
            topUsers: [
                {name: "usuario1", value: 42},
                {name: "usuario2", value: 37},
                {name: "usuario3", value: 25}
            ],
            unusualIPs: [
                {ip: "192.168.1.45", count: 1},
                {ip: "192.168.1.72", count: 2}
            ],
            recentActivity: [
                {date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(), user: "usuario1", event: "connect", ip: "192.168.1.10"}
            ],
            sessionList: [
                {user: "usuario1", ip: "192.168.1.10", start_time: new Date().toISOString(), event: "connect"}
            ]
        };
        
        return NextResponse.json(mockData);
    }
}
