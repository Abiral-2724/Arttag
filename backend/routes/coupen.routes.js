import express from 'express' 
import { addBulkPincodes, addCoupenCode, addPincode, applyCoupenCode, checkallpincode, checkPincode, deletePincode, getAllCoupens, getAllPincode } from '../controllers/coupens.controllers.js';

const router = express.Router() ; 

router.post('/add/coupen/code' ,addCoupenCode)

router.post('/apply/coupen' ,applyCoupenCode)

router.post('/add/pincode' , addPincode) 
router.post('/check/pincode' ,checkPincode)

router.delete('/pincode/:id', deletePincode);
router.post('/pincode/bulk', addBulkPincodes);

router.post('/check/pincode/dumy' ,checkallpincode)

router.get('/all/coupens' , getAllCoupens) ; 

router.get('/all/pincode' ,getAllPincode ) ; 

export default router ;