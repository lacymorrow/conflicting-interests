import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);
    if (!id) {
      return NextResponse.json(
        { message: 'Missing politician ID' },
        { status: 400 }
      );
    }

    const politician = await prisma.politician.findUnique({
      where: { id },
      include: {
        votes: {
          orderBy: { voteDate: 'desc' }
        },
        contributions: {
          orderBy: { date: 'desc' }
        },
        investments: {
          orderBy: { date: 'desc' }
        },
        expenditures: {
          orderBy: { date: 'desc' }
        },
        reports: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!politician) {
      return NextResponse.json(
        { message: 'Politician not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: politician });
  } catch (error) {
    console.error('Error fetching politician details:', error);
    return NextResponse.json(
      { message: 'Failed to fetch politician details' },
      { status: 500 }
    );
  }
}
