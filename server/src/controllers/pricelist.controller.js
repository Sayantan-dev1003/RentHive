const Pricelist = require('../models/Pricelist');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middlewares/errorHandler');

/**
 * Create a new pricelist
 * POST /api/pricelists
 */
const createPricelist = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    description,
    rules,
    validity,
    priority,
    applicableCustomers
  } = req.body;

  // Validate required fields
  if (!name || !type || !validity || !rules || rules.length === 0) {
    throw createValidationError('Name, type, validity period, and at least one rule are required');
  }

  // Validate validity dates
  const startDate = new Date(validity.startDate);
  const endDate = new Date(validity.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw createValidationError('Invalid validity dates');
  }

  if (endDate <= startDate) {
    throw createValidationError('End date must be after start date');
  }

  // Validate rules
  for (const rule of rules) {
    if (!rule.productCategory || !rule.discountType || rule.discountValue === undefined) {
      throw createValidationError('Each rule must have productCategory, discountType, and discountValue');
    }

    if (rule.discountType === 'percentage' && (rule.discountValue < 0 || rule.discountValue > 100)) {
      throw createValidationError('Percentage discount must be between 0 and 100');
    }

    if (rule.discountType === 'fixed' && rule.discountValue < 0) {
      throw createValidationError('Fixed discount cannot be negative');
    }
  }

  // Create pricelist
  const pricelist = new Pricelist({
    name: name.trim(),
    type,
    description: description ? description.trim() : '',
    rules,
    validity: {
      startDate,
      endDate
    },
    priority: priority || 0,
    applicableCustomers: applicableCustomers || [],
    createdBy: req.user._id
  });

  await pricelist.save();

  res.status(201).json({
    success: true,
    message: 'Pricelist created successfully',
    data: {
      pricelist
    }
  });
});

/**
 * Get all pricelists with filtering and pagination
 * GET /api/pricelists
 */
const getPricelists = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    isActive,
    search
  } = req.query;

  // Build query
  const query = {};

  if (type) {
    query.type = type;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const pricelists = await Pricelist.find(query)
    .populate('createdBy', 'name email')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Pricelist.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      pricelists,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Get single pricelist by ID
 * GET /api/pricelists/:id
 */
const getPricelistById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pricelist = await Pricelist.findById(id)
    .populate('createdBy', 'name email')
    .populate('applicableCustomers', 'name email');

  if (!pricelist) {
    throw createNotFoundError('Pricelist');
  }

  res.status(200).json({
    success: true,
    data: {
      pricelist
    }
  });
});

/**
 * Update pricelist
 * PUT /api/pricelists/:id
 */
const updatePricelist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    description,
    rules,
    validity,
    priority,
    isActive,
    applicableCustomers
  } = req.body;

  const pricelist = await Pricelist.findById(id);

  if (!pricelist) {
    throw createNotFoundError('Pricelist');
  }

  // Build update object
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (type) updateData.type = type;
  if (description !== undefined) updateData.description = description.trim();
  if (rules) updateData.rules = rules;
  if (priority !== undefined) updateData.priority = priority;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (applicableCustomers) updateData.applicableCustomers = applicableCustomers;

  // Update validity if provided
  if (validity) {
    const startDate = new Date(validity.startDate);
    const endDate = new Date(validity.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw createValidationError('Invalid validity dates');
    }

    if (endDate <= startDate) {
      throw createValidationError('End date must be after start date');
    }

    updateData.validity = { startDate, endDate };
  }

  const updatedPricelist = await Pricelist.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Pricelist updated successfully',
    data: {
      pricelist: updatedPricelist
    }
  });
});

/**
 * Delete pricelist
 * DELETE /api/pricelists/:id
 */
const deletePricelist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pricelist = await Pricelist.findById(id);

  if (!pricelist) {
    throw createNotFoundError('Pricelist');
  }

  await Pricelist.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Pricelist deleted successfully'
  });
});

/**
 * Get active pricelists for a specific date
 * GET /api/pricelists/active
 */
const getActivePricelists = asyncHandler(async (req, res) => {
  const { date } = req.query;

  const checkDate = date ? new Date(date) : new Date();

  if (isNaN(checkDate.getTime())) {
    throw createValidationError('Invalid date format');
  }

  const activePricelists = await Pricelist.findActiveForDate(checkDate)
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    data: {
      pricelists: activePricelists,
      date: checkDate
    }
  });
});

/**
 * Get applicable pricelists for a customer
 * GET /api/pricelists/customer/:customerId
 */
const getCustomerPricelists = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { date } = req.query;

  const checkDate = date ? new Date(date) : new Date();

  // Get general active pricelists
  const generalPricelists = await Pricelist.find({
    isActive: true,
    'validity.startDate': { $lte: checkDate },
    'validity.endDate': { $gte: checkDate },
    $or: [
      { applicableCustomers: { $size: 0 } },
      { applicableCustomers: { $exists: false } }
    ]
  });

  // Get customer-specific pricelists
  const customerPricelists = await Pricelist.find({
    isActive: true,
    'validity.startDate': { $lte: checkDate },
    'validity.endDate': { $gte: checkDate },
    applicableCustomers: customerId
  });

  const allApplicable = [...generalPricelists, ...customerPricelists]
    .sort((a, b) => b.priority - a.priority);

  res.status(200).json({
    success: true,
    data: {
      pricelists: allApplicable,
      customerId,
      date: checkDate
    }
  });
});

/**
 * Preview pricelist discount for items
 * POST /api/pricelists/:id/preview
 */
const previewPricelistDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; // Array of {productCategory, quantity, durationHours, basePrice}

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createValidationError('Items array is required');
  }

  const pricelist = await Pricelist.findById(id);

  if (!pricelist) {
    throw createNotFoundError('Pricelist');
  }

  const preview = items.map(item => {
    const {
      productCategory,
      quantity = 1,
      durationHours = 24,
      basePrice = 0
    } = item;

    // Get applicable rules for this item
    const applicableRules = pricelist.getApplicableRules(
      productCategory,
      quantity,
      durationHours
    );

    let bestDiscount = 0;
    let appliedRule = null;

    // Find the best discount
    for (const rule of applicableRules) {
      let discount = 0;

      if (rule.discountType === 'percentage') {
        discount = (basePrice * rule.discountValue) / 100;
      } else {
        discount = rule.discountValue * quantity;
      }

      if (discount > bestDiscount) {
        bestDiscount = discount;
        appliedRule = rule;
      }
    }

    const finalPrice = Math.max(0, basePrice - bestDiscount);

    return {
      ...item,
      appliedRule,
      discountAmount: bestDiscount,
      finalPrice,
      savings: bestDiscount
    };
  });

  const totalSavings = preview.reduce((sum, item) => sum + item.savings, 0);

  res.status(200).json({
    success: true,
    data: {
      pricelist: {
        id: pricelist._id,
        name: pricelist.name,
        type: pricelist.type
      },
      preview,
      summary: {
        totalSavings,
        itemCount: items.length
      }
    }
  });
});

/**
 * Toggle pricelist active status
 * PATCH /api/pricelists/:id/toggle
 */
const togglePricelistStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pricelist = await Pricelist.findById(id);

  if (!pricelist) {
    throw createNotFoundError('Pricelist');
  }

  pricelist.isActive = !pricelist.isActive;
  await pricelist.save();

  res.status(200).json({
    success: true,
    message: `Pricelist ${pricelist.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      pricelist
    }
  });
});

module.exports = {
  createPricelist,
  getPricelists,
  getPricelistById,
  updatePricelist,
  deletePricelist,
  getActivePricelists,
  getCustomerPricelists,
  previewPricelistDiscount,
  togglePricelistStatus
};
