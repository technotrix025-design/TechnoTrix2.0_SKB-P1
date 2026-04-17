import https from 'https';
import AdmZip from 'adm-zip';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Global cache for parsed dataset
let datasetCache = [];

export const fetchKaggleData = async () => {
  if (datasetCache.length > 0) return datasetCache;

  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;

  if (!username || !key) {
    console.error('Kaggle credentials missing');
    return getMockData(); // fallback
  }

  const datasetOwner = 'yoannboyere';
  const datasetName = 'co2-ghg-emissionsdata';
  const url = `https://www.kaggle.com/api/v1/datasets/download/${datasetOwner}/${datasetName}`;

  try {
    console.log('Downloading Kaggle dataset...');
    const auth = Buffer.from(`${username}:${key}`).toString('base64');

    const zipBuffer = await downloadFile(url, auth);
    console.log('Download complete. Unzipping...');
    
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    // Find the first CSV file in the zip
    const csvEntry = zipEntries.find(entry => entry.entryName.endsWith('.csv'));
    
    if (!csvEntry) {
      throw new Error('No CSV file found in the Kaggle dataset zip');
    }

    const csvData = csvEntry.getData();
    const results = await parseCSV(csvData);
    
    console.log(`Parsed ${results.length} rows from Kaggle dataset.`);
    datasetCache = results;
    return results;

  } catch (error) {
    console.error('Failed to fetch/parse Kaggle data:', error.message);
    console.log('Falling back to robust simulated data generation for the stream.');
    datasetCache = getMockData();
    return datasetCache;
  }
};

// Helper to handle redirects and download buffer
function downloadFile(url, auth) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        // Handle redirect
        https.get(res.headers.location, (redirectRes) => {
          let data = [];
          redirectRes.on('data', chunk => data.push(chunk));
          redirectRes.on('end', () => resolve(Buffer.concat(data)));
          redirectRes.on('error', reject);
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
        res.on('error', reject);
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    });
    req.on('error', reject);
  });
}

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        // only keep some reasonable data to prevent memory overflow
        if (results.length < 5000) {
          results.push(data);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Fallback high-quality mock data generator if Kaggle API fails
function getMockData() {
  const mockData = [];
  const baseValue = 1500;
  for (let i = 0; i < 1000; i++) {
    mockData.push({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      scope1: Math.floor(baseValue * 0.3 + Math.random() * 50 - 25),
      scope2: Math.floor(baseValue * 0.2 + Math.random() * 40 - 20),
      scope3: Math.floor(baseValue * 0.5 + Math.random() * 100 - 50),
      supplierScore: Math.floor(70 + Math.random() * 20),
    });
  }
  return mockData;
}
