import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createPlayerSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(16).max(45),
  position: z.string().min(2),
  experience: z.number().int().min(0),
  basePrice: z.number().int().min(100),
  tournamentId: z.string().optional(),
});

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ ok: true, players: players.length ? players : demoPlayers });
  } catch (error) {
    return NextResponse.json({ ok: true, players: demoPlayers, message: error instanceof Error ? error.message : 'Database unavailable' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createPlayerSchema.parse(body);

    const tournament = await prisma.tournament.findFirst();
    const player = await prisma.player.create({
      data: {
        name: payload.name,
        age: payload.age,
        position: payload.position as never,
        experience: payload.experience,
        basePrice: payload.basePrice,
        tournamentId: payload.tournamentId ?? tournament?.id ?? 'demo-tournament',
        status: 'APPROVED',
      },
    });

    return NextResponse.json({ ok: true, player }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Invalid payload' }, { status: 400 });
  }
}

const demoPlayers = [
  { id: 'p1', name: 'Ravi Sharma', age: 24, position: 'OUTSIDE_HITTER', experience: 7, basePrice: 500, status: 'APPROVED' },
  { id: 'p2', name: 'Nikhil Rao', age: 27, position: 'SETTER', experience: 9, basePrice: 450, status: 'APPROVED' },
];
