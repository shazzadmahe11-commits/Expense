import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#f59e0b' },
  { name: 'Groceries', icon: '🛒', color: '#10b981' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Fuel', icon: '⛽', color: '#f97316' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Healthcare', icon: '💊', color: '#ef4444' },
  { name: 'Utilities', icon: '💡', color: '#06b6d4' },
  { name: 'Subscriptions', icon: '📱', color: '#6366f1' },
  { name: 'Travel', icon: '✈️', color: '#14b8a6' },
  { name: 'Income', icon: '💵', color: '#22c55e' },
  { name: 'Other', icon: '📦', color: '#94a3b8' },
];

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let categories = await prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });

  // First time this user has ever loaded categories — give them a sensible starting set.
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
    });
    categories = await prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, icon, color } = body;
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  try {
    const category = await prisma.category.create({
      data: { userId, name, icon: icon || '📦', color: color || '#94a3b8' },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Category name must be unique' }, { status: 409 });
  }
}
