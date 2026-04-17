import express from 'express';
import { addEmission, getEmissionsSummary, getAllEmissions } from '../controllers/emissionCtrl.js';

const router = express.Router();

router.post('/', addEmission);
router.get('/summary', getEmissionsSummary);
router.get('/', getAllEmissions);

export default router;
