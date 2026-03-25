import { PrismaClient } from '@prisma/client';
import { fecAPI } from '../src/lib/api/fec';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting financial data scraping...');

  // Get all politicians with FEC IDs
  const politicians = await prisma.politician.findMany({
    where: {
      fecCandidateId: {
        not: null,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      fecCandidateId: true,
    },
  });

  console.log(`Found ${politicians.length} politicians with FEC IDs`);

  for (const politician of politicians) {
    console.log(`Processing ${politician.firstName} ${politician.lastName}...`);

    try {
      // Get independent expenditures
      const expenditures = await fecAPI.getIndependentExpenditures(politician.fecCandidateId!);
      
      // Convert expenditures to contributions
      for (const exp of expenditures) {
        await prisma.contribution.upsert({
          where: {
            id: `fec-${exp.committee_id}-${exp.expenditure_date}`,
          },
          update: {
            amount: exp.expenditure_amount,
            date: new Date(exp.expenditure_date),
            source: exp.committee_name,
            type: exp.support_oppose_indicator === 'S' ? 'Support' : 'Oppose',
            industry: 'Political Committee', // We could enhance this with committee type data
          },
          create: {
            id: `fec-${exp.committee_id}-${exp.expenditure_date}`,
            amount: exp.expenditure_amount,
            date: new Date(exp.expenditure_date),
            source: exp.committee_name,
            type: exp.support_oppose_indicator === 'S' ? 'Support' : 'Oppose',
            industry: 'Political Committee',
            politicianId: politician.id,
          },
        });
      }

      // Search for candidate committees
      const searchResults = await fecAPI.searchCandidates(
        `${politician.firstName} ${politician.lastName}`
      );
      
      const candidateCommittees = searchResults
        .filter(result => result.candidate_id === politician.fecCandidateId)
        .map(result => result.principal_committees?.[0]?.committee_id)
        .filter(Boolean);

      // Get committee contributions
      for (const committeeId of candidateCommittees) {
        const contributions = await fecAPI.getCommitteeContributions(committeeId);
        
        for (const contrib of contributions) {
          await prisma.contribution.upsert({
            where: {
              id: `fec-${contrib.committee_id}-${contrib.contribution_receipt_date}`,
            },
            update: {
              amount: contrib.contribution_receipt_amount,
              date: new Date(contrib.contribution_receipt_date),
              source: contrib.committee_name,
              type: contrib.entity_type,
              industry: contrib.entity_type_desc,
            },
            create: {
              id: `fec-${contrib.committee_id}-${contrib.contribution_receipt_date}`,
              amount: contrib.contribution_receipt_amount,
              date: new Date(contrib.contribution_receipt_date),
              source: contrib.committee_name,
              type: contrib.entity_type,
              industry: contrib.entity_type_desc,
              politicianId: politician.id,
            },
          });
        }
      }

      console.log(`Processed financial data for ${politician.firstName} ${politician.lastName}`);
    } catch (error) {
      console.error(
        `Error processing ${politician.firstName} ${politician.lastName}:`,
        error
      );
    }
  }

  console.log('Finished scraping financial data');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
