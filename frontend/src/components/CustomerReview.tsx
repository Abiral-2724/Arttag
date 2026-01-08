import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const CustomerReviewSection = ({ productId, userId, productName }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Responsive cards per slide
  const getCardsPerSlide = () => {
    if (windowWidth < 768) return 1; // Mobile
    if (windowWidth < 1024) return 2; // Tablet
    return 3; // Desktop
  };

  const cardsPerSlide = getCardsPerSlide();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    // Reset to first slide when cards per slide changes
    setCurrentSlide(0);
  }, [cardsPerSlide]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/review/all/review/${productId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.productReview);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/review/add/product/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId,
          title,
          description,
          rating,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowDialog(false);
        setRating(0);
        setTitle('');
        setDescription('');
        fetchReviews();
        alert('Review submitted successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const totalSlides = Math.ceil(reviews.length / cardsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getVisibleReviews = () => {
    const startIdx = currentSlide * cardsPerSlide;
    const endIdx = startIdx + cardsPerSlide;
    return reviews.slice(startIdx, endIdx);
  };

  const StarRating = ({ rating: starRating, size = 24, interactive = false, onRate }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`cursor-${interactive ? 'pointer' : 'default'} transition-colors ${
              star <= (interactive ? (hoverRating || starRating) : starRating)
                ? 'fill-teal-500 text-teal-500'
                : 'text-gray-300'
            }`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-sans mb-2 sm:mb-4">CUSTOMER REVIEWS</h2>

      {/* Main Review Section */}
      <Card className="mb-5 sm:mb-6 lg:mb-8 bg-gray-50 border-0">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 px-2">
              {productName}
            </h3>
            
            <div className="flex justify-center mb-2">
              <StarRating rating={reviews.length > 0 ? Math.round(calculateAverageRating()) : 0} size={windowWidth < 640 ? 20 : 24} />
            </div>
            
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              {reviews.length === 0 ? 'No Reviews Yet' : `${reviews.length} Review${reviews.length > 1 ? 's' : ''} (${calculateAverageRating()} average)`}
            </p>

            <Button
              onClick={() => setShowDialog(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-sm sm:text-base"
            >
              {reviews.length === 0 ? "BE THE FIRST TO WRITE A REVIEW" : "WRITE A REVIEW"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Slider */}
      {reviews.length > 0 && (
        <div className="relative px-2 sm:px-8 lg:px-12">
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {getVisibleReviews().map((review) => (
                <Card key={review.id} className="h-full">
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base sm:text-lg truncate">{review.user?.name || 'Anonymous'}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                      <StarRating rating={review.rating} size={windowWidth < 640 ? 16 : 20} />
                    </div>
                    
                    {review.title && (
                      <h5 className="font-semibold mb-2 text-sm sm:text-base line-clamp-2">{review.title}</h5>
                    )}
                    
                    {review.description && (
                      <p className="text-gray-700 line-clamp-4 text-sm sm:text-base">{review.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {totalSlides > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg hover:bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg hover:bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}

          {totalSlides > 1 && (
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 sm:h-2.5 rounded-full transition-all ${
                    index === currentSlide ? 'bg-teal-600 w-6 sm:w-8' : 'bg-gray-300 w-2 sm:w-2.5'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Write Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-sans">Write a review</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 pt-1">
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2 sm:mb-3">Rating</label>
              <StarRating
                rating={rating}
                size={windowWidth < 640 ? 20 : 25}
                interactive={true}
                onRate={setRating}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Review Title</label>
              <Input
                placeholder="Enter review title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Review Description</label>
              <Textarea
                placeholder="Share your experience with this product (Maximum 400 characters)"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 400) {
                    setDescription(e.target.value);
                  }
                }}
                className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base resize-none"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1 text-right">
                {description.length}/400 characters
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button
                onClick={handleSubmitReview}
                disabled={loading}
                className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white py-5 sm:py-6 text-sm sm:text-base font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="w-full sm:flex-1 py-5 sm:py-6 text-sm sm:text-base font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerReviewSection;