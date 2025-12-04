import express from 'express' 
import { createCategoryOrCreateSubCategory, getallCategory, getallSubCategory, getallSubCategoryOfTheCategory } from '../controllers/category.controllers.js';
import upload from '../middlewares/multer.js';

const router = express.Router() ;


router.post('/:userId/add/category/or/subcategory' ,upload.single('image'),createCategoryOrCreateSubCategory)

router.get('/get/all/category' ,getallCategory) ; 

router.get('/get/:categoryId/all/subcategory' ,getallSubCategoryOfTheCategory) ;

router.get('/get/all/subcategory' ,getallSubCategory)

export default router ;