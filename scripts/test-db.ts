import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('\n=== Testing Database Connections and Data ===\n');

  try {
    // Test Politicians
    const politicianCount = await prisma.politician.count();
    console.log(`Politicians in database: ${politicianCount}`);
    
    const samplePolitician = await prisma.politician.findFirst({
      include: {
        contributions: true,
        investments: true,
        reports: true,
      },
    });
    console.log('\nSample Politician:', JSON.stringify(samplePolitician, null, 2));

    // Test Bills
    const billCount = await prisma.bill.count();
    console.log(`\nBills in database: ${billCount}`);
    
    const sampleBill = await prisma.bill.findFirst();
    console.log('\nSample Bill:', JSON.stringify(sampleBill, null, 2));

    // Test Contributions
    const contributionCount = await prisma.contribution.count();
    console.log(`\nContributions in database: ${contributionCount}`);
    
    const topContributors = await prisma.contribution.groupBy({
      by: ['source'],
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    });
    console.log('\nTop 5 Contributors:', JSON.stringify(topContributors, null, 2));

  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
