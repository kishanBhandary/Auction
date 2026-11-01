import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    bids: [
      { team: 'Team Alpha', amount: 900 },
      { team: 'Team Bravo', amount: 800 },
      { team: 'Team Charlie', amount: 700 },
    ],
  });
}
