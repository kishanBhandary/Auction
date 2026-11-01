import { prisma } from '@/lib/db';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function getAuctionRoomSnapshot() {
  const tournament = await prisma.tournament.findFirst({
    where: {
      OR: [
        { name: 'Narayana Guru Premier League' },
        { name: 'Volleyball Premier League' }
      ]
    },
    include: {
      teams: {
        include: {
          owner: true,
          purchases: {
            include: { player: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      players: {
        orderBy: { name: 'asc' },
      },
      auction: {
        include: {
          currentPlayer: true,
          highestBidTeam: true,
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { team: true },
          },
        },
      },
    },
  });

  if (!tournament) {
    throw new Error('Narayana Guru Premier League tournament not found');
  }

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
          take: 10,
          include: { team: true },
        },
      },
    });
  }

  const teams = tournament.teams.map((team) => {
    const purchases = team.purchases ?? [];
    const latestPurchase = purchases.at(-1)?.player ?? null;

    return {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      ownerName: team.owner?.name ?? 'Unassigned',
      budget: team.budget,
      remainingBudget: team.remainingBudget,
      purchasedCount: purchases.length,
      availableSlots: Math.max(0, tournament.maxPlayersPerTeam - purchases.length),
      latestPurchasedPlayer: latestPurchase?.name ?? 'No purchase yet',
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        playerName: purchase.player.name,
        price: purchase.price,
      })),
    };
  });

  const liveCurrentPlayer = auction.currentPlayer ?? tournament.players[0] ?? null;
  const nextValidBid = auction.currentHighestBid > 0
    ? auction.currentHighestBid + tournament.minimumBidIncrement
    : tournament.basePlayerPrice;

  const countdownSeconds = auction.status === 'LIVE' && auction.endsAt
    ? Math.max(0, Math.ceil((auction.endsAt.getTime() - Date.now()) / 1000))
    : 0;

  return {
    roomName: 'Narayana Guru Premier League Auction Room',
    tournamentName: tournament.name,
    auctionStatus: auction.status,
    currentPlayer: liveCurrentPlayer
      ? {
          id: liveCurrentPlayer.id,
          name: liveCurrentPlayer.name,
          position: liveCurrentPlayer.position,
          age: liveCurrentPlayer.age,
          experience: liveCurrentPlayer.experience,
          basePrice: liveCurrentPlayer.basePrice,
          photoUrl: liveCurrentPlayer.photoUrl ?? null,
          status: liveCurrentPlayer.status,
        }
      : null,
    currentHighestBid: auction.currentHighestBid,
    highestBidTeam: auction.highestBidTeam
      ? {
          id: auction.highestBidTeam.id,
          name: auction.highestBidTeam.name,
          shortName: auction.highestBidTeam.shortName,
        }
      : null,
    countdownSeconds,
    nextValidBid,
    updatedAt: new Date().toISOString(),
    teams,
    history: auction.bids.map((bid) => ({
      id: bid.id,
      teamName: bid.team.name,
      amount: bid.amount,
      createdAt: bid.createdAt.toISOString(),
    })),
    tournamentConfig: {
      numberOfTeams: tournament.numberOfTeams,
      maxPlayersPerTeam: tournament.maxPlayersPerTeam,
      playingPlayers: tournament.playingPlayers,
      substitutePlayers: tournament.substitutePlayers,
      teamAuctionBudget: tournament.teamAuctionBudget,
      minimumBidIncrement: tournament.minimumBidIncrement,
      initialAuctionCountdownSeconds: tournament.initialAuctionCountdownSeconds,
      lateBidExtensionSeconds: tournament.lateBidExtensionSeconds,
    },
  };
}

export async function broadcastRoomUpdate() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes('placeholder')) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const room = await getAuctionRoomSnapshot();
  const channel = supabase.channel('vpl-auction-room');

  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'room:update',
    payload: { room },
  });
}
