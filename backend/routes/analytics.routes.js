import express from 'express';
import { getProductEngagement } from '../controllers/analytics.controllers.js';

const router = express.Router();
router.get('/product-engagement', getProductEngagement);
export default router;