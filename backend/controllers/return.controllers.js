import client from "../prisma.js";


export const requestReturn = async(req ,res) => {
    try {
      const { orderId, productId, reason ,userId } = req.body;
      
      if (!orderId || !productId || !reason) {
        return res.status(400).json({ 
          error: 'Order ID, Product ID, and reason are required' 
        });
      }

      // Verify order exists and belongs to user
      const order = await client.order.findFirst({
        where: {
          id: orderId,
          userId: userId,
          orderStatus: 'DELIVERED'
        },
        include: {
          items: {
            where: { productId: productId }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found or not eligible for return' 
        });
      }

      const orderItem = order.items[0];
      if (!orderItem) {
        return res.status(404).json({ 
          error: 'Product not found in order' 
        });
      }

      if (!orderItem.isReturnable) {
        return res.status(400).json({ 
          error: 'This product is not returnable' 
        });
      }

      // Check if return already exists
      const existingReturn = await client.return.findFirst({
        where: {
          orderId: orderId,
          productId: productId,
          userId: userId
        }
      });

      if (existingReturn) {
        return res.status(400).json({ 
          error: 'Return request already exists for this product' 
        });
      }

      // Create return request
      const returnRequest = await client.return.create({
        data: {
          orderId: orderId,
          productId: productId,
          userId: userId,
          reason: reason,
          amount: orderItem.price * orderItem.quantity,
          status: 'REQUESTED'
        }
      });

      // Update order item return status
      await client.orderItem.update({
        where: { id: orderItem.id },
        data: { returnStatus: 'REQUESTED' }
      });

      res.status(201).json({
        message: 'Return request submitted successfully',
        returnRequest
      });

    } catch (error) {
      console.error('Error requesting return:', error);
      res.status(500).json({ error: 'Failed to submit return request' });
    }
}

// 2. Admin approves or rejects return request
export const updateReturnStatus = async (req, res)  => {
    try {
      const { returnId } = req.params;
      const { status, adminNote } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status. Must be APPROVED or REJECTED' 
        });
      }

      const returnRequest = await client.return.findUnique({
        where: { id: returnId },
        include: {
          order: {
            include: {
              items: {
                where: { 
                  productId: { equals: undefined } // Will be filtered below
                }
              }
            }
          }
        }
      });

      if (!returnRequest) {
        return res.status(404).json({ error: 'Return request not found' });
      }

      if (returnRequest.status !== 'REQUESTED') {
        return res.status(400).json({ 
          error: 'Return request has already been processed' 
        });
      }

      // Update return status
      const updatedReturn = await client.return.update({
        where: { id: returnId },
        data: { status: status }
      });

      // Update order item return status
      await client.orderItem.updateMany({
        where: {
          orderId: returnRequest.orderId,
          productId: returnRequest.productId
        },
        data: { returnStatus: status }
      });

      res.json({
        message: `Return request ${status.toLowerCase()} successfully`,
        returnRequest: updatedReturn,
        adminNote
      });

    } catch (error) {
      console.error('Error updating return status:', error);
      res.status(500).json({ error: 'Failed to update return status' });
    }
  }


// 3. Mark product as picked up
export const markProductPicked = async(req, res) => {
    try {
      const { returnId } = req.params;

      const returnRequest = await client.return.findUnique({
        where: { id: returnId }
      });

      if (!returnRequest) {
        return res.status(404).json({ error: 'Return request not found' });
      }

      if (returnRequest.status !== 'APPROVED') {
        return res.status(400).json({ 
          error: 'Return must be approved before pickup' 
        });
      }

      // Update return status to PICKED
      const updatedReturn = await client.return.update({
        where: { id: returnId },
        data: { status: 'PICKED' }
      });

      // Update order item return status
      await client.orderItem.updateMany({
        where: {
          orderId: returnRequest.orderId,
          productId: returnRequest.productId
        },
        data: { returnStatus: 'PICKED' }
      });

      res.json({
        message: 'Product marked as picked successfully',
        returnRequest: updatedReturn
      });

    } catch (error) {
      console.error('Error marking product as picked:', error);
      res.status(500).json({ error: 'Failed to mark product as picked' });
    }
  }



  // 4. Initiate refund (for online payments)
export const initiateRefund   = async (req, res) => {
    try {
      const { returnId } = req.params;

      const returnRequest = await client.return.findUnique({
        where: { id: returnId },
        include: {
          order: {
            include: {
              payment: true
            }
          }
        }
      });

      if (!returnRequest) {
        return res.status(404).json({ error: 'Return request not found' });
      }

      if (returnRequest.status !== 'PICKED') {
        return res.status(400).json({ 
          error: 'Product must be picked before refund' 
        });
      }

      const order = returnRequest.order;

      // Check if payment was online
      if (order.paymentMethod === 'COD') {
        return res.status(400).json({ 
          error: 'No refund needed for Cash on Delivery orders' 
        });
      }

      if (!order.payment || order.payment.status !== 'PAID') {
        return res.status(400).json({ 
          error: 'Payment not found or not completed' 
        });
      }

      // Create refund record
      const refund = await client.refund.create({
        data: {
          orderId: order.id,
          paymentId: order.payment.id,
          amount: returnRequest.amount,
          reason: returnRequest.reason,
          status: 'INITIATED'
        }
      });

      
      // Update return status to REFUNDED
      await client.return.update({
        where: { id: returnId },
        data: { status: 'REFUNDED' }
      });

      // Update order item return status
      await client.orderItem.updateMany({
        where: {
          orderId: returnRequest.orderId,
          productId: returnRequest.productId
        },
        data: { returnStatus: 'REFUNDED' }
      });

      res.json({
        message: 'Refund initiated successfully',
        refund,
        returnRequest: await prisma.return.findUnique({ where: { id: returnId } })
      });

    } catch (error) {
      console.error('Error initiating refund:', error);
      res.status(500).json({ error: 'Failed to initiate refund' });
    }
  }


  export const getAllReturns = async (req, res) =>  {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where = {};
      if (status) {
        where.status = status;
      }

      const [returns, total] = await Promise.all([
        client.return.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        client.return.count({ where })
      ]);

      res.json({
        returns,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching returns:', error);
      res.status(500).json({ error: 'Failed to fetch return requests' });
    }
  }

 // Get all return requests of a user
export const getUserReturns = async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const returns = await client.return.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              id: true,
              orderStatus: true,
              createdAt: true,
              updatedAt: true,
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
              }
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              primaryImage1: true
            }
          }
        }
      });
  
      res.status(200).json({ returns });
    } catch (error) {
      console.error("Error fetching user returns:", error);
      res.status(500).json({ error: "Failed to fetch return requests" });
    }
  };
  

  // 7. Get return details by ID
  export const getReturnById = async (req, res) => {
    try {
      const { returnId } = req.params;

      const returnRequest = await client.return.findUnique({
        where: { id: returnId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
              items: {
                include: {
                  product: true
                }
              },
              payment: true
            }
          }
        }
      });

      if (!returnRequest) {
        return res.status(404).json({ error: 'Return request not found' });
      }

      res.json({ returnRequest });

    } catch (error) {
      console.error('Error fetching return details:', error);
      res.status(500).json({ error: 'Failed to fetch return details' });
    }
  }

