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
      where: {
        OR: [
          { name: 'Narayana Guru Premier League' },
          { name: 'Volleyball Premier League' }
        ]
      }
    }) ?? await prisma.tournament.findFirst();
    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const auction = await prisma.auction.findFirst({ where: { tournamentId: tournament.id } });
    if (!auction) {
      return NextResponse.json({ ok: false, message: 'Auction not found.' }, { status: 404 });
    }

    await prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'PAUSED' },
    });

    await prisma.auctionEvent.create({
      data: {
        auctionId: auction.id,
        type: 'AUCTION_PAUSED',
        message: 'Auction paused by auctioneer.',
        metadata: { paused: true },
      },
    });

    await broadcastRoomUpdate();
    return NextResponse.json({ ok: true, message: 'Auction paused.', status: 'PAUSED' });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Pause failed' }, { status: 500 });
  }
}
