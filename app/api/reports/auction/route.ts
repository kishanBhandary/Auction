import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    summary: {
      totalPlayersRegistered: 28,
      totalPlayersSold: 17,
      totalPlayersUnsold: 11,
      totalSpending: 17300,
      remainingBudgetAcrossTeams: 10450,
    },
  });
}
