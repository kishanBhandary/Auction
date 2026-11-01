import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return NextResponse.json({
    ok: true,
    squad: {
      teamId: id,
      players: [
        { name: 'Ravi Sharma', designation: 'STARTER' },
        { name: 'Aarav Singh', designation: 'SUBSTITUTE' },
      ],
    },
  });
}
