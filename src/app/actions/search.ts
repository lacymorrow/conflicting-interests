'use server';

import { prisma } from '@/lib/prisma';

export async function searchPoliticians(query: string) {
  if (!query.trim()) return [];

  try {
    const members = await prisma.politician.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            votes: true,
            contributions: true,
            investments: true,
            expenditures: true,
          },
        },
      },
    });

    return members.map(member => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      party: member.party,
      state: member.state,
      stats: member._count,
    }));
  } catch (error) {
    console.error('Error searching politicians:', error);
    return [];
  }
}
