CREATE TYPE "AuctionRoomStatus" AS ENUM ('WAITING', 'LIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "RoomMembershipConnectionStatus" AS ENUM ('ONLINE', 'OFFLINE', 'DISCONNECTED');

ALTER TABLE "User"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "AuctionRoom" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "roomCode" TEXT NOT NULL,
  "passcodeHash" TEXT NOT NULL,
  "roomName" TEXT NOT NULL,
  "description" TEXT,
  "status" "AuctionRoomStatus" NOT NULL DEFAULT 'WAITING',
  "createdBy" TEXT,
  "auctioneerId" TEXT,
  "maximumTeams" INTEGER NOT NULL DEFAULT 4,
  "teamBudget" INTEGER NOT NULL DEFAULT 5000,
  "squadSize" INTEGER NOT NULL DEFAULT 7,
  "startingPrice" INTEGER NOT NULL DEFAULT 100,
  "bidIncrement" INTEGER NOT NULL DEFAULT 100,
  "countdownSeconds" INTEGER NOT NULL DEFAULT 20,
  "lateBidExtensionSeconds" INTEGER NOT NULL DEFAULT 10,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "AuctionRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoomMembership" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "connectionStatus" "RoomMembershipConnectionStatus" NOT NULL DEFAULT 'ONLINE',

  CONSTRAINT "RoomMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuctionRoom_roomCode_key" ON "AuctionRoom"("roomCode");
CREATE UNIQUE INDEX "RoomMembership_roomId_teamId_key" ON "RoomMembership"("roomId", "teamId");
CREATE UNIQUE INDEX "RoomMembership_roomId_userId_key" ON "RoomMembership"("roomId", "userId");
CREATE INDEX "AuctionRoom_tournamentId_status_idx" ON "AuctionRoom"("tournamentId", "status");
CREATE INDEX "RoomMembership_roomId_connectionStatus_idx" ON "RoomMembership"("roomId", "connectionStatus");

ALTER TABLE "AuctionRoom"
  ADD CONSTRAINT "AuctionRoom_tournamentId_fkey"
  FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE;

ALTER TABLE "AuctionRoom"
  ADD CONSTRAINT "AuctionRoom_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "AuctionRoom"
  ADD CONSTRAINT "AuctionRoom_auctioneerId_fkey"
  FOREIGN KEY ("auctioneerId") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "RoomMembership"
  ADD CONSTRAINT "RoomMembership_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "AuctionRoom"("id") ON DELETE CASCADE;

ALTER TABLE "RoomMembership"
  ADD CONSTRAINT "RoomMembership_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;

ALTER TABLE "RoomMembership"
  ADD CONSTRAINT "RoomMembership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
