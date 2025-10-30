import express from 'express' 
import { addCoupenCode, applyCoupenCode } from '../controllers/coupens.controllers.js';

const router = express.Router() ; 

router.post('/add/coupen/code' ,addCoupenCode)

router.post('/apply/coupen' ,applyCoupenCode)

export default router ;