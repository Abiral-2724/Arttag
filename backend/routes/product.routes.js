import express from "express";
import { productUpload } from "../middlewares/multer.js";
import { addProduct, allDetails, deleteProductById, editProductDetails, getAllProduct, getallProductoftheCategory, getAllTypeOfProductInSubcategory, getProductBySpecificType, getProductDetailsById, searchProduct, updateStockOfProduct } from "../controllers/product.controllers.js";

const router = express.Router() ; 

router.post("/admin/:userId/add/product/:categoryId" ,productUpload ,addProduct)

router.get("/get/product/details/:productId" ,getProductDetailsById)

router.get('/get/all/product/category/:categoryId' ,getallProductoftheCategory)

router.delete("/:userId/delete/product" ,deleteProductById)

router.get('/get/all/product' ,getAllProduct)

router.get('/all/website/details' ,allDetails)

router.get('/get/product/bytype/:subcategoryId' ,getProductBySpecificType)

router.get('/get/product/subcategory/all/type/:subcategoryId' ,getAllTypeOfProductInSubcategory)

router.get('/search/product' ,searchProduct)

router.patch('/update/stock' ,updateStockOfProduct) ; 

router.patch('/edit/product/:productId' ,productUpload ,editProductDetails)

export default router ; 