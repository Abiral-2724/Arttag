import client from "../prisma.js";

// import { PrismaClient } from "@prisma/client";

// const client = new PrismaClient() ;

export const addCoupenCode = async (req ,res) => {
    try{
            const {userId , code ,discountPercentage ,minOrderAmount ,validFrom ,validUntil} = req.body ;

            if(!userId || !code || !discountPercentage || !minOrderAmount || !validFrom || !validUntil){
                return res.status(400).json({
                    success : false ,
                    message : 'all fields are required'
                })
            }

            const user = await client.user.findFirst({
                where : {
                    id : userId
                }
            })

            if (!user) {
                return res.status(404).json({
                  success: false,
                  message: 'User not found',
                });
              }

            if(user.role !== "ADMIN"){
                return res.status(400).json({
                    success : false ,
                    message : 'you do not have right to add coupen code'
                })
            }

            if(code.trim().length < 6){
                return res.status(400).json({
                    success : false ,
                    message : 'code must be min of 6 length'
                })
            }

            const modifiedCode = code.trim().toUpperCase();

            const checkcode = await client.couponsCode.findFirst({
                where : {
                    code : modifiedCode
                }
            })

           

            if(checkcode){
                return res.status(400).json({
                    success : false ,
                    message : 'code already exitss please enter a unique code'
                })
            }

            const newCoupon = await client.couponsCode.create({
                data: {
                  code : modifiedCode ,
                  discountPercentage: discountPercentage, 
                  minOrderAmount: minOrderAmount,
                  validFrom: new Date(validFrom),
                  validUntil: new Date(validUntil),
                },
              });
              
              return res.status(201).json({
                success: true,
                message: 'Coupon created successfully.',
                coupon: newCoupon,
              });

    }   
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error adding coupen code ,please try again later !'
        })
    }
}

export const applyCoupenCode = async(req ,res) => {
    try{
        const {code ,totalCartAmount ,currentDate} = req.body ; 

        
        if(!code || !totalCartAmount || !currentDate){
            return res.status(400).json({
                success : false ,
                message : 'all fields are required'
            })
        }

        const coupon = await client.couponsCode.findFirst({
            where : {
                code : code
            }
        })

        if(!coupon){
            return res.status(400).json({
                success : false ,
                message : 'no such code exits'
            })
        }

        if(coupon.isActive === false){
            return res.status(400).json({
                success : false ,
                message : 'the given code is expired'
            })
        }

        const now = new Date(currentDate);
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return res.status(400).json({
        success: false,
        message: 'This coupon code has expired',
      });
    }

    if (coupon.minOrderAmount && Number(coupon.minOrderAmount) > Number(totalCartAmount)) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not valid for the current cart amount',
        });
      }

      const discount = Number(coupon.discountPercentage);
      const discountAmount = (Number(totalCartAmount) * discount) / 100;
      const finalAmount = Number(totalCartAmount) - discountAmount;
  
      return res.status(200).json({
        success: true,
        message: 'Coupon code applied successfully',
        discountPercentage : coupon.discountPercentage
      });

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error applying coupen code ,please try again later !'
        })
    }
}