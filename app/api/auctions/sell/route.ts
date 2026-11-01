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
      },
      include: { teams: true },
    }) ?? await prisma.tournament.findFirst({ include: { teams: true } });

    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const auction = await prisma.auction.findFirst({
      where: { tournamentId: tournament.id },
      include: { currentPlayer: true, highestBidTeam: true },
    });

    if (!auction || !auction.currentPlayerId || !auction.highestBidTeamId || auction.currentHighestBid <= 0) {
      return NextResponse.json({ ok: false, message: 'No valid winning bid was found.' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({ where: { id: auction.highestBidTeamId } });
    if (!team) {
      return NextResponse.json({ ok: false, message: 'Winning team not found.' }, { status: 404 });
    }

    const purchaseCount = await prisma.purchase.count({ where: { teamId: team.id } });
    if (purchaseCount >= tournament.maxPlayersPerTeam) {
      return NextResponse.json({ ok: false, message: 'Winning team has reached maximum squad size.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const teamRecord = await tx.team.findUnique({ where: { id: team.id } });
      if (!teamRecord) {
        throw new Error('Winning team record missing.');
      }

      await tx.team.update({
        where: { id: team.id },
        data: {
          remainingBudget: Math.max(0, teamRecord.remainingBudget - auction.currentHighestBid),
        },
      });

      await tx.player.update({
        where: { id: auction.currentPlayerId! },
        data: { status: 'SOLD' },
      });

      await tx.purchase.upsert({
        where: { playerId: auction.currentPlayerId! },
        update: {
          teamId: team.id,
          price: auction.currentHighestBid,
          status: 'CONFIRMED',
        },
        create: {
          auctionId: auction.id,
          playerId: auction.currentPlayerId!,
          teamId: team.id,
          price: auction.currentHighestBid,
          status: 'CONFIRMED',
        },
      });

      await tx.auction.update({
        where: { id: auction.id },
        data: {
          status: 'SCHEDULED',
          currentHighestBid: 0,
          highestBidTeamId: null,
          currentPlayerId: null,
          endsAt: null,
        },
      });

      await tx.auctionEvent.create({
        data: {
          auctionId: auction.id,
          type: 'PLAYER_SOLD',
          message: `${auction.currentPlayer?.name ?? 'Player'} sold to ${team.name} for ₹${auction.currentHighestBid}.`,
          metadata: {
            playerId: auction.currentPlayerId,
            teamId: team.id,
            amount: auction.currentHighestBid,
          },
        },
      });
    });

    await broadcastRoomUpdate();
    return NextResponse.json({ ok: true, message: 'Player sold to the winning team.', winner: team.name, amount: auction.currentHighestBid });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Sale failed' }, { status: 500 });
  }
}
