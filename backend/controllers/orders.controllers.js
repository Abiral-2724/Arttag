import client from "../prisma.js";

// import { PrismaClient } from "@prisma/client";

// const client = new PrismaClient() ;


// export const placingOrderOfProduct = async(req ,res) => {
//     try{
//             const {userId ,subtotal ,discountAmount,shippingCharge,taxAmount ,cart ,addressId ,paymentType} = req.body ;

//             if(!userId || !subtotal){
//                 return res.status(400).json({
//                     success : false ,
//                     message : 'fields missing all fields are required'
//                 })
//             }

//             let totalAmount = subtotal - discountAmount + shippingCharge + taxAmount ; 

//             const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;


//           const order = await client.orders.create({
//             data : {
//                 userId : userId ,
//                 subtotal : subtotal ,
//                 discountAmount : discountAmount ,
//                 shippingCharge : shippingCharge ,
//                 taxAmount : taxAmount ,
//                 totalAmount : totalAmount,
//                 orderNumber : orderNumber ,
//                 addressId : addressId ,
//                 paymentType : paymentType 
//             } 
//           })  

//          // console.log(order) ;
//           let AllorderItemOfOrder = []
//           for(let c of cart){
//                 const orderItems = await client.orderItem.create({
//                     data:{
//                         orderId: order.id,
//             productId: c.product.id,
//             price: c.product.originalPrice,
//             discount: c.product.originalPrice - c.product.discountPrice,
//             finalPrice: c.product.discountPrice,
//             quantity: c.quantity
//                     }
                   
//                 })
//                 AllorderItemOfOrder.push(orderItems)
//           }

//           return res.status(200).json({
//                 success : true ,
//                 message : "order placed successsfully" ,
//                 order : order ,
//                 items : AllorderItemOfOrder
//           })


//     }
//     catch(e){
//         console.log(e) ; 
//         return res.status(500).json({
//             success : false ,
//             message : 'error while placing order of product ,please try again later !'
//         })
//     }
// }

// export const updatingOrderStateOfTheOrder = async(req ,res) => {
//     try{
//             const {orderId ,newStatus ,userId} = req.body ; 

//              // 1️⃣ Check user
//       const user = await client.user.findFirst({ where: { id: userId } });
//       if (!user) {
//         return res.status(400).json({
//           success: false,
//           message: "No user exists with this ID",
//         });
//       }
  
//       if (user.role === "USER") {
//         return res.status(403).json({
//           success: false,
//           message: "You have no right to update status of a product",
//         });
//       }

//             const updateOrderState = await client.orders.update({
//                 where : {
//                     id : orderId
//                 } ,
//                 data : {
//                     status : newStatus
//                 }
//             })

//             return res.status(200).json({
//                 success : true ,
//                 message : "order status updated successsfully" ,
//                updatedOrder : updateOrderState
//           }) 
//     }
//     catch(e){
//         console.log(e) ; 
//         return res.status(500).json({
//             success : false ,
//             message : 'error while updating order state ,please try again later !'
//         })
//     }
// }


// export const findingTotalOrderPlacedOfUserWithOrderDetail = async(req ,res) => {
//     try{
//             const userId = req.params.userId ; 

//             const orders = await client.orders.findMany({
//                 where : {
//                     userId : userId
//                 } ,
//                 include : {
//                     items : {
//                         include : {
//                             product : true
//                         }
//                     } 
                    
//                 },
//                 orderBy: {
//                     createdAt: 'desc', // optional: to show latest orders first
//                   },
//             })

//             return res.status(200).json({
//                 success : true ,
//                 message : "all order of user found succesfully" ,
//                 orders : orders
//             })
//     }
//     catch(e){
//         console.log(e) ; 
//         return res.status(500).json({
//             success : false ,
//             message : 'error while finding total order placed ,please try again later !'
//         })
//     }
// }

// export const addingReviewToTheOrderPlaced = async(req ,res) => {
//     try{

//     }
//     catch(e){
//         console.log(e) ; 
//         return res.status(500).json({
//             success : false ,
//             message : 'error while finding total order placed ,please try again later !'
//         })
//     }
// }


// export const getAllOrders = async (req, res) => {
//   try {
//     // Accept status as single value or comma-separated list:
//     // ?status=PENDING
//     // ?status=PENDING,SHIPPED
//     const { status } = req.query;

  
//     const allowedStatuses = [
//       "PENDING",
//       "CONFIRMED",
//       "PROCESSING",
//       "SHIPPED",
//       "DELIVERED",
//       "CANCELLED",
//       "RETURNED",
//     ];

//     let where = {};

//     if (status) {
     
//       const statusList = String(status)
//         .split(",")
//         .map((s) => s.trim().toUpperCase())
//         .filter(Boolean);

//       const invalid = statusList.filter((s) => !allowedStatuses.includes(s));
//       if (invalid.length) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid status value(s): ${invalid.join(
//             ", "
//           )}. Allowed: ${allowedStatuses.join(", ")}`,
//         });
//       }

//       where.status = statusList.length === 1 ? statusList[0] : { in: statusList };
//     }

//     const orders = await client.orders.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//       include: {
//         user: { select: { id: true, name: true, email: true } },
//         items: {
//           include: {
//             product: {
//               select: {
//                 id: true,
//                 name: true,
//                 discountPrice: true,
//                 primaryImage1: true,
//               },
//             },
//           },
//         },
//       },
//     });

   
//     return res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({
//       success: false,
//       message:
//         "Error while finding orders. Please try again later!",
//     });
//   }
// };
