import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, icon, color } = body;
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  try {
    const category = await prisma.category.create({
      data: { name, icon: icon || '📦', color: color || '#94a3b8' },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Category name must be unique' }, { status: 409 });
  }
}
