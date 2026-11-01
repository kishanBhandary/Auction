import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'vpl_session';

export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: 'AUCTIONEER' | 'TEAM_OWNER' | 'ADMIN' | 'VIEWER' | 'SUPER_ADMIN';
  teamId?: string;
  teamName?: string;
  portal?: 'admin' | 'team' | 'auctioneer';
};

export const FALLBACK_USERS: Record<
  string,
  {
    password: string;
    role: UserSession['role'];
    name: string;
    teamId?: string;
    teamName?: string;
  }
> = {
  'admin@vpl.local': {
    password: 'Vpl@2026!',
    role: 'ADMIN',
    name: 'League Admin',
  },
  'auctioneer@vpl.local': {
    password: 'Vpl@2026!',
    role: 'AUCTIONEER',
    name: 'Kishan Bhandary',
  },
  'alpha.owner@vpl.local': {
    password: 'Vpl@2026!',
    role: 'TEAM_OWNER',
    name: 'Rahul Verma',
    teamId: 'team-alpha',
    teamName: 'Team Alpha',
  },
  'bravo.owner@vpl.local': {
    password: 'Vpl@2026!',
    role: 'TEAM_OWNER',
    name: 'Karan Mehta',
    teamId: 'team-bravo',
    teamName: 'Team Bravo',
  },
  'charlie.owner@vpl.local': {
    password: 'Vpl@2026!',
    role: 'TEAM_OWNER',
    name: 'Aditya Sen',
    teamId: 'team-charlie',
    teamName: 'Team Charlie',
  },
  'delta.owner@vpl.local': {
    password: 'Vpl@2026!',
    role: 'TEAM_OWNER',
    name: 'Vivek Nair',
    teamId: 'team-delta',
    teamName: 'Team Delta',
  },
};

export async function getSession(): Promise<UserSession | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as UserSession;
    if (!session?.email || !session?.role) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
