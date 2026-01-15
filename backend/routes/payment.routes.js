import express from 'express' ; 
import { cancelOrder, createOrder, getAllOrders, getAllRefundRequests, getOrderById, getUserOrders, placingOrderOfProduct, processRefund, updateOrderStatus, verifyPayment } from '../controllers/payment.controller.js';

const router = express.Router() ; 

router.post('/create/order' ,createOrder)

router.post('/verify' ,verifyPayment)

router.post('/place/user/new/order' ,placingOrderOfProduct)

router.get('/get/all/user/:userId/orders' ,getUserOrders)

router.get('/get/order/:orderId',getOrderById)

// router.patch('/update/order/status', updateOrderStatus)

router.patch('/cancel/:orderId' ,cancelOrder)

router.get('/get/all/orders' ,getAllOrders)

router.patch('/update/order/status/:orderId',updateOrderStatus)

router.get('/get/all/refund/request' ,getAllRefundRequests)

router.post('/process/refund/:refundId' ,processRefund)

export default router ; 