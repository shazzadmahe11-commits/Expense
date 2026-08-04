import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalDate } from '@/lib/utils';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
