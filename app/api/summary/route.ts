import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  // Monthly transactions — powers the "this month" figures (Total Spent,
  // Total Income, category breakdown) which are meant to reset every month.
  const monthTransactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { card: true, category: true },
  });

  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryMap: Record<string, { category: { id: string; name: string; icon: string; color: string }; total: number }> = {};
  for (const tx of monthTransactions.filter((t) => t.type === 'EXPENSE')) {
    if (!categoryMap[tx.categoryId]) {
      categoryMap[tx.categoryId] = { category: tx.category, total: 0 };
    }
    categoryMap[tx.categoryId].total += tx.amount;
  }
  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);

  // All-time transactions — powers Net Amount only, which is meant to keep
  // accumulating rather than reset when the month changes.
  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
  });

  const totalExpensesAllTime = allTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncomeAllTime = allTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncomeAllTime - totalExpensesAllTime;

  // Card breakdown is scoped to the selected month, same as category
  // breakdown — shows what happened on each card *this month*, not a
  // running lifetime total.
  const cardMap: Record<string, { card: { id: string; name: string; color: string; type: string; limit: number | null }; expenses: number; income: number; transferred: number }> = {};
  for (const tx of monthTransactions) {
    if (!cardMap[tx.cardId]) {
      cardMap[tx.cardId] = { card: tx.card, expenses: 0, income: 0, transferred: 0 };
    }
    if (tx.type === 'EXPENSE') cardMap[tx.cardId].expenses += tx.amount;
    else if (tx.type === 'INCOME') cardMap[tx.cardId].income += tx.amount;
    else if (tx.type === 'TRANSFER') cardMap[tx.cardId].transferred += tx.amount;
  }
  const cardBreakdown = Object.values(cardMap)
    .map((entry) => ({
      card: entry.card,
      // Same logic as the Cards page: a credit card payment (transfer in)
      // reduces what's owed, rather than counting as separate spending.
      expenses: entry.card.type === 'CREDIT'
        ? Math.max(entry.expenses - entry.transferred, 0)
        : entry.expenses,
      income: entry.income,
    }))
    .sort((a, b) => b.expenses - a.expenses);

  return NextResponse.json({
    totalExpenses,
    totalIncome,
    transactionCount: monthTransactions.length,
    categoryBreakdown,
    netAmount,
    cardBreakdown,
  });
}
