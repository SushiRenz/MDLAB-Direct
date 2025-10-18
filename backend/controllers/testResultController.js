const { validationResult } = require('express-validator');
const TestResult = require('../models/TestResult');
const Service = require('../models/Service');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all test results with filtering and pagination
// @route   GET /api/test-results
// @access  Private (All authenticated users see their own, staff see all)
const getTestResults = asyncHandler(async (req, res) => {
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
    testType,
    patientId,
    patientName,
    appointmentId,
    sampleId,
    fromDate,
    toDate,
    isAbnormal,
    isCritical,
    isNew,
    medTech,
    pathologist,
    sortBy = 'sampleDate',
    sortOrder = 'desc'
  } = req.query;

  // Build query object
  let query = { isDeleted: false };
  console.log('🔍 Initial query:', query);
  console.log('🔍 User role:', req.user.role);
  console.log('🔍 Request params:', { patientId, appointmentId, status, testType });

  // Role-based filtering
  if (req.user.role === 'patient') {
    // Patients can only see their own results
    query.patient = req.user._id;
  } else if (req.user.role === 'medtech') {
    // MedTechs can see results they're assigned to or unassigned ones
    // BUT if filtering by appointmentId, allow access to any results for that appointment
    if (!patientId && !appointmentId) {
      query.$or = [
        { medTech: req.user._id },
        { medTech: null }
      ];
      console.log('🔍 Applied medtech role restriction (no patientId/appointmentId)');
    } else {
      console.log('🔍 Skipping medtech role restriction (patientId or appointmentId provided)');
    }
  }
  // Admin, receptionist, pathologist can see all results

  // Apply filters
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  if (testType) {
    query.testType = { $regex: testType, $options: 'i' };
  }

  if (patientId) {
    query.patient = patientId;
  }

  if (appointmentId) {
    // Try both string and ObjectId versions
    const mongoose = require('mongoose');
    const appointmentIdAsObjectId = mongoose.Types.ObjectId.isValid(appointmentId) 
      ? new mongoose.Types.ObjectId(appointmentId) 
      : appointmentId;
    
    query.$or = [
      { appointment: appointmentId }, // String version
      { appointment: appointmentIdAsObjectId } // ObjectId version
    ];
    console.log('🔍 Added appointmentId filter with both string and ObjectId:', { appointmentId, appointmentIdAsObjectId });
    console.log('🔍 Checking what field name exists in database...');
    
    // Debug: Check both possible field names and data types
    const testByAppointmentString = await TestResult.findOne({ appointment: appointmentId });
    const testByAppointmentObjectId = await TestResult.findOne({ appointment: appointmentIdAsObjectId });
    const testByAppointmentIdField = await TestResult.findOne({ appointmentId: appointmentId });
    console.log('🔍 Found by appointment field (string):', testByAppointmentString ? 'YES' : 'NO');
    console.log('🔍 Found by appointment field (ObjectId):', testByAppointmentObjectId ? 'YES' : 'NO');
    console.log('🔍 Found by appointmentId field:', testByAppointmentIdField ? 'YES' : 'NO');
  }

  if (sampleId) {
    query.sampleId = { $regex: sampleId, $options: 'i' };
  }

  // Date range filtering
  if (fromDate || toDate) {
    query.sampleDate = {};
    if (fromDate) {
      query.sampleDate.$gte = new Date(fromDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      query.sampleDate.$lte = endDate;
    }
  }

  // Boolean filters
  if (isAbnormal !== undefined) {
    query.isAbnormal = isAbnormal === 'true';
  }

  if (isCritical !== undefined) {
    query.isCritical = isCritical === 'true';
  }

  if (isNew !== undefined) {
    query.isNew = isNew === 'true';
  }

  if (medTech) {
    query.medTech = medTech;
  }

  if (pathologist) {
    query.pathologist = pathologist;
  }

  // Patient name search (requires population)
  let pipeline = [
    { $match: query }
  ];

  // Add patient name search if needed
  if (patientName) {
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $match: {
          $or: [
            { 'patientInfo.firstName': { $regex: patientName, $options: 'i' } },
            { 'patientInfo.lastName': { $regex: patientName, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$patientInfo.firstName', ' ', '$patientInfo.lastName'] },
                  regex: patientName,
                  options: 'i'
                }
              }
            }
          ]
        }
      }
    );
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  pipeline.push({ $sort: sortOptions });

  // Get total count
  const totalPipeline = [...pipeline, { $count: 'total' }];
  const totalResults = await TestResult.aggregate(totalPipeline);
  const total = totalResults[0]?.total || 0;

  // Add pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  pipeline.push(
    { $skip: skip },
    { $limit: parseInt(limit) }
  );

  // Execute aggregation
  console.log('🔍 Final query before execution:', JSON.stringify(query, null, 2));
  console.log('🔍 Pipeline before execution:', JSON.stringify(pipeline, null, 2));
  
  // Debug: Check total test results in database first
  const totalTestResults = await TestResult.countDocuments();
  console.log('🔍 TOTAL test results in database:', totalTestResults);
  
  // Debug: Check test results with any appointment field
  const testResultsWithAppointment = await TestResult.countDocuments({ appointment: { $exists: true, $ne: null } });
  console.log('🔍 Test results with appointment field:', testResultsWithAppointment);
  
  let testResults = await TestResult.aggregate(pipeline);
  console.log('🔍 Query results count:', testResults.length);
  console.log('🔍 First result (if any):', testResults[0] ? JSON.stringify(testResults[0], null, 2) : 'No results');

  // Always do comprehensive population to get all required data
  testResults = await TestResult.populate(testResults, [
    {
      path: 'patient',
      select: 'firstName lastName email phone address age gender sex dateOfBirth'
    },
    {
      path: 'service',
      select: 'serviceName category price description'
    },
    {
      path: 'medTech',
      select: 'firstName lastName email'
    },
    {
      path: 'pathologist',
      select: 'firstName lastName email'
    },
    {
      path: 'appointment',
      select: 'appointmentId appointmentDate appointmentTime patientName age sex address contactNumber email status serviceName services',
      populate: {
        path: 'services',
        select: 'serviceName category description'
      }
    }
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.status(200).json({
    success: true,
    message: 'Test results retrieved successfully',
    data: testResults,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalResults: total,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    }
  });
});

// @desc    Get single test result by ID
// @route   GET /api/test-results/:id
// @access  Private
const getTestResult = asyncHandler(async (req, res) => {
  const testResult = await TestResult.findOne({
    _id: req.params.id,
    isDeleted: false
  })
    .populate('patient', 'firstName lastName email phone address dateOfBirth gender sex age')
    .populate('service', 'serviceName category price description')
    .populate('medTech', 'firstName lastName email')
    .populate('pathologist', 'firstName lastName email')
    .populate('appointment', 'appointmentId appointmentDate appointmentTime patientName age sex address contactNumber email status serviceName services')
    .populate({
      path: 'appointment',
      populate: {
        path: 'services',
        select: 'serviceName category description'
      }
    })
    .populate('createdBy', 'firstName lastName');

  if (!testResult) {
    return res.status(404).json({
      success: false,
      message: 'Test result not found'
    });
  }

  // Permission check
  if (req.user.role === 'patient' && testResult.patient._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own test results.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Test result retrieved successfully',
    data: testResult
  });
});

// @desc    Create new test result
// @route   POST /api/test-results
// @access  Private (MedTech, Pathologist, Admin)
const createTestResult = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check permission
  if (!['medtech', 'pathologist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only medical staff can create test results.'
    });
  }

  const {
    patientId,
    appointmentId,
    serviceId,
    testType,
    results,
    status = 'pending',
    sampleDate,
    notes,
    medTechNotes,
    pathologistNotes
  } = req.body;

  // Validate patient exists (or is a walk-in patient)
  let patient = null;
  let isWalkInPatient = false;
  
  // Check if patientId is a valid MongoDB ObjectId
  if (patientId && patientId.match(/^[0-9a-fA-F]{24}$/)) {
    patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Registered patient not found'
      });
    }
  } else {
    // Handle walk-in patients (patientId might be a name or other identifier)
    console.log('Processing walk-in patient:', patientId);
    isWalkInPatient = true;
    
    // For walk-in patients, we'll store the patientId as-is (could be a name)
    // The appointment should have the patient details
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found for walk-in patient'
        });
      }
      // Use appointment data for walk-in patient validation
    } else {
      return res.status(400).json({
        success: false,
        message: 'Walk-in patients must have an associated appointment'
      });
    }
  }

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }

  // Validate appointment if provided
  let appointment = null;
  if (appointmentId) {
    appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
  }

  // Get reference ranges for the test type
  const referenceRanges = TestResult.getDefaultReferenceRanges(testType);

  // Create test result
  const testResultData = {
    patient: isWalkInPatient ? patientId : patientId, // Store ID/name for walk-ins, ObjectId for registered
    appointment: appointmentId,
    service: serviceId,
    testType,
    results: new Map(Object.entries(results)),
    referenceRanges: new Map(Object.entries(referenceRanges)),
    status,
    sampleDate: sampleDate ? new Date(sampleDate) : new Date(),
    notes,
    medTechNotes,
    pathologistNotes,
    createdBy: req.user._id,
    isWalkInPatient: isWalkInPatient
  };

  // If walk-in patient, extract patient info from appointment
  if (isWalkInPatient && appointment) {
    testResultData.patientInfo = {
      name: appointment.patientName,
      age: appointment.patientAge,
      gender: appointment.patientGender,
      contactNumber: appointment.patientPhone,
      address: appointment.patientAddress
    };
  }

  const testResult = new TestResult(testResultData);

  // Add medTech assignment if current user is medtech
  if (req.user.role === 'medtech') {
    testResult.medTech = req.user._id;
  }

  await testResult.save();

  // Populate the created result
  await testResult.populate([
    {
      path: 'patient',
      select: 'firstName lastName email phone'
    },
    {
      path: 'service',
      select: 'serviceName category price'
    },
    {
      path: 'createdBy',
      select: 'firstName lastName'
    }
  ]);

  res.status(201).json({
    success: true,
    message: 'Test result created successfully',
    data: testResult
  });
});

// @desc    Update test result
// @route   PUT /api/test-results/:id
// @access  Private (MedTech, Pathologist, Admin)
const updateTestResult = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check permission
  if (!['medtech', 'pathologist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only medical staff can update test results.'
    });
  }

  const testResult = await TestResult.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!testResult) {
    return res.status(404).json({
      success: false,
      message: 'Test result not found'
    });
  }

  const {
    results,
    status,
    notes,
    medTechNotes,
    pathologistNotes,
    qcPassed,
    qcNotes,
    medTech,
    pathologist
  } = req.body;

  // Update fields
  if (results) {
    testResult.results = new Map(Object.entries(results));
  }
  if (status) testResult.status = status;
  if (notes !== undefined) testResult.notes = notes;
  if (medTechNotes !== undefined) testResult.medTechNotes = medTechNotes;
  if (pathologistNotes !== undefined) testResult.pathologistNotes = pathologistNotes;
  if (qcPassed !== undefined) testResult.qcPassed = qcPassed;
  if (qcNotes !== undefined) testResult.qcNotes = qcNotes;
  if (medTech) testResult.medTech = medTech;
  if (pathologist) testResult.pathologist = pathologist;

  testResult.lastModifiedBy = req.user._id;

  await testResult.save();

  // Populate the updated result
  await testResult.populate([
    {
      path: 'patient',
      select: 'firstName lastName email phone'
    },
    {
      path: 'service',
      select: 'serviceName category price'
    },
    {
      path: 'medTech',
      select: 'firstName lastName'
    },
    {
      path: 'pathologist',
      select: 'firstName lastName'
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Test result updated successfully',
    data: testResult
  });
});

// @desc    Delete test result (soft delete)
// @route   DELETE /api/test-results/:id
// @access  Private (Admin only)
const deleteTestResult = asyncHandler(async (req, res) => {
  // Only admin can delete
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin can delete test results.'
    });
  }

  const testResult = await TestResult.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!testResult) {
    return res.status(404).json({
      success: false,
      message: 'Test result not found'
    });
  }

  // Soft delete
  testResult.isDeleted = true;
  testResult.lastModifiedBy = req.user._id;
  await testResult.save();

  res.status(200).json({
    success: true,
    message: 'Test result deleted successfully'
  });
});

// @desc    Release test result to patient
// @route   PUT /api/test-results/:id/release
// @access  Private (Pathologist, Admin)
const releaseTestResult = asyncHandler(async (req, res) => {
  // Only pathologist or admin can release results
  if (!['pathologist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only pathologists can release test results.'
    });
  }

  const testResult = await TestResult.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!testResult) {
    return res.status(404).json({
      success: false,
      message: 'Test result not found'
    });
  }

  // Update status and dates
  testResult.status = 'released';
  testResult.releasedDate = new Date();
  testResult.pathologist = req.user._id;
  testResult.isNew = true; // Mark as new for patient
  testResult.lastModifiedBy = req.user._id;

  await testResult.save();

  // Populate the updated result
  await testResult.populate([
    {
      path: 'patient',
      select: 'firstName lastName email phone'
    },
    {
      path: 'service',
      select: 'serviceName category price'
    },
    {
      path: 'pathologist',
      select: 'firstName lastName'
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Test result released successfully',
    data: testResult
  });
});

// @desc    Mark test result as viewed by patient
// @route   PUT /api/test-results/:id/mark-viewed
// @access  Private (Patient only)
const markAsViewed = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access denied.'
    });
  }

  const testResult = await TestResult.findOne({
    _id: req.params.id,
    patient: req.user._id,
    isDeleted: false
  });

  if (!testResult) {
    return res.status(404).json({
      success: false,
      message: 'Test result not found'
    });
  }

  testResult.isNew = false;
  await testResult.save();

  res.status(200).json({
    success: true,
    message: 'Test result marked as viewed'
  });
});

// @desc    Get test result statistics
// @route   GET /api/test-results/stats
// @access  Private (Staff only)
const getTestResultStats = asyncHandler(async (req, res) => {
  // Only staff can view stats
  if (req.user.role === 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access denied.'
    });
  }

  const { date, period = 'day' } = req.query;

  let dateFilter = {};
  if (date) {
    const targetDate = new Date(date);
    
    switch (period) {
      case 'day':
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        dateFilter = {
          sampleDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        };
        break;
        
      case 'week':
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        dateFilter = {
          sampleDate: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        };
        break;
        
      case 'month':
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        dateFilter = {
          sampleDate: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        };
        break;
    }
  }

  const stats = await TestResult.aggregate([
    {
      $match: {
        isDeleted: false,
        ...dateFilter
      }
    },
    {
      $group: {
        _id: null,
        totalResults: { $sum: 1 },
        pendingResults: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        inProgressResults: {
          $sum: {
            $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
          }
        },
        completedResults: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        releasedResults: {
          $sum: {
            $cond: [{ $eq: ['$status', 'released'] }, 1, 0]
          }
        },
        abnormalResults: {
          $sum: {
            $cond: ['$isAbnormal', 1, 0]
          }
        },
        criticalResults: {
          $sum: {
            $cond: ['$isCritical', 1, 0]
          }
        },
        newResults: {
          $sum: {
            $cond: ['$isNew', 1, 0]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalResults: 0,
    pendingResults: 0,
    inProgressResults: 0,
    completedResults: 0,
    releasedResults: 0,
    abnormalResults: 0,
    criticalResults: 0,
    newResults: 0
  };

  res.status(200).json({
    success: true,
    message: 'Test result statistics retrieved successfully',
    data: result
  });
});

// @desc    Get all test results for a specific appointment
// @route   GET /api/test-results/appointment/:appointmentId
// @access  Private (MedTech, Pathologist, Admin)
const getTestResultsByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  // First find the appointment by appointmentId string
  const appointment = await Appointment.findOne({ appointmentId: appointmentId });
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Find all test results for this appointment using the ObjectId
  const testResults = await TestResult.find({
    appointment: appointment._id,
    isDeleted: false
  })
    .populate('patient', 'firstName lastName email phone address dateOfBirth gender sex age')
    .populate('service', 'serviceName category price description')
    .populate('medTech', 'firstName lastName email')
    .populate('pathologist', 'firstName lastName email')
    .populate({
      path: 'appointment',
      select: 'appointmentId appointmentDate appointmentTime patientName age sex address contactNumber email status serviceName services',
      populate: {
        path: 'services',
        select: 'serviceName category description'
      }
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  if (!testResults || testResults.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No test results found for this appointment'
    });
  }

  // Group test results by category based on the selected services
  const groupedResults = {};
  const appointmentData = testResults[0]?.appointment || appointment;
  
  if (appointmentData && appointmentData.services) {
    // Group by service categories
    appointmentData.services.forEach(service => {
      const category = service.category || 'general';
      if (!groupedResults[category]) {
        groupedResults[category] = {
          categoryName: category,
          services: [],
          testResults: []
        };
      }
      groupedResults[category].services.push(service);
    });

    // Assign test results to categories
    testResults.forEach(testResult => {
      const testType = testResult.testType.toLowerCase();
      let assigned = false;

      // Try to match test result to appropriate category
      Object.keys(groupedResults).forEach(category => {
        const categoryServices = groupedResults[category].services;
        const matchingService = categoryServices.find(service => 
          testType.includes(service.serviceName.toLowerCase()) ||
          service.serviceName.toLowerCase().includes(testType)
        );

        if (matchingService && !assigned) {
          groupedResults[category].testResults.push(testResult);
          assigned = true;
        }
      });

      // If no category match found, create a general category
      if (!assigned) {
        if (!groupedResults['general']) {
          groupedResults['general'] = {
            categoryName: 'general',
            services: [],
            testResults: []
          };
        }
        groupedResults['general'].testResults.push(testResult);
      }
    });
  }

  // Use the appointment data we fetched earlier (with populated services)
  await appointment.populate('services', 'serviceName category description');

  // Return the most recent completed test result, or if none completed, the most recent one
  const completedTestResults = testResults.filter(tr => tr.status === 'completed');
  const selectedTestResult = completedTestResults.length > 0 
    ? completedTestResults[0] // Most recent completed
    : testResults[0]; // Most recent regardless of status

  console.log(`📊 Found ${testResults.length} test results, ${completedTestResults.length} completed. Using:`, {
    id: selectedTestResult?._id,
    status: selectedTestResult?.status,
    sampleId: selectedTestResult?.sampleId
  });

  res.status(200).json({
    success: true,
    message: 'Test results retrieved successfully',
    testResults: selectedTestResult,
    services: appointment.services || [],
    data: {
      appointment: appointment,
      testResults: testResults,
      groupedResults: groupedResults,
      totalResults: testResults.length
    }
  });
});

module.exports = {
  getTestResults,
  getTestResult,
  getTestResultsByAppointment,
  createTestResult,
  updateTestResult,
  deleteTestResult,
  releaseTestResult,
  markAsViewed,
  getTestResultStats
};