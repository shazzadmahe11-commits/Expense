const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const categories = [
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

  const createdCategories = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories[cat.name] = created;
  }
  console.log('✅ Categories created');

  const cards = [
    { name: 'TD Visa', type: 'CREDIT', color: '#2563eb', limit: 10000 },
    { name: 'RBC Mastercard', type: 'CREDIT', color: '#dc2626', limit: 8000 },
    { name: 'Scotiabank Debit', type: 'DEBIT', color: '#16a34a', limit: null },
    { name: 'PC Financial', type: 'CREDIT', color: '#9333ea', limit: 5000 },
  ];

  const createdCards = {};
  for (const card of cards) {
    const existing = await prisma.card.findFirst({ where: { name: card.name } });
    if (!existing) {
      const created = await prisma.card.create({ data: card });
      createdCards[card.name] = created;
    } else {
      createdCards[card.name] = existing;
    }
  }
  console.log('✅ Cards created');

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const txs = [
    { amount: 142.50, type: 'EXPENSE', description: 'Loblaws weekly shop', date: new Date(y, m, 3), card: 'Scotiabank Debit', category: 'Groceries' },
    { amount: 68.90, type: 'EXPENSE', description: 'Tim Hortons & lunch', date: new Date(y, m, 4), card: 'TD Visa', category: 'Food & Dining' },
    { amount: 89.00, type: 'EXPENSE', description: 'Gas fill-up', date: new Date(y, m, 5), card: 'TD Visa', category: 'Fuel' },
    { amount: 220.00, type: 'EXPENSE', description: 'Hydro bill', date: new Date(y, m, 7), card: 'Scotiabank Debit', category: 'Utilities' },
    { amount: 19.99, type: 'EXPENSE', description: 'Netflix', date: new Date(y, m, 8), card: 'RBC Mastercard', category: 'Subscriptions' },
    { amount: 14.99, type: 'EXPENSE', description: 'Spotify', date: new Date(y, m, 8), card: 'RBC Mastercard', category: 'Subscriptions' },
    { amount: 185.60, type: 'EXPENSE', description: 'Shoppers Drug Mart', date: new Date(y, m, 10), card: 'RBC Mastercard', category: 'Healthcare' },
    { amount: 312.45, type: 'EXPENSE', description: 'Costco run', date: new Date(y, m, 12), card: 'Scotiabank Debit', category: 'Groceries' },
    { amount: 55.00, type: 'EXPENSE', description: 'TTC monthly pass', date: new Date(y, m, 1), card: 'Scotiabank Debit', category: 'Transport' },
    { amount: 245.00, type: 'EXPENSE', description: 'Amazon order', date: new Date(y, m, 14), card: 'TD Visa', category: 'Shopping' },
    { amount: 95.00, type: 'EXPENSE', description: 'Dinner with friends', date: new Date(y, m, 15), card: 'PC Financial', category: 'Food & Dining' },
    { amount: 78.50, type: 'EXPENSE', description: 'Movie night + snacks', date: new Date(y, m, 17), card: 'RBC Mastercard', category: 'Entertainment' },
    { amount: 48.00, type: 'EXPENSE', description: 'Uber rides', date: new Date(y, m, 18), card: 'PC Financial', category: 'Transport' },
    { amount: 199.00, type: 'EXPENSE', description: 'LCBO', date: new Date(y, m, 19), card: 'TD Visa', category: 'Shopping' },
    { amount: 65.00, type: 'EXPENSE', description: 'Sobeys groceries', date: new Date(y, m, 20), card: 'Scotiabank Debit', category: 'Groceries' },
    { amount: 4200.00, type: 'INCOME', description: 'Salary', date: new Date(y, m, 1), card: 'Scotiabank Debit', category: 'Income' },
    { amount: 850.00, type: 'INCOME', description: 'Freelance payment', date: new Date(y, m, 15), card: 'Scotiabank Debit', category: 'Income' },
  ];

  for (const tx of txs) {
    const card = createdCards[tx.card];
    const category = createdCategories[tx.category];
    if (card && category) {
      await prisma.transaction.create({
        data: {
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          date: tx.date,
          cardId: card.id,
          categoryId: category.id,
        },
      });
    }
  }
  console.log('✅ Demo transactions created');
  console.log('🎉 Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
