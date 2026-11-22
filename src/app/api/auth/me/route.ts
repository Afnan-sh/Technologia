import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error retrieving user';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
