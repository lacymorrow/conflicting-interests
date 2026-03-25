import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  try {
    const bills = await prisma.bill.findMany({
      where: {
        status: status || undefined,
        billNumber: type ? { startsWith: type } : undefined,
      },
      orderBy: {
        introducedDate: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}
