export const config = {
  api: {
    propublica: {
      key: process.env.NEXT_PUBLIC_PROPUBLICA_API_KEY,
      required: true,
    },
    opensecrets: {
      key: process.env.NEXT_PUBLIC_OPENSECRETS_API_KEY,
      required: true,
    },
    fec: {
      key: process.env.NEXT_PUBLIC_FEC_API_KEY,
      required: true,
    },
  },
  features: {
    realTimeUpdates: true,
    socialSharing: true,
    dataVisualization: true,
  },
  urls: {
    propublicaApi: 'https://api.propublica.org/congress/v1',
    openSecretsApi: 'http://www.opensecrets.org/api',
    fecApi: 'https://api.open.fec.gov/v1',
  },
} as const;

// Validate required environment variables
Object.entries(config.api).forEach(([name, settings]) => {
  if (settings.required && !settings.key) {
    throw new Error(
      `Missing required environment variable for ${name}. Please check your .env file.`
    );
  }
});
