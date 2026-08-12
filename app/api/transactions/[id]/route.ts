import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalDate } from '@/lib/utils';
import { getUserId } from '@/lib/auth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (existing.type === 'TRANSFER' && existing.transferId) {
    // Delete both legs of the transfer together so balances stay consistent.
    await prisma.transaction.deleteMany({ where: { transferId: existing.transferId, userId } });
  } else {
    await prisma.transaction.deleteMany({ where: { id, userId } });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      amount: body.amount ? parseFloat(body.amount) : undefined,
      type: body.type,
      description: body.description,
      date: body.date ? parseLocalDate(body.date) : undefined,
      cardId: body.cardId,
      categoryId: body.categoryId,
    },
    include: { card: true, category: true },
  });
  return NextResponse.json(transaction);
}
