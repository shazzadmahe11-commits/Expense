import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cards = await prisma.card.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });

  const sums = await prisma.transaction.groupBy({
    by: ['cardId', 'type'],
    where: { userId },
    _sum: { amount: true },
  });

  const cardsWithTotals = cards.map((card) => {
    const expenses = sums.find((s) => s.cardId === card.id && s.type === 'EXPENSE')?._sum.amount || 0;
    const income = sums.find((s) => s.cardId === card.id && s.type === 'INCOME')?._sum.amount || 0;
    const transferred = sums.find((s) => s.cardId === card.id && s.type === 'TRANSFER')?._sum.amount || 0;

    // For a credit card, a transfer *into* it is a bill payment — it reduces
    // what's owed, same as the physical world. For a debit card, a transfer
    // *out* of it is real cash leaving, tracked separately from purchases.
    const totalSpent = card.type === 'CREDIT' ? Math.max(expenses - transferred, 0) : expenses;
    const totalTransferredOut = card.type === 'DEBIT' ? transferred : 0;

    return {
      ...card,
      totalSpent,
      totalIncome: income,
      totalTransferredOut,
      available: card.limit != null ? Math.max(card.limit - totalSpent, 0) : null,
    };
  });

  return NextResponse.json(cardsWithTotals);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, type, color, limit } = body;
  if (!name || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const card = await prisma.card.create({
    data: { userId, name, type, color: color || '#6366f1', limit: limit ? parseFloat(limit) : null },
  });
  return NextResponse.json(card, { status: 201 });
}
