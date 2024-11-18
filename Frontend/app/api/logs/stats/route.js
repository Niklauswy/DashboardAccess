
import { getTopUsers, getRecentLogins } from '@/lib/logs';

export async function GET() {
  try {
    const [topUsers, recentLogins] = await Promise.all([
      getTopUsers(),     // Obtener el top 10 de usuarios con más logs
      getRecentLogins(), // Obtener los últimos logins
    ]);

    return new Response(JSON.stringify({ topUsers, recentLogins }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    return new Response(JSON.stringify({ error: 'Unable to fetch log stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}