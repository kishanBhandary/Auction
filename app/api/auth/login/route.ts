import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { FALLBACK_USERS, SESSION_COOKIE, type UserSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const requestedRole = String(body.role ?? '').toUpperCase();

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: 'Email and password are required.' }, { status: 400 });
    }

    let session: UserSession | null = null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (!error && data.user) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            include: { team: true },
          });

          session = {
            id: dbUser?.id ?? data.user.id,
            email,
            name: dbUser?.name ?? data.user.email ?? 'Auction user',
            role: (dbUser?.role as UserSession['role']) ?? 'VIEWER',
            teamId: dbUser?.team?.id,
            teamName: dbUser?.team?.name,
          };
        }
      } catch {
        session = null;
      }
    }

    if (!session) {
      const fallback = FALLBACK_USERS[email];
      if (!fallback || fallback.password !== password) {
        return NextResponse.json({ ok: false, message: 'Invalid email or password.' }, { status: 401 });
      }

      const dbUser = await prisma.user.upsert({
        where: { email },
        update: { role: fallback.role, name: fallback.name },
        create: {
          email,
          name: fallback.name,
          role: fallback.role,
        },
      });

      session = {
        id: dbUser.id,
        email,
        name: fallback.name,
        role: fallback.role,
        teamId: fallback.teamId,
        teamName: fallback.teamName,
      };
    }

    const store = await cookies();
    store.set(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    const redirect =
      session.role === 'TEAM_OWNER'
        ? '/team/join-room'
        : session.role === 'AUCTIONEER'
          ? '/auctioneer/dashboard'
          : session.role === 'ADMIN'
            ? '/admin/dashboard'
            : '/auction-room';

    if (requestedRole && ['ADMIN', 'AUCTIONEER', 'TEAM_OWNER'].includes(requestedRole) && requestedRole !== session.role) {
      return NextResponse.json({ ok: false, message: 'Role mismatch.' }, { status: 403 });
    }

    return NextResponse.json({ ok: true, session, redirect });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Login failed' }, { status: 500 });
  }
}
