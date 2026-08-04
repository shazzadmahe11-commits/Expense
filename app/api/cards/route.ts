import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cards = await prisma.card.findMany({ orderBy: { createdAt: 'asc' } });

  const sums = await prisma.transaction.groupBy({
    by: ['cardId', 'type'],
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
  const body = await req.json();
  const { name, type, color, limit } = body;
  if (!name || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const card = await prisma.card.create({
    data: { name, type, color: color || '#6366f1', limit: limit ? parseFloat(limit) : null },
  });
  return NextResponse.json(card, { status: 201 });
}
