import { prisma } from '@/lib/prisma';
import { fecClient } from '@/lib/api/fec-client';

async function syncPoliticianData(name: string) {
  console.log(`Syncing data for ${name}...`);
  
  // Split name into first and last name
  const [firstName, lastName] = name.split(' ');
  
  // Search for the politician
  const candidates = await fecClient.searchCandidates(name);
  console.log('Found candidates:', candidates);

  if (candidates.length === 0) {
    console.log('No candidates found');
    return;
  }

  const candidate = candidates[0];
  console.log('Selected candidate:', candidate);

  // Get or create politician record
  let politician = await prisma.politician.findFirst({
    where: {
      firstName,
      lastName,
    }
  });

  if (!politician) {
    console.log('No politician found in database');
    politician = await prisma.politician.create({
      data: {
        firstName,
        lastName,
        party: candidate.party,
        state: candidate.state,
        district: candidate.district,
        office: candidate.office,
        fecCandidateId: candidate.candidate_id,
      }
    });
    console.log('Created politician in database:', politician);
  } else {
    console.log('Found politician in database:', politician);
  }

  // Get committees
  const committees = await fecClient.getCandidateCommittees(candidate.candidate_id);
  console.log(`Found ${committees.length} committees:`, committees);

  // Get contributions for each committee
  for (const committee of committees) {
    console.log(`\nProcessing committee: ${committee.name}`);
    
    // Get contributions
    const contributions = await fecClient.getCommitteeContributions(committee.committee_id);
    console.log(`Found ${contributions.length} contributions`);
    
    // Process contributions
    for (const contribution of contributions) {
      console.log('Creating contribution:', {
        politicianId: politician.id,
        amount: contribution.contribution_receipt_amount,
        date: new Date(contribution.contribution_receipt_date),
        source: contribution.contributor_name || "Unknown",
        industry: contribution.contributor_occupation || "Unknown",
        type: contribution.entity_type || "Individual",
      });
      
      await prisma.contribution.create({
        data: {
          politicianId: politician.id,
          amount: contribution.contribution_receipt_amount,
          date: new Date(contribution.contribution_receipt_date),
          source: contribution.contributor_name || "Unknown",
          industry: contribution.contributor_occupation || "Unknown",
          type: contribution.entity_type || "Individual",
        }
      }).catch(error => {
        console.error('Error creating contribution:', error);
      });
    }
  }

  // Get and process independent expenditures
  const expenditures = await fecClient.getIndependentExpenditures({
    candidate_id: candidate.candidate_id
  });

  console.log(`Found ${expenditures.length} independent expenditures:`, expenditures);

  for (const expenditure of expenditures) {
    console.log('Creating expenditure:', {
      politicianId: politician.id,
      amount: expenditure.expenditure_amount || 0,
      date: new Date(expenditure.expenditure_date || expenditure.disbursement_dt),
      industry: expenditure.purpose || 'Independent Expenditure',
      type: expenditure.committee?.committee_type_full || 'PAC',
      source: expenditure.committee?.name || expenditure.payee_name || 'Unknown'
    });
    
    try {
      await prisma.expenditure.create({
        data: {
          politicianId: politician.id,
          amount: expenditure.expenditure_amount || 0,
          date: new Date(expenditure.expenditure_date || expenditure.disbursement_dt),
          industry: expenditure.purpose || 'Independent Expenditure',
          type: expenditure.committee?.committee_type_full || 'PAC',
          source: expenditure.committee?.name || expenditure.payee_name || 'Unknown'
        }
      });
    } catch (error) {
      console.error('Error creating expenditure:', error);
    }
  }

  console.log('Sync complete!');
}

// Sync data for Ted Cruz
const name = "Ted Cruz";
const [firstName, lastName] = name.split(" ");
syncPoliticianData(name).catch(console.error);
