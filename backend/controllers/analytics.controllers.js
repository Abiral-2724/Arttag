// controllers/analytics.controllers.js
import client from "../prisma.js";

export const getProductEngagement = async (req, res) => {
  try {
    const products = await client.product.findMany({
      select: {
        id: true,
        name: true,
        primaryImage1: true,
        discountPrice: true,
        originalPrice: true,
        wishlists: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: { id: true, name: true, email: true, phoneNumber: true }
            }
          }
        },
        cart: {
          select: {
            id: true,
            ownerId: true,
            quantity: true,
            createdAt: true,
            owner: {
              select: { id: true, name: true, email: true, phoneNumber: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = products.map(p => ({
      id: p.id,
      name: p.name,
      image: p.primaryImage1,
      discountPrice: p.discountPrice,
      originalPrice: p.originalPrice,
      wishlistCount: p.wishlists.length,
      cartCount: p.cart.length,
      wishlistUsers: p.wishlists.map(w => ({ ...w.user, addedAt: w.createdAt })),
      cartUsers: p.cart.map(c => ({ ...c.owner, addedAt: c.createdAt, quantity: c.quantity })),
    }));

    // Sort by most engaged (wishlist + cart combined)
    data.sort((a, b) => (b.wishlistCount + b.cartCount) - (a.wishlistCount + a.cartCount));

    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error fetching product engagement' });
  }
};