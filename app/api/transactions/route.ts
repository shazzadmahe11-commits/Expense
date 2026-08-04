import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
  const cardId = searchParams.get('cardId');
  const categoryId = searchParams.get('categoryId');
  const type = searchParams.get('type');

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const where: Record<string, unknown> = {
    date: { gte: start, lte: end },
  };
  if (cardId) where.cardId = cardId;
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      card: true,
      category: true,
    },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, type, description, date, cardId, categoryId } = body;

  if (!amount || !type || !date || !cardId || !categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      description: description || null,
      date: parseLocalDate(date),
      cardId,
      categoryId,
    },
    include: { card: true, category: true },
  });

  return NextResponse.json(transaction, { status: 201 });
}
