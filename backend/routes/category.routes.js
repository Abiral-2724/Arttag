import express from 'express' 
import { createCategoryOrCreateSubCategory, deleteCategory, getallCategory, getallSubCategory, getallSubCategoryOfTheCategory, getCategoryById, updateCategory } from '../controllers/category.controllers.js';
import upload from '../middlewares/multer.js';

const router = express.Router() ;


router.post('/:userId/add/category/or/subcategory' ,upload.single('image'),createCategoryOrCreateSubCategory)

router.get('/get/all/category' ,getallCategory) ; 

router.get('/get/:categoryId/all/subcategory' ,getallSubCategoryOfTheCategory) ;

router.get('/get/all/subcategory' ,getallSubCategory)

router.get('/category/get/:categoryId', getCategoryById);

router.patch('/category/update/:userId/:categoryId', upload.single('image'), updateCategory);

router.delete('/category/delete/:userId/:categoryId', deleteCategory);


export default router ;