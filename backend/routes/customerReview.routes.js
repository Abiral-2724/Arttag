import express from 'express' ;
import { addProductReview, deleteProductReview, getAllProductreview } from '../controllers/productcustomerreview.controller.js';

const router = express.Router() ;

router.post('/add/product/review' ,addProductReview)

router.delete('/delete/product' , deleteProductReview)

router.get('/all/review/:productId' ,getAllProductreview)

export default router ;