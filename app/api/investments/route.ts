import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(investments);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { broker, stock, amount } = body;
  if (!broker || !stock || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const investment = await prisma.investment.create({
    data: { userId, broker, stock, amount: parseFloat(amount) },
  });
  return NextResponse.json(investment, { status: 201 });
}
