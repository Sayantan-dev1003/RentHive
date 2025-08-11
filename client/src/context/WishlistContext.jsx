import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('renthive_wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('renthive_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Add item to wishlist
  const addToWishlist = async (product) => {
    try {
      setIsLoading(true);
      
      // Check if item already exists
      const existingItem = wishlistItems.find(item => item.id === product.id);
      if (existingItem) {
        return { success: false, message: 'Item already in wishlist' };
      }

      // Add to wishlist
      const wishlistItem = {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        period: product.period,
        image: product.image,
        rating: product.rating,
        location: product.location,
        status: product.status,
        addedAt: new Date().toISOString(),
        ...product
      };

      setWishlistItems(prev => [...prev, wishlistItem]);
      return { success: true, message: 'Item added to wishlist' };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add item to wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setIsLoading(true);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      return { success: true, message: 'Item removed from wishlist' };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Failed to remove item from wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle item in wishlist
  const toggleWishlist = async (product) => {
    const isInList = isInWishlist(product.id || product);
    
    if (isInList) {
      return await removeFromWishlist(product.id || product);
    } else {
      return await addToWishlist(product);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      setIsLoading(true);
      setWishlistItems([]);
      return { success: true, message: 'Wishlist cleared' };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, message: 'Failed to clear wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get wishlist item count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    isLoading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;