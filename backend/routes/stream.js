import express from 'express';
import { fetchKaggleData } from '../utils/kaggle.js';

const router = express.Router();

router.get('/emissions', async (req, res) => {
  // Setup Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connected message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Stream initialized' })}\n\n`);

  try {
    const dataset = await fetchKaggleData();
    let currentIndex = 0;

    // Stream a new data point every 3 seconds to simulate real-time IoT sensors
    const interval = setInterval(() => {
      if (currentIndex >= dataset.length) {
        currentIndex = 0; // Loop back for continuous simulation
      }

      const rawDataRow = dataset[currentIndex];
      
      // Map the raw Kaggle data (or mock data) to our dashboard format
      // We add some dynamic noise to make it look active and real-time
      const randomNoise = (Math.random() * 20) - 10;
      
      const streamPayload = {
        timestamp: new Date().toISOString(),
        scope1: rawDataRow.scope1 ? parseInt(rawDataRow.scope1) + randomNoise : 350 + randomNoise,
        scope2: rawDataRow.scope2 ? parseInt(rawDataRow.scope2) + randomNoise : 270 + randomNoise,
        scope3: rawDataRow.scope3 ? parseInt(rawDataRow.scope3) + randomNoise : 780 + randomNoise,
        esgScore: 82 + (Math.random() * 1.5 - 0.5), // Fluctuates slightly
        alert: Math.random() > 0.95 ? 'Anomaly detected in Supplier network' : null,
        target: 1500
      };

      res.write(`data: ${JSON.stringify(streamPayload)}\n\n`);
      currentIndex++;
    }, 3000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      console.log('Client disconnected from emissions stream');
    });

  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to stream data' })}\n\n`);
    res.end();
  }
});

export default router;
