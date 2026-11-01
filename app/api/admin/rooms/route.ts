import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { hashPasscode, generatePasscode, generateRoomCode } from '@/lib/room';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'AUCTIONEER'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: 'Admin access required.' }, { status: 403 });
    }

    const rooms = await prisma.auctionRoom.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tournament: true },
    });

    return NextResponse.json({ ok: true, rooms });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load rooms.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'AUCTIONEER'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: 'Admin or Auctioneer access required.' }, { status: 403 });
    }

    const body = await request.json();
    const roomName = String(body.roomName || body.name || 'NGPL SEASON 1 AUCTION').trim();
    const description = String(body.description || 'Official auction room for the Narayana Guru Premier League').trim();
    const tournamentName = String(body.tournamentName || 'Narayana Guru Premier League').trim();
    const auctioneerEmail = String(body.auctioneerEmail || 'auctioneer@vpl.local').trim();
    const maximumTeams = Number(body.maximumTeams || 4);

    let tournament = await prisma.tournament.findFirst({
      where: {
        OR: [
          { name: tournamentName },
          { name: 'Narayana Guru Premier League' },
          { name: 'Volleyball Premier League' }
        ]
      },
      include: { players: true }
    });

    if (!tournament) {
      tournament = await prisma.tournament.create({
        data: {
          name: tournamentName || 'Narayana Guru Premier League',
          status: 'SCHEDULED',
          numberOfTeams: maximumTeams,
          maxPlayersPerTeam: Number(body.squadSize || 7),
          playingPlayers: 6,
          substitutePlayers: 1,
          teamAuctionBudget: Number(body.teamBudget || 5000),
          totalAuctionBudget: Number(body.teamBudget || 5000) * maximumTeams,
          basePlayerPrice: Number(body.startingPrice || 1000),
          minimumBidIncrement: Number(body.bidIncrement || 100),
          initialAuctionCountdownSeconds: Number(body.countdownSeconds || 20),
          lateBidExtensionSeconds: Number(body.lateBidExtensionSeconds || 10),
        },
        include: { players: true }
      });
    }

    const auctioneer = await prisma.user.findUnique({ where: { email: auctioneerEmail.toLowerCase() } });

    let roomCode = generateRoomCode();
    let roomExists = await prisma.auctionRoom.findUnique({ where: { roomCode } });
    while (roomExists) {
      roomCode = generateRoomCode();
      roomExists = await prisma.auctionRoom.findUnique({ where: { roomCode } });
    }

    const passcode = generatePasscode();
    const room = await prisma.auctionRoom.create({
      data: {
        tournamentId: tournament.id,
        roomName,
        description,
        roomCode,
        passcodeHash: hashPasscode(passcode),
        status: 'WAITING',
        createdBy: session.id,
        auctioneerId: auctioneer?.id ?? null,
        maximumTeams,
        teamBudget: Number(body.teamBudget || 5000),
        squadSize: Number(body.squadSize || 7),
        startingPrice: Number(body.startingPrice || 1000),
        bidIncrement: Number(body.bidIncrement || 100),
        countdownSeconds: Number(body.countdownSeconds || 20),
        lateBidExtensionSeconds: Number(body.lateBidExtensionSeconds || 10),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({
      ok: true,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        passcode,
        invitation: `${appUrl}/team/join?roomCode=${room.roomCode}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Failed to create room.' }, { status: 500 });
  }
}
