import express from 'express' 
import { addStore, deleteStore, getAllStore, searchStore, updateStore } from '../controllers/store.controllers.js';
import { productUpload } from '../middlewares/multer.js';

const router = express.Router() ; 
 
router.post('/add/store' ,productUpload ,addStore)

router.delete('/delete/store' ,deleteStore) ; 

router.patch('/update/store' ,productUpload ,updateStore)

router.get('/search' ,searchStore) ;

router.get('/get/all/store' ,getAllStore)

export default router ;