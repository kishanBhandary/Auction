import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE, type UserSession } from '@/lib/auth';
import { broadcastRoomUpdate } from '@/lib/auction-room';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roomCode = String(body.roomCode || '').trim().toUpperCase();
    const teamName = String(body.teamName || '').trim();
    const ownerName = String(body.ownerName || '').trim();
    const iconName = String(body.iconName || body.shortName || '').trim().toUpperCase();
    const logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null;
    const ownerPhotoUrl = body.ownerPhotoUrl ? String(body.ownerPhotoUrl).trim() : null;
    const iconPlayerName = String(body.iconPlayerName || '').trim();
    const iconPlayerPosition = String(body.iconPlayerPosition || 'OUTSIDE_HITTER').trim().toUpperCase();
    const iconPlayerPhotoUrl = body.iconPlayerPhotoUrl ? String(body.iconPlayerPhotoUrl).trim() : null;

    if (!roomCode) {
      return NextResponse.json({ ok: false, message: 'Room code is required.' }, { status: 400 });
    }

    if (!teamName) {
      return NextResponse.json({ ok: false, message: 'Team name is required.' }, { status: 400 });
    }

    if (!ownerName) {
      return NextResponse.json({ ok: false, message: 'Owner name is required.' }, { status: 400 });
    }

    // Auto-generate unique email if user didn't enter one
    const cleanSlug = (ownerName || teamName).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'owner';
    const ownerEmail = body.ownerEmail
      ? String(body.ownerEmail).trim().toLowerCase()
      : `${cleanSlug}-${Date.now().toString(36)}@npl.local`;

    // Find the room by roomCode or id
    const room = await prisma.auctionRoom.findFirst({
      where: {
        OR: [{ roomCode }, { id: roomCode }],
      },
      include: {
        tournament: true,
        memberships: {
          include: { team: true, user: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ ok: false, message: `Auction room "${roomCode}" not found. Please check your room code.` }, { status: 404 });
    }

    if (room.status === 'COMPLETED' || room.status === 'CANCELLED') {
      return NextResponse.json({ ok: false, message: 'This auction room is closed.' }, { status: 400 });
    }

    // Check maximum teams limit
    if (room.memberships.length >= room.maximumTeams) {
      // Check if this team is already joined
      const existingTeamMembership = room.memberships.find(
        (m) => m.team.name.toLowerCase() === teamName.toLowerCase()
      );
      if (!existingTeamMembership) {
        return NextResponse.json({
          ok: false,
          message: `Room has reached maximum capacity of ${room.maximumTeams} teams.`,
        }, { status: 400 });
      }
    }

    // Create or update Owner User
    const user = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {
        name: ownerName,
        role: 'TEAM_OWNER',
      },
      create: {
        email: ownerEmail,
        name: ownerName,
        role: 'TEAM_OWNER',
      },
    });

    // Determine clean shortName / iconName
    const baseShortName = iconName || teamName.slice(0, 3).toUpperCase() || 'TEM';
    let shortName = baseShortName;
    const existingShort = await prisma.team.findUnique({ where: { shortName } });
    if (existingShort && existingShort.name !== teamName) {
      shortName = `${baseShortName}${Math.floor(10 + Math.random() * 89)}`;
    }

    // Create or update Team in this tournament
    const team = await prisma.team.upsert({
      where: { name: teamName },
      update: {
        ownerId: user.id,
        logoUrl: logoUrl ?? undefined,
        shortName: shortName,
        remainingBudget: room.teamBudget,
        budget: room.teamBudget,
      },
      create: {
        tournamentId: room.tournamentId,
        name: teamName,
        shortName,
        logoUrl: logoUrl,
        ownerId: user.id,
        budget: room.teamBudget,
        remainingBudget: room.teamBudget,
      },
    });

    // Create or update Icon Player (1 retained player for the 7-player squad)
    if (iconPlayerName) {
      try {
        let auction = await prisma.auction.findUnique({
          where: { tournamentId: room.tournamentId },
        });

        if (!auction) {
          auction = await prisma.auction.create({
            data: {
              tournamentId: room.tournamentId,
              status: 'SCHEDULED',
            },
          });
        }

        const validPositions = [
          'OUTSIDE_HITTER',
          'OPPOSITE',
          'SETTER',
          'MIDDLE_BLOCKER',
          'LIBERO',
          'DEFENSIVE_SPECIALIST',
        ];
        const assignedPosition = validPositions.includes(iconPlayerPosition)
          ? (iconPlayerPosition as any)
          : 'OUTSIDE_HITTER';

        let player = await prisma.player.findFirst({
          where: {
            tournamentId: room.tournamentId,
            name: iconPlayerName,
          },
        });

        if (!player) {
          player = await prisma.player.create({
            data: {
              tournamentId: room.tournamentId,
              name: iconPlayerName,
              age: 24,
              position: assignedPosition,
              experience: 5,
              basePrice: 0,
              status: 'SOLD',
              photoUrl: iconPlayerPhotoUrl || null,
            },
          });
        } else {
          player = await prisma.player.update({
            where: { id: player.id },
            data: {
              status: 'SOLD',
              photoUrl: iconPlayerPhotoUrl || player.photoUrl,
              position: assignedPosition,
            },
          });
        }

        // Upsert purchase of 0 price for retained Icon Player
        await prisma.purchase.upsert({
          where: { playerId: player.id },
          update: {
            teamId: team.id,
            auctionId: auction.id,
            price: 0,
            status: 'CONFIRMED',
          },
          create: {
            teamId: team.id,
            playerId: player.id,
            auctionId: auction.id,
            price: 0,
            status: 'CONFIRMED',
          },
        });
      } catch (err) {
        console.error('Failed to link icon player:', err);
      }
    }

    // Upsert RoomMembership
    const membership = await prisma.roomMembership.upsert({
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
        userId: user.id,
        connectionStatus: 'ONLINE',
      },
    });

    // Set auth session cookie
    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name ?? ownerName,
      role: 'TEAM_OWNER',
      teamId: team.id,
      teamName: team.name,
      portal: 'team',
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Broadcast room update via Supabase Realtime
    try {
      await broadcastRoomUpdate();
    } catch {
      // Continue even if broadcast fails
    }

    return NextResponse.json({
      ok: true,
      message: 'Team joined successfully!',
      roomId: room.id,
      teamId: team.id,
      membershipId: membership.id,
      redirect: `/room/${room.id}/waiting-room`,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to join room.' },
      { status: 500 }
    );
  }
}
