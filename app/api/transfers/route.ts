import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalDate } from '@/lib/utils';
import { getUserId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { fromCardId, toCardId, amount, date, description } = body;

  if (!fromCardId || !toCardId || !amount || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (fromCardId === toCardId) {
    return NextResponse.json({ error: 'Pick two different cards' }, { status: 400 });
  }

  const [fromCard, toCard] = await Promise.all([
    prisma.card.findFirst({ where: { id: fromCardId, userId } }),
    prisma.card.findFirst({ where: { id: toCardId, userId } }),
  ]);
  if (!fromCard || !toCard) {
    return NextResponse.json({ error: 'Invalid card' }, { status: 400 });
  }

  // Transfers need a category row to satisfy the schema, but shouldn't show
  // up in spending-by-category — reuse (or create once) a dedicated one.
  let transferCategory = await prisma.category.findFirst({ where: { userId, name: 'Transfer' } });
  if (!transferCategory) {
    transferCategory = await prisma.category.create({
      data: { userId, name: 'Transfer', icon: '🔁', color: '#94a3b8' },
    });
  }

  const transferId = crypto.randomUUID();
  const parsedAmount = parseFloat(amount);
  const parsedDate = parseLocalDate(date);

  const [outLeg, inLeg] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId,
        amount: parsedAmount,
        type: 'TRANSFER',
        description: description || `Transfer to ${toCard.name}`,
        date: parsedDate,
        cardId: fromCardId,
        categoryId: transferCategory.id,
        transferId,
      },
      include: { card: true, category: true },
    }),
    prisma.transaction.create({
      data: {
        userId,
        amount: parsedAmount,
        type: 'TRANSFER',
        description: description || `Payment from ${fromCard.name}`,
        date: parsedDate,
        cardId: toCardId,
        categoryId: transferCategory.id,
        transferId,
      },
      include: { card: true, category: true },
    }),
  ]);

  return NextResponse.json({ outLeg, inLeg }, { status: 201 });
}
