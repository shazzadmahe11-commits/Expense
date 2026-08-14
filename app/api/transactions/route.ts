import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalDate } from '@/lib/utils';
import { getUserId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
  const cardId = searchParams.get('cardId');
  const categoryId = searchParams.get('categoryId');
  const type = searchParams.get('type');

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const where: Record<string, unknown> = {
    userId,
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
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { amount, type, description, date, cardId, categoryId } = body;

  if (!amount || !type || !date || !cardId || !categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Make sure the card/category being referenced actually belongs to this user.
  const [card, category] = await Promise.all([
    prisma.card.findFirst({ where: { id: cardId, userId } }),
    prisma.category.findFirst({ where: { id: categoryId, userId } }),
  ]);
  if (!card || !category) {
    return NextResponse.json({ error: 'Invalid card or category' }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
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
