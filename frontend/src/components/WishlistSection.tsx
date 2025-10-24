import React from 'react';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-v628.onrender.com/api/v1';

export default function WishlistSection({ wishlist, userId, onUpdate, showAlert } : any) {
  const removeFromWishlist = async (productId : any) => {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/wishlist/delete/item/user/wishlist`, {
        data: { userId, productId }
      });
      if (data.success) {
        showAlert('Removed from wishlist');
        onUpdate();
      }
    } catch (error : any) {
      showAlert(error.response?.data?.message || 'Failed to remove item', 'error');
    }
  };

  const moveToCart = async (productId : any) => {
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/wishlist/move/wishlist/to/cart`, 
        { userId, productId }
      );
      if (data.success) {
        showAlert(data.message);
        onUpdate();
      }
    } catch (error : any) {
      showAlert(error.response?.data?.message || 'Failed to move to cart', 'error');
    }
  };

  return (
    <CardContent className="p-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mt-2">Save items you love to buy them later</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item : any) => (
              <Card key={item.id} className="border border-gray-200 hover:border-gray-300 transition-all group">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.product?.primaryImage1 ? (
                      <img 
                        src={item.product.primaryImage1} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <Package className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.product?.name || 'Product'}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">₹{item.product?.discountPrice}</span>
                      <span className="text-sm text-gray-500 line-through">₹{item.product?.originalPrice}</span>
                      {item.product?.discountPrice && item.product?.originalPrice && (
                        <Badge className="bg-green-100 text-green-700 text-xs ml-auto">
                          {Math.round((1 - item.product.discountPrice / item.product.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => moveToCart(item.productId)} 
                        className="flex-1 bg-black hover:bg-gray-800 text-white h-9 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => removeFromWishlist(item.productId)}
                        className="border-gray-300 h-9 px-3"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  );
}