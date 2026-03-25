import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const state = searchParams.get('state');

  try {
    const politicians = await prisma.politician.findMany({
      where: {
        OR: query ? [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ] : undefined,
        state: state || undefined,
      },
      include: {
        _count: {
          select: {
            votes: true,
            contributions: true,
            investments: true,
          },
        },
      },
    });

    return NextResponse.json(politicians);
  } catch (error) {
    console.error('Error fetching politicians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch politicians' },
      { status: 500 }
    );
  }
}
