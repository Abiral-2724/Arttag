
import client from "../prisma.js";
import dotenv from 'dotenv' 
import bcrypt from 'bcrypt' ;
import jwt from 'jsonwebtoken'

// const client = new PrismaClient()

dotenv.config({});
// import { PrismaClient } from "@prisma/client";

export const registerOrLoginUser = async(req ,res) => {
    try{
            const {phoneNumber} = req.body ;

            if(!phoneNumber){
                return res.status(400).json({
                    success : false ,
                    message : "missing phone number" ,
                   
                })
            }

            const user = await client.user.findFirst({
                where : {
                    phoneNumber : phoneNumber
                }
            })

            let userId = "" ; 

            if(!user){
                const createUser = await client.user.create({
                    data : {
                        phoneNumber : phoneNumber
                    }
                })
                userId = createUser.id
            }else{
                userId = user.id
            }

            const tokenData = {
                id : userId
            }

            const token = await jwt.sign(tokenData ,process.env.JWT_SECRET)

            return res.status(200).json({
                success : true ,
                message : "User Login/created successfully" ,
                phoneNumber : phoneNumber ,
                userId : userId ,
                token : token
            })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while registering / login user ,please try again later !'
        })
    }
}

export const resendOtp = async(req ,res) => {
    try{

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while resending otp ,please try again later !'
        })
    }
}


export const LogoutUser = async(req ,res) => {
    try{

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while registering / login user ,please try again later !'
        })
    }
}

export const editUserProfile = async(req ,res) => {
    try{
               const {name ,email}  = req.body ;
               const userId = req.params.userId ; 

               const response = await client.user.updateMany({
                where : {
                    id : userId
                } ,
                data : {
                    name : name ,
                    email : email
                }
               })


               return res.status(200).json({
                    success : true ,
                    message : "user profile updated successfully" ,
                    updatedProfile : response
               })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while editing user profile ,please try again later !'
        })
    }
}

export const getUserProfile = async(req ,res) => {
    try{
        const userId = req.params.userId ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        })

        return res.status(200).json({
            success : true ,
            message : "user details found successfully" ,
            user : user
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting user profile ,please try again later !'
        })
    }
}

export const addUserAddress = async(req ,res) => {
    try{
            const userId = req.params.userId ; 
            const {fullname ,email ,mobile ,pincode ,city ,state,country ,streetAddress,locality,landmark,GSTIN} = req.body ;

            if(!fullname || !email || !mobile || !pincode 
                || !city || !state || !country || !streetAddress || !locality
            ){
                return res.status(400).json({
                    success : false ,
                    message : "All fields are requried"
                })
            }

            if(mobile.length !== 13){
                return res.status(400).json({
                    success : false ,
                    message : "Invalid Phone number"
                })
            }

            if(mobile[0] !== '+'){
                return res.status(400).json({
                    success : false ,
                    message : "Invalid Phone number"
                })
            }

            if(pincode.length !== 6){
                return res.status(400).json({
                    success : false ,
                    message : "Invalid pincode"
                })
            }
            if(pincode[0] === 0){
                return res.status(400).json({
                    success : false ,
                    message : "Invalid pincode"
                })
            }


            const newaddress = await client.address.createMany({
                data : {
                    ownerId : userId ,
                    fullname : fullname ,
                    email : email ,
                    pincode : pincode ,
                    mobile : mobile ,
                    city : city ,
                    state : state ,
                    country : country ,
                    streetAddress : streetAddress ,
                    locality : locality ,
                    landmark : landmark ,
                    GSTIN : GSTIN
                }
            })


            return res.status(200).json({
                success : true ,
                message : "Address added successfully" ,
                address : newaddress
            })



    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while adding user address ,please try again later !'
        })
    }
}

export const getAllAddress = async(req ,res) => {
    try {
        const userId = req.params.userId ; 

        const address = await client.address.findMany({
            where : {
                ownerId : userId
            }
        })

        return res.status(200).json({
            success : true ,
            message : "user address found successfully" ,
            address : address
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting all address ,please try again later !'
        })
    }
}

export const modifyUserAddress = async(req ,res) => {
    try{
        const userId = req.params.userId ; 
        const {addressId ,fullname ,email ,mobile ,pincode ,city ,state,country ,streetAddress,locality,landmark,GSTIN} = req.body ;

        if(!addressId){
            return res.status(400).json({
                success : false ,
                message : "address id missing"
            })
        }

        if( mobile && mobile.length !== 13){
            return res.status(400).json({
                success : false ,
                message : "Invalid Phone number"
            })
        }

        if(mobile && mobile[0] !== '+'){
            return res.status(400).json({
                success : false ,
                message : "Invalid Phone number"
            })
        }


        if(pincode && pincode.length !== 6){
            return res.status(400).json({
                success : false ,
                message : "Invalid pincode"
            })
        }
        if(pincode && pincode[0] === 0){
            return res.status(400).json({
                success : false ,
                message : "Invalid pincode"
            })
        }

        const findaddress = await client.address.findFirst({
            where : {
                id : addressId
            }
        })

        if(!findaddress){
            return res.status(400).json({
                success : false ,
                message : "No such address id exits"
            })
        }

        if(findaddress.ownerId !== userId){
            return res.status(400).json({
                success : false ,
                message : "you do not have right to edit the address"
            })
        }

        const updatedAddress = await client.address.updateMany({
            where : {
                id : addressId ,
                ownerId : userId
            } ,
            data : {
                    fullname : fullname ,
                    email : email ,
                    pincode : pincode ,
                    mobile : mobile ,
                    city : city ,
                    state : state ,
                    country : country ,
                    streetAddress : streetAddress ,
                    locality : locality ,
                    landmark : landmark ,
                    GSTIN : GSTIN
            }
        })

        return res.status(200).json({
            success : true ,
            message : "address modified successfully" ,
            updatedAddress : updatedAddress
        })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while editing user address ,please try again later !'
        })
    }
}

export const deleteUserAddress = async(req ,res) => {
    try{
        const userId = req.params.userId ; 
        const {addressId} = req.body ;


        if(!addressId){
            return res.status(400).json({
                success : false ,
                message : "address id missing"
            })
        }

        const findaddress = await client.address.findFirst({
            where : {
                id : addressId
            }
        })

        if(!findaddress){
            return res.status(400).json({
                success : false ,
                message : "No such address id exits"
            })
        }

        if(findaddress.ownerId !== userId){
            return res.status(400).json({
                success : false ,
                message : "you do not have right to delete the address"
            })
        }

        const deleteAddress = await client.address.delete({
            where : {
                id : addressId ,
                ownerId : userId
            }
        })

        return res.status(200).json({
            success : true ,
            message : "address deleted successfully" ,
            deletedaddress : deleteAddress
        })


    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while deleting user address ,please try again later !'
        })
    }
}











