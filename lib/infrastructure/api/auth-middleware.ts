import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth/auth';

export function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get session from BetterAuth
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Call the handler with userId
      return handler(req, session.user.id);
    } catch (error: any) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function createErrorResponse(error: any, status: number = 500): NextResponse {
  const message = error instanceof Error ? error.message : 'An error occurred';
  return NextResponse.json({ error: message }, { status });
}
