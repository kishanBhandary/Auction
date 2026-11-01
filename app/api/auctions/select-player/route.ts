import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { broadcastRoomUpdate } from '@/lib/auction-room';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'AUCTIONEER') {
      return NextResponse.json({ ok: false, message: 'Auctioneer access required.' }, { status: 403 });
    }

    const payload = await request.json().catch(() => ({}));
    const tournament = await prisma.tournament.findFirst({ where: { name: 'Volleyball Premier League' } });
    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const auction = await prisma.auction.findFirst({ where: { tournamentId: tournament.id } });
    if (!auction) {
      return NextResponse.json({ ok: false, message: 'Auction room not found.' }, { status: 404 });
    }

    const player = payload.playerId
      ? await prisma.player.findFirst({ where: { id: payload.playerId, tournamentId: tournament.id } })
      : await prisma.player.findFirst({
          where: { tournamentId: tournament.id, status: { in: ['REGISTERED', 'APPROVED', 'ACTIVE'] } },
          orderBy: { name: 'asc' },
        });

    if (!player) {
      return NextResponse.json({ ok: false, message: 'No available player found.' }, { status: 400 });
    }

    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        currentPlayerId: player.id,
        currentHighestBid: 0,
        highestBidTeamId: null,
        status: 'LIVE',
        endsAt: new Date(Date.now() + tournament.initialAuctionCountdownSeconds * 1000),
      },
    });

    await prisma.auctionEvent.create({
      data: {
        auctionId: auction.id,
        type: 'PLAYER_SELECTED',
        message: `${player.name} selected for the next auction block.`,
        metadata: { playerId: player.id },
      },
    });

    await broadcastRoomUpdate();
    return NextResponse.json({ ok: true, message: 'Player selected for auction.', currentPlayer: player.name });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Failed to select player' }, { status: 500 });
  }
}
