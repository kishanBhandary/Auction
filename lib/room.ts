import { createHash, randomBytes } from 'node:crypto';

export const TEAM_COLORS = {
  ALPHA: 'from-sky-500/30 to-blue-500/10 border-sky-400/40',
  BRAVO: 'from-rose-500/30 to-red-500/10 border-rose-400/40',
  CHARLIE: 'from-emerald-500/30 to-green-500/10 border-emerald-400/40',
  DELTA: 'from-violet-500/30 to-purple-500/10 border-violet-400/40',
} as const;

export const DEFAULT_TOURNAMENT_NAME = 'Narayana Guru Premier League';

export const DEFAULT_ROOM_SETTINGS = {
  maximumTeams: 4,
  teamBudget: 5000,
  squadSize: 7,
  startingPlayers: 6,
  substitutePlayers: 1,
  startingPrice: 100,
  bidIncrement: 100,
  countdownSeconds: 20,
  lateBidExtensionSeconds: 10,
};  

export function generateRoomCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `NPL-${num}`;
}

export function generatePasscode() {
  return randomBytes(3).toString('hex').slice(0, 6).toUpperCase();
}

export function hashPasscode(passcode: string) {
  return createHash('sha256').update(passcode).digest('hex');
}

export function verifyPasscode(passcode: string, hash: string) {
  return hashPasscode(passcode) === hash;
}
