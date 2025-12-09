import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth/auth';

export function withAuth<T = any>(
  handler: (req: NextRequest, userId: string, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    try {
      // Get session from BetterAuth
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Call the handler with userId and context (which includes params for dynamic routes)
      return handler(req, session.user.id, context);
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
