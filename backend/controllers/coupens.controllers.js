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

export const getAllCoupens = async(req ,res) => {
    try{
        const coupens = await client.couponsCode.findMany({
            orderBy: {
                createdAt: 'desc'  // optional: newest first
            }
        });

        return res.status(200).json({
            success: true,
            message: "All coupons fetched successfully",
            coupens
        });
    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error getting all coupens'
        })
    }
}

export const deleteCoupon = async (req, res) => {
    try {
      const { id } = req.params;
  
      const coupon = await client.couponsCode.findFirst({ where: { id } });
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
  
      await client.couponsCode.delete({ where: { id } });
  
      return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ success: false, message: 'Error deleting coupon, please try again later!' });
    }
  };
  
  export const editCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const { code, discountPercentage, minOrderAmount, validFrom, validUntil, isActive } = req.body;
  
      const coupon = await client.couponsCode.findFirst({ where: { id } });
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
  
      // If code is being changed, check uniqueness
      if (code) {
        const modifiedCode = code.trim().toUpperCase();
        if (modifiedCode.length < 6) {
          return res.status(400).json({ success: false, message: 'Code must be min 6 characters' });
        }
        const existing = await client.couponsCode.findFirst({
          where: { code: modifiedCode, NOT: { id } }
        });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Code already exists, please enter a unique code' });
        }
      }
  
      const updated = await client.couponsCode.update({
        where: { id },
        data: {
          ...(code              && { code: code.trim().toUpperCase() }),
          ...(discountPercentage !== undefined && { discountPercentage }),
          ...(minOrderAmount     !== undefined && { minOrderAmount }),
          ...(validFrom          && { validFrom: new Date(validFrom) }),
          ...(validUntil         && { validUntil: new Date(validUntil) }),
          ...(isActive           !== undefined && { isActive }),
        },
      });
  
      return res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon: updated });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ success: false, message: 'Error updating coupon, please try again later!' });
    }
  };

export const addPincode = async(req ,res) => {
    try{
        const {pincode} = req.body ; 
        if(String(pincode).length !== 6){
            return res.status(400).json({
                success : false ,
                message : 'invalid picode , please enter the correct pincode'
            })
        }
        const isPincodeAvailable = await client.pincode.findFirst({
            where : {
                pincode : pincode
            }
        })

        if(isPincodeAvailable){
            return res.status(400).json({
                success : false ,
                message : 'Pincode already exits ! enter something else'
            })
        }

       const creatingNewPincode =  await client.pincode.create({
        data : {
            pincode : pincode
        }
       })

       return res.status(200).json({
        success : true ,
        message : 'Pincode added successfully' , 
        pincode : creatingNewPincode
    })

    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error adding pincode ,please try again later !'
        })
    }
}

export const checkPincode = async(req ,res) => {
    try{
        const {pincode} = req.body ; 
        let Pincode = parseInt(pincode) ; 
        if(String(Pincode).length !== 6){
            return res.status(400).json({
                success : false ,
                message : 'invalid picode , please enter the correct pincode'
            })
        }
        const isPincodeAvailable = await client.pincode.findFirst({
            where : {
                pincode : Pincode
            }
        })

        if(!isPincodeAvailable){
            return res.status(400).json({
                success : false ,
                message : 'Pincode not found !'
            })
        }

        return res.status(200).json({
            success : true ,
            message : 'Pincode found successfully ! delivery possible' , 
        })


    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error checking pincode ! '
        })
    }
}

export const getAllPincode = async(req ,res) => {
    try{
        const pincodes = await client.pincode.findMany({
            orderBy: {
                pincode: "asc"   // optional: sort lowest to highest
            }
        });

        return res.status(200).json({
            success: true,
            message: "All pincodes fetched successfully",
            pincodes,
        });
    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error getting all pincode'
        })
    }
}

export const deletePincode = async (req, res) => {
    try {
      const { id } = req.params;
  
      const existingPincode = await client.pincode.findFirst({
        where: { id }
      });
  
      if (!existingPincode) {
        return res.status(404).json({
          success: false,
          message: 'Pincode not found!'
        });
      }
  
      await client.pincode.delete({
        where: { id }
      });
  
      return res.status(200).json({
        success: true,
        message: 'Pincode deleted successfully'
      });
  
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: 'Error deleting pincode, please try again later!'
      });
    }
  };

export const checkallpincode = async(req ,res) => {
    try{
        const {pincode} = req.body ; 
        if(String(pincode).length !== 6){
            return res.status(400).json({
                success : false ,
                message : 'invalid picode , please enter the correct pincode'
            })
        }
       
       return res.status(200).json({
        success : true ,
        message : 'Pincode added successfully' , 
        pincode : pincode
    })

    }catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error adding pincode ,please try again later !'
        })
    }
}
  
  
  export const addBulkPincodes = async (req, res) => {
    try {
      const { pincodes } = req.body;
  
      if (!Array.isArray(pincodes) || pincodes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a non-empty array of pincodes'
        });
      }
  
      // Validate all pincodes before doing anything
      const invalidPincodes = pincodes.filter(p => String(parseInt(p)).length !== 6);
      if (invalidPincodes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid pincodes found: ${invalidPincodes.join(', ')}`
        });
      }
  
      const parsedPincodes = pincodes.map(p => parseInt(p));
  
      // Find which ones already exist
      const existingPincodes = await client.pincode.findMany({
        where: { pincode: { in: parsedPincodes } },
        select: { pincode: true }
      });
  
      const existingSet = new Set(existingPincodes.map(p => p.pincode));
      const newPincodes = parsedPincodes.filter(p => !existingSet.has(p));
  
      if (newPincodes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'All provided pincodes already exist'
        });
      }
  
      const result = await client.pincode.createMany({
        data: newPincodes.map(pincode => ({ pincode })),
        skipDuplicates: true
      });
  
      return res.status(200).json({
        success: true,
        message: `${result.count} pincode(s) added successfully`,
        added: result.count,
        skipped: pincodes.length - result.count,
        skippedPincodes: [...existingSet].filter(p => parsedPincodes.includes(p))
      });
  
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: 'Error adding pincodes, please try again later!'
      });
    }
  };

// export const addCartItemsAsAGift = async(req ,res) => {
//     try{

//     }catch(e){
//         console.log(e) ; 
//         return res.status(500).json({
//             success : false ,
//             message : 'error adding items as gift'
//         })
//     }
// }