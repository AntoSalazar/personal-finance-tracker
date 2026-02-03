import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { GetAccountsUseCase } from '@/lib/application/use-cases/accounts/GetAccountsUseCase';
import { AccountType } from '@/lib/domain/entities/Account';
import { z, ZodError } from 'zod';

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.nativeEnum(AccountType).optional(),
  balance: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateAccountInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [CHECKING, SAVINGS, CREDIT_CARD, INVESTMENT, CASH, OTHER]
 *         balance:
 *           type: number
 *         currency:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 */

// GET /api/accounts/[id] - Get account by ID
/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get an account by ID
 *     description: Retrieve details of a specific account.
 *     tags:
 *       - Accounts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved account details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an account
 *     description: Update details of an existing account.
 *     tags:
 *       - Accounts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccountInput'
 *     responses:
 *       200:
 *         description: Account successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an account
 *     description: Permanently delete an account.
 *     tags:
 *       - Accounts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account successfully deleted
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaAccountRepository();
    const useCase = new GetAccountsUseCase(repository);

    const account = await useCase.getById(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // SECURITY: Verify account belongs to user
    if (account.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('GET /api/accounts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// PUT /api/accounts/[id] - Update account
export const PUT = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const validatedData = updateAccountSchema.parse(body);

    const repository = new PrismaAccountRepository();

    // SECURITY: Verify account belongs to user before updating
    const existingAccount = await repository.findById(id);
    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    if (existingAccount.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const account = await repository.update(id, validatedData);

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/accounts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/accounts/[id] - Delete account
export const DELETE = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaAccountRepository();

    // SECURITY: Verify account belongs to user before deleting
    const existingAccount = await repository.findById(id);
    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    if (existingAccount.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await repository.delete(id);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/accounts/[id] error:', error);
    return createErrorResponse(error);
  }
});
