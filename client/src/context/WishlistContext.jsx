import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user?._id) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getCustomerWishlist(user._id);
      
      if (response.success) {
        setWishlistItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    if (!user?._id) {
      throw new Error('Please log in to add items to wishlist');
    }

    try {
      const response = await apiService.addToWishlist(user._id, productId);
      
      if (response.success) {
        // Refetch wishlist to get updated data
        await fetchWishlist();
        return { success: true, message: 'Added to wishlist' };
      } else {
        throw new Error(response.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user?._id) return;

    try {
      const response = await apiService.removeFromWishlist(user._id, productId);
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        return { success: true, message: 'Removed from wishlist' };
      } else {
        throw new Error(response.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (!user?._id) return;

    try {
      const response = await apiService.clearWishlist(user._id);
      
      if (response.success) {
        setWishlistItems([]);
        return { success: true, message: 'Wishlist cleared' };
      } else {
        throw new Error(response.message || 'Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Toggle wishlist status
  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    toggleWishlist,
    fetchWishlist,
    wishlistCount: wishlistItems.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
