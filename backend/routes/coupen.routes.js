import express from 'express' 
import { addCoupenCode, addPincode, applyCoupenCode, checkPincode, getAllCoupens, getAllPincode } from '../controllers/coupens.controllers.js';

const router = express.Router() ; 

router.post('/add/coupen/code' ,addCoupenCode)

router.post('/apply/coupen' ,applyCoupenCode)

router.post('/add/pincode' , addPincode) 
router.post('/check/pincode' ,checkPincode)

router.get('/all/coupens' , getAllCoupens) ; 

router.get('/all/pincode' ,getAllPincode ) ; 

export default router ;