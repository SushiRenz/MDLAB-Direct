const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all appointments with filtering and pagination
// @route   GET /api/appointments
// @access  Private (Admin, Receptionist, MedTech, Pathologist)
const getAppointments = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 20,
    status,
    date,
    patientName,
    service,
    type,
    priority,
    createdBy,
    sortBy = 'appointmentDate',
    sortOrder = 'desc'
  } = req.query;

  // Build query object
  const query = {};
  
  // Filter by status
  if (status) {
    if (status === 'active') {
      query.status = { $in: ['pending', 'confirmed', 'checked-in', 'in-progress'] };
    } else {
      query.status = status;
    }
  }
  
  // Filter by date
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    query.appointmentDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  // Filter by patient name (case-insensitive search)
  if (patientName) {
    query.patientName = {
      $regex: patientName,
      $options: 'i'
    };
  }
  
  // Filter by service
  if (service) {
    query.serviceName = {
      $regex: service,
      $options: 'i'
    };
  }
  
  // Filter by type
  if (type) {
    query.type = type;
  }
  
  // Filter by priority
  if (priority) {
    query.priority = priority;
  }
  
  // Filter by created by (for receptionist tracking)
  if (createdBy) {
    query.createdBy = createdBy;
  }

  // Role-based filtering
  if (req.user.role === 'patient') {
    query.patient = req.user._id;
  }

  try {
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone address dateOfBirth gender')
      .populate('service', 'serviceName price category')
      .populate('services', 'serviceName price category')
      .populate('createdBy', 'firstName lastName role')
      .populate('checkedInBy', 'firstName lastName role')
      .populate('checkedOutBy', 'firstName lastName role')
      .populate('assignedMedTech', 'firstName lastName')
      .populate('assignedPathologist', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Appointment.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalAppointments: total,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (Admin, Receptionist, MedTech, Pathologist, Patient - own only)
const getAppointment = asyncHandler(async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone address dateOfBirth gender')
      .populate('service', 'serviceName price category description')
      .populate('services', 'serviceName price category description')
      .populate('createdBy', 'firstName lastName role')
      .populate('checkedInBy', 'firstName lastName role')
      .populate('checkedOutBy', 'firstName lastName role')
      .populate('assignedMedTech', 'firstName lastName email')
      .populate('assignedPathologist', 'firstName lastName email')
      .populate('billId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user can access this appointment
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own appointments.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Admin, Receptionist, Patient)
const createAppointment = asyncHandler(async (req, res) => {
  try {
    console.log('🚀 APPOINTMENT CREATION STARTED');
    console.log('   User:', req.user ? `${req.user.firstName} ${req.user.lastName} (${req.user.role})` : 'No user');
    console.log('   Request method:', req.method);
    console.log('   Request URL:', req.originalUrl);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
      console.log('📦 Request body keys:', Object.keys(req.body));
      console.log('📦 Request body serviceIds:', req.body.serviceIds);
      console.log('📦 ServiceIds type:', typeof req.body.serviceIds);
      console.log('📦 ServiceIds isArray:', Array.isArray(req.body.serviceIds));
      if (req.body.serviceIds) {
        console.log('📦 ServiceIds length:', req.body.serviceIds.length);
        console.log('📦 First few serviceIds:', req.body.serviceIds.slice(0, 3));
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
  } catch (preValidationError) {
    console.error('❌ PRE-VALIDATION ERROR:', preValidationError);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during validation',
      error: process.env.NODE_ENV === 'development' ? preValidationError.message : 'Server error'
    });
  }

  const {
    patientId,
    patientName,
    contactNumber,
    email,
    address,
    age,
    sex,
    serviceId,
    serviceIds, // New field for multiple services
    serviceName,
    appointmentDate,
    appointmentTime,
    type = 'scheduled',
    priority = 'regular',
    notes,
    reasonForVisit,
    totalPrice // New field for total price
  } = req.body;

  // Debug logging for patient appointments
  if (req.user && req.user.role === 'patient') {
    console.log('🧑‍⚕️ PATIENT APPOINTMENT DEBUG:');
    console.log('   User ID:', req.user._id);
    console.log('   User role:', req.user.role);
    console.log('   Request body keys:', Object.keys(req.body));
    console.log('   Patient ID in request:', patientId);
    console.log('   Patient name:', patientName);
    console.log('   Age:', age, '(type:', typeof age, ')');
    console.log('   Sex:', sex, '(type:', typeof sex, ')');
    console.log('   Address:', address, '(type:', typeof address, ')');
  }

  try {
    // Handle both single service (backward compatibility) and multiple services
    let services = [];
    let totalCost = 0;
    let combinedServiceName = serviceName || '';

    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      // Multiple services case
      const foundServices = await Service.find({ _id: { $in: serviceIds } });
      if (foundServices.length !== serviceIds.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more services not found'
        });
      }
      services = foundServices;
      totalCost = totalPrice || foundServices.reduce((sum, service) => sum + service.price, 0);
      combinedServiceName = combinedServiceName || foundServices.map(s => s.serviceName).join(', ');
    } else if (serviceId) {
      // Single service case (backward compatibility)
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      services = [service];
      totalCost = service.price;
      combinedServiceName = combinedServiceName || service.serviceName;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either serviceId or serviceIds must be provided'
      });
    }

    // Verify patient exists if patientId provided
    let patient = null;
    if (patientId) {
      try {
        patient = await User.findById(patientId);
        if (!patient) {
          console.log('❌ Patient not found with ID:', patientId);
          return res.status(404).json({
            success: false,
            message: 'Patient not found'
          });
        }
        console.log('✅ Patient found:', patient.firstName, patient.lastName);
      } catch (patientError) {
        console.error('❌ Error finding patient:', patientError);
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }
    }

    // Check for appointment conflicts (same date/time/service)
    // Use just the appointmentDate for the database field, not combined datetime
    const appointmentDateOnly = new Date(appointmentDate);
    
    // For medical lab services, we allow multiple appointments per day
    // Only prevent exact duplicate appointments (same patient, same exact service combination, same date)
    // This is more flexible for lab operations
    if (patientId && services.length === 1) {
      // Only check for exact duplicates when it's a single service and we have a patient ID
      const existingAppointment = await Appointment.findOne({
        appointmentDate: {
          $gte: new Date(appointmentDate + 'T00:00:00.000Z'),
          $lte: new Date(appointmentDate + 'T23:59:59.999Z')
        },
        $or: [
          { service: services[0]._id }, // Single service compatibility
          { services: { $in: [services[0]._id] } } // Multiple services containing this service
        ],
        patient: patientId,
        status: { $nin: ['cancelled', 'completed', 'no-show'] }
      });

      if (existingAppointment) {
        return res.status(409).json({
          success: false,
          message: `You already have an appointment for ${services[0].serviceName} on this date. Please choose a different date or cancel your existing appointment.`
        });
      }
    }
    // For multiple services or walk-in patients, allow all appointments
    // Medical labs can handle multiple appointments per day

    // Create appointment with improved data handling
    const appointmentData = {
      patient: patientId || null,
      patientName: patientName || (patient ? `${patient.firstName} ${patient.lastName}` : ''),
      contactNumber: contactNumber || patient?.phone || '',
      email: email || patient?.email || '',
      address: address || (patient?.address ? 
        (typeof patient.address === 'string' ? patient.address : 
         [patient.address.street, patient.address.city, patient.address.province, patient.address.zipCode]
         .filter(Boolean).join(', ')) : ''),
      age: age ? parseInt(age) : (patient?.age || null),
      sex: sex || (patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase() : null),
      serviceName: combinedServiceName,
      appointmentDate: appointmentDateOnly, // Use the properly formatted date
      appointmentTime,
      type,
      priority,
      notes: notes || '',
      reasonForVisit: reasonForVisit || '',
      estimatedCost: totalCost,
      totalPrice: totalCost,
      createdBy: req.user._id,
      createdByName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username || 'System',
      status: type === 'walk-in' ? 'walk-in' : 'pending'
    };

    // Enhanced debugging for appointment data
    console.log('📝 APPOINTMENT DATA CONSTRUCTION:');
    console.log('   Raw age from request:', age, 'Type:', typeof age);
    console.log('   Patient age (calculated):', patient?.age);
    console.log('   Final age:', appointmentData.age);
    console.log('   Raw sex from request:', sex);
    console.log('   Patient gender:', patient?.gender);
    console.log('   Final sex:', appointmentData.sex);
    console.log('   Raw address from request:', address);
    console.log('   Patient address:', patient?.address);
    console.log('   Final address:', appointmentData.address);

    // Add services (support both single and multiple)
    if (services.length === 1) {
      // Single service for backward compatibility
      appointmentData.service = services[0]._id;
      appointmentData.services = [services[0]._id];
    } else {
      // Multiple services
      appointmentData.services = services.map(s => s._id);
      // Keep first service as primary for backward compatibility
      appointmentData.service = services[0]._id;
    }

    const appointment = new Appointment(appointmentData);

    await appointment.save();

    // Populate the appointment for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('service', 'serviceName price category')
      .populate('services', 'serviceName price category')
      .populate('createdBy', 'firstName lastName role');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('❌ APPOINTMENT CREATION ERROR:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Request body:', JSON.stringify(req.body, null, 2));
    console.error('   User info:', req.user ? `${req.user.firstName} ${req.user.lastName} (${req.user.role})` : 'No user');
    
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Receptionist)
const updateAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be modified
    if (!appointment.canBeModified()) {
      return res.status(400).json({
        success: false,
        message: `Appointment cannot be modified. Current status: ${appointment.status}`
      });
    }

    // Additional check for payment-related updates on cancelled appointments
    if (appointment.status === 'cancelled' && (req.body.billGenerated || req.body.actualCost)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled appointments'
      });
    }

    const updateData = { ...req.body };
    updateData.lastModifiedBy = req.user._id;
    updateData.lastModifiedByName = req.user.name;

    // If service is being changed, update the service name and cost
    if (updateData.serviceId && updateData.serviceId !== appointment.service.toString()) {
      const newService = await Service.findById(updateData.serviceId);
      if (!newService) {
        return res.status(404).json({
          success: false,
          message: 'New service not found'
        });
      }
      updateData.service = updateData.serviceId;
      updateData.serviceName = newService.serviceName;
      updateData.estimatedCost = newService.price;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('patient', 'name email phone')
    .populate('service', 'serviceName price category')
    .populate('lastModifiedBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Admin, Receptionist, Patient - own only)
const cancelAppointment = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own appointments.'
      });
    }

    // Check if appointment can be cancelled
    if (['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment cannot be cancelled. Current status: ${appointment.status}`
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: req.user._id,
        cancellationReason: reason || 'No reason provided',
        lastModifiedBy: req.user._id,
        lastModifiedByName: req.user.name
      },
      { new: true }
    ).populate('patient', 'name email')
    .populate('service', 'serviceName');

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Check-in patient
// @route   PUT /api/appointments/:id/checkin
// @access  Private (Admin, Receptionist, MedTech)
const checkInPatient = asyncHandler(async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.canCheckIn()) {
      return res.status(400).json({
        success: false,
        message: `Patient cannot be checked in. Current status: ${appointment.status}`
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'checked-in',
        checkedInAt: new Date(),
        checkedInBy: req.user._id,
        checkedInByName: req.user.name,
        lastModifiedBy: req.user._id,
        lastModifiedByName: req.user.name
      },
      { new: true }
    )
    .populate('patient', 'name email phone')
    .populate('service', 'serviceName')
    .populate('checkedInBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Patient checked in successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Check-out patient
// @route   PUT /api/appointments/:id/checkout
// @access  Private (Admin, Receptionist, MedTech)
const checkOutPatient = asyncHandler(async (req, res) => {
  const { status = 'completed' } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.canCheckOut()) {
      return res.status(400).json({
        success: false,
        message: `Patient cannot be checked out. Current status: ${appointment.status}`
      });
    }

    const updateData = {
      status: status, // 'completed' or 'no-show'
      checkedOutAt: new Date(),
      checkedOutBy: req.user._id,
      checkedOutByName: req.user.name,
      lastModifiedBy: req.user._id,
      lastModifiedByName: req.user.name
    };

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('patient', 'name email phone')
    .populate('service', 'serviceName')
    .populate('checkedOutBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Patient ${status === 'completed' ? 'checked out' : 'marked as no-show'} successfully`,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private (Admin, Receptionist, MedTech, Pathologist)
const getAppointmentStats = asyncHandler(async (req, res) => {
  const { date, period = 'day' } = req.query;
  
  try {
    let startDate, endDate;
    const targetDate = date ? new Date(date) : new Date();
    
    if (period === 'day') {
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - targetDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    console.log('Stats query range:', { startDate, endDate, targetDate, period });

    // Get all appointments for the specified period
    const allAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      }
    });

    console.log('Found appointments for period:', allAppointments.length);

    // Calculate statistics
    const stats = {
      total: allAppointments.length,
      pending: allAppointments.filter(apt => apt.status === 'pending').length,
      confirmed: allAppointments.filter(apt => apt.status === 'confirmed').length,
      checkedIn: allAppointments.filter(apt => apt.status === 'checked-in').length,
      inProgress: allAppointments.filter(apt => apt.status === 'in-progress').length,
      completed: allAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: allAppointments.filter(apt => apt.status === 'cancelled').length,
      noShow: allAppointments.filter(apt => apt.status === 'no-show').length,
      walkIn: allAppointments.filter(apt => apt.status === 'walk-in').length
    };

    console.log('Calculated stats:', stats);
    
    // Get recent appointments (last 10 from the period)
    const recentAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('patient', 'name')
    .populate('service', 'serviceName')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get upcoming appointments (next 7 days from today) - only active appointments
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const upcomingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lte: nextWeek
      },
      status: { $in: ['pending', 'confirmed', 'checked-in', 'in-progress'] } // Only active appointments
    })
    .populate('patient', 'name')
    .populate('service', 'serviceName')
    .sort({ appointmentDate: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      message: 'Appointment statistics retrieved successfully',
      data: {
        ...stats,
        recent: recentAppointments,
        upcoming: upcomingAppointments,
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private (Admin, Receptionist, MedTech, Pathologist)
const getTodayAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  try {
    const appointments = await Appointment.getTodayAppointments(status);
    
    res.status(200).json({
      success: true,
      message: 'Today\'s appointments retrieved successfully',
      data: appointments
    });
  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve today\'s appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Assign medical staff to appointment
// @route   PUT /api/appointments/:id/assign
// @access  Private (Admin, Receptionist)
const assignMedicalStaff = asyncHandler(async (req, res) => {
  const { medTechId, pathologistId } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const updateData = {
      lastModifiedBy: req.user._id,
      lastModifiedByName: req.user.name
    };

    if (medTechId) {
      const medTech = await User.findById(medTechId);
      if (!medTech || medTech.role !== 'medtech') {
        return res.status(400).json({
          success: false,
          message: 'Invalid MedTech ID'
        });
      }
      updateData.assignedMedTech = medTechId;
    }

    if (pathologistId) {
      const pathologist = await User.findById(pathologistId);
      if (!pathologist || pathologist.role !== 'pathologist') {
        return res.status(400).json({
          success: false,
          message: 'Invalid Pathologist ID'
        });
      }
      updateData.assignedPathologist = pathologistId;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('assignedMedTech', 'name email')
    .populate('assignedPathologist', 'name email');

    res.status(200).json({
      success: true,
      message: 'Medical staff assigned successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Assign medical staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign medical staff',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Delete appointment permanently
// @route   DELETE /api/appointments/:id
// @access  Private (Admin, Receptionist)
const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only allow admin and receptionist to delete appointments
    if (req.user.role !== 'admin' && req.user.role !== 'receptionist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin and receptionist can delete appointments.'
      });
    }

    // For extra security, don't allow deletion of completed appointments with test results
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed appointments. Please cancel instead.'
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: {
        deletedAppointmentId: id,
        appointmentId: appointment.appointmentId
      }
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  checkInPatient,
  checkOutPatient,
  getAppointmentStats,
  getTodayAppointments,
  assignMedicalStaff
};