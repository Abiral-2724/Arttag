import express from 'express' ; 
import { getAllReturns, getReturnById, getUserReturns, initiateRefund, markProductPicked, requestReturn, updateReturnStatus } from '../controllers/return.controllers.js';

const router = express.Router() ; 

router.post('/request/return' ,requestReturn) 

router.patch('/update/return/request/:returnId' ,updateReturnStatus)

router.patch('/update/product/picked/:returnId' ,markProductPicked)

router.post('/initiate/refund/:returnId' ,initiateRefund) 

router.get('/get/all/return' ,getAllReturns)

router.get('/get/user/:userId/return' ,getUserReturns)

router.get('/get/return/by/id' ,getReturnById)

export default router ; 