import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true, players: true, auction: true },
    });

    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, tournament });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
