import express from 'express';
import { addSupplier, getSuppliers, reportSupplierEmissions } from '../controllers/supplierCtrl.js';

const router = express.Router();

router.post('/', addSupplier);
router.get('/', getSuppliers);
router.post('/:supplierId/emissions', reportSupplierEmissions);

export default router;
