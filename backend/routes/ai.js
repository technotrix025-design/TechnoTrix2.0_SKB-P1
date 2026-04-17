import express from 'express';
import { getEmissionForecast, runScenarioAnalysis, evaluateSupplier, chatWithAI, forecastWithAI } from '../controllers/aiCtrl.js';

const router = express.Router();

router.post('/chat', chatWithAI);

router.get('/forecast', getEmissionForecast);
router.post('/forecast', forecastWithAI);
router.post('/scenario', runScenarioAnalysis);
router.get('/supplier-score/:id', evaluateSupplier);

export default router;
