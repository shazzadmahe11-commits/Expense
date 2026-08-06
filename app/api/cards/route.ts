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
    const spent = sums.find((s) => s.cardId === card.id && s.type === 'EXPENSE')?._sum.amount || 0;
    const income = sums.find((s) => s.cardId === card.id && s.type === 'INCOME')?._sum.amount || 0;
    return {
      ...card,
      totalSpent: spent,
      totalIncome: income,
      available: card.limit != null ? Math.max(card.limit - spent, 0) : null,
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
