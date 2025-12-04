import express from "express" 
import { addCartItemsAsAGift, addCoupenDiscountAmountToTheCart, addingProductToUserCart, decreaseProductcount, deletingProductFromUserCart, gettingAllProductOfUserCart, getTotalCountOfProductInCart, getTotalProductUserCartOrderDetailsWithUserId, increaseProductcount, moveFromCartToWishList, removeCartItemsFromGift } from "../controllers/cart.controllers.js";

const router = express.Router() ;

router.post('/add/product/user/cart' ,addingProductToUserCart) ;
router.delete('/delete/product/user/cart' ,deletingProductFromUserCart) ; 

router.get('/:userId/get/all/user/cart/product' ,gettingAllProductOfUserCart) ; 

router.patch('/update/product/count' ,increaseProductcount)  ;

router.patch('/decrease/product/count' ,decreaseProductcount) ;

router.patch('/move/product/cart/to/wishlist' ,moveFromCartToWishList) ;

router.get('/:userId/get/product/total/count' ,getTotalCountOfProductInCart);

router.get('/:userId/cart/summary' ,getTotalProductUserCartOrderDetailsWithUserId)

router.patch('/add/coupendiscount/amount' ,addCoupenDiscountAmountToTheCart)

router.patch('/add/cart/item/gift' ,addCartItemsAsAGift ) ; 
router.patch('/remove/cart/item/gift' , removeCartItemsFromGift) ; 

export default router;