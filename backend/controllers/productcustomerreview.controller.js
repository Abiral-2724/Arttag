import client from "../prisma.js";


export const addProductReview = async(req ,res) =>{
    try{
            const {productId ,title ,description ,rating,userId} = req.body ; 

            if(!productId){
                return res.status(400).json({
                    success: false,
                    message: "Missing productId",
                  });
            }

            if(!userId){
                return res.status(400).json({
                    success: false,
                    message: "Missing user id",
                  });
            }

            const newReview = await client.customerReview.create({
                data : {
                    userId : userId ,
                    productId : productId ,
                    title : title ,
                    description : description  ,
                    rating : rating
                }
            })

            return res.status(200).json({
                success: true,
                message: "Product review added successfully",
                review : newReview
              });

    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while adding product review ,please try again later !'
        })
    }
}

export const deleteProductReview = async(req ,res) =>{
    try{
        const { userId ,reviewId} = req.body ; 

        if(!reviewId){
            return res.status(400).json({
                success: false,
                message: "Missing reviewId",
              });
        }

        if(!userId){
            return res.status(400).json({
                success: false,
                message: "Missing user id",
              });
        }

        const reviewExits = await client.customerReview.findFirst({
            where : {
                id : reviewId
            }
        })

        console.log(reviewExits)

        if(!reviewExits){
            return res.status(400).json({
                success: false,
                message: "no such review exits",
              });
        }

        if(reviewExits.userId !== userId){
            return res.status(400).json({
                success: false,
                message: "you have no right to delete review",
              });
        }

        const deletereview = await client.customerReview.delete({
            where : {
                id : reviewId
            }
        })

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
          });
    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while deleting product review ,please try again later !'
        })
    }
}

export const getAllProductreview = async(req ,res) =>{
    try{
        const productId = req.params.productId; 
        if(!productId){
            return res.status(400).json({
                success : false ,
                message : "Missing product Id ! "
            })
        }
            const allProductReview = await client.customerReview.findMany({
                where : {
                    productId : productId
                } ,
                include : {
                    user : {
                        select : {
                            id : true ,
                            name : true ,
                        }
                    }
                } ,
                orderBy : {
                    createdAt: "desc"
                }
            })

            return res.status(200).json({
                success : true ,
                message : "All review got successfully" ,
                productReview : allProductReview
            })
    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting all product review ,please try again later !'
        })
    }
}

