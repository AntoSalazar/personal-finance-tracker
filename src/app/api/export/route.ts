import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories/PrismaAccountRepository';
import { PrismaTransactionRepository } from '@/lib/infrastructure/database/repositories/PrismaTransactionRepository';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper to apply styles to worksheet
const styleWorksheet = (ws: XLSX.WorkSheet, headerColor: string) => {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  // Set column widths
  ws['!cols'] = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    ws['!cols'].push({ wch: 18 });
  }

  // Style header row
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;

    ws[cellAddress].s = {
      fill: { fgColor: { rgb: headerColor } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
  }

  // Style data rows with alternating colors
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const isEven = row % 2 === 0;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        fill: { fgColor: { rgb: isEven ? "F8F9FA" : "FFFFFF" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "E0E0E0" } },
          bottom: { style: "thin", color: { rgb: "E0E0E0" } },
          left: { style: "thin", color: { rgb: "E0E0E0" } },
          right: { style: "thin", color: { rgb: "E0E0E0" } },
        },
      };
    }
  }
};

// GET /api/export - Export all financial data to Excel
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
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: "Financial Export",
      Subject: "Complete Financial Overview",
      Author: "Finance App",
      CreatedDate: new Date()
    };

    // Summary sheet (first sheet with key metrics)
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

    const summaryData = [
      { '📊 Metric': 'Export Date', '💰 Value': new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) },
      { '📊 Metric': '', '💰 Value': '' },
      { '📊 Metric': '💳 ACCOUNTS OVERVIEW', '💰 Value': '' },
      { '📊 Metric': 'Total Accounts', '💰 Value': accounts.length.toString() },
      { '📊 Metric': 'Total Balance', '💰 Value': formatCurrency(totalBalance) },
      { '📊 Metric': 'Active Accounts', '💰 Value': accounts.filter((a: any) => a.isActive).length.toString() },
      { '📊 Metric': '', '💰 Value': '' },
      { '📊 Metric': '💵 TRANSACTIONS SUMMARY', '💰 Value': '' },
      { '📊 Metric': 'Total Transactions', '💰 Value': transactions.length.toString() },
      { '📊 Metric': 'Total Income', '💰 Value': formatCurrency(totalIncome) },
      { '📊 Metric': 'Total Expenses', '💰 Value': formatCurrency(totalExpenses) },
      { '📊 Metric': 'Net Income', '💰 Value': formatCurrency(totalIncome - totalExpenses) },
      { '📊 Metric': '', '💰 Value': '' },
      { '📊 Metric': '👥 DEBTS RECEIVABLE', '💰 Value': '' },
      { '📊 Metric': 'Total Debts', '💰 Value': debts.length.toString() },
      { '📊 Metric': 'Unpaid Debts', '💰 Value': debts.filter((d: any) => !d.isPaid).length.toString() },
      { '📊 Metric': 'Amount Owed to You', '💰 Value': formatCurrency(totalDebtsOwed) },
      { '📊 Metric': 'Amount Collected', '💰 Value': formatCurrency(totalDebtsPaid) },
      { '📊 Metric': '', '💰 Value': '' },
      { '📊 Metric': '🔄 SUBSCRIPTIONS', '💰 Value': '' },
      { '📊 Metric': 'Total Subscriptions', '💰 Value': subscriptions.length.toString() },
      { '📊 Metric': 'Active Subscriptions', '💰 Value': subscriptions.filter((s: any) => s.status === 'ACTIVE').length.toString() },
      { '📊 Metric': 'Monthly Cost', '💰 Value': formatCurrency(
        subscriptions.filter((s: any) => s.status === 'ACTIVE').reduce((sum: number, s: any) => {
          const multiplier = s.frequency === 'WEEKLY' ? 4.33 : s.frequency === 'MONTHLY' ? 1 : s.frequency === 'QUARTERLY' ? 0.33 : 0.083;
          return sum + (s.amount * multiplier);
        }, 0)
      )},
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 35 }];
    styleWorksheet(summarySheet, "1E40AF");
    XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Summary');

    // Accounts sheet
    const accountsData = accounts.map((account: any) => ({
      '💳 Account Name': account.name,
      '📂 Type': account.type,
      '💰 Balance': formatCurrency(account.balance),
      '💱 Currency': account.currency,
      '📝 Description': account.description || '-',
      '✅ Status': account.isActive ? '✅ Active' : '❌ Inactive',
      '📅 Created Date': new Date(account.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }));
    const accountsSheet = XLSX.utils.json_to_sheet(accountsData);
    styleWorksheet(accountsSheet, "059669");
    XLSX.utils.book_append_sheet(workbook, accountsSheet, '💳 Accounts');

    // Transactions sheet
    const transactionsData = transactions.map((transaction: any) => ({
      '📅 Date': new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      '📝 Description': transaction.description,
      '🏷️ Type': transaction.type === 'INCOME' ? '💰 Income' : transaction.type === 'EXPENSE' ? '💸 Expense' : '🔄 Transfer',
      '💵 Amount': formatCurrency(transaction.amount),
      '💳 Account': transaction.account?.name || '-',
      '📂 Category': transaction.category?.name || '-',
      '📋 Reason': transaction.reason || '-',
      '🕐 Created': new Date(transaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    styleWorksheet(transactionsSheet, "7C3AED");
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, '💵 Transactions');

    // Debts sheet
    const debtsData = debts.map((debt: any) => ({
      '👤 Person Name': debt.personName,
      '💰 Amount': formatCurrency(debt.amount),
      '📝 Description': debt.description || '-',
      '📅 Due Date': debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
      '✅ Status': debt.isPaid ? '✅ Paid' : '⏳ Pending',
      '💵 Paid Date': debt.paidDate ? new Date(debt.paidDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
      '📋 Notes': debt.notes || '-',
      '🕐 Created': new Date(debt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));
    const debtsSheet = XLSX.utils.json_to_sheet(debtsData);
    styleWorksheet(debtsSheet, "DC2626");
    XLSX.utils.book_append_sheet(workbook, debtsSheet, '👥 Debts Receivable');

    // Subscriptions sheet
    const subscriptionsData = subscriptions.map((subscription: any) => ({
      '🔄 Name': subscription.name,
      '💰 Amount': formatCurrency(subscription.amount),
      '📆 Frequency': subscription.frequency === 'WEEKLY' ? '📅 Weekly' : subscription.frequency === 'MONTHLY' ? '🗓️ Monthly' : subscription.frequency === 'QUARTERLY' ? '📊 Quarterly' : '🎯 Yearly',
      '⏰ Next Billing': new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      '💳 Account': subscription.account?.name || '-',
      '📂 Category': subscription.category?.name || '-',
      '✅ Status': subscription.status === 'ACTIVE' ? '✅ Active' : subscription.status === 'PAUSED' ? '⏸️ Paused' : '❌ Cancelled',
      '📋 Notes': subscription.notes || '-',
      '🕐 Created': new Date(subscription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));
    const subscriptionsSheet = XLSX.utils.json_to_sheet(subscriptionsData);
    styleWorksheet(subscriptionsSheet, "EA580C");
    XLSX.utils.book_append_sheet(workbook, subscriptionsSheet, '🔄 Subscriptions');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the file
    return new NextResponse(excelBuffer, {
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
