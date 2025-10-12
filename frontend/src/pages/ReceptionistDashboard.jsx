import React, { useState, useEffect } from 'react';
import '../design/ReceptionistDashboard.css';
import { userAPI, financeAPI, servicesAPI, appointmentAPI } from '../services/api';
import BookAppointmentModal from './BookAppointmentModal';

function ReceptionistDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('receptionist-dashboard');
  const [appointmentManagementOpen, setAppointmentManagementOpen] = useState(false);
  const [patientServicesOpen, setPatientServicesOpen] = useState(false);
  
  // Receptionist Dashboard Overview State
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    cancelledAppointments: 0,
    totalPatientsToday: 0,
    confirmedAppointments: 0,
    recentAppointments: [],
    upcomingAppointments: [],
    popularServices: []
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  
  // Appointment management state
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Services state (needed for appointment booking)
  const [services, setServices] = useState([]);

  // Patient details modal state
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);

  // Bill generation state
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);

  // Dropdown menu state for appointment actions
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Edit modals state
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editingAppointmentData, setEditingAppointmentData] = useState(null);

  // Helper function to parse and display multiple tests
  const parseTestNames = (testTypeString) => {
    if (!testTypeString) return [];
    
    // Split by comma and clean up each test name
    const tests = testTypeString.split(',').map(test => test.trim());
    
    return tests;
  };

  // Helper function to get test count display
  const getTestDisplayInfo = (testTypeString) => {
    const tests = parseTestNames(testTypeString);
    
    if (tests.length <= 1) {
      return {
        mainTitle: tests[0] || 'Lab Test',
        hasMultiple: false,
        testCount: tests.length,
        allTests: tests
      };
    }
    
    return {
      mainTitle: `${tests.length} Laboratory Tests`,
      hasMultiple: true,
      testCount: tests.length,
      allTests: tests
    };
  };

  // Helper function to format service name for table display
  const formatServiceNameForTable = (serviceName) => {
    if (!serviceName) return 'No service';
    
    const tests = parseTestNames(serviceName);
    if (tests.length <= 1) {
      return serviceName;
    }
    
    return `${tests.length} Tests: ${tests[0]}${tests.length > 1 ? `, +${tests.length - 1} more` : ''}`;
  };

  // Dropdown action handlers
  const toggleDropdown = (appointmentId) => {
    setActiveDropdown(activeDropdown === appointmentId ? null : appointmentId);
  };

  const handleEditService = (appointment) => {
    setEditingAppointmentData(appointment);
    setShowEditServiceModal(true);
    setActiveDropdown(null);
  };

  const handleEditStatus = (appointment) => {
    setEditingAppointmentData(appointment);
    setShowEditStatusModal(true);
    setActiveDropdown(null);
  };

  const handleDeleteAppointment = async (appointment) => {
    if (window.confirm(`Are you sure you want to permanently delete appointment ${appointment.appointmentId} for ${appointment.patientName}?\n\nThis action cannot be undone.`)) {
      try {
        // Call API to delete appointment permanently
        const response = await appointmentAPI.deleteAppointment(appointment._id);
        
        if (response.success) {
          // Update local state
          setAppointments(appointments.filter(apt => apt._id !== appointment._id));
          alert(`Appointment ${appointment.appointmentId} has been deleted successfully.`);
        } else {
          alert(`Failed to delete appointment: ${response.message}`);
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setActiveDropdown(null);
  };

  // Schedule appointment state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [appointmentType, setAppointmentType] = useState('scheduled'); // 'scheduled', 'follow-up'
  
  // Patient information for receptionist scheduling
  const [patientData, setPatientData] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    age: '',
    sex: ''
  });
  
  // Legacy schedule data (keeping for compatibility)
  const [scheduleData, setScheduleData] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    serviceId: '',
    serviceName: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    reasonForVisit: '',
    followUpFor: '', // For follow-up appointments
    groupSize: 1, // For group appointments
    groupMembers: [] // For group appointments
  });

  const user = currentUser;

  // Dashboard data fetching for receptionist
  const fetchReceptionistDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
      // Fetch appointment statistics for the last week to show real data
      const today = new Date();
      console.log('Fetching appointment stats for week period...');
      
      // Get week data to show real statistics
      const appointmentStatsResponse = await appointmentAPI.getAppointmentStats(today.toISOString().split('T')[0], 'week');
      console.log('Week appointment stats response:', appointmentStatsResponse);

      if (appointmentStatsResponse.success) {
        const stats = appointmentStatsResponse.data;
        console.log('Processing stats:', stats);
        
        // Calculate confirmed appointments (confirmed + checked-in + in-progress)
        const confirmedAppointments = (stats.confirmed || 0) + (stats.checkedIn || 0) + (stats.inProgress || 0);
        
        setDashboardStats({
          todayAppointments: stats.total || 0,
          pendingAppointments: stats.pending || 0,
          completedToday: stats.completed || 0,
          cancelledAppointments: stats.cancelled || 0,
          totalPatientsToday: stats.total || 0,
          confirmedAppointments: confirmedAppointments,
          recentAppointments: stats.recent ? stats.recent.slice(0, 5).map(apt => ({
            appointmentId: apt._id || apt.appointmentId,
            patientName: apt.patientName || apt.patient?.name || 'Unknown Patient',
            service: formatServiceNameForTable(apt.serviceName || apt.service?.serviceName || 'Unknown Service'),
            serviceName: apt.serviceName || apt.service?.serviceName || 'Unknown Service',
            time: apt.appointmentTime,
            status: apt.status
          })) : [],
          upcomingAppointments: stats.upcoming ? stats.upcoming.slice(0, 5).map(apt => ({
            appointmentId: apt._id || apt.appointmentId,
            patientName: apt.patientName || apt.patient?.name || 'Unknown Patient', 
            service: formatServiceNameForTable(apt.serviceName || apt.service?.serviceName || 'Unknown Service'),
            serviceName: apt.serviceName || apt.service?.serviceName || 'Unknown Service',
            time: apt.appointmentTime,
            status: apt.status
          })) : [],
          popularServices: []
        });
        
        console.log('Dashboard stats set successfully');
      } else {
        throw new Error(appointmentStatsResponse.message || 'Failed to load appointment data');
      }
    } catch (err) {
      console.error('Receptionist dashboard data fetch error:', err);
      setDashboardError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data for demo purposes - but try to keep it minimal since we want real data
      setDashboardStats({
        todayAppointments: 0,
        pendingAppointments: 0,
        completedToday: 0,
        totalPatientsToday: 0,
        recentAppointments: [],
        upcomingAppointments: [],
        popularServices: []
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  // Appointment Management Functions
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.patientName = searchTerm;
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.appointmentDate = filterDate;
      
      console.log('Fetching appointments with params:', params);
      const response = await appointmentAPI.getAppointments(params);
      console.log('Appointments response:', response);
      
      if (response.success) {
        setAppointments(response.data || []);
        console.log('Appointments loaded:', response.data?.length || 0, 'appointments');
      } else {
        throw new Error(response.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Fetch appointments error:', err);
      setError(err.message || 'Failed to fetch appointments');
      
      // Set empty array instead of mock data to show real situation
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    if (activeSection === 'receptionist-dashboard') {
      fetchReceptionistDashboardData();
    }
  }, [activeSection]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const toggleAppointmentManagement = () => {
    setAppointmentManagementOpen(!appointmentManagementOpen);
  };

  const togglePatientServices = () => {
    setPatientServicesOpen(!patientServicesOpen);
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Call the parent logout function
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      onLogout();
    }
  };

  // Bill generation and appointment management functions
  
  // Check-in/Check-out functions for appointment workflow
  const handleCheckIn = async (appointment) => {
    try {
      const response = await appointmentAPI.checkInPatient(appointment._id);
      
      if (response.success) {
        // Update local state with the response data
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointment._id 
              ? { ...apt, status: 'checked-in' }
              : apt
          )
        );
        
        alert(`Patient ${appointment.patientName} checked in successfully!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to check in patient');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setError('Failed to check in patient: ' + error.message);
      alert('Failed to check in patient: ' + error.message);
    }
  };

  const handleCheckOut = async (appointment) => {
    try {
      const response = await appointmentAPI.checkOutPatient(appointment._id, 'completed');
      
      if (response.success) {
        // Update local state with the response data
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointment._id 
              ? { ...apt, status: 'completed' }
              : apt
          )
        );
        
        alert(`Patient ${appointment.patientName} checked out successfully!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to check out patient');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setError('Failed to check out patient: ' + error.message);
      alert('Failed to check out patient: ' + error.message);
    }
  };
  
  // View patient details function
  const handleViewPatientDetails = (appointment) => {
    setSelectedAppointmentDetails(appointment);
    setShowPatientDetailsModal(true);
  };
  
  // Validate appointment form data
  const validateAppointmentForm = () => {
    const errors = [];

    // Required field validation
    if (!scheduleData.patientName.trim()) {
      errors.push('Patient name is required');
    }
    
    if (!scheduleData.contactNumber.trim()) {
      errors.push('Contact number is required');
    } else if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(scheduleData.contactNumber)) {
      errors.push('Please enter a valid contact number');
    }
    
    if (!scheduleData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(scheduleData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!scheduleData.serviceId) {
      errors.push('Please select a service');
    }
    
    if (!scheduleData.appointmentDate) {
      errors.push('Appointment date is required');
    } else {
      const selectedDate = new Date(scheduleData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push('Appointment date cannot be in the past');
      }
    }
    
    if (!scheduleData.appointmentTime) {
      errors.push('Please select an appointment time slot');
    }
    
    if (!scheduleData.reasonForVisit.trim()) {
      errors.push('Reason for visit is required');
    }

    // Appointment type specific validation
    if (appointmentType === 'group' && scheduleData.groupSize < 1) {
      errors.push('Group size must be at least 1');
    }

    return errors;
  };

  // Handle appointment form submission
  const handleScheduleSubmit = async () => {
    try {
      // Validate form
      const validationErrors = validateAppointmentForm();
      if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
        return;
      }

      // Prepare appointment data based on type
      const appointmentData = {
        patientId: null, // For new patients without existing IDs
        patientName: scheduleData.patientName,
        contactNumber: scheduleData.contactNumber,
        email: scheduleData.email,
        serviceId: scheduleData.serviceId,
        serviceName: scheduleData.serviceName,
        appointmentDate: scheduleData.appointmentDate,
        appointmentTime: scheduleData.appointmentTime,
        type: appointmentType, // 'scheduled', 'follow-up', 'emergency'
        priority: 'regular', // Default priority
        notes: scheduleData.notes,
        reasonForVisit: scheduleData.reasonForVisit,
        receptionistNotes: `Scheduled via receptionist portal by ${user.name || user.email || 'Receptionist'}`
      };

      // Add type-specific data
      if (appointmentType === 'follow-up' && scheduleData.followUpFor) {
        appointmentData.followUpFor = scheduleData.followUpFor;
      }
      
      if (appointmentType === 'group') {
        appointmentData.groupSize = scheduleData.groupSize;
        appointmentData.groupMembers = scheduleData.groupMembers;
      }

      const response = await appointmentAPI.createAppointment(appointmentData);
      
      if (response.success) {
        // Update local appointments list
        setAppointments(prev => [response.data, ...prev]);
        
        setShowScheduleModal(false);
        setScheduleData({
          patientName: '',
          contactNumber: '',
          email: '',
          serviceId: '',
          serviceName: '',
          appointmentDate: '',
          appointmentTime: '',
          notes: '',
          reasonForVisit: '',
          followUpFor: '',
          groupSize: 1,
          groupMembers: []
        });
        setError(''); // Clear any previous errors
        
        alert(`${appointmentType === 'scheduled' ? 'Scheduled' : appointmentType === 'follow-up' ? 'Follow-up' : 'Emergency'} appointment scheduled successfully for ${response.data.patientName}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        // Handle API response with errors
        let errorMessage = response.message || 'Failed to schedule appointment';
        
        if (response.errors && Array.isArray(response.errors)) {
          const validationErrors = response.errors.map(err => err.msg || err.message || err).join('\n');
          errorMessage = `Validation failed:\n${validationErrors}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Schedule appointment error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to schedule appointment';
      
      // Check if it's a validation error with specific errors array
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError('Failed to schedule appointment: ' + errorMessage);
      alert('Failed to schedule appointment:\n' + errorMessage);
    }
  };

  // Bill generation functions - payment confirmation for receptionist
  const handleGenerateBill = (appointment) => {
    console.log('Generating bill for specific appointment:', appointment.appointmentId);
    console.log('Appointment details:', appointment);
    
    // Prevent billing for cancelled appointments
    if (appointment.status === 'cancelled') {
      alert('Cannot generate bill for cancelled appointments.');
      return;
    }
    
    // Set appointment data for billing modal
    setBillData({
      appointment: appointment,
      patientName: appointment.patientName,
      service: appointment.serviceName || appointment.service || 'Service',
      date: appointment.appointmentDate 
        ? new Date(appointment.appointmentDate).toLocaleDateString()
        : 'Date not specified',
      time: appointment.appointmentTime || 'Any time during clinic hours',
      price: appointment.totalPrice || appointment.price || '1,500.00',
      contactNumber: appointment.contactNumber || 'Contact not available',
      email: appointment.email || 'Email not available'
    });
    setShowBillModal(true);
    console.log('Opening payment confirmation for appointment:', appointment.appointmentId, 'patient:', appointment.patientName);
  };

  const handlePaymentConfirmation = async (isPaid) => {
    if (!billData) return;
    
    try {
      if (isPaid) {
        console.log('Processing payment for appointment:', billData.appointment.appointmentId);
        console.log('Patient:', billData.patientName);
        
        // Update appointment status to confirmed in local state - ONLY for this specific appointment
        const updatedAppointments = appointments.map(apt => {
          if (apt.appointmentId === billData.appointment.appointmentId) {
            console.log('Updating appointment:', apt.appointmentId, 'from status:', apt.status, 'to: confirmed');
            return { ...apt, status: 'confirmed', billGenerated: true };
          }
          return apt;
        });
        
        setAppointments(updatedAppointments);
        setShowBillModal(false);
        setBillData(null);
        
        // Update appointment status in the backend
        try {
          if (billData.appointment._id) {
            await appointmentAPI.updateAppointment(billData.appointment._id, { 
              status: 'confirmed',
              billGenerated: true,
              actualCost: billData.price || billData.appointment.totalPrice || billData.appointment.estimatedCost
            });
            console.log('Appointment status updated in backend for:', billData.appointment.appointmentId);
          }
        } catch (error) {
          console.error('Failed to update appointment status in backend:', error);
          console.error('Error details:', error.response?.data);
          alert(`Warning: Payment confirmed locally, but failed to sync with server. Error: ${error.response?.data?.message || error.message}`);
        }
        
        alert(`Payment confirmed for ${billData.patientName}! Appointment ${billData.appointment.appointmentId} status updated to confirmed.`);
        
        // Refresh appointments list to ensure consistency
        if (typeof fetchAppointments === 'function') {
          fetchAppointments();
        }
      } else {
        setShowBillModal(false);
        setBillData(null);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  // Schedule appointment functions
  const handleScheduleAppointment = () => {
    setShowScheduleModal(true);
  };

  // New appointment submission handler for BookAppointmentModal
  const handleReceptionistAppointmentSubmit = async (appointmentData) => {
    try {
      if (!patientData.patientName || !patientData.contactNumber || !patientData.email) {
        alert('Please fill in all patient information before scheduling appointments.');
        return;
      }

      const selectedTests = appointmentData.selectedTests || [];
      
      if (selectedTests.length === 0) {
        alert('Please select at least one test.');
        return;
      }

      // Check if date is provided
      if (!appointmentData.date) {
        alert('Please select an appointment date.');
        return;
      }

      // Fix timezone issue - format date in local timezone
      const year = appointmentData.date.getFullYear();
      const month = String(appointmentData.date.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentData.date.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      // Create a single appointment for all selected tests
      const serviceIds = selectedTests.map(test => test._id);
      const serviceNames = selectedTests.map(test => test.serviceName);
      const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);
      
      console.log(`Creating single appointment for ${selectedTests.length} tests:`, serviceNames);
      
      // Create appointment data for API
      const apiAppointmentData = {
        patientId: null, // Explicitly null for receptionist-scheduled patients
        patientName: patientData.patientName,
        contactNumber: patientData.contactNumber,
        email: patientData.email,
        age: patientData.age ? parseInt(patientData.age) : null,
        sex: patientData.sex,
        serviceIds: serviceIds, 
        serviceName: serviceNames.join(', '),
        appointmentDate: localDateString,
        appointmentTime: appointmentData.time || 'Any time during clinic hours',
        type: 'scheduled',
        priority: 'regular',
        notes: `Scheduled by receptionist - ${selectedTests.length} tests`,
        reasonForVisit: `${serviceNames.join(', ')} - Scheduled by receptionist`,
        receptionistNotes: `Scheduled via receptionist portal by ${currentUser.name || currentUser.email || 'Receptionist'}`,
        totalPrice: totalPrice
      };

      console.log('Creating single appointment with data:', apiAppointmentData);
      console.log('📋 Detailed API data validation:');
      console.log('- patientName:', apiAppointmentData.patientName, typeof apiAppointmentData.patientName);
      console.log('- contactNumber:', apiAppointmentData.contactNumber, typeof apiAppointmentData.contactNumber);
      console.log('- email:', apiAppointmentData.email, typeof apiAppointmentData.email);
      console.log('- age:', apiAppointmentData.age, typeof apiAppointmentData.age);
      console.log('- sex:', apiAppointmentData.sex, typeof apiAppointmentData.sex);
      console.log('- serviceIds:', apiAppointmentData.serviceIds, Array.isArray(apiAppointmentData.serviceIds), apiAppointmentData.serviceIds?.length);
      console.log('- appointmentDate:', apiAppointmentData.appointmentDate, typeof apiAppointmentData.appointmentDate);
      console.log('- totalPrice:', apiAppointmentData.totalPrice, typeof apiAppointmentData.totalPrice);
      
      const response = await appointmentAPI.createAppointment(apiAppointmentData);
      console.log('📦 Received response:', response);
      
      if (response.success) {
        // Transform API response to match component format
        const newAppointment = {
          id: response.data._id,
          _id: response.data._id,
          appointmentId: response.data.appointmentId,
          patientName: response.data.patientName,
          contactNumber: response.data.contactNumber,
          email: response.data.email,
          serviceName: response.data.serviceName, // Combined service names
          appointmentDate: response.data.appointmentDate,
          appointmentTime: response.data.appointmentTime,
          service: response.data.serviceName, // Keep for compatibility
          date: new Date(response.data.appointmentDate), // Keep for compatibility
          time: response.data.appointmentTime, // Keep for compatibility
          testType: response.data.serviceName,
          status: response.data.status,
          notes: response.data.notes || '',
          totalPrice: response.data.totalPrice || totalPrice
        };

        console.log('✅ Single appointment created successfully!', newAppointment);
        
        // Add the new appointment to the state
        setAppointments([newAppointment, ...appointments]);
        setShowScheduleModal(false);
        setShowAppointmentBooking(false);
        
        // Reset patient data for next appointment
        setPatientData({
          patientName: '',
          contactNumber: '',
          email: '',
          age: '',
          sex: ''
        });
        
        alert(`Appointment scheduled successfully!\n\nPatient: ${patientData.patientName}\nTests: ${serviceNames.join(', ')}\nAppointment ID: ${newAppointment.appointmentId}\nTotal: ₱${totalPrice}`);
      } else {
        console.error('❌ Appointment creation failed:', response.message);
        throw new Error(`Failed to create appointment: ${response.message}`);
      }
      
    } catch (error) {
      console.error('Error scheduling appointments:', error);
      alert('Failed to schedule appointments: ' + (error.message || 'Please try again'));
    }
  };

  const processScheduleAppointment = async () => {
    try {
      if (!scheduleData.patientName || !scheduleData.contactNumber || !scheduleData.email || 
          !scheduleData.serviceId || !scheduleData.appointmentDate || !scheduleData.appointmentTime) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await appointmentAPI.createAppointment({
        patientName: scheduleData.patientName,
        contactNumber: scheduleData.contactNumber,
        email: scheduleData.email,
        serviceId: scheduleData.serviceId,
        serviceName: scheduleData.serviceName,
        appointmentDate: scheduleData.appointmentDate,
        appointmentTime: scheduleData.appointmentTime,
        type: 'scheduled',
        priority: scheduleData.priority,
        notes: scheduleData.notes,
        reasonForVisit: scheduleData.reasonForVisit
      });
      
      if (response.success) {
        // Update local appointments list
        setAppointments(prev => [response.data, ...prev]);
        
        setShowScheduleModal(false);
        setScheduleData({
          patientName: '',
          contactNumber: '',
          email: '',
          serviceId: '',
          serviceName: '',
          appointmentDate: '',
          appointmentTime: '',
          priority: 'regular',
          notes: '',
          reasonForVisit: ''
        });
        
        alert(`Appointment scheduled successfully for ${response.data.patientName}!`);
        
        // Update dashboard stats
        fetchReceptionistDashboardData();
      } else {
        throw new Error(response.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Schedule appointment error:', error);
      setError('Failed to schedule appointment: ' + error.message);
      alert('Failed to schedule appointment: ' + error.message);
    }
  };

  // Load services for dropdown
  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getServices();
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    }
  };

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Effect to fetch appointments when section changes
  useEffect(() => {
    if (activeSection === 'appointments') {
      fetchAppointments();
    }
  }, [activeSection, searchTerm, filterStatus, filterDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.receptionist-dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="receptionist-dashboard-container">
      {/* Sidebar */}
      <div className="receptionist-dashboard-sidebar">
        <div className="receptionist-sidebar-header">
          <h2 className="receptionist-sidebar-title">RECEPTIONIST PORTAL</h2>
        </div>
        
        <nav className="receptionist-sidebar-nav">
          <div
            className={`receptionist-nav-item ${activeSection === 'receptionist-dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionClick('receptionist-dashboard')}
          >
            <span className="receptionist-nav-text">Dashboard</span>
          </div>

          <div className="receptionist-dropdown">
            <div className="receptionist-nav-item-header" onClick={toggleAppointmentManagement}>
              <div className="receptionist-nav-item-main">
                <span className="receptionist-nav-text">Appointments</span>
              </div>
              <span className={`receptionist-dropdown-arrow ${appointmentManagementOpen ? 'open' : ''}`}>▼</span>
            </div>
            {appointmentManagementOpen && (
              <div className="receptionist-nav-submenu">
                <div
                  className={`receptionist-nav-subitem ${activeSection === 'appointments' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('appointments')}
                >
                  View Appointments
                </div>
              </div>
            )}
          </div>

          <div className="receptionist-dropdown">
            <div className="receptionist-nav-item-header" onClick={togglePatientServices}>
              <div className="receptionist-nav-item-main">
                <span className="receptionist-nav-text">Patient Services</span>
              </div>
              <span className={`receptionist-dropdown-arrow ${patientServicesOpen ? 'open' : ''}`}>▼</span>
            </div>
            {patientServicesOpen && (
              <div className="receptionist-nav-submenu">
                <div className="receptionist-nav-subitem">
                  <span style={{color: '#999', fontStyle: 'italic'}}>Coming Soon</span>
                </div>
              </div>
            )}
          </div>

          <div
            className={`receptionist-nav-item ${activeSection === 'billing-support' ? 'active' : ''}`}
            onClick={() => handleSectionClick('billing-support')}
          >
            <span className="receptionist-nav-text">Billing Support</span>
          </div>
        </nav>

        <div className="receptionist-sidebar-footer">
          <div className="receptionist-user-info">
            <div className="receptionist-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div className="receptionist-user-details">
              <div className="receptionist-user-role">Receptionist</div>
              <div className="receptionist-user-email">{user?.email || 'receptionist@mdlab.com'}</div>
            </div>
            <button className="receptionist-logout-btn" onClick={handleLogout}>
              ⏻
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="receptionist-dashboard-main">
        <div className="receptionist-dashboard-header">
          <h1 className="receptionist-page-title">
            {activeSection === 'receptionist-dashboard' && 'Dashboard'}
            {activeSection === 'appointments' && 'Appointment Management'}
            {activeSection === 'check-in-out' && 'Patient Check-In/Check-Out'}
            {activeSection === 'patient-information' && 'Patient Information'}
            {activeSection === 'service-information' && 'Service Information'}
            {activeSection === 'billing-support' && 'Billing Support'}
          </h1>
        </div>

        <div className="receptionist-dashboard-content">
          {/* Dashboard Overview */}
          {activeSection === 'receptionist-dashboard' && (
            <>
              {dashboardLoading ? (
                <div className="receptionist-loading">Loading dashboard data...</div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="receptionist-stats-grid">
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">This Week</div>
                        <div className="receptionist-stat-value">{dashboardStats.todayAppointments}</div>
                      </div>
                    </div>
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Pending</div>
                        <div className="receptionist-stat-value">{dashboardStats.pendingAppointments}</div>
                      </div>
                    </div>
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Completed</div>
                        <div className="receptionist-stat-value">{dashboardStats.completedToday}</div>
                      </div>
                    </div>
                    <div className="receptionist-stat-card">
                      <div className="receptionist-stat-info">
                        <div className="receptionist-stat-label">Cancelled</div>
                        <div className="receptionist-stat-value">{dashboardStats.cancelledAppointments || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="receptionist-middle-grid">
                    <div className="receptionist-chart-card">
                      <div className="receptionist-card-header">
                        <h3>Upcoming Appointments</h3>
                      </div>
                      <div className="receptionist-card-content">
                        {dashboardStats.upcomingAppointments.length === 0 ? (
                          <div className="receptionist-empty-state">
                            <p>No upcoming appointments</p>
                          </div>
                        ) : (
                          <div className="receptionist-appointment-list">
                            {dashboardStats.upcomingAppointments.map((appointment, index) => (
                              <div key={index} className="receptionist-appointment-item">
                                <div className="receptionist-appointment-time">{appointment.time}</div>
                                <div className="receptionist-appointment-details">
                                  <div className="receptionist-appointment-patient">{appointment.patientName}</div>
                                  <div className="receptionist-appointment-service">{appointment.service}</div>
                                </div>
                                <div className={`receptionist-appointment-status ${appointment.status}`}>
                                  {appointment.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="receptionist-info-card">
                      <div className="receptionist-card-header">
                        <h3>Recent Activity</h3>
                      </div>
                      <div className="receptionist-card-content">
                        {dashboardStats.recentAppointments.length === 0 ? (
                          <div className="receptionist-empty-state">
                            <p>No recent activity</p>
                          </div>
                        ) : (
                          <div className="receptionist-activity-list">
                            {dashboardStats.recentAppointments.map((appointment, index) => (
                              <div key={index} className="receptionist-activity-item">
                                <div className="receptionist-activity-details">
                                  <div className="receptionist-activity-patient">{appointment.patientName}</div>
                                  <div className="receptionist-activity-service">{appointment.service}</div>
                                  <div className="receptionist-activity-time">{appointment.time}</div>
                                </div>
                                <div className={`receptionist-activity-status ${appointment.status}`}>
                                  {appointment.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="receptionist-bottom-grid">
                    <div className="receptionist-quick-access-card">
                      <div className="receptionist-card-header">
                        <h3>Quick Actions</h3>
                      </div>
                      <div className="receptionist-quick-access-content">
                        <button className="receptionist-quick-btn" onClick={handleScheduleAppointment}>
                          Schedule Appointment
                        </button>
                        <button className="receptionist-quick-btn" onClick={() => handleSectionClick('view-appointments')}>
                          View Appointments
                        </button>
                        <button className="receptionist-quick-btn" onClick={() => handleSectionClick('billing-support')}>
                          Billing Support
                        </button>
                      </div>
                    </div>

                    <div className="receptionist-activity-card">
                      <div className="receptionist-card-header">
                        <h3>Week Summary</h3>
                      </div>
                      <div className="receptionist-activity-stats">
                        <div className="receptionist-stat-item">
                          <div className="receptionist-stat-label">Total Appointments</div>
                          <div className="receptionist-stat-value">{dashboardStats.todayAppointments}</div>
                        </div>
                        <div className="receptionist-stat-item">
                          <div className="receptionist-stat-label">Needs Attention</div>
                          <div className="receptionist-stat-value">{dashboardStats.pendingAppointments}</div>
                        </div>
                        <div className="receptionist-stat-item">
                          <div className="receptionist-stat-label">Success Rate</div>
                          <div className="receptionist-stat-value">
                            {dashboardStats.todayAppointments > 0 
                              ? Math.round((dashboardStats.completedToday / dashboardStats.todayAppointments) * 100) 
                              : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Appointment Management Section */}
          {activeSection === 'appointments' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Appointment Management</h2>
                  <p>View and manage patient appointments</p>
                </div>
                <button className="receptionist-add-btn" onClick={handleScheduleAppointment}>
                  + Schedule Appointment
                </button>
              </div>

              <div className="receptionist-search-filter">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="receptionist-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="receptionist-filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  className="receptionist-date-filter"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="receptionist-management-content">
                <div className="receptionist-data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Appointment ID</th>
                        <th>Patient Name</th>
                        <th>Service</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6">Loading appointments...</td>
                        </tr>
                      ) : appointments.length === 0 ? (
                        <tr>
                          <td colSpan="6">No appointments found</td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>{appointment.appointmentId}</td>
                            <td>{appointment.patientName}</td>
                            <td>{formatServiceNameForTable(appointment.serviceName)}</td>
                            <td>
                              {appointment.appointmentDate 
                                ? `${new Date(appointment.appointmentDate).toLocaleDateString()} - ${appointment.appointmentTime || 'Any time during clinic hours'}`
                                : 'Invalid Date - Any time during clinic hours'
                              }
                            </td>
                            <td>
                              <span className={`receptionist-status ${appointment.status}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td>
                              <div className="receptionist-action-buttons">
                                <button 
                                  className="receptionist-btn-view" 
                                  onClick={() => handleViewPatientDetails(appointment)}
                                >
                                  View
                                </button>
                                {appointment.status === 'confirmed' && (
                                  <button 
                                    className="receptionist-btn-checkin" 
                                    onClick={() => handleCheckIn(appointment)}
                                  >
                                    Check In
                                  </button>
                                )}
                                {appointment.status === 'checked-in' && (
                                  <button 
                                    className="receptionist-btn-checkout" 
                                    onClick={() => handleCheckOut(appointment)}
                                  >
                                    Check Out
                                  </button>
                                )}
                                {/* Only show bill button for non-cancelled appointments */}
                                {appointment.status !== 'cancelled' && (
                                  <button 
                                    className="receptionist-btn-bill" 
                                    onClick={() => handleGenerateBill(appointment)}
                                  >
                                    Bill
                                  </button>
                                )}
                                
                                {/* Three-dot dropdown menu */}
                                <div className="receptionist-dropdown-container">
                                  <button 
                                    className="receptionist-btn-dropdown"
                                    onClick={() => toggleDropdown(appointment._id)}
                                    aria-label="More actions"
                                  >
                                    ⋮
                                  </button>
                                  
                                  {activeDropdown === appointment._id && (
                                    <div className="receptionist-dropdown-menu">
                                      <button 
                                        className="receptionist-dropdown-item"
                                        onClick={() => handleEditService(appointment)}
                                      >
                                        Edit Service
                                      </button>
                                      <button 
                                        className="receptionist-dropdown-item"
                                        onClick={() => handleEditStatus(appointment)}
                                      >
                                        Edit Status
                                      </button>
                                      <button 
                                        className="receptionist-dropdown-item delete"
                                        onClick={() => handleDeleteAppointment(appointment)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'billing-support' && (
            <div className="receptionist-management-container">
              <div className="receptionist-management-header">
                <div className="receptionist-management-title">
                  <h2>Billing Support</h2>
                  <p>Assist patients with billing inquiries - Limited Access</p>
                </div>
              </div>
              <div className="receptionist-billing-tools">
                <div className="receptionist-billing-card">
                  <h4>Generate Bill Estimate</h4>
                  <p>Help patients estimate costs for services</p>
                  <button className="receptionist-btn-secondary">Calculate Estimate</button>
                </div>
                <div className="receptionist-billing-card">
                  <h4>Payment Information</h4>
                  <p>Provide payment method and policy information</p>
                  <button className="receptionist-btn-secondary">View Payment Options</button>
                </div>
                <div className="receptionist-billing-card">
                  <h4>Insurance Verification</h4>
                  <p>Basic insurance verification for patients</p>
                  <button className="receptionist-btn-secondary">Check Coverage</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      
      {/* Schedule Appointment Modal - New Patient Info Collection */}
      {showScheduleModal && !showAppointmentBooking && (
        <div className="receptionist-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Schedule New Appointment - Patient Information</h3>
              <button className="receptionist-modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <p style={{marginBottom: '20px', color: '#666'}}>
                First, please enter the patient's information. Then you'll be able to select tests and schedule appointments.
              </p>
              
              <div className="receptionist-form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  value={patientData.patientName}
                  onChange={(e) => setPatientData({...patientData, patientName: e.target.value})}
                  placeholder="Enter patient full name"
                />
              </div>
              
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    value={patientData.contactNumber}
                    onChange={(e) => {
                      // Only allow numbers, plus sign, and spaces
                      const value = e.target.value.replace(/[^0-9+\s]/g, '');
                      setPatientData({...patientData, contactNumber: value});
                    }}
                    placeholder="+639XXXXXXXXX"
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={patientData.email}
                    onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                    placeholder="patient@email.com"
                  />
                </div>
              </div>
              
              <div className="receptionist-form-row">
                <div className="receptionist-form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    value={patientData.age}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 120)) {
                        setPatientData({...patientData, age: value});
                      }
                    }}
                    placeholder="Enter age"
                    min="1"
                    max="120"
                  />
                </div>
                <div className="receptionist-form-group">
                  <label>Sex *</label>
                  <select
                    value={patientData.sex}
                    onChange={(e) => setPatientData({...patientData, sex: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: '#333',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              
              <div className="receptionist-modal-footer">
                <button 
                  className="receptionist-btn-secondary" 
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="receptionist-btn-primary"
                  onClick={() => {
                    if (!patientData.patientName || !patientData.contactNumber || !patientData.email || !patientData.age || !patientData.sex) {
                      alert('Please fill in all patient information fields.');
                      return;
                    }
                    // Patient info is collected, now proceed to appointment booking
                    setShowAppointmentBooking(true);
                  }}
                >
                  Continue to Test Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal - Test Selection and Scheduling */}
      <BookAppointmentModal
        isOpen={showAppointmentBooking}
        onClose={() => {
          setShowScheduleModal(false);
          setShowAppointmentBooking(false);
          setPatientData({ patientName: '', contactNumber: '', email: '', age: '', sex: '' });
        }}
        onSubmit={handleReceptionistAppointmentSubmit}
        availableServices={services}
        isRescheduling={false}
      />

      {/* OLD MODAL REMOVED - Now using BookAppointmentModal system */}

      {/* Patient Details Modal */}
      {showPatientDetailsModal && selectedAppointmentDetails && (
        <div className="receptionist-modal-overlay" onClick={() => setShowPatientDetailsModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Patient & Appointment Details</h3>
              <button className="receptionist-modal-close" onClick={() => setShowPatientDetailsModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-patient-details">
                <div className="patient-info-section">
                  <h4>Patient Information</h4>
                  <div className="info-grid">
                    <p><strong>Name:</strong> {selectedAppointmentDetails.patientName}</p>
                    <p><strong>Contact:</strong> {selectedAppointmentDetails.contactNumber}</p>
                    <p><strong>Email:</strong> {selectedAppointmentDetails.email || 'Not provided'}</p>
                    <p><strong>Age:</strong> {selectedAppointmentDetails.age || 'Not provided'}</p>
                    <p><strong>Gender:</strong> {selectedAppointmentDetails.gender || 'Not provided'}</p>
                    <p><strong>Address:</strong> {selectedAppointmentDetails.address || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="appointment-info-section">
                  <h4>Appointment Details</h4>
                  <div className="info-grid">
                    <p><strong>Appointment ID:</strong> {selectedAppointmentDetails.appointmentId}</p>
                    <p><strong>Date:</strong> {selectedAppointmentDetails.appointmentDate}</p>
                    <p><strong>Time:</strong> {selectedAppointmentDetails.appointmentTime}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${selectedAppointmentDetails.status}`}>
                        {selectedAppointmentDetails.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="tests-info-section">
                  <h4>Laboratory Tests</h4>
                  <div className="tests-container">
                    {(() => {
                      const testInfo = getTestDisplayInfo(selectedAppointmentDetails.serviceName);
                      
                      if (testInfo.hasMultiple && testInfo.allTests && testInfo.allTests.length > 0) {
                        return (
                          <div className="multiple-tests">
                            <div className="test-summary">
                              <span className="test-count-badge">{testInfo.testCount} Tests Ordered</span>
                            </div>
                            <div className="test-list">
                              {testInfo.allTests.map((test, index) => (
                                <div key={index} className="test-item">
                                  <span className="test-name">{test}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="single-test">
                            <div className="test-item">
                              <span className="test-name">{selectedAppointmentDetails.serviceName || 'Lab Test'}</span>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                {selectedAppointmentDetails.notes && (
                  <div className="notes-section">
                    <h4>Additional Notes</h4>
                    <p className="notes-text">{selectedAppointmentDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowPatientDetailsModal(false)}>
                Close
              </button>
              <button 
                className="receptionist-btn-primary" 
                onClick={() => {
                  setShowPatientDetailsModal(false);
                  handleGenerateBill(selectedAppointmentDetails);
                }}
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Generation Modal - Payment Confirmation */}
      {showBillModal && billData && (
        <div className="receptionist-modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="receptionist-modal-content" onClick={e => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Billing Information</h3>
              <button className="receptionist-modal-close" onClick={() => setShowBillModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="billing-details">
                <div className="billing-section">
                  <h4>Patient Details</h4>
                  <p><strong>Name:</strong> {billData.patientName}</p>
                  <p><strong>Contact:</strong> {billData.contactNumber}</p>
                  <p><strong>Email:</strong> {billData.email}</p>
                </div>
                
                <div className="billing-section">
                  <h4>Service Details</h4>
                  <p><strong>Service:</strong> {billData.service}</p>
                  <p><strong>Date:</strong> {billData.date}</p>
                  <p><strong>Time:</strong> {billData.time}</p>
                  <p><strong>Location:</strong> MDLAB Clinic</p>
                </div>
                
                <div className="billing-section">
                  <h4>Payment Details</h4>
                  <p><strong>Service Price:</strong> ₱{billData.price}</p>
                  <p><strong>Payment Method:</strong> Cash Payment</p>
                </div>
                
                <div className="payment-confirmation">
                  <p><strong>Has the patient paid for this service?</strong></p>
                </div>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => handlePaymentConfirmation(false)}>
                Not Paid
              </button>
              <button className="receptionist-btn-primary" onClick={() => handlePaymentConfirmation(true)}>
                Payment Confirmed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceModal && editingAppointmentData && (
        <div className="receptionist-modal-overlay" onClick={() => setShowEditServiceModal(false)}>
          <div className="receptionist-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Edit Service - Appointment {editingAppointmentData.appointmentId}</h3>
              <button className="receptionist-modal-close" onClick={() => setShowEditServiceModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-form-container">
                <p><strong>Patient:</strong> {editingAppointmentData.patientName}</p>
                <p><strong>Current Service:</strong> {editingAppointmentData.serviceName}</p>
                <p style={{color: '#6b7280', fontStyle: 'italic', marginTop: '10px'}}>
                  Service editing functionality will be implemented soon. This allows changing the tests/services for this appointment.
                </p>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowEditServiceModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditStatusModal && editingAppointmentData && (
        <div className="receptionist-modal-overlay" onClick={() => setShowEditStatusModal(false)}>
          <div className="receptionist-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="receptionist-modal-header">
              <h3>Edit Status - Appointment {editingAppointmentData.appointmentId}</h3>
              <button className="receptionist-modal-close" onClick={() => setShowEditStatusModal(false)}>×</button>
            </div>
            <div className="receptionist-modal-body">
              <div className="receptionist-form-container">
                <p><strong>Patient:</strong> {editingAppointmentData.patientName}</p>
                <p><strong>Current Status:</strong> <span className={`receptionist-status ${editingAppointmentData.status}`}>{editingAppointmentData.status}</span></p>
                
                <div style={{marginTop: '20px'}}>
                  <label htmlFor="newStatus" style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                    New Status:
                  </label>
                  <select 
                    id="newStatus" 
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    defaultValue={editingAppointmentData.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked In</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="receptionist-modal-footer">
              <button className="receptionist-btn-secondary" onClick={() => setShowEditStatusModal(false)}>
                Cancel
              </button>
              <button className="receptionist-btn-primary" onClick={() => {
                const newStatus = document.getElementById('newStatus').value;
                // This will be implemented to actually update the status
                alert(`Status update functionality will be implemented soon. Would change to: ${newStatus}`);
                setShowEditStatusModal(false);
              }}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistDashboard;