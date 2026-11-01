import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return NextResponse.json({
    ok: true,
    team: {
      id,
      name: 'Team Alpha',
      shortName: 'ALP',
      owner: 'Aisha Mehta',
      budget: 5000,
      remainingBudget: 2450,
      purchasedPlayers: 2,
    },
  });
}
