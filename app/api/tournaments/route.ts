import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { teams: true, players: true },
    });

    return NextResponse.json({
      ok: true,
      tournament: tournament ?? {
        id: 'demo-tournament',
        name: 'Narayana Guru Premier League',
        status: 'SCHEDULED',
        totalTeams: 4,
      },
    });
  } catch (error) {
    return NextResponse.json({
      ok: true,
      tournament: {
        id: 'demo-tournament',
        name: 'Narayana Guru Premier League',
        status: 'SCHEDULED',
        totalTeams: 4,
      },
      message: error instanceof Error ? error.message : 'Database unavailable',
    });
  }
}
