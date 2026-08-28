
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ url: '/dashboard?checkout=mock_success' });
  }
  return NextResponse.json({ url: '/dashboard?success=true' });
}
