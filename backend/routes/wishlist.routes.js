import express from "express"
import { addProductToUserWishlist, deleteItemsFromUserWishList, getUserWishList, moveFromWishListTocart } from "../controllers/wishlist.controllers.js";

const router = express.Router() ;

router.post('/add/product/user/wishlist' ,addProductToUserWishlist)

router.delete('/delete/item/user/wishlist' ,deleteItemsFromUserWishList)

router.get("/:userId/get/all/items/wishlist" ,getUserWishList)

router.patch('/move/wishlist/to/cart' ,moveFromWishListTocart)

export default router ;