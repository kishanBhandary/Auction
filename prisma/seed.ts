import { PrismaClient, UserRole, TournamentStatus, PlayerPosition, PlayerStatus, AuctionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.upsert({
    where: { name: 'Narayana Guru Premier League' },
    update: {
      numberOfTeams: 4,
      maxPlayersPerTeam: 7,
      teamAuctionBudget: 5000,
      basePlayerPrice: 1000,
      minimumBidIncrement: 100,
      initialAuctionCountdownSeconds: 20,
    },
    create: {
      name: 'Narayana Guru Premier League',
      status: TournamentStatus.SCHEDULED,
      numberOfTeams: 4,
      maxPlayersPerTeam: 7,
      playingPlayers: 6,
      substitutePlayers: 1,
      teamAuctionBudget: 5000,
      totalAuctionBudget: 20000,
      basePlayerPrice: 1000,
      minimumBidIncrement: 100,
      initialAuctionCountdownSeconds: 20,
      lateBidExtensionSeconds: 10,
      auctionType: 'LIVE',
    },
  });

  const teamDefinitions = [
    { name: 'Team Alpha', shortName: 'ALP', ownerEmail: 'alpha.owner@vpl.local', ownerName: 'Rahul Verma', budget: 3400 },
    { name: 'Team Bravo', shortName: 'BRV', ownerEmail: 'bravo.owner@vpl.local', ownerName: 'Karan Mehta', budget: 5000 },
    { name: 'Team Charlie', shortName: 'CHA', ownerEmail: 'charlie.owner@vpl.local', ownerName: 'Aditya Sen', budget: 4200 },
    { name: 'Team Delta', shortName: 'DEL', ownerEmail: 'delta.owner@vpl.local', ownerName: 'Vivek Nair', budget: 4800 },
  ];

  const ownerUsers = await Promise.all(
    teamDefinitions.map(({ ownerEmail, ownerName }) =>
      prisma.user.upsert({
        where: { email: ownerEmail },
        update: { name: ownerName },
        create: {
          email: ownerEmail,
          name: ownerName,
          role: UserRole.TEAM_OWNER,
        },
      })
    )
  );

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vpl.local' },
    update: { name: 'League Admin' },
    create: { email: 'admin@vpl.local', name: 'League Admin', role: UserRole.ADMIN },
  });

  const auctioneer = await prisma.user.upsert({
    where: { email: 'auctioneer@vpl.local' },
    update: { name: 'Kishan Bhandary' },
    create: { email: 'auctioneer@vpl.local', name: 'Kishan Bhandary', role: UserRole.AUCTIONEER },
  });

  const createdTeams = await Promise.all(
    teamDefinitions.map(async ({ name, shortName, budget }, index) => {
      const owner = ownerUsers[index];

      return prisma.team.upsert({
        where: { name },
        update: {
          shortName,
          remainingBudget: budget,
          budget: 5000,
          ownerId: owner.id,
        },
        create: {
          tournamentId: tournament.id,
          name,
          shortName,
          budget: 5000,
          remainingBudget: budget,
          ownerId: owner.id,
        },
      });
    })
  );

  // 24 Players matching the reference screenshot exactly
  const allPlayers = [
    { name: 'Arjun Nath', age: 22, position: PlayerPosition.OPPOSITE, experience: 3, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Rohit Das', age: 24, position: PlayerPosition.SETTER, experience: 4, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Sahil Kumar', age: 23, position: PlayerPosition.MIDDLE_BLOCKER, experience: 3, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Vikram Rao', age: 26, position: PlayerPosition.OUTSIDE_HITTER, experience: 5, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Nikhil Shetty', age: 21, position: PlayerPosition.LIBERO, experience: 2, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Sujith P.', age: 25, position: PlayerPosition.OUTSIDE_HITTER, experience: 4, basePrice: 1000, status: PlayerStatus.SOLD },
    { name: 'Karthik R.', age: 27, position: PlayerPosition.SETTER, experience: 6, basePrice: 1000, status: PlayerStatus.SOLD },
    { name: 'Manav S.', age: 23, position: PlayerPosition.LIBERO, experience: 3, basePrice: 1000, status: PlayerStatus.SOLD },
    { name: 'Ravi Sharma', age: 24, position: PlayerPosition.OUTSIDE_HITTER, experience: 7, basePrice: 1000, status: PlayerStatus.SOLD },
    { name: 'Daniel Cruz', age: 22, position: PlayerPosition.MIDDLE_BLOCKER, experience: 5, basePrice: 1000, status: PlayerStatus.SOLD },
    { name: 'Aarav Singh', age: 25, position: PlayerPosition.LIBERO, experience: 6, basePrice: 1000, status: PlayerStatus.SOLD },
    { name: 'Mason Lee', age: 28, position: PlayerPosition.OPPOSITE, experience: 10, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Priyansh Verma', age: 26, position: PlayerPosition.DEFENSIVE_SPECIALIST, experience: 8, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Dev Patel', age: 23, position: PlayerPosition.SETTER, experience: 3, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Ankit Rawat', age: 25, position: PlayerPosition.OUTSIDE_HITTER, experience: 5, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Siddharth Roy', age: 24, position: PlayerPosition.MIDDLE_BLOCKER, experience: 4, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Tushar Joshi', age: 22, position: PlayerPosition.LIBERO, experience: 2, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Prateek Mishra', age: 27, position: PlayerPosition.OPPOSITE, experience: 6, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Rohan Kapoor', age: 26, position: PlayerPosition.OUTSIDE_HITTER, experience: 5, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Sameer Khan', age: 23, position: PlayerPosition.SETTER, experience: 3, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Varun Dhawan', age: 25, position: PlayerPosition.MIDDLE_BLOCKER, experience: 4, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Lakshya Sen', age: 22, position: PlayerPosition.OUTSIDE_HITTER, experience: 3, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Chirag Shetty', age: 26, position: PlayerPosition.MIDDLE_BLOCKER, experience: 6, basePrice: 1000, status: PlayerStatus.ACTIVE },
    { name: 'Satwik Ranki', age: 24, position: PlayerPosition.OPPOSITE, experience: 5, basePrice: 1000, status: PlayerStatus.ACTIVE },
  ];

  const dbPlayers = [];
  for (const player of allPlayers) {
    const p = await prisma.player.upsert({
      where: {
        id: `${tournament.id}-${player.name}`,
      },
      update: {
        name: player.name,
        age: player.age,
        position: player.position,
        experience: player.experience,
        basePrice: player.basePrice,
        status: player.status,
      },
      create: {
        id: `${tournament.id}-${player.name}`,
        tournamentId: tournament.id,
        name: player.name,
        age: player.age,
        position: player.position,
        experience: player.experience,
        basePrice: player.basePrice,
        status: player.status,
      },
    });
    dbPlayers.push(p);
  }

  const arjunNath = dbPlayers.find((p) => p.name === 'Arjun Nath');
  const teamAlpha = createdTeams.find((t) => t.name === 'Team Alpha');

  // Set Auction
  const auction = await prisma.auction.upsert({
    where: { tournamentId: tournament.id },
    update: {
      status: AuctionStatus.LIVE,
      currentPlayerId: arjunNath?.id,
      currentHighestBid: 1600,
      highestBidTeamId: teamAlpha?.id,
      endsAt: new Date(Date.now() + 14 * 1000),
    },
    create: {
      tournamentId: tournament.id,
      status: AuctionStatus.LIVE,
      currentPlayerId: arjunNath?.id,
      currentHighestBid: 1600,
      highestBidTeamId: teamAlpha?.id,
      endsAt: new Date(Date.now() + 14 * 1000),
    },
  });

  // Create room if none
  let room = await prisma.auctionRoom.findFirst({
    where: { tournamentId: tournament.id },
  });

  if (!room) {
    room = await prisma.auctionRoom.create({
      data: {
        tournamentId: tournament.id,
        roomName: 'Narayana Guru Premier League Arena',
        roomCode: 'VPL2026',
        passcodeHash: 'VPLPASS',
        status: 'LIVE',
        maximumTeams: 4,
        squadSize: 7,
        teamBudget: 5000,
        bidIncrement: 100,
        countdownSeconds: 20,
      },
    });
  }

  // Ensure room memberships for all 4 team owners
  for (let i = 0; i < createdTeams.length; i++) {
    const team = createdTeams[i];
    const owner = ownerUsers[i];
    await prisma.roomMembership.upsert({
      where: {
        roomId_teamId: {
          roomId: room.id,
          teamId: team.id,
        },
      },
      update: {
        connectionStatus: 'ONLINE',
      },
      create: {
        roomId: room.id,
        teamId: team.id,
        userId: owner.id,
        connectionStatus: 'ONLINE',
      },
    });
  }

  console.log('Seed completed successfully for VPL!', {
    tournament: tournament.name,
    teams: createdTeams.length,
    players: dbPlayers.length,
    auction: auction.id,
    room: room.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
