const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all services with filtering and pagination
// @route   GET /api/services
// @access  Public (with optional admin features when authenticated)
const getServices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    isActive,
    isPopular,
    isPackage,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minPrice,
    maxPrice
  } = req.query;

  // Build filter object
  const filter = {};

  // For public access, only show active services unless user is admin
  if (req.user && req.user.role === 'admin') {
    // Admin can see all services, apply filters as requested
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
  } else {
    // Public access - only show active services
    filter.isActive = true;
  }

  if (category) {
    filter.category = category;
  }

  if (isPopular !== undefined) {
    filter.isPopular = isPopular === 'true';
  }

  if (isPackage !== undefined) {
    filter.isPackage = isPackage === 'true';
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Search in service name, description, and tags
  if (search) {
    filter.$or = [
      { serviceName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  try {
    // Sort configuration
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const services = await Service.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalServices = await Service.countDocuments(filter);
    const totalPages = Math.ceil(totalServices / parseInt(limit));

    res.json({
      success: true,
      data: services,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalServices,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private (Admin only)
const getServiceStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Service.getServiceStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
      error: error.message
    });
  }
});

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
const getPopularServices = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularServices = await Service.getPopularServices(parseInt(limit));
    
    res.json({
      success: true,
      data: popularServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular services',
      error: error.message
    });
  }
});

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin only)
const createService = asyncHandler(async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Generate unique service ID
    const existingService = await Service.findOne({ serviceName: serviceData.serviceName });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this name already exists'
      });
    }

    const service = await Service.create(serviceData);
    
    // Populate creator information
    await service.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin only)
const updateService = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check for duplicate service name (excluding current service)
    if (req.body.serviceName && req.body.serviceName !== service.serviceName) {
      const existingService = await Service.findOne({ 
        serviceName: req.body.serviceName,
        _id: { $ne: req.params.id }
      });
      
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: 'Service with this name already exists'
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        service[key] = req.body[key];
      }
    });

    service.lastModifiedBy = req.user.id;
    await service.save();

    // Populate user information
    await service.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'lastModifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
const deleteService = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Soft delete by setting isActive to false instead of hard delete
    // This preserves historical data for orders and reports
    service.isActive = false;
    service.lastModifiedBy = req.user.id;
    await service.save();

    res.json({
      success: true,
      message: 'Service deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
});

// @desc    Toggle service active status
// @route   PATCH /api/services/:id/toggle-status
// @access  Private (Admin only)
const toggleServiceStatus = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.isActive = !service.isActive;
    service.lastModifiedBy = req.user.id;
    await service.save();

    await service.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'lastModifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      data: service,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service status',
      error: error.message
    });
  }
});

// @desc    Toggle service popular status
// @route   PATCH /api/services/:id/toggle-popular
// @access  Private (Admin only)
const toggleServicePopular = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.isPopular = !service.isPopular;
    service.lastModifiedBy = req.user.id;
    await service.save();

    await service.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'lastModifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      data: service,
      message: `Service ${service.isPopular ? 'marked as popular' : 'unmarked as popular'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service popular status',
      error: error.message
    });
  }
});

// @desc    Bulk update services
// @route   PATCH /api/services/bulk-update
// @access  Private (Admin only)
const bulkUpdateServices = asyncHandler(async (req, res) => {
  try {
    const { serviceIds, updateData } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Service IDs array is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    // Add lastModifiedBy to update data
    updateData.lastModifiedBy = req.user.id;

    const result = await Service.updateMany(
      { _id: { $in: serviceIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} services updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update services',
      error: error.message
    });
  }
});

// @desc    Get service categories with counts
// @route   GET /api/services/categories
// @access  Public
const getServiceCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          services: { $push: { _id: '$_id', serviceName: '$serviceName', price: '$price' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service categories',
      error: error.message
    });
  }
});

module.exports = {
  getServices,
  getServiceStats,
  getPopularServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  toggleServicePopular,
  bulkUpdateServices,
  getServiceCategories
};