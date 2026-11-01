import { NextResponse } from 'next/server';
import { getAuctionRoomSnapshot } from '@/lib/auction-room';

export async function GET() {
  try {
    const room = await getAuctionRoomSnapshot();
    return NextResponse.json({ ok: true, room });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Room unavailable' }, { status: 500 });
  }
}
