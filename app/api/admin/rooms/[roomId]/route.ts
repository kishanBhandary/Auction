import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'AUCTIONEER'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: 'Access denied.' }, { status: 403 });
    }

    const { roomId } = await params;
    let room = await prisma.auctionRoom.findFirst({
      where: {
        OR: [{ id: roomId }, { roomCode: roomId }],
      },
      include: {
        tournament: {
          include: {
            teams: {
              include: {
                owner: true,
                purchases: {
                  include: { player: true },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
            players: {
              orderBy: { name: 'asc' },
              include: {
                purchase: {
                  include: { team: true },
                },
              },
            },
            auction: {
              include: {
                currentPlayer: true,
                highestBidTeam: true,
                bids: {
                  orderBy: { createdAt: 'desc' },
                  take: 20,
                  include: { team: true },
                },
              },
            },
          },
        },
        memberships: {
          include: {
            team: true,
            user: true,
          },
        },
      },
    });

    if (!room) {
      room = await prisma.auctionRoom.findFirst({
        include: {
          tournament: {
            include: {
              teams: {
                include: {
                  owner: true,
                  purchases: {
                    include: { player: true },
                    orderBy: { createdAt: 'desc' },
                  },
                },
              },
              players: {
                orderBy: { name: 'asc' },
                include: {
                  purchase: {
                    include: { team: true },
                  },
                },
              },
              auction: {
                include: {
                  currentPlayer: true,
                  highestBidTeam: true,
                  bids: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: { team: true },
                  },
                },
              },
            },
          },
          memberships: {
            include: {
              team: true,
              user: true,
            },
          },
        },
      });
    }

    if (!room) {
      return NextResponse.json({ ok: false, message: 'Room not found.' }, { status: 404 });
    }

    const tournament = room.tournament;
    let auction = tournament.auction;
    if (!auction) {
      auction = await prisma.auction.create({
        data: {
          tournamentId: tournament.id,
          status: 'SCHEDULED',
          currentHighestBid: 0,
        },
        include: {
          currentPlayer: true,
          highestBidTeam: true,
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { team: true },
          },
        },
      });
    }

    const allPlayers = tournament.players || [];
    const soldCount = allPlayers.filter((p) => p.status === 'SOLD').length;
    const unsoldCount = allPlayers.filter((p) => p.status === 'UNSOLD').length;
    const remainingCount = allPlayers.filter((p) => ['REGISTERED', 'APPROVED', 'ACTIVE'].includes(p.status)).length;

    const currentPlayer = auction.currentPlayer || allPlayers.find((p) => ['REGISTERED', 'APPROVED', 'ACTIVE'].includes(p.status)) || null;

    const nextValidBid = auction.currentHighestBid > 0
      ? auction.currentHighestBid + tournament.minimumBidIncrement
      : (currentPlayer?.basePrice || tournament.basePlayerPrice || 1000);

    const countdownSeconds = auction.status === 'LIVE' && auction.endsAt
      ? Math.max(0, Math.ceil((new Date(auction.endsAt).getTime() - Date.now()) / 1000))
      : (room.countdownSeconds || 20);

    const teams = (tournament.teams || []).map((team) => {
      const purchases = team.purchases || [];
      return {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        ownerName: team.owner?.name || (team.name === 'Team Alpha' ? 'Rahul Verma' : team.name === 'Team Bravo' ? 'Karan Mehta' : team.name === 'Team Charlie' ? 'Aditya Sen' : 'Vivek Nair'),
        budget: team.budget,
        remainingBudget: team.remainingBudget,
        purchasedCount: purchases.length,
        squadCapacity: room.squadSize || 7,
        purchases: purchases.map((pur) => ({
          id: pur.id,
          playerId: pur.playerId,
          playerName: pur.player.name,
          playerPhoto: pur.player.photoUrl,
          price: pur.price,
        })),
      };
    });

    return NextResponse.json({
      ok: true,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        status: room.status,
        maximumTeams: room.maximumTeams,
        squadSize: room.squadSize,
        teamBudget: room.teamBudget,
        bidIncrement: room.bidIncrement,
        countdownSeconds: room.countdownSeconds,
        tournamentName: tournament.name,
        memberships: room.memberships,
      },
      auction: {
        id: auction.id,
        status: auction.status,
        currentHighestBid: auction.currentHighestBid,
        highestBidTeam: auction.highestBidTeam ? {
          id: auction.highestBidTeam.id,
          name: auction.highestBidTeam.name,
          shortName: auction.highestBidTeam.shortName,
        } : null,
        nextValidBid,
        countdownSeconds,
        currentPlayer: currentPlayer ? {
          id: currentPlayer.id,
          name: currentPlayer.name,
          position: currentPlayer.position,
          age: currentPlayer.age,
          experience: currentPlayer.experience,
          basePrice: currentPlayer.basePrice,
          photoUrl: currentPlayer.photoUrl,
          status: currentPlayer.status,
        } : null,
      },
      stats: {
        totalPlayers: allPlayers.length,
        sold: soldCount,
        unsold: unsoldCount,
        remaining: remainingCount,
      },
      teams,
      players: allPlayers,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to load room.' },
      { status: 500 }
    );
  }
}
