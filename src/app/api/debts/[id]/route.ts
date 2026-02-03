import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { UpdateDebtUseCase } from '@/lib/application/use-cases/debts/UpdateDebtUseCase';
import { DeleteDebtUseCase } from '@/lib/application/use-cases/debts/DeleteDebtUseCase';
import { GetDebtsUseCase } from '@/lib/application/use-cases/debts/GetDebtsUseCase';
import { z, ZodError } from 'zod';

const updateDebtSchema = z.object({
  personName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  dueDate: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateDebtInput:
 *       type: object
 *       properties:
 *         personName:
 *           type: string
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 */

// GET /api/debts/[id] - Get specific debt
/**
 * @swagger
 * /api/debts/{id}:
 *   get:
 *     summary: Get a debt by ID
 *     description: Retrieve details of a specific debt.
 *     tags:
 *       - Debts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved debt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Debt'
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a debt
 *     description: Update details of an existing debt.
 *     tags:
 *       - Debts
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
 *             $ref: '#/components/schemas/UpdateDebtInput'
 *     responses:
 *       200:
 *         description: Debt successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Debt'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a debt
 *     description: Permanently delete a debt.
 *     tags:
 *       - Debts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Debt successfully deleted
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaDebtRepository();
    const useCase = new GetDebtsUseCase(repository);

    const debt = await useCase.getById(id);

    if (!debt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    if (debt.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(debt);
  } catch (error) {
    console.error('GET /api/debts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// PUT /api/debts/[id] - Update debt
export const PUT = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const validatedData = updateDebtSchema.parse(body);

    const repository = new PrismaDebtRepository();
    const useCase = new UpdateDebtUseCase(repository);

    const debt = await useCase.execute(id, validatedData);

    return NextResponse.json(debt);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/debts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/debts/[id] - Delete debt
export const DELETE = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaDebtRepository();
    const useCase = new DeleteDebtUseCase(repository);

    await useCase.execute(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/debts/[id] error:', error);
    return createErrorResponse(error);
  }
});
