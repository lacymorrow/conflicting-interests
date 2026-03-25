import { PrismaClient } from '@prisma/client';
import { fecAPI } from '../src/lib/api/fec';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting FEC ID update...');

  // Get all politicians without FEC IDs
  const politicians = await prisma.politician.findMany({
    where: {
      fecCandidateId: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log(`Found ${politicians.length} politicians without FEC IDs`);

  for (const politician of politicians) {
    console.log(`Processing ${politician.firstName} ${politician.lastName}...`);

    try {
      // Search for candidate in FEC database
      const searchResults = await fecAPI.searchCandidates(
        `${politician.firstName} ${politician.lastName}`
      );

      if (searchResults.length > 0) {
        // Take the first result - in a production environment, we'd want to be more careful
        // about matching the correct candidate
        const candidate = searchResults[0];

        await prisma.politician.update({
          where: { id: politician.id },
          data: {
            fecCandidateId: candidate.candidate_id,
          },
        });

        console.log(`Updated FEC ID for ${politician.firstName} ${politician.lastName}`);
      } else {
        console.log(`No FEC data found for ${politician.firstName} ${politician.lastName}`);
      }
    } catch (error) {
      console.error(
        `Error processing ${politician.firstName} ${politician.lastName}:`,
        error
      );
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Finished updating FEC IDs');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
