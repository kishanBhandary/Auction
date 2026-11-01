import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      return NextResponse.json({ ok: false, message: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
