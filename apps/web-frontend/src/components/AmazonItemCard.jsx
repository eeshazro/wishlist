import React from 'react';
import CommentThread from './CommentThread';

export default function AmazonItemCard({ item, auth, wid, canComment, canDelete, onDelete }) {
  const [commentsExpanded, setCommentsExpanded] = React.useState(false);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to generate random rating (for demo purposes)
  const getRandomRating = () => {
    const ratings = [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8];
    return ratings[Math.floor(Math.random() * ratings.length)];
  };

  // Helper function to generate random number of ratings
  const getRandomRatingCount = () => {
    const counts = [164, 3610, 1247, 892, 2156, 743, 1892, 4567];
    return counts[Math.floor(Math.random() * counts.length)];
  };

  // Helper function to generate retailer name
  const getRetailer = () => {
    const retailers = [
      'Amazon.com',
      '365 by Whole Foods Market',
      'Cascade',
      'Sony',
      'Samsung',
      'Apple',
      'Microsoft',
      'Logitech'
    ];
    return retailers[Math.floor(Math.random() * retailers.length)];
  };

  // Helper function to generate category
  const getCategory = () => {
    const categories = [
      'Electronics',
      'Grocery',
      'Health and Beauty',
      'Home & Kitchen',
      'Sports & Outdoors',
      'Books',
      'Clothing',
      'Tools & Home Improvement'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  // Use useMemo to generate random values only once per item
  const itemData = React.useMemo(() => {
    return {
      rating: getRandomRating(),
      ratingCount: getRandomRatingCount(),
      retailer: getRetailer(),
      category: getCategory()
    };
  }, [item.id]); // Only regenerate when item.id changes

  // Generate star rating display
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="amazon-stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">☆</span>
        ))}
      </div>
    );
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (!canDelete || !onDelete) return;
    
    try {
      await onDelete(item.id);
    } catch (error) {
      console.error('Failed to delete item:', error);
      // You could add a toast notification here if you have one
    }
  };

  // Handle comments toggle
  const toggleComments = () => {
    setCommentsExpanded(!commentsExpanded);
  };

  return (
    <div className="amazon-item-card">
      <div className="amazon-item-content">
        {/* Product Image */}
        <div className="amazon-item-image">
          <img src={item.product?.image_url} alt={item.title} />
        </div>

        {/* Product Details */}
        <div className="amazon-item-details">
          {/* Product Title */}
          <div className="amazon-item-title">
            <span className="amazon-item-title-main">{item.title}</span>
            <div className="amazon-item-title-full">
              {item.product?.description || item.title}
            </div>
          </div>

          {/* By Line */}
          <div className="amazon-item-byline">
            by {itemData.retailer} ({itemData.category})
          </div>

          {/* Rating */}
          <div className="amazon-item-rating">
            {renderStars(itemData.rating)}
            <a href="#" className="amazon-rating-count">{itemData.ratingCount}</a>
          </div>

          {/* Price */}
          <div className="amazon-item-price">
            ${item.product?.price}
          </div>

          {/* Item Added Date */}
          <div className="amazon-item-added">
            Item added {formatDate(item.created_at || new Date())}
          </div>

          {/* Action Buttons */}
          <div className="amazon-item-actions">
            <button className="amazon-btn amazon-btn-primary">Add to Cart</button>
            <button className="amazon-btn amazon-btn-secondary">
              Move <span className="amazon-arrow">▼</span>
            </button>
            <button className="amazon-btn amazon-btn-icon" title="Share">
              <span className="amazon-share-icon">⎋</span>
            </button>
            {canDelete && (
              <button 
                className="amazon-btn amazon-btn-icon amazon-btn-delete" 
                title="Delete item"
                onClick={handleDelete}
              >
                <span className="amazon-delete-icon">🗑</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapse/Expand Arrow with Comments text */}
        <div className="amazon-item-collapse" onClick={toggleComments}>
          <span className="amazon-comments-text">Comments</span>
          <span className={`amazon-collapse-icon ${commentsExpanded ? 'expanded' : ''}`}>⏷</span>
        </div>
      </div>

      {/* Comments Section - Expandable */}
      <div className={`amazon-item-comments ${commentsExpanded ? 'expanded' : ''}`}>
        <CommentThread auth={auth} wid={wid} itemId={item.id} canComment={canComment} />
      </div>
    </div>
  );
} 