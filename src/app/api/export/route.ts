import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories/PrismaAccountRepository';
import { PrismaTransactionRepository } from '@/lib/infrastructure/database/repositories/PrismaTransactionRepository';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper to style header row
const styleHeaderRow = (row: ExcelJS.Row, color: string) => {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
  });
};

// Helper to style data rows with alternating colors
const styleDataRows = (worksheet: ExcelJS.Worksheet, startRow: number) => {
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= startRow) return;
    const isEven = rowNumber % 2 === 0;
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF8F9FA' : 'FFFFFFFF' },
      };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
  });
};

// GET /api/export - Export all financial data to Excel
/**
 * @swagger
 * /api/export:
 *   get:
 *     summary: Export data to Excel
 *     description: Download a comprehensive Excel report of all financial data.
 *     tags:
 *       - Export
 *     responses:
 *       200:
 *         description: Successfully generated Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    // Fetch all data
    const accountRepo = new PrismaAccountRepository();
    const transactionRepo = new PrismaTransactionRepository();
    const debtRepo = new PrismaDebtRepository();
    const subscriptionRepo = new PrismaSubscriptionRepository();

    const accounts = await accountRepo.findByUserId(userId);
    const transactions = await transactionRepo.findByUserId(userId);
    const debts = await debtRepo.findByUserId(userId);
    const subscriptions = await subscriptionRepo.findByUserId(userId);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Finance App';
    workbook.created = new Date();
    workbook.properties.date1904 = false;

    // Calculate summary stats
    const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
    const totalIncome = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalDebtsOwed = debts
      .filter((d: any) => !d.isPaid)
      .reduce((sum: number, d: any) => sum + d.amount, 0);
    const totalDebtsPaid = debts
      .filter((d: any) => d.isPaid)
      .reduce((sum: number, d: any) => sum + d.amount, 0);

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 35 },
    ];
    styleHeaderRow(summarySheet.getRow(1), 'FF1E40AF');

    const summaryData = [
      { metric: 'Export Date', value: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
      { metric: '', value: '' },
      { metric: 'ACCOUNTS OVERVIEW', value: '' },
      { metric: 'Total Accounts', value: accounts.length.toString() },
      { metric: 'Total Balance', value: formatCurrency(totalBalance) },
      { metric: 'Active Accounts', value: accounts.filter((a: any) => a.isActive).length.toString() },
      { metric: '', value: '' },
      { metric: 'TRANSACTIONS SUMMARY', value: '' },
      { metric: 'Total Transactions', value: transactions.length.toString() },
      { metric: 'Total Income', value: formatCurrency(totalIncome) },
      { metric: 'Total Expenses', value: formatCurrency(totalExpenses) },
      { metric: 'Net Income', value: formatCurrency(totalIncome - totalExpenses) },
      { metric: '', value: '' },
      { metric: 'DEBTS RECEIVABLE', value: '' },
      { metric: 'Total Debts', value: debts.length.toString() },
      { metric: 'Unpaid Debts', value: debts.filter((d: any) => !d.isPaid).length.toString() },
      { metric: 'Amount Owed to You', value: formatCurrency(totalDebtsOwed) },
      { metric: 'Amount Collected', value: formatCurrency(totalDebtsPaid) },
      { metric: '', value: '' },
      { metric: 'SUBSCRIPTIONS', value: '' },
      { metric: 'Total Subscriptions', value: subscriptions.length.toString() },
      { metric: 'Active Subscriptions', value: subscriptions.filter((s: any) => s.status === 'ACTIVE').length.toString() },
      {
        metric: 'Monthly Cost', value: formatCurrency(
          subscriptions.filter((s: any) => s.status === 'ACTIVE').reduce((sum: number, s: any) => {
            const multiplier = s.frequency === 'WEEKLY' ? 4.33 : s.frequency === 'MONTHLY' ? 1 : s.frequency === 'QUARTERLY' ? 0.33 : 0.083;
            return sum + (s.amount * multiplier);
          }, 0)
        )
      },
    ];
    summaryData.forEach(row => summarySheet.addRow(row));
    styleDataRows(summarySheet, 1);

    // Accounts sheet
    const accountsSheet = workbook.addWorksheet('Accounts');
    accountsSheet.columns = [
      { header: 'Account Name', key: 'name', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Balance', key: 'balance', width: 18 },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created Date', key: 'createdAt', width: 20 },
    ];
    styleHeaderRow(accountsSheet.getRow(1), 'FF059669');

    accounts.forEach((account: any) => {
      accountsSheet.addRow({
        name: account.name,
        type: account.type,
        balance: formatCurrency(account.balance),
        currency: account.currency,
        description: account.description || '-',
        status: account.isActive ? 'Active' : 'Inactive',
        createdAt: new Date(account.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
    });
    styleDataRows(accountsSheet, 1);

    // Transactions sheet
    const transactionsSheet = workbook.addWorksheet('Transactions');
    transactionsSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Account', key: 'account', width: 18 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Reason', key: 'reason', width: 20 },
      { header: 'Created', key: 'createdAt', width: 15 },
    ];
    styleHeaderRow(transactionsSheet.getRow(1), 'FF7C3AED');

    transactions.forEach((transaction: any) => {
      transactionsSheet.addRow({
        date: new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        description: transaction.description,
        type: transaction.type === 'INCOME' ? 'Income' : transaction.type === 'EXPENSE' ? 'Expense' : 'Transfer',
        amount: formatCurrency(transaction.amount),
        account: transaction.account?.name || '-',
        category: transaction.category?.name || '-',
        reason: transaction.reason || '-',
        createdAt: new Date(transaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });
    });
    styleDataRows(transactionsSheet, 1);

    // Debts sheet
    const debtsSheet = workbook.addWorksheet('Debts Receivable');
    debtsSheet.columns = [
      { header: 'Person Name', key: 'personName', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Due Date', key: 'dueDate', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Paid Date', key: 'paidDate', width: 18 },
      { header: 'Notes', key: 'notes', width: 25 },
      { header: 'Created', key: 'createdAt', width: 15 },
    ];
    styleHeaderRow(debtsSheet.getRow(1), 'FFDC2626');

    debts.forEach((debt: any) => {
      debtsSheet.addRow({
        personName: debt.personName,
        amount: formatCurrency(debt.amount),
        description: debt.description || '-',
        dueDate: debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
        status: debt.isPaid ? 'Paid' : 'Pending',
        paidDate: debt.paidDate ? new Date(debt.paidDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
        notes: debt.notes || '-',
        createdAt: new Date(debt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });
    });
    styleDataRows(debtsSheet, 1);

    // Subscriptions sheet
    const subscriptionsSheet = workbook.addWorksheet('Subscriptions');
    subscriptionsSheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Frequency', key: 'frequency', width: 12 },
      { header: 'Next Billing', key: 'nextBillingDate', width: 18 },
      { header: 'Account', key: 'account', width: 18 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Notes', key: 'notes', width: 25 },
      { header: 'Created', key: 'createdAt', width: 15 },
    ];
    styleHeaderRow(subscriptionsSheet.getRow(1), 'FFEA580C');

    subscriptions.forEach((subscription: any) => {
      subscriptionsSheet.addRow({
        name: subscription.name,
        amount: formatCurrency(subscription.amount),
        frequency: subscription.frequency === 'WEEKLY' ? 'Weekly' : subscription.frequency === 'MONTHLY' ? 'Monthly' : subscription.frequency === 'QUARTERLY' ? 'Quarterly' : 'Yearly',
        nextBillingDate: new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        account: subscription.account?.name || '-',
        category: subscription.category?.name || '-',
        status: subscription.status === 'ACTIVE' ? 'Active' : subscription.status === 'PAUSED' ? 'Paused' : 'Cancelled',
        notes: subscription.notes || '-',
        createdAt: new Date(subscription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });
    });
    styleDataRows(subscriptionsSheet, 1);

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="finance-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('GET /api/export error:', error);
    return createErrorResponse(error);
  }
});
