import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PoliticianProfile } from "@/components/politician/politician-profile";

interface Politician {
  id: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district?: string;
  _count: {
    votes: number;
    contributions: number;
    investments: number;
    expenditures: number;
  };
}

interface PageProps {
  params: { id: string };
}

export default async function PoliticianPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  const politician = await prisma.politician.findUnique({
    where: { id },
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

  if (!politician) {
    notFound();
  }

  return <PoliticianProfile politician={politician} />;
}
