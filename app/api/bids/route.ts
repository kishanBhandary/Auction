import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { broadcastRoomUpdate } from '@/lib/auction-room';

const bidSchema = z.object({
  amount: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'TEAM_OWNER') {
      return NextResponse.json({ ok: false, message: 'Unauthorized. Team owner login required.' }, { status: 403 });
    }

    const body = await request.json();
    const payload = bidSchema.parse(body);

    const tournament = await prisma.tournament.findFirst({
      where: {
        OR: [
          { name: 'Narayana Guru Premier League' },
          { name: 'Volleyball Premier League' }
        ]
      },
      include: { players: true },
    }) ?? await prisma.tournament.findFirst({ include: { players: true } });

    if (!tournament) {
      return NextResponse.json({ ok: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const auction = await prisma.auction.findFirst({
      where: { tournamentId: tournament.id },
      include: { currentPlayer: true, highestBidTeam: true },
    });

    if (!auction || auction.status !== 'LIVE' || !auction.currentPlayerId) {
      return NextResponse.json({ ok: false, message: 'Auction is not active.' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: {
        ownerId: session.id,
        tournamentId: tournament.id,
      },
    });

    if (!team) {
      return NextResponse.json({ ok: false, message: 'Assigned team not found for this owner.' }, { status: 403 });
    }

    const purchaseCount = await prisma.purchase.count({ where: { teamId: team.id } });
    if (purchaseCount >= tournament.maxPlayersPerTeam) {
      return NextResponse.json({ ok: false, message: 'This team has already reached the squad limit.' }, { status: 400 });
    }

    if (payload.amount < auction.currentHighestBid + tournament.minimumBidIncrement) {
      return NextResponse.json({ ok: false, message: `Bid must be at least ₹${auction.currentHighestBid + tournament.minimumBidIncrement}.` }, { status: 400 });
    }

    if (payload.amount > team.remainingBudget) {
      return NextResponse.json({ ok: false, message: 'This bid exceeds the team purse.' }, { status: 400 });
    }

    const bid = await prisma.$transaction(async (tx) => {
      const activeAuction = await tx.auction.findUnique({
        where: { id: auction.id },
        include: { currentPlayer: true },
      });

      if (!activeAuction || activeAuction.status !== 'LIVE' || !activeAuction.currentPlayerId) {
        throw new Error('Auction closed before bid confirmation.');
      }

      const validBid = payload.amount >= (activeAuction.currentHighestBid ?? 0) + tournament.minimumBidIncrement;
      if (!validBid) {
        throw new Error(`Bid must be at least ₹${(activeAuction.currentHighestBid ?? 0) + tournament.minimumBidIncrement}.`);
      }

      const teamRecord = await tx.team.findUnique({ where: { id: team.id } });
      if (!teamRecord || payload.amount > teamRecord.remainingBudget) {
        throw new Error('Bid exceeds available purse.');
      }

      const createdBid = await tx.bid.create({
        data: {
          auctionId: auction.id,
          playerId: activeAuction.currentPlayerId,
          teamId: team.id,
          amount: payload.amount,
          status: 'ACTIVE',
        },
      });

      await tx.auction.update({
        where: { id: auction.id },
        data: {
          currentHighestBid: payload.amount,
          highestBidTeamId: team.id,
          endsAt: new Date(Date.now() + tournament.lateBidExtensionSeconds * 1000),
        },
      });

      await tx.auctionEvent.create({
        data: {
          auctionId: auction.id,
          type: 'BID_PLACED',
          message: `${team.name} placed a bid of ₹${payload.amount}.`,
          metadata: {
            teamId: team.id,
            amount: payload.amount,
            playerId: activeAuction.currentPlayerId,
          },
        },
      });

      return createdBid;
    });

    await broadcastRoomUpdate();

    return NextResponse.json({
      ok: true,
      bid,
      message: 'Bid accepted and broadcast to the auction room.',
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Invalid request' }, { status: 400 });
  }
}
