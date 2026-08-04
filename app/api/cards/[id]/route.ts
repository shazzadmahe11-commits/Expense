import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const card = await prisma.card.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      color: body.color,
      limit: body.limit ? parseFloat(body.limit) : null,
    },
  });
  return NextResponse.json(card);
}
