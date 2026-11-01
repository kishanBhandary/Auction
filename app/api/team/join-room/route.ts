import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verifyPasscode } from '@/lib/room';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'TEAM_OWNER') {
      return NextResponse.json({ ok: false, message: 'Team owner access required.' }, { status: 403 });
    }

    const body = await request.json();
    const roomCode = String(body.roomCode || '').trim().toUpperCase();
    const passcode = String(body.passcode || '').trim();

    if (!roomCode || !passcode) {
      return NextResponse.json({ ok: false, message: 'Room code and passcode are required.' }, { status: 400 });
    }

    const room = await prisma.auctionRoom.findUnique({
      where: { roomCode },
      include: { tournament: true, memberships: true },
    });

    if (!room) {
      return NextResponse.json({ ok: false, message: 'Room not found.' }, { status: 404 });
    }

    if (room.status === 'COMPLETED' || room.status === 'CANCELLED') {
      return NextResponse.json({ ok: false, message: 'This room is no longer accepting entries.' }, { status: 400 });
    }

    if (!verifyPasscode(passcode, room.passcodeHash)) {
      return NextResponse.json({ ok: false, message: 'Incorrect room passcode.' }, { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: { ownerId: session.id },
      include: { tournament: true },
    });

    if (!team) {
      return NextResponse.json({ ok: false, message: 'No team is assigned to this owner account.' }, { status: 403 });
    }

    if (team.tournamentId !== room.tournamentId) {
      return NextResponse.json({ ok: false, message: 'This owner is not assigned to the selected tournament.' }, { status: 403 });
    }

    const duplicate = await prisma.roomMembership.findFirst({
      where: { roomId: room.id, userId: session.id },
    });

    if (duplicate) {
      return NextResponse.json({ ok: true, roomId: room.id, redirect: `/room/${room.id}/waiting-room`, message: 'Already joined this room.' });
    }

    const membership = await prisma.roomMembership.create({
      data: {
        roomId: room.id,
        teamId: team.id,
        userId: session.id,
        connectionStatus: 'ONLINE',
      },
    });

    return NextResponse.json({
      ok: true,
      roomId: room.id,
      teamId: team.id,
      membershipId: membership.id,
      redirect: `/room/${room.id}/waiting-room`,
      message: 'Room joined successfully.',
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Room join failed.' }, { status: 500 });
  }
}
