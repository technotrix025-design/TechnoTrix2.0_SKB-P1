import express from 'express';
import { getEmissionForecast, runScenarioAnalysis, evaluateSupplier, chatWithAI, forecastWithAI, analyzeESG } from '../controllers/aiCtrl.js';
import { parseDocument } from '../controllers/documentCtrl.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.post('/chat', chatWithAI);

router.get('/forecast', getEmissionForecast);
router.post('/forecast', forecastWithAI);
router.post('/scenario', runScenarioAnalysis);
router.get('/supplier-score/:id', evaluateSupplier);
router.post('/esg-analyze', analyzeESG);

// Document parsing — accepts single file as "document" field
router.post('/parse-document', uploadMiddleware.single('document'), parseDocument);

export default router;
