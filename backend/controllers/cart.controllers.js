import client from "../prisma.js";

// import { PrismaClient } from "@prisma/client";

// const client = new PrismaClient() ;


export const moveFromCartToWishList = async(req ,res) => {
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

        const removefromcart = await client.cartItems.deleteMany({
            where : {
                ownerId : userId ,
                productId : productId
            }
        })

        if(removefromcart.count === 0){

            return res.status(400).json({
                success : false ,
                message : 'no such product found in cart'
            })
        }

        const findwishlist = await client.wishlist.findFirst({
            where : {
                userId : userId ,
                productId : productId
            }
        })

        if(findwishlist){

            return res.status(200).json({
                success : true ,
                message : 'Product already added to wislist' ,
                wishlist : findwishlist
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
            message : 'Product added to wislist and removed from cart' ,
            wishlist : wishlist
        })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error moving item from cart to wishlist ,please try again later !'
        })
    }
}

export const addingProductToUserCart = async(req ,res) => {
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

            const checkproduct = await client.cartItems.findFirst({
                where : {
                    ownerId : userId ,
                    productId : productId
                }
            })

            if(checkproduct){
                return res.status(400).json({
                    success : false ,
                    message : 'Product already added to cart'
                })
            }

            const cart = await client.cartItems.create({
                data:{
                    ownerId : userId ,
                    productId : productId
                }
            });

            return res.status(200).json({
                success : true ,
                message : 'Product added to cart succesffuly' ,
                cart : cart
            })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while adding product to using cart ,please try again later !'
        })
    }
}

export const deletingProductFromUserCart = async(req ,res) => {
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

        const checkproduct = await client.cartItems.findFirst({
            where : {
                ownerId : userId ,
                productId : productId
            }
        })

        if(!checkproduct){
            return res.status(400).json({
                success : false ,
                message : 'Product already removed from the cart'
            })
        }

        const cart = await client.cartItems.deleteMany({
            where : {
                ownerId : userId ,
                productId : productId
            }
        })


        return res.status(200).json({
            success : true ,
            message : 'Product deleted from cart succesffuly' ,
            cart : cart
        })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting all the product ,please try again later !'
        })
    }
}

export const gettingAllProductOfUserCart = async(req ,res) => {
    try{
        const userId = req.params.userId ; 

        const cart = await client.cartItems.findMany({
            where : {
                ownerId : userId
            } ,
            include : {
                product : true
            }
        })

        // console.log(cart)

        let totalOrginalPrice = 0 ;
        let totalItems = 0 ; 
        let totalDiscount = 0 ;

        for(let c of cart){
            totalItems = totalItems + c.quantity ;
            totalOrginalPrice = totalOrginalPrice + (c.product.originalPrice * c.quantity) ; 
            totalDiscount = totalDiscount + ((c.quantity*c.product.originalPrice) - (c.quantity*c.product.discountPrice))
        }

        let grandTotal = totalOrginalPrice - totalDiscount ; 
        let priceSaved = totalDiscount ;


        return res.status(200).json({
            success : true ,
            message : 'all product of user cart found succesfully' ,
            totalItems : totalItems ,
            totalOrginalPrice : totalOrginalPrice ,
            totalDiscount : totalDiscount ,
            grandTotal : grandTotal ,
            priceSaved : priceSaved ,
            cart : cart
        })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting all the product ,please try again later !'
        })
    }
}

export const increaseProductcount = async(req ,res) => {
    try{
        const {productId ,userId ,productCount} = req.body ;

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

        const cartdetails = await client.cartItems.findFirst({
            where : {
                ownerId : userId ,
                productId : productId
            }
        })
       // console.log(cartdetails) ; 
        if(cartdetails.quantity !== productCount){
            return res.status(400).json({
                success : false ,
                message : 'invalid product count'
            })
        
        }

        const cart = await client.cartItems.update({
            where : {
                id : cartdetails.id
            },
            data : {
                quantity : productCount + 1 
            }
        })

        return res.status(200).json({
             success : true ,
                    message : 'product count added succesfully'
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while increasing product ,please try again later !'
        })
    }
}

export const decreaseProductcount = async(req ,res) => {
    try{
        const {productId ,userId ,productCount} = req.body ;

        if(!userId || !productId){
            return res.status(400).json({
                success : false ,
                message : 'all fields are required'
            })
        }

        if(productCount === 0){
            return res.status(400).json({
                success : false ,
                message : 'product quantity count can not be decreased further'
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

        const cartdetails = await client.cartItems.findFirst({
            where : {
                ownerId : userId ,
                productId : productId
            }
        })
       
        if(cartdetails.quantity !== productCount){
            return res.status(400).json({
                success : false ,
                message : 'invalid product count'
            })
        
        }

        const cart = await client.cartItems.update({
            where : {
                id : cartdetails.id
            },
            data : {
                quantity : productCount - 1 
            }
        })

        return res.status(200).json({
             success : true ,
                    message : 'product count decreased succesfully'
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while increasing product ,please try again later !'
        })
    }
}

export const getTotalCountOfProductInCart = async(req ,res) =>{
    
        try {
          const userId = req.params.userId;
      
          // Fetch all cart items for that user
          const cartItems = await client.cartItems.findMany({
            where: {
              ownerId: userId,
            },
            select: {
              quantity: true, // no need to include product details
            },
          });
      
          // Sum up all quantities
          const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      
          return res.status(200).json({
            success: true,
            message: 'total product count fetched successfully',
            totalCount: totalCount,
          });
        } catch (e) {
          console.log(e);
          return res.status(500).json({
            success: false,
            message: 'error while getting count of total products, please try again later!',
          });
        }
      };
      
export const getTotalProductUserCartOrderDetailsWithUserId = async(req ,res) => {
    try{
            const userId = req.params.userId ; 

            if (!userId) {
                return res.status(400).json({
                  success: false,
                  message: "User ID is required.",
                });
              }

            const cartdetails = await client.cartItems.findMany({
                where : {
                    ownerId : userId
                } ,
                include : {
                    product : true 
                }
            })

            let totalItem = 0 ;
            let totalamount = 0 ;
            let shippingCharge = 0 ; 
            for(let cart of cartdetails){
                totalItem = totalItem + cart.quantity ;
                totalamount = totalamount + (cart.product.discountPrice*cart.quantity) ; 
            }

            if(totalamount < 1199 && totalItem > 0){
                shippingCharge = 79
            }
            return res.status(200).json({
                success : true ,
                message : "cart details found successfully" ,
                totalItem : totalItem ,
                totalamount : totalamount ,
                shippingCharge : shippingCharge ,
               
            })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({
          success: false,
          message: 'error while getting total product details of user card, please try again later!',
        });
    }
}