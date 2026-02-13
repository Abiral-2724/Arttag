import express from "express" 
import { addBlog, deleteBlog, editBlog, getAllBlog, getBlogDetailsByBlogId, searchBlogByTitle } from "../controllers/blog.controllers.js";
import { productUpload } from "../middlewares/multer.js";

const router = express.Router() ;

router.post('/add/blog' ,productUpload,addBlog) ; 

router.patch('/edit/blog' ,productUpload,editBlog) 

router.get('/get/all/blogs' ,getAllBlog)

router.delete('/delete/blog' ,deleteBlog) ; 

router.get('/search/blog' ,searchBlogByTitle) ;

router.get('/details/blog/:id' ,getBlogDetailsByBlogId)

export default router;