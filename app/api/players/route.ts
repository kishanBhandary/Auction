import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { broadcastRoomUpdate } from '@/lib/auction-room';

const createPlayerSchema = z.object({
  name: z.string().min(2),
  age: z.coerce.number().int().optional().default(22),
  position: z.string().min(2),
  experience: z.coerce.number().int().min(0).default(0),
  basePrice: z.coerce.number().int().default(50),
  tournamentId: z.string().optional(),
  roomCode: z.string().optional(),
  photoUrl: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const where = tournamentId ? { tournamentId } : {};

    const players = await prisma.player.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tournament: { select: { id: true, name: true } },
        purchase: {
          include: {
            team: { select: { id: true, name: true, shortName: true } },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, players });
  } catch (error) {
    return NextResponse.json(
      { ok: false, players: [], message: error instanceof Error ? error.message : 'Database unavailable' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createPlayerSchema.parse(body);

    // If roomCode is provided, find the tournament linked to that room
    let targetTournamentId = payload.tournamentId;
    if (!targetTournamentId && payload.roomCode) {
      const room = await prisma.auctionRoom.findFirst({
        where: {
          OR: [
            { roomCode: payload.roomCode.trim().toUpperCase() },
            { id: payload.roomCode.trim() },
          ],
        },
      });
      if (room) {
        targetTournamentId = room.tournamentId;
      }
    }

    let tournament = targetTournamentId
      ? await prisma.tournament.findUnique({ where: { id: targetTournamentId } })
      : await prisma.tournament.findFirst({ orderBy: { createdAt: 'desc' } });

    if (!tournament) {
      tournament = await prisma.tournament.create({
        data: {
          name: 'Narayana Guru Premier League',
          status: 'SCHEDULED',
        },
      });
    }

    // Normalize positions: Attacker, Libero, Defence, Setter, All Rounder
    const upper = payload.position.trim().toUpperCase();
    let normalizedPosition = 'OUTSIDE_HITTER';
    if (upper === 'ATTACKER' || upper === 'OUTSIDE_HITTER') normalizedPosition = 'OUTSIDE_HITTER';
    else if (upper === 'LIBERO') normalizedPosition = 'LIBERO';
    else if (upper === 'DEFENCE' || upper === 'DEFENSIVE_SPECIALIST') normalizedPosition = 'DEFENSIVE_SPECIALIST';
    else if (upper === 'SETTER') normalizedPosition = 'SETTER';
    else if (upper === 'ALL_ROUNDER' || upper === 'ALL ROUNDER' || upper === 'MIDDLE_BLOCKER' || upper === 'OPPOSITE') normalizedPosition = 'MIDDLE_BLOCKER';

    const player = await prisma.player.create({
      data: {
        name: payload.name.trim(),
        age: payload.age ?? 22,
        position: normalizedPosition as any,
        experience: payload.experience ?? 0,
        basePrice: 50, // Constant base price 50
        photoUrl: payload.photoUrl || null,
        tournamentId: tournament.id,
        status: 'APPROVED',
      },
    });

    try {
      await broadcastRoomUpdate();
    } catch {
      // Continue if broadcast fails
    }

    return NextResponse.json({ ok: true, player }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Invalid payload' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'AUCTIONEER'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Delete all purchases and bids first to satisfy foreign key constraints if any
      await prisma.purchase.deleteMany();
      await prisma.bid.deleteMany();
      const result = await prisma.player.deleteMany();
      return NextResponse.json({ ok: true, deletedCount: result.count, message: 'All players cleared successfully.' });
    }

    if (!id) {
      return NextResponse.json({ ok: false, message: 'Player ID required' }, { status: 400 });
    }

    await prisma.purchase.deleteMany({ where: { playerId: id } });
    await prisma.bid.deleteMany({ where: { playerId: id } });
    const deleted = await prisma.player.delete({ where: { id } });

    return NextResponse.json({ ok: true, player: deleted, message: 'Player deleted successfully.' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to delete player.' },
      { status: 500 }
    );
  }
}
