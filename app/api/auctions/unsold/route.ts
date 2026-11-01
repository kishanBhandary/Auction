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

    const tournament = await prisma.tournament.findFirst({ where: { name: 'Volleyball Premier League' } });
    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const auction = await prisma.auction.findFirst({
      where: { tournamentId: tournament.id },
      include: { currentPlayer: true },
    });

    if (!auction || !auction.currentPlayerId) {
      return NextResponse.json({ ok: false, message: 'No active player to mark unsold.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: auction.currentPlayerId! },
        data: { status: 'UNSOLD' },
      });

      await tx.auction.update({
        where: { id: auction.id },
        data: {
          status: 'SCHEDULED',
          currentPlayerId: null,
          currentHighestBid: 0,
          highestBidTeamId: null,
          endsAt: null,
        },
      });

      await tx.auctionEvent.create({
        data: {
          auctionId: auction.id,
          type: 'PLAYER_UNSOLD',
          message: `${auction.currentPlayer?.name ?? 'Player'} remained unsold.`,
          metadata: { playerId: auction.currentPlayerId },
        },
      });
    });

    await broadcastRoomUpdate();
    return NextResponse.json({ ok: true, message: 'Player marked unsold.', status: 'UNSOLD' });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Unsold failed' }, { status: 500 });
  }
}
