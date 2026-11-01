export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Narayana Guru Premier League',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  tournamentName: 'Narayana Guru Premier League',
  teams: [
    { name: 'Team Alpha', shortName: 'ALP', logo: '/team-alpha.png' },
    { name: 'Team Bravo', shortName: 'BRV', logo: '/team-bravo.png' },
    { name: 'Team Charlie', shortName: 'CHA', logo: '/team-charlie.png' },
    { name: 'Team Delta', shortName: 'DEL', logo: '/team-delta.png' },
  ],
  settings: {
    totalTeams: 4,
    maxPlayersPerTeam: 7,
    playingPlayers: 6,
    substitutePlayers: 1,
    teamBudget: 5000,
    totalBudget: 20000,
    basePlayerPrice: 100,
    minimumBidIncrement: 100,
    initialAuctionCountdown: 20,
    lateBidExtension: 10,
    auctionType: 'Live auction',
  },
};
