import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cards = await prisma.card.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(cards);
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
