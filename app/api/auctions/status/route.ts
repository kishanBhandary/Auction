import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: {
      auctionStatus: 'LIVE',
      currentPlayer: 'Ravi Sharma',
      currentHighestBid: 900,
      teamInLead: 'Team Alpha',
      countdownSeconds: 14,
      updatedAt: new Date().toISOString(),
    },
  });
}
