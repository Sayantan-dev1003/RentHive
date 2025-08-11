const Product = require('../models/Product');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middlewares/errorHandler');
const { getAvailableQuantity, getAvailabilityCalendar: getProductAvailabilityCalendar, isAvailable } = require('../utils/availabilityHelper');
const { emitProductUpdate } = require('../utils/socket');

/**
 * Create a new product
 * POST /api/products
 */
const createProduct = asyncHandler(async (req, res) => {
  // Use req.body directly as the frontend sends form data
  const { name, category, description, rentable, pricing, stock, specifications } = req.body;

  // Extract image URLs from uploaded files
  const imageUrls = req.files.map(file => file.path);

  // Validate required fields
  if (!name || !category || !description || !pricing) {
    throw createValidationError('Name, category, description, and pricing are required');
  }

  // Since pricing is a string from FormData, parse it to an object
  const parsedPricing = JSON.parse(pricing);
  if (!parsedPricing.hour || !parsedPricing.day || !parsedPricing.week || !parsedPricing.month) {
    throw createValidationError('All pricing tiers (hour, day, week, month) are required');
  }

  // Create product
  const product = new Product({
    name: name.trim(),
    category,
    description: description.trim(),
    rentable: rentable === 'true', // Convert string to boolean
    pricing: {
      hour: parseFloat(parsedPricing.hour),
      day: parseFloat(parsedPricing.day),
      week: parseFloat(parsedPricing.week),
      month: parseFloat(parsedPricing.month)
    },
    stock: parseInt(stock) || 1,
    images: imageUrls,
    specifications: specifications ? JSON.parse(specifications) : {}
  });

  await product.save();

  // Emit product update
  emitProductUpdate(product._id.toString(), {
    id: product._id,
    name: product.name,
    category: product.category,
    stock: product.stock,
    availability: product.availability,
    rentable: product.rentable
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: {
      product
    }
  });
});

/**
 * Get all products with filtering and pagination
 * GET /api/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    rentable,
    search,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (rentable !== undefined) {
    query.rentable = rentable === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Price filtering (based on daily rate)
  if (minPrice || maxPrice) {
    query['pricing.day'] = {};
    if (minPrice) query['pricing.day'].$gte = parseFloat(minPrice);
    if (maxPrice) query['pricing.day'].$lte = parseFloat(maxPrice);
  }

  // Date availability filtering
  let dateFilter = null;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw createValidationError('Start date must be before end date');
    }

    dateFilter = { start, end };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const products = await Product.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  // Add current available stock and date-specific availability
  const productsWithAvailability = await Promise.all(products.map(async product => {
    const productObj = product.toObject();
    productObj.currentAvailableStock = product.currentAvailableStock;

    // If date filter is provided, check availability for that period
    if (dateFilter) {
      const availableQty = await getAvailableQuantity(
        product._id,
        dateFilter.start,
        dateFilter.end
      );
      productObj.availableForPeriod = availableQty;
      productObj.isAvailableForPeriod = availableQty > 0;
    }

    return productObj;
  }));

  res.status(200).json({
    success: true,
    data: {
      products: productsWithAvailability,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      filters: {
        categories: await Product.distinct('category', { isActive: true }),
        priceRange: await Product.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$pricing.day' },
              maxPrice: { $max: '$pricing.day' }
            }
          }
        ])
      }
    }
  });
});

/**
 * Get product categories
 * GET /api/products/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });

  // Get category counts
  const categoryCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      categories,
      categoryCounts
    }
  });
});

/**
 * Get single product by ID
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product || !product.isActive) {
    throw createNotFoundError('Product');
  }

  // Add current available stock
  const productObj = product.toObject();
  productObj.currentAvailableStock = product.currentAvailableStock;

  res.status(200).json({
    success: true,
    data: {
      product: productObj
    }
  });
});

/**
 * Update product
 * PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    rentable,
    pricing,
    stock,
    images,
    specifications,
    isActive
  } = req.body;

  // Find the existing product
  const product = await Product.findById(id);
  if (!product) {
    throw createNotFoundError('Product not found');
  }

  // Extract new image URLs from uploaded files if any
  const newImageUrls = req.files ? req.files.map(file => file.path) : [];

  // Build the update object, initializing with the existing product's values
  const updateData = { ...product.toObject() };

  // Update fields if provided in the request body
  if (name) updateData.name = name.trim();
  if (category) updateData.category = category;
  if (description) updateData.description = description.trim();
  if (rentable !== undefined) updateData.rentable = rentable === 'true'; // Parse string to boolean
  if (stock !== undefined) updateData.stock = parseInt(stock); // Parse string to number
  if (isActive !== undefined) updateData.isActive = isActive === 'true'; // Parse string to boolean

  // Update pricing if provided, and parse string to JSON
  if (pricing) {
    const parsedPricing = JSON.parse(pricing);
    updateData.pricing = {};
    if (parsedPricing.hour) updateData.pricing.hour = parseFloat(parsedPricing.hour);
    if (parsedPricing.day) updateData.pricing.day = parseFloat(parsedPricing.day);
    if (parsedPricing.week) updateData.pricing.week = parseFloat(parsedPricing.week);
    if (parsedPricing.month) updateData.pricing.month = parseFloat(parsedPricing.month);
  }

  // Combine existing images with new images
  if (newImageUrls.length > 0) {
    // If images are provided in the body, it means the user wants to replace them.
    // If not, we just append to the existing images.
    const existingImages = images ? JSON.parse(images) : product.images;
    updateData.images = [...existingImages, ...newImageUrls];
  } else if (images) {
      // If no new files are uploaded, but 'images' field is in the body,
      // it means the user sent a new array of URLs to replace the old ones
      updateData.images = JSON.parse(images);
  }

  // Update specifications if provided
  if (specifications) {
    updateData.specifications = JSON.parse(specifications);
  }


  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw createNotFoundError('Product not found or failed to update');
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product: updatedProduct
    }
  });
});

/**
 * Delete product (Soft delete - production)
 * DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw createNotFoundError('Product');
  }

  // Soft delete - set isActive to false
  await Product.findByIdAndUpdate(id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

/**
 * Hard delete product (Development only)
 * DELETE /api/dev/products/:id
 */
const hardDeleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw createNotFoundError('Product');
  }

  res.status(200).json({
    success: true,
    message: 'Product permanently deleted from database'
  });
});

/**
 * Get all products including inactive (Development only)
 * GET /api/dev/products/all
 */
const getAllProductsIncludingInactive = asyncHandler(async (req, res) => {
  const allProducts = await Product.find({});
  const activeProducts = await Product.find({ isActive: true });
  const inactiveProducts = await Product.find({ isActive: false });

  res.status(200).json({
    success: true,
    data: {
      total: allProducts.length,
      active: activeProducts.length,
      inactive: inactiveProducts.length,
      allProducts,
      activeProducts,
      inactiveProducts
    }
  });
});

/**
 * Check product availability
 * GET /api/products/:id/availability
 */
const checkAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { start, end, quantity = 1 } = req.query;

  if (!start || !end) {
    throw createValidationError('Start and end dates are required');
  }

  const product = await Product.findById(id);

  if (!product || !product.isActive) {
    throw createNotFoundError('Product');
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw createValidationError('Invalid date format');
  }

  if (endDate <= startDate) {
    throw createValidationError('End date must be after start date');
  }

  const availableQuantity = await getAvailableQuantity(product, startDate, endDate);
  const isAvailable = availableQuantity >= parseInt(quantity);

  res.status(200).json({
    success: true,
    data: {
      available: isAvailable,
      availableQuantity,
      requestedQuantity: parseInt(quantity),
      totalStock: product.stock,
      period: {
        start: startDate,
        end: endDate
      }
    }
  });
});

/**
 * Get product availability calendar
 * GET /api/products/:id/calendar
 */
const getAvailabilityCalendar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { start, end } = req.query;

  if (!start || !end) {
    throw createValidationError('Start and end dates are required');
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw createValidationError('Invalid date format');
  }

  const calendar = await getProductAvailabilityCalendar(id, startDate, endDate);

  res.status(200).json({
    success: true,
    data: {
      calendar,
      period: {
        start: startDate,
        end: endDate
      }
    }
  });
});

/**
 * Search products
 * GET /api/products/search
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    throw createValidationError('Search query must be at least 2 characters long');
  }

  const searchQuery = {
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } }
    ]
  };

  const products = await Product.find(searchQuery)
    .select('name category pricing.day images')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      products,
      count: products.length,
      query: q
    }
  });
});

/**
 * Get featured products
 * GET /api/products/featured
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  // For now, return most recently added products
  // In a real app, you might have a 'featured' flag
  const products = await Product.find({ isActive: true, rentable: true })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('name category pricing.day images');

  res.status(200).json({
    success: true,
    data: {
      products
    }
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  getAllProductsIncludingInactive,
  checkAvailability,
  getAvailabilityCalendar,
  getCategories,
  searchProducts,
  getFeaturedProducts,
};