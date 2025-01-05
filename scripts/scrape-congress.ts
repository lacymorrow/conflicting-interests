import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { parse } from 'date-fns';
import { fecClient } from '../src/lib/api/fec-client';

const prisma = new PrismaClient();

async function scrapeHouseMembers() {
  console.log('Scraping House members...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.house.gov/representatives');
    await page.waitForSelector('table');

    const members = await page.evaluate(() => {
      const members: any[] = [];
      const rows = document.querySelectorAll('table tr');

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const nameCell = cells[0];
          const partyCell = cells[1];
          const stateCell = cells[2];
          const districtCell = cells[3];

          // Clean up the name by removing "(link is external)"
          const fullName = nameCell.textContent?.replace('(link is external)', '').trim() || '';
          const [firstName, ...lastNameParts] = fullName.split(' ');
          const lastName = lastNameParts.join(' ');

          // Clean up other fields
          const party = partyCell.textContent?.trim() || '';
          const stateDistrict = stateCell.textContent?.trim() || '';
          const state = stateDistrict.split(' ')[0];
          const district = districtCell.textContent?.trim() || '';

          members.push({
            firstName,
            lastName,
            party,
            state,
            district,
            office: 'House'
          });
        }
      });
      return members;
    });

    console.log(`Scraped ${members.length} House members`);
    return members;
  } finally {
    await browser.close();
  }
}

async function scrapeSenateMembers() {
  console.log('Scraping Senate members...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.senate.gov/senators/');
    
    // Wait for any table to load
    await page.waitForSelector('table', { timeout: 30000 });

    const members = await page.evaluate(() => {
      const members: any[] = [];
      // Try different possible table selectors
      const rows = Array.from(document.querySelectorAll('table tr'));

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const nameCell = cells[0];
          const partyCell = cells[1];
          const stateCell = cells[2];

          if (nameCell && partyCell && stateCell) {
            // Clean up the name
            const fullName = nameCell.textContent?.trim() || '';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');

            // Clean up other fields
            const party = partyCell.textContent?.trim() || '';
            const state = stateCell.textContent?.trim() || '';

            if (firstName && lastName && party && state) {
              members.push({
                firstName,
                lastName,
                party,
                state,
                district: null,
                office: 'Senate'
              });
            }
          }
        }
      });
      return members;
    });

    console.log(`Scraped ${members.length} Senate members`);
    return members;
  } finally {
    await browser.close();
  }
}

async function scrapeCongressMembers() {
  console.log('\nStarting to scrape Congress members...');

  // Check if we have recently scraped data
  const latestScrape = await prisma.politician.findFirst({
    orderBy: { lastScrapedAt: 'desc' }
  });

  const SCRAPE_THRESHOLD_HOURS = 24;
  if (latestScrape && 
      (new Date().getTime() - latestScrape.lastScrapedAt.getTime()) < SCRAPE_THRESHOLD_HOURS * 60 * 60 * 1000) {
    console.log(`Recent scrape found from ${latestScrape.lastScrapedAt}. Skipping scrape.`);
    return;
  }

  console.log('No recent scrape found or data is stale. Starting fresh scrape...');
  
  const houseMembers = await scrapeHouseMembers();
  const senateMembers = await scrapeSenateMembers();
  
  // Process members and save to database
  const allMembers = [...houseMembers, ...senateMembers];
  console.log(`Processing ${allMembers.length} total members...`);

  for (const member of allMembers) {
    try {
      const fullName = `${member.firstName} ${member.lastName}`;
      console.log(`\nProcessing ${fullName}...`);
      
      // Try to find existing record
      const existing = await prisma.politician.findFirst({
        where: {
          firstName: member.firstName,
          lastName: member.lastName,
          state: member.state,
        }
      });

      if (existing) {
        // Update existing record
        await prisma.politician.update({
          where: { id: existing.id },
          data: {
            party: member.party,
            district: member.district,
            office: member.office,
            lastScrapedAt: new Date(),
          }
        });
        console.log('Updated existing record');
      } else {
        // Create new record
        await prisma.politician.create({
          data: {
            firstName: member.firstName,
            lastName: member.lastName,
            party: member.party,
            state: member.state,
            district: member.district,
            office: member.office,
            lastScrapedAt: new Date(),
          }
        });
        console.log('Created new record');
      }

      // Add delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error processing ${member.firstName} ${member.lastName}:`, error);
    }
  }

  console.log('\nScraping completed successfully');
}

async function scrapeBills() {
  console.log('\nStarting to fetch bills...');
  
  try {
    if (!process.env.CONGRESS_API_KEY) {
      console.error('\nError: CONGRESS_API_KEY environment variable is missing');
      console.error('Please follow these steps:');
      console.error('1. Get an API key from https://api.congress.gov/sign-up/');
      console.error('2. Add it to your .env file:');
      console.error('   CONGRESS_API_KEY=your_api_key_here');
      return;
    }

    const baseUrl = 'https://api.congress.gov/v3';
    const congress = '118';
    const options = {
      headers: {
        'X-API-Key': process.env.CONGRESS_API_KEY
      }
    };

    // Fetch bills from the current Congress
    console.log('Fetching bills from Congress.gov API...');
    const response = await fetch(
      `${baseUrl}/bill/${congress}?limit=250&offset=0`, 
      options
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid API key. Please check your CONGRESS_API_KEY in .env');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const bills = data.bills || [];

    console.log(`Found ${bills.length} bills`);

    // Save to database
    let savedCount = 0;
    let errorCount = 0;

    for (const bill of bills) {
      try {
        // Get detailed bill info
        const detailResponse = await fetch(
          `${baseUrl}/bill/${congress}/${bill.type}/${bill.number}`, 
          options
        );
        
        if (!detailResponse.ok) {
          throw new Error(`Failed to fetch bill details: ${detailResponse.status}`);
        }

        const billDetail = await detailResponse.json();
        const billData = billDetail.bill;

        // Find sponsor if available
        let sponsorId = null;
        if (billData.sponsors && billData.sponsors[0]) {
          const sponsor = billData.sponsors[0];
          if (sponsor.bioguideId) {
            // Try to find by bioguide ID first
            const dbSponsor = await prisma.politician.findFirst({
              where: {
                bioguideId: sponsor.bioguideId
              }
            });
            if (dbSponsor) {
              sponsorId = dbSponsor.id;
            }
          } else if (sponsor.name) {
            // Fallback to name matching if bioguide ID not available
            try {
              let firstName = '', lastName = '';
              if (sponsor.name.includes(',')) {
                [lastName, firstName] = sponsor.name.split(',').map(s => s.trim());
              } else {
                const nameParts = sponsor.name.trim().split(' ');
                lastName = nameParts.pop() || '';
                firstName = nameParts.join(' ');
              }
              
              if (firstName || lastName) {
                const dbSponsor = await prisma.politician.findFirst({
                  where: {
                    AND: [
                      firstName ? { firstName: { contains: firstName } } : {},
                      lastName ? { lastName: { contains: lastName } } : {}
                    ]
                  }
                });
                if (dbSponsor) {
                  sponsorId = dbSponsor.id;
                }
              }
            } catch (error) {
              console.error(`Error parsing sponsor name "${sponsor.name}":`, error);
            }
          }
        }

        // Format bill number
        const billNumber = `${billData.type}${billData.number}`;

        // Upsert bill
        await prisma.bill.upsert({
          where: {
            billNumber: billNumber
          },
          update: {
            title: billData.title,
            summary: billData.summary?.text || '',
            introducedDate: billData.introducedDate ? new Date(billData.introducedDate) : null,
            status: billData.latestAction?.text || '',
            sponsorId
          },
          create: {
            billNumber: billNumber,
            title: billData.title,
            summary: billData.summary?.text || '',
            introducedDate: billData.introducedDate ? new Date(billData.introducedDate) : null,
            status: billData.latestAction?.text || '',
            sponsorId
          }
        });
        savedCount++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing bill ${bill.number}:`, error);
        errorCount++;
      }
    }

    console.log(`\nFinished processing bills:`);
    console.log(`- Successfully saved: ${savedCount}`);
    console.log(`- Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error in fetchBills:', error);
  }
}

// Main function to run all scrapers
async function main() {
  try {
    await scrapeCongressMembers();
    await scrapeBills();
    console.log('\nData collection completed successfully');
  } catch (error) {
    console.error('Error collecting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
