import client from "../prisma.js";

import crypto from "crypto";
import razorpay from "../utils/razorpay.js";


export const createOrder = async (req, res) => {
    try{
        const { userId, amount } = req.body;
  
        // 1. Create DB order
        const order = await client.order.create({
          data: {
            userId,
            totalAmount: amount * 100,
            paymentMethod: "ONLINE",
            paymentStatus: "PENDING",
            orderStatus: "CREATED",
          },
        });

         
    // 2. Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: order.id,
      });
    
      // 3. Save payment entry
      await client.payment.create({
        data: {
          orderId: order.id,
          razorpayOrderId: razorpayOrder.id,
          amount: amount * 100,
          currency: "INR",
          status: "PENDING",
        },
      });

       // 4. Update DB order
    await client.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });
    
      return res.json(razorpayOrder);
      
    }catch(e){
        console.log(e) ; 
        return res.status(200).json({
            success : false ,
            message : "error creating order"
        })
    }
   
  };
  

 
export const verifyPayment = async (req, res) => {
    try{
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          } = req.body;
        
          const body = razorpay_order_id + "|" + razorpay_payment_id;

          const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await client.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId : razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "PAID",
      },
    });

    res.status(200).json({ success: true });
}else {
    res.status(400).json({ success: false });
  }
    }catch(e){
        console.log(e) ; 
        return res.status(200).json({
            success : false ,
            message : "error verifying payment"
        })
    }
  
  
  
};



// In payment.controller.js - Update placingOrderOfProduct

export const placingOrderOfProduct = async(req, res) => {
    try {
        const {
            userId,
            subtotal,
            discountAmount,
            shippingCharge,
            taxAmount,
            cart,
            addressId,
            paymentType,
            razorpayOrderId,  // This comes from the first order
            razorpayPaymentId
        } = req.body;

        // Calculate total
        let totalAmount = subtotal - (discountAmount || 0) + (shippingCharge || 0) + (taxAmount || 0);

        let order;

        if (paymentType === 'ONLINE' && razorpayOrderId) {
            // ✅ UPDATE existing order instead of creating new one
            order = await client.order.findFirst({
                where: { razorpayOrderId: razorpayOrderId }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Update order with final details
            order = await client.order.update({
                where: { id: order.id },
                data: {
                    totalAmount: totalAmount,
                    orderStatus: 'CONFIRMED',
                    paymentStatus: 'PAID'
                }
            });

        } else {
            // ✅ Only create NEW order for COD
            order = await client.order.create({
                data: {
                    userId: userId,
                    totalAmount: totalAmount,
                    paymentMethod: 'COD',
                    paymentStatus: 'PENDING',
                    orderStatus: 'CONFIRMED'
                }
            });

            // Create payment record for COD
            await client.payment.create({
                data: {
                    orderId: order.id,
                    amount: totalAmount,
                    currency: "INR",
                    status: "PENDING"
                }
            });
        }

        // Create order items (same for both)
        let allOrderItems = [];
        if (cart && cart.length > 0) {
            for (let item of cart) {
                const orderItem = await client.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId || item.product?.id,
                        price: item.product?.discountPrice || item.price,
                        quantity: item.quantity,
                        isReturnable: true
                    }
                });
                allOrderItems.push(orderItem);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order: order,
            items: allOrderItems
        });

    } catch(e) {
        console.error('Order placement error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error while placing order',
            error: e.message
        });
    }
}


// Get all orders for a specific user
export const getUserOrders = async(req, res) => {
    try {
        const { userId } = req.params;

        const orders = await client.order.findMany({
            where: { userId: userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                primaryImage1: true,
                                discountPrice: true,
                                originalPrice: true
                            }
                        }
                    }
                },
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: orders,
            count: orders.length
        });

    } catch(e) {
        console.error('Get orders error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: e.message
        });
    }
}

// Get single order details
export const getOrderById = async(req, res) => {
    try {
        const { orderId } = req.params;

        const order = await client.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            order: order
        });

    } catch(e) {
        console.error('Get order error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error fetching order details',
            error: e.message
        });
    }
}

// // Update order status (for admin)
// export const updateOrderStatus = async(req, res) => {
//     try {
//         const { orderId, newStatus } = req.body;

//         // Validate status
//         const validStatuses = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
//         if (!validStatuses.includes(newStatus)) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
//             });
//         }

//         const updatedOrder = await client.order.update({
//             where: { id: orderId },
//             data: { orderStatus: newStatus }
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Order status updated successfully",
//             order: updatedOrder
//         });

//     } catch(e) {
//         console.error('Update order status error:', e);
//         return res.status(500).json({
//             success: false,
//             message: 'Error updating order status',
//             error: e.message
//         });
//     }
// }

export const cancelOrder = async(req, res) => {
    try {
        const { orderId } = req.params;
        const { userId, reason } = req.body;

        // Find the order
        const order = await client.order.findUnique({
            where: { id: orderId },
            include: { 
                payment: true,
                items: true 
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if user owns this order
        if (order.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to cancel this order"
            });
        }

        // Check if order can be cancelled
        const cancellableStatuses = ['CREATED', 'CONFIRMED'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled. Current status: ${order.orderStatus}`
            });
        }

        // Handle COD orders - Delete directly
        if (order.paymentMethod === 'COD') {
            // Delete order items first
            await client.orderItem.deleteMany({
                where: { orderId: order.id }
            });

            // Delete payment record if exists
            if (order.payment) {
                await client.payment.delete({
                    where: { id: order.payment.id }
                });
            }

            // Delete the order
            await client.order.delete({
                where: { id: orderId }
            });

            return res.status(200).json({
                success: true,
                message: "COD order cancelled and deleted successfully",
                orderDeleted: true
            });
        }

        // Handle ONLINE payment orders - Create refund request for admin
        if (order.paymentMethod === 'ONLINE') {
            // Update order status to CANCELLED
            const updatedOrder = await client.order.update({
                where: { id: orderId },
                data: { 
                    orderStatus: 'CANCELLED'
                }
            });

            // Create refund request for admin approval
            const refund = await client.refund.create({
                data: {
                    orderId: order.id,
                    paymentId: order.payment?.id || '',
                    amount: order.totalAmount,
                    reason: reason || 'User requested cancellation',
                    status: 'INITIATED',
                    razorpayRefundId: order.payment?.razorpayPaymentId || null
                }
            });

            return res.status(200).json({
                success: true,
                message: "Cancellation request submitted. Refund will be processed by admin.",
                order: updatedOrder,
                refund: refund,
                requiresAdminApproval: true
            });
        }

        // Fallback (shouldn't reach here)
        return res.status(400).json({
            success: false,
            message: "Invalid payment method"
        });

    } catch(e) {
        console.error('Cancel order error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: e.message
        });
    }
}


// Update order status (Admin only)
export const updateOrderStatus = async(req, res) => {
    try {
        const { orderId } = req.params;
        const { newStatus, deliveryDate } = req.body;

        // Validate status
        const validStatuses = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
            });
        }

        const updateData = { orderStatus: newStatus };
        
        // Add delivery date if provided
        if (deliveryDate) {
            updateData.deliveryDate = new Date(deliveryDate);
        }

        // Auto-set delivery date when marking as delivered
        if (newStatus === 'DELIVERED' && !deliveryDate) {
            updateData.deliveryDate = new Date();
        }

        const updatedOrder = await client.order.update({
            where: { id: orderId },
            data: updateData
        });

        // Update payment status when delivered
        if (newStatus === 'DELIVERED') {
            await client.payment.update({
                where: { orderId: orderId },
                data: { status: 'PAID' }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder
        });

    } catch(e) {
        console.error('Update order status error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: e.message
        });
    }
}


// Get all orders (Admin)
export const getAllOrders = async(req, res) => {
    try {
        const { status, paymentMethod } = req.query;

        let where = {};

        if (status) {
            where.orderStatus = status;
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
        }

        const orders = await client.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                primaryImage1: true,
                                discountPrice: true
                            }
                        }
                    }
                },
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: orders,
            count: orders.length
        });

    } catch(e) {
        console.error('Get all orders error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: e.message
        });
    }
}

// Get all refund requests (Admin)
export const getAllRefundRequests = async(req, res) => {
    try {
        const { status } = req.query;

        let where = {};
        
        if (status) {
            where.status = status;
        }

        const refunds = await client.refund.findMany({
            where,
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        primaryImage1: true
                                    }
                                }
                            }
                        },
                        payment: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Refund requests fetched successfully",
            refunds: refunds,
            count: refunds.length
        });

    } catch(e) {
        console.error('Get refund requests error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error fetching refund requests',
            error: e.message
        });
    }
}

// Process refund request (Admin) - Manual Process
export const processRefund = async(req, res) => {
    try {
        const { refundId } = req.params;
        const { action } = req.body; // action: 'APPROVE' or 'REJECT'

        const refund = await client.refund.findUnique({
            where: { id: refundId },
            include: {
                order: {
                    include: { payment: true }
                }
            }
        });

        if (!refund) {
            return res.status(404).json({
                success: false,
                message: "Refund request not found"
            });
        }

        if (refund.status !== 'INITIATED') {
            return res.status(400).json({
                success: false,
                message: `Refund already ${refund.status.toLowerCase()}`
            });
        }

        if (action === 'APPROVE') {
            // Update refund status to REFUNDED (manual process completed)
            const updatedRefund = await client.refund.update({
                where: { id: refundId },
                data: {
                    status: 'REFUNDED'
                }
            });

            // Update payment status to REFUNDED
            if (refund.order.payment) {
                await client.payment.update({
                    where: { id: refund.order.payment.id },
                    data: { status: 'REFUNDED' }
                });
            }

            // Update order payment status to REFUNDED
            await client.order.update({
                where: { id: refund.orderId },
                data: { 
                    paymentStatus: 'REFUNDED',
                    orderStatus: 'CANCELLED'
                }
            });

            return res.status(200).json({
                success: true,
                message: "Refund marked as refunded successfully. Please process the refund manually using the Order ID and Payment ID.",
                refund: updatedRefund
            });

        } else if (action === 'REJECT') {
            // Update refund status to FAILED
            const updatedRefund = await client.refund.update({
                where: { id: refundId },
                data: { status: 'FAILED' }
            });

            // Keep order status as is (don't revert)
            // Admin rejected the refund, so order remains in its current state

            return res.status(200).json({
                success: true,
                message: "Refund request rejected successfully",
                refund: updatedRefund
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Use 'APPROVE' or 'REJECT'"
            });
        }

    } catch(e) {
        console.error('Process refund error:', e);
        return res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: e.message
        });
    }
}

