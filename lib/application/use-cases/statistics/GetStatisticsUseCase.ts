import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear } from 'date-fns';

export interface StatisticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  netWorth: number;
  transactionCount: number;
  avgExpenseAmount: number;
  avgIncomeAmount: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface AccountBalance {
  name: string;
  balance: number;
  type: string;
}

export interface TopSpending {
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export interface DailyTrend {
  date: string;
  amount: number;
}

export interface StatisticsResult {
  period: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: StatisticsSummary;
  categoryBreakdown: CategoryBreakdown[];
  incomeCategoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  accountBalances: AccountBalance[];
  dailyTrend: DailyTrend[];
  topSpending: TopSpending[];
}

export class GetStatisticsUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(userId: string, period: string = 'month'): Promise<StatisticsResult> {
    // Calculate date range based on period
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'month':
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      case 'quarter':
        startDate = subMonths(new Date(), 3);
        break;
      case 'year':
        startDate = startOfYear(new Date());
        endDate = endOfYear(new Date());
        break;
      case 'all':
        startDate = new Date(2000, 0, 1);
        break;
      default:
        startDate = startOfMonth(new Date());
    }

    // Get transactions for the period (filtered by userId)
    const transactions = await this.transactionRepository.findByUserId(userId, {
      startDate,
      endDate,
    });

    // Get all user accounts (filtered by userId)
    const accounts = await this.accountRepository.findByUserId(userId);

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);

    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');

    const avgExpenseAmount = expenseTransactions.length > 0
      ? totalExpenses / expenseTransactions.length
      : 0;

    const avgIncomeAmount = incomeTransactions.length > 0
      ? totalIncome / incomeTransactions.length
      : 0;

    // Calculate category breakdown for expenses
    const categoryMap = new Map<string, CategoryBreakdown>();
    expenseTransactions.forEach(t => {
      const categoryName = t.category.name;
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          amount: 0,
          count: 0,
          color: t.category.color || '#888888',
        });
      }
      const category = categoryMap.get(categoryName)!;
      category.amount += t.amount;
      category.count += 1;
    });

    const categoryBreakdown = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    // Calculate category breakdown for income
    const incomeCategoryMap = new Map<string, CategoryBreakdown>();
    incomeTransactions.forEach(t => {
      const categoryName = t.category.name;
      if (!incomeCategoryMap.has(categoryName)) {
        incomeCategoryMap.set(categoryName, {
          name: categoryName,
          amount: 0,
          count: 0,
          color: t.category.color || '#888888',
        });
      }
      const category = incomeCategoryMap.get(categoryName)!;
      category.amount += t.amount;
      category.count += 1;
    });

    const incomeCategoryBreakdown = Array.from(incomeCategoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    // Calculate monthly trends (last 6 months)
    const monthlyTrends: MonthlyTrend[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter(
        t => t.date >= monthStart && t.date <= monthEnd
      );

      const monthIncome = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrends.push({
        month: format(monthDate, 'MMM yyyy'),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      });
    }

    // Calculate account balances
    const accountBalances: AccountBalance[] = accounts
      .map(account => ({
        name: account.name,
        balance: account.balance,
        type: account.type,
      }))
      .sort((a, b) => b.balance - a.balance);

    // Calculate daily spending trend for current month
    const dailyTrend: DailyTrend[] = [];
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthTransactions = expenseTransactions.filter(
      t => t.date >= currentMonthStart
    );

    const dailyMap = new Map<string, number>();
    currentMonthTransactions.forEach(t => {
      const dateKey = format(t.date, 'MMM dd');
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + t.amount);
    });

    dailyMap.forEach((amount, date) => {
      dailyTrend.push({ date, amount });
    });

    // Calculate top spending
    const topSpending: TopSpending[] = expenseTransactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(t => ({
        description: t.description,
        amount: t.amount,
        category: t.category.name,
        date: t.date,
      }));

    return {
      period,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate,
        netWorth,
        transactionCount: transactions.length,
        avgExpenseAmount,
        avgIncomeAmount,
      },
      categoryBreakdown,
      incomeCategoryBreakdown,
      monthlyTrends,
      accountBalances,
      dailyTrend,
      topSpending,
    };
  }
}
