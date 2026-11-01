import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    teams: [
      { id: 'team-alpha', name: 'Team Alpha', shortName: 'ALP', budget: 5000, remainingBudget: 2450 },
      { id: 'team-bravo', name: 'Team Bravo', shortName: 'BRV', budget: 5000, remainingBudget: 3100 },
      { id: 'team-charlie', name: 'Team Charlie', shortName: 'CHA', budget: 5000, remainingBudget: 2800 },
      { id: 'team-delta', name: 'Team Delta', shortName: 'DEL', budget: 5000, remainingBudget: 2650 },
    ],
  });
}
