import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { broadcastRoomUpdate } from '@/lib/auction-room';

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'AUCTIONEER') {
      return NextResponse.json({ ok: false, message: 'Auctioneer access required.' }, { status: 403 });
    }

    const tournament = await prisma.tournament.findFirst({
      where: { name: 'Volleyball Premier League' },
      include: { players: true },
    });

    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const auction = await prisma.auction.findFirst({
      where: { tournamentId: tournament.id },
      include: { currentPlayer: true },
    });

    if (!auction) {
      return NextResponse.json({ ok: false, message: 'Auction room is not initialized.' }, { status: 404 });
    }

    const player = await prisma.player.findFirst({
      where: {
        tournamentId: tournament.id,
        status: { in: ['REGISTERED', 'APPROVED', 'ACTIVE'] },
        id: { not: auction.currentPlayerId ?? '' },
      },
      orderBy: { name: 'asc' },
    }) ?? await prisma.player.findFirst({
      where: { tournamentId: tournament.id, status: { in: ['REGISTERED', 'APPROVED', 'ACTIVE'] } },
      orderBy: { name: 'asc' },
    });

    if (!player) {
      return NextResponse.json({ ok: false, message: 'No active players available.' }, { status: 400 });
    }

    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        status: 'LIVE',
        currentPlayerId: player.id,
        currentHighestBid: 0,
        highestBidTeamId: null,
        endsAt: new Date(Date.now() + tournament.initialAuctionCountdownSeconds * 1000),
      },
    });

    await prisma.auctionEvent.create({
      data: {
        auctionId: auction.id,
        type: 'AUCTION_STARTED',
        message: `${player.name} is now live for bidding.`,
        metadata: { playerId: player.id },
      },
    });

    await broadcastRoomUpdate();
    return NextResponse.json({ ok: true, message: 'Auction started', status: 'LIVE', player });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Failed to start auction' }, { status: 500 });
  }
}
