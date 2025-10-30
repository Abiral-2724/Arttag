import client from "../prisma.js";

// import { PrismaClient } from "@prisma/client";

// const client = new PrismaClient() ;


export const moveFromWishListTocart = async(req ,res) => {
    try{
        const {userId ,productId} = req.body ;

        if(!userId || !productId){
            return res.status(400).json({
                success : false ,
                message : 'all fields are required'
            })
        }

        const product = await client.product.findFirst({
            where : {
                id : productId
            }
        })

        if(!product){
          
                return res.status(400).json({
                    success : false ,
                    message : 'no product found with this id'
                })
            
        }

        const removeWishlist =  await client.wishlist.deleteMany({
            where : {
                userId : userId ,
                productId : productId
            }
        })

        if(removeWishlist.count === 0){

            return res.status(400).json({
                success : false ,
                message : 'no such product found in wishlist'
            })
        }
       
        const checkCart = await client.cartItems.findFirst({
            where : {
                ownerId : userId ,
                productId : productId
            }
        })

        if(checkCart){
            return res.status(200).json({
                success : true ,
                message : 'Product already added to cart' ,
                cart : checkCart
            })
        }

        const cart = await client.cartItems.create({
            data : {
                ownerId : userId ,
                productId : productId
            }
        })

        return res.status(200).json({
            success : true ,
            message : 'Product added to cart and removed from wishlist' ,
            cart : cart
        })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while movinf item from wishlist to cart,please try again later !'
        })
    }
}

export const addProductToUserWishlist = async(req ,res) => {
    try{
        const {userId ,productId} = req.body ; 

        if(!userId || !productId){
            return res.status(400).json({
                success : false ,
                message : 'all fields are required'
            })
        }

        const product = await client.product.findFirst({
            where : {
                id : productId
            }
        })

        if(!product){
          
                return res.status(400).json({
                    success : false ,
                    message : 'no product found with this id'
                })
            
        }

        const findwishlist = await client.wishlist.findFirst({
            where : {
                userId : userId ,
                productId : productId
            }
        })

        if(findwishlist){
          
            return res.status(400).json({
                success : false ,
                message : 'product already added to user wishlist'
            })
        
        }

        const wishlist = await client.wishlist.create({
            data : {
                userId : userId ,
                productId : productId
            }
        })

        return res.status(200).json({
            success : true ,
            message : 'product added to wishlist' ,
            wishlist : wishlist ,
            productImage : product.primaryImage1 ,
            productName : product.name,
            orginalPrice : product.originalPrice ,
            discountPrice : product.discountPrice
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while adding product to user wishlist ,please try again later !'
        })
    }
}

export const getUserWishList = async(req ,res) => {
    try{
        const userId = req.params.userId 

        const wishlist = await client.wishlist.findMany({
            where : {
                userId : userId
            } ,
            include : {product : true}
        })

        return res.status(200).json({
            success : true ,
            message : "user wishlist found succesfully" ,
            wishlist : wishlist
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting user wishlist ,please try again later !'
        })
    }
}


export const deleteItemsFromUserWishList = async(req ,res) => {
    try{
        const {userId ,productId} = req.body ; 

        if(!userId || !productId){
            return res.status(400).json({
                success : false ,
                message : 'all fields are required'
            })
        }

        const product = await client.product.findFirst({
            where : {
                id : productId
            }
        })

        if(!product){
          
                return res.status(400).json({
                    success : false ,
                    message : 'no product found with this id'
                })
            
        }

        const wishlist = await client.wishlist.deleteMany({
            where : {
                userId : userId ,
                productId : productId
            }
        })

        return res.status(200).json({
            success : true ,
            message : 'deleted item from user wishlist' ,
            wishlist : wishlist ,
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while deleting item from user wishlist ,please try again later !'
        })
    }
}

