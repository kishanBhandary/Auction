-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AUCTIONEER', 'TEAM_OWNER', 'PLAYER', 'VIEWER');
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PlayerPosition" AS ENUM ('OUTSIDE_HITTER', 'OPPOSITE', 'SETTER', 'MIDDLE_BLOCKER', 'LIBERO', 'DEFENSIVE_SPECIALIST');
CREATE TYPE "PlayerStatus" AS ENUM ('REGISTERED', 'APPROVED', 'ACTIVE', 'SOLD', 'UNSOLD', 'HOLD');
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WINNING', 'INVALID');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "SquadDesignation" AS ENUM ('STARTER', 'SUBSTITUTE');
CREATE TYPE "AuctionEventType" AS ENUM ('AUCTION_STARTED', 'PLAYER_SELECTED', 'BID_PLACED', 'TIMER_UPDATED', 'PLAYER_SOLD', 'PLAYER_UNSOLD', 'AUCTION_PAUSED', 'AUCTION_RESUMED', 'BUDGET_UPDATED', 'AUCTION_COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "numberOfTeams" INTEGER NOT NULL DEFAULT 4,
    "maxPlayersPerTeam" INTEGER NOT NULL DEFAULT 7,
    "playingPlayers" INTEGER NOT NULL DEFAULT 6,
    "substitutePlayers" INTEGER NOT NULL DEFAULT 1,
    "teamAuctionBudget" INTEGER NOT NULL DEFAULT 5000,
    "totalAuctionBudget" INTEGER NOT NULL DEFAULT 20000,
    "basePlayerPrice" INTEGER NOT NULL DEFAULT 100,
    "minimumBidIncrement" INTEGER NOT NULL DEFAULT 100,
    "initialAuctionCountdownSeconds" INTEGER NOT NULL DEFAULT 20,
    "lateBidExtensionSeconds" INTEGER NOT NULL DEFAULT 10,
    "auctionType" TEXT NOT NULL DEFAULT 'LIVE',
    "bannerUrl" TEXT,
    "bannerPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "ownerId" TEXT,
    "budget" INTEGER NOT NULL DEFAULT 5000,
    "remainingBudget" INTEGER NOT NULL DEFAULT 5000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "experience" INTEGER NOT NULL,
    "basePrice" INTEGER NOT NULL DEFAULT 100,
    "status" "PlayerStatus" NOT NULL DEFAULT 'REGISTERED',
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "currentPlayerId" TEXT,
    "currentHighestBid" INTEGER NOT NULL DEFAULT 0,
    "highestBidTeamId" TEXT,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuctionEvent" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "type" "AuctionEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Tournament_name_key" ON "Tournament"("name");
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "Team_shortName_key" ON "Team"("shortName");
CREATE UNIQUE INDEX "Team_ownerId_key" ON "Team"("ownerId");
CREATE UNIQUE INDEX "Auction_tournamentId_key" ON "Auction"("tournamentId");
CREATE UNIQUE INDEX "Auction_currentPlayerId_key" ON "Auction"("currentPlayerId");
CREATE UNIQUE INDEX "Purchase_playerId_key" ON "Purchase"("playerId");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");
CREATE INDEX "Player_tournamentId_status_idx" ON "Player"("tournamentId", "status");
CREATE INDEX "Player_name_idx" ON "Player"("name");
CREATE INDEX "Auction_status_idx" ON "Auction"("status");
CREATE INDEX "Bid_auctionId_playerId_idx" ON "Bid"("auctionId", "playerId");
CREATE INDEX "Bid_teamId_idx" ON "Bid"("teamId");
CREATE INDEX "Purchase_auctionId_idx" ON "Purchase"("auctionId");
CREATE INDEX "Purchase_teamId_idx" ON "Purchase"("teamId");
CREATE INDEX "AuctionEvent_auctionId_createdAt_idx" ON "AuctionEvent"("auctionId", "createdAt");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Player" ADD CONSTRAINT "Player_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_currentPlayerId_fkey" FOREIGN KEY ("currentPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_highestBidTeamId_fkey" FOREIGN KEY ("highestBidTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuctionEvent" ADD CONSTRAINT "AuctionEvent_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
