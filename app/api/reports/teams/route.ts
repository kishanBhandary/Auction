import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    teams: [
      { name: 'Team Alpha', spending: 2550, remainingBudget: 2450, purchasedPlayers: 2 },
      { name: 'Team Bravo', spending: 1900, remainingBudget: 3100, purchasedPlayers: 2 },
      { name: 'Team Charlie', spending: 2200, remainingBudget: 2800, purchasedPlayers: 2 },
      { name: 'Team Delta', spending: 2350, remainingBudget: 2650, purchasedPlayers: 2 },
    ],
  });
}
