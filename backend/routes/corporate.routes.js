import express from 'express' 
import { addRequest, searchByCompanyNameOrCompanyEmail, updateStatus, viewAllRequest } from '../controllers/corporate.controllers.js';

const router = express.Router() ;


router.post('/add/request' ,addRequest) ; 

router.get('/get/all/request' ,viewAllRequest) ; 

router.patch('/update/status' ,updateStatus)

router.get('/search' ,searchByCompanyNameOrCompanyEmail) ;

export default router ;